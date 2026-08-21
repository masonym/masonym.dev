# Burning Field Tracker

Tracks Burning Field levels per **channel** for a given **map**, shared across a
group of trusted loggers.

## Setup (one time)

1. Open the Supabase SQL editor for this project and run
   [`docs/burning-field-schema.sql`](../../../docs/burning-field-schema.sql).
   It is idempotent, so re-running it after edits is safe.
2. Confirm Realtime is on for `burning_logs` (the script tries to add it to the
   `supabase_realtime` publication; if your project's publication is managed in
   the dashboard, tick the box for the table there instead).
3. Magic-link email sign-in must be enabled under Auth → Providers. It already is
   for the Mystic Frontier tracker, which uses the same Supabase project.

No new environment variables — it reuses `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_PUBLIC_KEY` via `src/lib/supabase.js`.

## Model

- **Group** = one map, in one world, with a channel count (Kronos = 40).
  Created by a user, who becomes its owner.
- **Membership** has a role: `owner`, `logger` (can log), `viewer` (read only).
  Joining happens by invite code, or by browsing if the group is public — both
  go through `security definer` RPCs so codes never leak to non-members.
- **Log** = one reading: channel, level 0–10, and a status:
  - `free` — nobody in the map, burning is climbing
  - `ours` — our party is hunting there, burning is draining
  - `taken` — someone else is in the map

Everything is protected by RLS: you can only read logs for groups you belong to,
and only `owner`/`logger` members can insert.

## Projection

`src/lib/burning/projection.js` holds the maths, with no React or Supabase in it:

- free channels gain 1 level per hour, **excluding 00:00–08:00 UTC**, capped at 10
- occupied channels lose 1 level per 15 minutes of wall-clock time
- projections carry a bound (`≤` for stale free readings that someone may have
  burned down, `≥` for occupied ones we can't see the end of) and a confidence
  tier driven by the reading's age

The board re-projects every 15 seconds, so countdowns stay live without polling
the database.

## Logging quickly

The quick-entry bar takes `channel level [status]`:

```
12 7          → channel 12 is at level 7, free
12 7 ours     → we're hunting it
12 0 taken    → someone else is sitting on it
12 7o         → shorthand (o = ours, t = taken, f = free)
```

Press `/` anywhere on the board to focus it. Clicking a tile opens a panel with
level buttons 0–10, a status picker, an optional note, and that channel's history.

## Known rough edges

- Supabase `DELETE` realtime events only carry the primary key under the default
  replica identity, so the `group_id` filter drops them for other viewers. Their
  board corrects itself on the next refresh. Set `replica identity full` on
  `burning_logs` if live deletes matter.
- Group merging is owner-of-both-groups only (`burning_merge_groups`). Merging
  across owners would need an invitation/handshake flow.
- Map names are free text. If a map picker is wanted later, only `map_name`
  changes shape.
