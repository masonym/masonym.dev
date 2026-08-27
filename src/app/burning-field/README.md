# Burning Field Tracker

Tracks Burning Field levels per **channel** for a given **map**, shared across a
group of trusted loggers.

## Setup (one time)

1. Open the Supabase SQL editor for this project and run
   [`docs/burning-field-schema.sql`](../../../docs/burning-field-schema.sql).
   It is idempotent, so re-running it after edits is safe. **Re-run it after
   pulling the `camped` status** (existing databases have a `status` check
   constraint that rejects it until they do), **after pulling occupancy**,
   which adds the `burning_occupants` table and `burning_set_occupant`, and
   **after pulling status syncing**, which adds `burning_logs.derived` -
   without that column every occupancy edit fails on the insert - and **after
   pulling the map picker**, which adds `burning_groups.map_id` /
   `map_street` and changes the row type `burning_public_groups` returns (the
   script drops the function first, because Postgres will not `create or
   replace` a function whose return type changed).
2. Confirm Realtime is on for `burning_logs` and `burning_occupants` (the script
   tries to add both to the `supabase_realtime` publication; if your project's
   publication is managed in the dashboard, tick the boxes there instead).
3. Magic-link email sign-in must be enabled under Auth → Providers. It already is
   for the Mystic Frontier tracker, which uses the same Supabase project.

No new environment variables - it reuses `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_PUBLIC_KEY` via `src/lib/supabase.js`.

## Model

- **Group** = one map, in one world, with a channel count (Kronos = 40).
  Created by a user, who becomes its owner. The map is chosen from the catalogue
  (see [Picking the map](#picking-the-map)), so the group stores the WZ `map_id`
  with the name and street kept alongside it for display.
- **Membership** has a role: `owner`, `logger` (can log), `viewer` (read only).
  Joining happens by invite code, or by browsing if the group is public - both
  go through `security definer` RPCs so codes never leak to non-members.
- **Log** = one reading: channel, level 0–10, and a status:
  - `free` - nobody in the map, burning is climbing
  - `ours` - our party is hunting there, burning is draining
  - `taken` - someone else is in the map, assumed to still be there until
    somebody re-scouts the channel
  - `camped` - somebody is parked in the map long-term, sitting on a burnt-out
    map instead of hopping. Drains like `taken`, but sorts below it and reads as
    a ceiling: the channel is treated as dead until re-scouted. (Often a bot, but
    the label deliberately isn't an accusation - all we actually observed is that
    nobody is leaving.)
- **Occupant** = a marker saying somebody is standing in a channel right now.
  Either a group member (`user_id` set) or a stranger somebody scouted, who has
  no account and is identified only by the name they were given. A burning field
  map holds `MAP_CAPACITY` (4) characters, so a channel at 4/4 is unusable no
  matter how high its level, and the board sorts it below everything else.

  One person cannot be in two places at once: unique indexes enforce that per
  `user_id`, and per lower-cased name for strangers. Placement goes through the
  `burning_set_occupant` RPC rather than a plain insert, because *moving*
  somebody means deleting their old row and inserting the new one atomically -
  an upsert can't, since the conflict target differs between the two cases.

  Markers are a shared whiteboard: anyone who can log can move or clear anyone
  else's, including their own. They never expire on their own, so the panel
  shows how long ago each one was placed.

## Status and markers are one thing

A reading's status and the markers are two descriptions of the same fact, so
the board keeps them in step instead of trusting whichever you happened to
update:

- **Moving a marker writes a reading.** Whoever moves it logs that channel's
  projected level under the status the markers now imply - `ours` if anyone
  from the group is in the map, `taken` if only strangers are, `free` if it is
  empty. `camped` survives a marked stranger, since that is a claim about the
  same person not leaving. The row is flagged `derived`, shows as "inferred
  from markers" in the history, is never treated as exact (`~`, not a plain
  number) and never counts as a fresh reading. Only the person who moved the
  marker writes it, so two clients don't both log the transition. A channel
  nobody has ever scouted stays unscouted: a marker is not a level.
- **Logging moves the markers.** Logging `free` clears the map; logging `ours`
  marks you in it (and takes you off wherever you were), including from the
  quick-entry bar, so `12 7o` both logs and moves you. Nothing invents a
  stranger marker, because a reading doesn't say how many of them there are.
- **The status picker opens on the channel's current status**, not on whatever
  was picked for the previous channel.
- **Leftover contradictions are shown, not silently resolved.** A reading that
  disagrees with the markers - a channel logged `free` with people standing in
  it, or `ours` with nobody from the group marked - gets a warning in the panel
  and a one-click "trust the markers" fix. The projection maths always follows
  the reading, so a mismatch really is wrong until one side is corrected. An
  unmarked map is *not* a contradiction of `taken`/`camped`: nobody has to mark
  a stranger. Where the two disagree, sorting and "best free channel" take the
  more pessimistic of the two, so a channel with people in it can never be
  offered as free.

Everything is protected by RLS: you can only read logs for groups you belong to,
and only `owner`/`logger` members can insert.

## The board states readings, not guesses

The projection is a chain of assumptions - nobody wandered in, whoever we saw is
still hunting - and in practice it is
wrong more often than it is right. So the UI leads with what somebody actually
logged:

- a tile's big number, its colour and its solid left-edge bar are all the **last
  logged level**, with the age of that reading under it
- the projection is the smallest line on the tile, `may be ~7`, shown only when
  it has drifted from the reading (otherwise that line is the `+1 in 12 min`
  countdown), plus a ghost bar behind the solid one, so the gap between the two
  bars is the size of the guess
- the channel panel and the "best free channel" banner read the same way: the
  reading in the brighter type, `· may be 9 now if nothing has changed` after it

The maths itself is unchanged, and sorting by "Best burning" still ranks on the
projection - ordering is a heuristic, not a claim about a number. Anything that
*writes* a level from a projection (a derived reading, "trust the markers")
still uses the projected value, because that is what it is carrying forward.

## Projection

`src/lib/burning/projection.js` holds the maths, with no React or Supabase in it:

- free channels gain 1 level per hour, **excluding the 00:00–08:00 UTC burning
  curfew**, capped at 10. "Curfew" rather than "freeze": levels can still *fall*
  during the window, they just can't climb.
- occupied channels lose 1 level per 15 minutes of wall-clock time
- a `taken` channel drains for as long as its reading is old. We do not guess a
  session length: nobody ever sees a stranger leave, so an assumed departure
  invented levels nobody observed. Its projection is a floor (`≥`) instead - if
  they did leave, the channel has been climbing back since, and the fix for a
  stale `taken` is to re-scout it, not to let the maths hallucinate a recovery.
- a `camped` channel drains the same way, but reads as a ceiling (`≤`) and sorts
  below `taken`, because the whole point of the status is that this one *isn't*
  being vacated.
- a reading written by an occupancy change is a projection carried forward, so
  it can never be exact and never reads as fresh - one confidence tier down,
  and `~` where a hand-logged reading would have been an exact number.
- projections carry a bound (`≤` for stale free readings that someone may have
  burned down and for `camped` channels, `≥` for occupied ones we can't see the
  end of, `~` for a reading that was itself inferred from markers) and
  a confidence tier driven by the reading's age

The rules and the assumptions are both listed in the UI, in the collapsible
`RulesPanel` - `GAME_RULES` and `SITE_ASSUMPTIONS` in `burningUi.js` are the
single source for that copy, derived from the same constants the maths uses.

The board re-projects every 15 seconds, so countdowns stay live without polling
the database.

## Picking the map

The map was free text once, which made two groups on the same map unsearchable
against each other, and was ambiguous besides: 300 name+street pairs in the game
name more than one map, so "Labyrinth of Suffering Core" does not identify
anything on its own. Creating a group now goes through `MapPicker`, which reads
`public/map-data/maps.json`: the 168 **Western Grandis** field maps, with their
street, monster names and the level range of those monsters. That is the
burning-field progression - Cernium at 260 through Gob's Workshop at 299 - and
shipping only it means the picker offers ten areas rather than the 379 in the
game. Widening it is one constant in `src/scripts/build-map-data.mjs`; see
[`docs/map-data.md`](../../../docs/map-data.md) for that, the schema, and how to
regenerate after a patch.

The picker browses by **street**, not by the world map's own regions: `region`
is missing on two thirds of the game's hunting maps (Hidden Streets,
mini-dungeons and event maps have no world-map presence at all) while
`streetName` is set on essentially every map, and lands at about the granularity
somebody means by "the map I train on is in Geardock". Areas are listed in level
order, so the column reads as the progression you walk; maps within an area are
ordered by level too. Searching cuts across every area at once and matches the
map name, the street, the monsters in it and the map id - so "combatron" finds
the Robot Depot maps just as well as "robot depot" does.

What gets stored is `map_id`, with `map_name` and `map_street` denormalized for
display. `map_id` stays nullable and the create form keeps a "type a name
instead" fallback, which is what makes the narrow catalogue safe: a map outside
Western Grandis, one added by a patch newer than the catalogue, or one whose
monsters are spawned by script rather than by a spawn point can still be tracked
by name today, without waiting on a re-run of the extractor.

## Logging quickly

The quick-entry bar takes `channel level [status]`:

```
12 7          → channel 12 is at level 7, free
12 7 ours     → we're hunting it
12 0 taken    → someone else is sitting on it
12 0 camped   → someone is parked there long-term
12 7o         → shorthand (o = ours, t = taken, c = camped, f = free)
```

Press `/` anywhere on the board to focus it; a confirmation naming the channel
appears under the bar, since the tile you changed may be off-screen. Clicking a
tile opens a panel with level buttons 0–10, a status picker, an optional note,
that channel's history, and two ways to retract a reading - "Undo last reading"
(falls back to the previous one) and "Mark unscouted" (drops every reading of
yours on that channel).

## Who is where

Clicking a tile opens "In the map - *n*/4": the people marked on that channel,
each with the age of their marker and an ✕ to take them out, plus a row of
buttons for every group member not already there (a member standing elsewhere
gets "· on Ch 7", and clicking moves them) and a free-text box for anybody
outside the group. Leaving that box blank names them "Random 1", "Random 2", …

On the tiles themselves occupancy is four pips along the bottom edge - one per
slot in the map, light for your group and dark for a stranger. Four filled pips
plus a white border is a full map. The group settings panel also lists each
member's current channel, which is the quickest read on where everyone is.

The grid is a fixed 5 columns, capped at `max-w-lg`; from `lg` up the selected
channel's panel sits in the space to its right, sticky and scrolling internally,
rather than below the board where clicking a tile scrolled its own controls out
of view. Below `lg` the two stack. While the pointer is over the grid the sort
order is pinned, so tiles can't reshuffle out from under a click when a level
ticks over mid-hover; the numbers on them keep updating.

## Known rough edges

Tracked in [`TODO.md`](./TODO.md) alongside the UX backlog.
