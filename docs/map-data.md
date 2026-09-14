# Map catalogue - data spec

Reference for `public/map-data/maps.json`, the map list behind the burning-field map picker
(`src/app/burning-field/components/MapPicker.jsx`, `src/lib/maps/catalog.js`).

Source WZ: `C:\Program Files (x86)\Steam\steamapps\common\MapleStory\Data`

## Regenerating

Two steps: dump the raw data out of the WZ files, then slim it down for the site.

```bash
cd /mnt/c/Users/Mason/Documents/coding_projects/WzDataExtractor
"/mnt/c/Program Files/dotnet/dotnet.exe" run \
  --project "C:\Users\Mason\Documents\coding_projects\WzDataExtractor\MapExtractor\MapExtractor.csproj" \
  -c Release -- \
  --data "C:\Program Files (x86)\Steam\steamapps\common\MapleStory\Data" \
  --out  "C:\Users\Mason\Documents\coding_projects\WzDataExtractor\output\maps"

cd /mnt/c/Users/Mason/Documents/coding_projects/masonym.dev
npm run build-map-data
```

The first step takes ~3 minutes (it parses all 21,844 map images and all ~12,000 monsters) and
writes `output/maps/maps.json`, ~856 KB - every hunting map in the game. `dotnet` is not
installed inside WSL - the Windows binary must be invoked by path. The second step narrows that
to what the site ships and writes `public/map-data/maps.json`, ~27 KB.

Widening the catalogue is a one-line change to `REGIONS` in
`src/scripts/build-map-data.mjs` plus a re-run of `npm run build-map-data` - the WZ pass does
not have to be repeated, since its output is unfiltered.

Re-run both after a patch that adds maps. Nothing breaks if you don't: groups already store the
map's name and street alongside its id, so an existing group keeps displaying correctly even if
its map vanishes from a regenerated catalogue.

## Why a map id and not a name

`burning_groups.map_name` used to be free text. Two groups tracking the same map could spell it
differently, and 300 name+street pairs in the game are ambiguous on their own - "Labyrinth of
Suffering Core" is the name of four different maps. Groups created through the picker store
`map_id` (the WZ map id, e.g. `410013717`), with `map_name`/`map_street` denormalized for
display. `map_id` is nullable: the picker keeps a free-text fallback for a map the catalogue
does not have.

## `maps.json`

```jsonc
{
  "generated": "2026-08-27T...",         // ISO timestamp of the WZ dump
  "mobs": { "9400001": ["Combatron EX", 298] },   // id -> [name, level]
  "maps": [
    {
      "id": 410013717,                   // WZ map id
      "name": "Robot Depot 8",
      "street": "Geardock",              // streetName; the picker's browse axis
      "region": "Western Grandis",       // optional, from the world map
      "minLv": 298,                      // lowest monster level in the map
      "maxLv": 298,                      // highest
      "spawns": 40,                      // monster spawn points
      "mobs": [9400001]                  // at most 6, keys into `mobs`
    }
  ]
}
```

### What is in it, and what is not

Two filters in `src/scripts/build-map-data.mjs` cut the 21,313 named maps down to 168.

**`REGIONS`** keeps only **Western Grandis** - the burning-field progression the tracker is
for, Cernium at 260 through Gob's Workshop at 299:

| area | maps | levels |
|---|---|---|
| Cernium | 16 | 260-261 |
| Burning Cernium | 16 | 262-264 |
| Hotel Arcus | 16 | 265-269 |
| Odium | 16 | 270-274 |
| Shangri-La | 20 | 275-279 |
| Empress Road | 6 | 280-281 |
| Arteria | 14 | 282-284 |
| Carcion | 20 | 285-289 |
| Tallahart | 22 | 290-294 |
| Geardock | 22 | 295-299 |

Filtering on the *region* rather than on those ten street names is deliberate, and does a
second job: every instanced copy of these areas shares the street name but is absent from the
world map, so it has no region and falls out here. That drops 78 maps - Monster Park stages
(`954xxxxxx`, "Stage 3: Royal Library"), story instances (`993xxxxxx`, "Somewhere in
Breathtaking Cave") - none of which have channels, so none of which can hold a burning field.
What survives is 168 maps, all persistent `410xxxxxx` fields.

**`MIN_SPAWNS`** keeps only maps with at least 3 monster spawn points. Towns and cutscene maps
have none; boss arenas and their entrance rooms have one or two, often a single scripted dummy.
Across the whole game that cut drops 265 of 4,098 maps and no training map among them.

`region` in the raw dump is present on about a third of hunting maps and absent on the rest -
every Hidden Street, mini-dungeon and event map is missing from the world map entirely. That is
fine as a *filter* (the maps it omits are the ones we don't want) but useless as a browse axis,
so the picker browses by `street`, which is set on essentially every map. Don't swap them
around without re-checking that coverage.

Monster lists are capped at 6 per map. A map's first few monsters name it; its twentieth is
noise in a picker row.

## Where each field comes from in the WZ

| field | source |
|---|---|
| `name`, `street` | `String.wz/Map.img/<category>/<mapId>/{mapName,streetName}` |
| `region` | `Map.wz/WorldMap/*.img/MapList/<n>/{title,mapNo}`, shallowest titled spot |
| `spawns`, `mobs` | `Map.wz/Map/MapN/<mapId>.img/life/*` where `type == "m"` |
| `minLv`, `maxLv` | `Packs/Mob_*.ms → <mobId>.img/info/level` |
| monster names | `String.wz/Mob.img/<mobId>/name` |

Monster data is **not** in `Mob.wz` on the current client - that file is a 192-byte stub and the
real data lives in `Data/Packs/Mob_*.ms`, a ChaCha20-encrypted pack format that only
`MapleLib.WzLib.MSFile.WzMsFileV2` reads. See `WzDataExtractor/MapExtractor/README.md`.
