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
- [x] ~~**Public groups leak their invite code.** The `burning_groups_select` policy lets
      non-members read public group rows, `invite_code` included. Harmless while the
      group is public (anyone can join anyway), but a group flipped public→private
      keeps a code that strangers may already have. Rotating the code on that
      transition would close it.~~ The owner can now flip visibility from the group
      panel, and `burning_set_group_visibility` rotates the invite code on the
      public→private transition. Non-members can still read a *public* group's code
      directly, which stays harmless: joining a public group needs no code.
      **Needs the schema re-run** for the new RPC.
- [ ] **No party co-ordination view.** The core use case is "four of us burn one
      channel down together", but nothing surfaces which channel the group is
      currently on. A status strip reading "your group is on Ch 12, level 6 and
      dropping" would serve that better than hunting for the flame icon.

## Data model

- [x] ~~**Map names are free text.** Two groups tracking the same map can spell it
      differently, which makes browsing and any future cross-group aggregation
      unreliable.~~ Groups now pick their map from an extracted catalogue of the 168
      Western Grandis field maps (`public/map-data/maps.json`, built by
      `WzDataExtractor/MapExtractor` - see [`docs/map-data.md`](../../../docs/map-data.md))
      and store the WZ `map_id`, with `map_name`/`map_street` kept alongside it for
      display. **Needs the schema re-run** for `burning_groups.map_id` /
      `map_street` and the new `burning_public_groups` row type.

      Left deliberately undone: `map_id` is nullable and the create form keeps a
      free-text fallback, so two groups *can* still disagree about a map that the
      catalogue does not have - which now includes everything outside Western
      Grandis, until somebody widens `REGIONS` in `src/scripts/build-map-data.mjs`. Existing groups keep their typed-in names - nothing
      backfills `map_id` by matching the old text, because "Robot Depot 8" matches
      one map but "Labyrinth of Suffering Core" matches four, and a wrong guess is
      worse than a null. Cross-group aggregation would want that backfill done by
      hand first.
- [ ] **Realtime deletes don't propagate.** Supabase `DELETE` events carry only the
      primary key under the default replica identity, so the `group_id=eq.` filter
      drops them and other viewers keep a deleted log until they refresh. Fixed by
      `alter table burning_logs replica identity full` if it matters.
