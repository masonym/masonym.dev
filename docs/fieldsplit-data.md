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

**Confirmed on GMS (2026-11-24)** in Proving Fields: Basic 1 (693106101, 3×2): summons stopped
and resumed exactly at the predicted transition lines. The grid isn't stored in the WZ files;
it's built into the game.

Maps with `largeSplit` (a WZ map setting the game reads) use a wider, non-standard grid whose
meaning is unknown. Show them as "grid unknown"; their `xBounds`/`yBounds` are only the standard
grid.

### largeSplit test results

The page shows a `largeSplit` map as safe when either of these holds:

- **It can't hide a summon even on the standard grid** (walkable area under 3 cells both ways).
  Every test so far shows `largeSplit` cells are bigger than standard, never smaller.
- **Its value is listed in `LARGE_SPLIT_SAFE`** in the build script, which also records the tests.

Values 2, 3, 4 and 5 are listed. Each was tested on its widest and tallest map: the summon kept
attacking end to end, where the standard grid says it should have been hidden. The results need
cells 2-3.6× standard. Applying each value's scale to both axes, no shipped map can hide a summon. The one map too big
for that, World's Sorrow Depths 2 (4311 wide), was tested on its own and is safe too; a map like
that goes in `LARGE_SPLIT_UNSETTLED` until it's tested. The per-map results are in the comment above `LARGE_SPLIT_SAFE`. Every
`largeSplit` value on the site's maps is now covered: 8 and 10 maps are all 2×2 on the standard
grid; 6, 9, 12 and 16 only appear on instanced maps the site doesn't show.

## Placing summons

`src/lib/fieldsplit/summons.js`. You place your summons and your character (where you idle between
loot trips); the page shows where all the summons keep attacking, which ones are active from your
character's spot, and what looting elsewhere does to them. Markers can be dragged. It makes no
suggestions: where people put their summons depends on the class, the other summons and the route
they loot.

- **Several summons:** you see them all only while your cell is within one cell of every summon's
  cell. The overlap of their 3×3 blocks is the green area. Looting elsewhere pauses the far
  summons until you come back past the cyan line, so stopping inside a transition band (amber) can
  leave a summon paused until your next trip. Green is only where every summon is active whichever
  way you came in. For your character's spot the page names the paused summons, and for amber,
  which side to walk in from (`approachFrom`).
- **Kinds** (`KINDS`), with attack ranges from `Skill/50000.img` in `Data/Packs` (read with WzDump):
  - **Your character:** sees the summons; never hidden itself.
  - **Sol Janus: Dawn**: each ring is its own skill, each smaller than the last
    (`summon/attack1/info/range`, each side / up / down): 1st ring 500001002, 280/415/145; 2nd
    500001003, 255/390/120; 3rd 500001004, 235/370/100. The first Dawn placed is the first ring.
    Up to 3 rings, 300–2500 apart (`common/s`, `common/range`, confirmed in game); the page warns
    when two rings break that.
  - **Other summon:** no range, just a position.
- **Sol Janus: Dusk** (500001001) is a checkbox, not a marker: it attacks around your character
  (the skill has no `summon` node; its Primal Crystals are SecondAtoms), so it never pauses. It
  can't be active alongside Dawn, so ticking it sets the Dawn rings aside (kept in the URL, shown
  again when unticked). People use it instead of three Dawn rings for the range, so its `common/lt`/`rb` box (600 each side, 600
  up, 400 down) is drawn around the character. The skill also has a bigger `lt2`/`rb2` (1000 each
  side, 1000 up, 800 down).
- **Colours:** the background is "if you stand here": green where every summon is active, amber
  where it depends on which way you came in, red where one is paused. It's what shows the loot
  route and the band trap. Once your character is placed, each summon also gets a ring for its
  state from that spot, and a paused summon's range fades.
- URL: `?map=<id>&summons=<kind>:<x>,<y>;...&dusk=1`, kind `y` (your character), `d` (Dawn) or `o`
  (other); `dusk=1` when using Dusk.

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
993 story instances). Hunting maps that aren't on the world map but should ship, currently Quanah's
Proving Fields, are listed in `EXTRA_MAPS` in the script with the region to show them under.
Only maps whose monsters are all level 200+ ship (`MIN_LEVEL`), each tagged with a picker `category` (Arcane River,
Grandis, Quanah, Other) from `CATEGORIES`. Every map gets grid, minimap and spawn data, so the page can show any map, not just the ones
that can hide a summon.

## `fieldsplit.json`

```jsonc
{
  "generated": "2026-11-24T...",
  "cell": [1366, 768],
  "band": [227, 128],
  "origin": "vr",
  "categories": ["Arcane River", "Grandis", "Quanah", "Other"],
  "largeSplitSafe": [2, 3, 4, 5],          // largeSplit values tested and found never to hide
  "largeSplitUnsettled": [],               // maps on those values too big for the tests to settle
  "mobs": { "8641013": ["Joyful Erda", 209] },  // id -> [name, level]
  "maps": [
    {
      "id": 450001260,
      "name": "Hidden Lakeshore",
      "street": "Lake of Oblivion",
      "category": "Arcane River",              // picker category (CATEGORIES in the build script)
      "region": "Vanishing Journey",          // world-map region (MapExtractor)
      "minLv": 209, "maxLv": 209,
      "spawns": 37,
      "cells": [3, 2],                         // [across, down] over the grid box
      "walkCells": [3, 2],                     // cells the walkable (foothold) area touches
      "canHide": true,                         // walkCells has 3+ in either direction
      "largeSplit": 3,                         // only when the map has one

      // grid, minimap and spawns (every map with a minimap):
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
