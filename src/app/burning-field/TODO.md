# Burning Field Tracker - backlog

Rough edges known at build time (2026-08-21). Nothing here is blocking; the feature
works as shipped. Items are written as observation + intent, not as prescriptions -
pick the implementation when you pick up the item.

## UI/UX

- [x] ~~Mark who is on which channel, group members and randoms alike, and see
      at a glance when a map is full (4/4).~~ New `burning_occupants` table plus
      a `burning_set_occupant` RPC. The channel panel gets an "In the map - n/4"
      section (member buttons that move somebody here from wherever they were, a
      free-text box for people outside the group, an ✕ per marker and "Empty the
      map"); tiles get four occupancy pips along the bottom edge, light for your
      group and dark for a stranger, with a white border when full; full
      channels sort last under "Best burning". "One person, one place" is
      enforced by unique indexes and by the RPC deleting the old row before
      inserting the new one, so two people dragging the same marker can't
      duplicate it. **Needs the schema re-run**
      (`docs/burning-field-schema.sql`).

      Left deliberately undone: markers never expire, so a stale one has to be
      cleared by hand - the panel shows each marker's age instead of guessing
      when somebody left. `MAP_CAPACITY` is a constant in `projection.js`, not
      a per-group setting, so a map with a different cap would need a column on
      `burning_groups`.

- [x] ~~Status and occupancy were two independent truths - a channel could read
      "free" with four people marked in it, and a party that hopped away left
      "we are here" behind, draining the old channel to nothing.~~ Occupancy
      edits now write the reading that goes with them (`derived` logs, flagged
      as inferred), logging `free`/`ours` moves the markers to match, the status
      picker opens on the channel's current status, and a leftover contradiction
      gets a warning plus a "trust the markers" fix. **Needs the schema re-run**
      for `burning_logs.derived`.

      Left deliberately undone: a derived reading freezes the *projected* level,
      so a long chain of marker moves without anyone actually looking at the
      screen compounds whatever error the first reading had - the confidence
      tier drops, but it doesn't decay per hop. Removal times aren't stored
      either; a marker cleared by somebody whose client then dies leaves no
      reading behind, since only the person who moved it writes one.

## Group management

- [ ] **Merging is owner-of-both-groups only** (`burning_merge_groups`). The realistic
      case - two separate groups tracking the same map, different owners, wanting to
      combine - needs an invite/accept handshake between owners.
- [ ] **Public groups leak their invite code.** The `burning_groups_select` policy lets
      non-members read public group rows, `invite_code` included. Harmless while the
      group is public (anyone can join anyway), but a group flipped public→private
      keeps a code that strangers may already have. Rotating the code on that
      transition would close it.
- [ ] **No party co-ordination view.** The core use case is "four of us burn one
      channel down together", but nothing surfaces which channel the group is
      currently on. A status strip reading "your group is on Ch 12, level 6 and
      dropping" would serve that better than hunting for the flame icon.

## Data model

- [ ] **Map names are free text.** Two groups tracking the same map can spell it
      differently, which makes browsing and any future cross-group aggregation
      unreliable. Only `map_name` changes shape if a real map picker is added.
- [ ] **Realtime deletes don't propagate.** Supabase `DELETE` events carry only the
      primary key under the default replica identity, so the `group_id=eq.` filter
      drops them and other viewers keep a deleted log until they refresh. Fixed by
      `alter table burning_logs replica identity full` if it matters.
