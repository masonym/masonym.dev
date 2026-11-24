# Field split ("summon zone") data - spec

Reference for `public/fieldsplit/`, the data behind the summon zone viewer.

## The mechanic

The game divides each map into a grid of cells, counted from the map's top-left corner. You only
get updates for objects (players, mobs, summons) in the **3×3 block of cells around your own
cell**. A placed summon outside that block is hidden for you and stops attacking.

You change cell a **band** past each boundary in the direction you're moving, not at the boundary
itself:

- walking right past a boundary, you move into the next cell at `boundary + band`;
- walking back left, you move back at `boundary - band`.

That's why a summon stops at one line and only starts again at a different one.

A map can hide a cell only when its walkable area spans **3+ cells in a row** (`canHide`).

| value | current | source |
|---|---|---|
| cell | 1366×768 | JP community sheet; was 1024×576 before New Age |
| band | 227×128 (1/6 of a cell) | same sheet |
| origin | VR box top-left (`info/VR*`), or the foothold box when the map has no VR | matches the sheet's worked example, Hidden Lakeshore 450001260 (3×2) |

**None of this has been confirmed in game yet.** The grid isn't stored in the WZ files; it's
built into the game. The sheet derived these values by testing too.

Maps with `largeSplit` (a WZ map setting the game reads) use a wider, non-standard grid whose
meaning is unknown. Show them as "grid unknown"; their `xBounds`/`yBounds` are only the standard
grid.

## Regenerating

```bash
cd /mnt/c/Users/Mason/Documents/coding_projects/WzDataExtractor
E=FieldSplitExtractor/bin/Release/net10.0-windows7.0/FieldSplitExtractor.exe   # build it first if missing
$E --minimaps --all --min-spawns 3        # ~2 min -> output/fieldsplit/ (all maps + minimaps)
# also needs output/maps/maps.json from MapExtractor (see docs/map-data.md) for regions and mob names

cd /mnt/c/Users/Mason/Documents/coding_projects/masonym.dev
npm run build-fieldsplit-data
```

The build script keeps maps with a name, at least 3 spawn points and a world-map region, which is
the same cut as the burning-field catalogue. That drops the instanced copies (954 Monster Park,
993 story instances). Only maps that are `canHide` or `largeSplit` get grid, minimap and spawn
data; for the rest, the verdict is enough.

## `fieldsplit.json`

```jsonc
{
  "generated": "2026-11-24T...",
  "cell": [1366, 768],
  "band": [227, 128],
  "origin": "vr",
  "mobs": { "8641013": ["Joyful Erda", 209] },  // id -> [name, level]
  "maps": [
    {
      "id": 450001260,
      "name": "Hidden Lakeshore",
      "street": "Lake of Oblivion",
      "region": "Vanishing Journey",          // world-map region (MapExtractor)
      "minLv": 209, "maxLv": 209,
      "spawns": 37,
      "cells": [3, 2],                         // [across, down] over the grid box
      "walkCells": [3, 2],                     // cells the walkable (foothold) area touches
      "canHide": true,                         // walkCells has 3+ in either direction
      "largeSplit": 3,                         // only when the map has one

      // only on canHide / largeSplit maps:
      "grid": [-1172, -908, 2108, 237],        // [l, t, r, b] box the grid starts from (map units)
      "fh": [-1182, -529, 2118, 47],           // walkable foothold box
      "xBounds": [194, 1560],                  // vertical cell boundaries (x)
      "yBounds": [-140],                       // horizontal cell boundaries (y)
      "miniMap": [1172, 908, 4, 3280, 1145],   // [centerX, centerY, mag, width, height]
      "mobs": [8641013],                       // distinct monsters, most spawns first
      "spawnPts": [[-573, 47, 0]]              // [x, y, index into this map's mobs]
    }
  ]
}
```

Cell `(c, r)` covers `x ∈ [grid.l + c·cell.w, grid.l + (c+1)·cell.w)`, and the same for y. A
point's cell is `floor((x - grid.l) / cell.w)`, clamped to `[0, cells[0] - 1]`.

## Drawing on the minimap

`public/fieldsplit/minimap/<id>.png` is the game's own minimap, roughly 1/16 scale.

```
minimap pixel = (map coord + center) / 2^mag
```

Put an SVG over the image with `viewBox="-centerX -centerY width height"`. Everything can then
be drawn in map units: boundaries from `xBounds`/`yBounds`, transition lines at ± `band`, spawn
points.
