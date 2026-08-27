# Erda Link Data Extractor

Parses MapleStory's Erda Link WZ XML exports into structured JSON for use in a Next.js calculator.

## What This Is

**Erda Link** is a passive skill tree system in MapleStory for the Stellar Detectives job branch (Sia Astelle, with Erel and Iel coming later). Players spend **Sol Erda** and **Sol Erda Fragments** to activate and upgrade nodes called "stones" on a radial board. Each stone provides passive stats or boosts a connected skill.

This repo contains:
- Three XML exports from MapleStory's WZ data files
- An extraction script that parses them into a single clean JSON file
- That JSON is what you copy into your Next.js project

---

## Files

```
Etc.ErdaLink.img.xml          — tree topology, stone definitions, UI node positions
Etc.ErdaLinkSolerda.img.xml   — all activation + upgrade costs
Etc.ErdaLinkShineStone.img.xml — SHINE stone conditions, enhance probabilities, passives

extract-erda-link.ts          — the extraction script
output/erda-link-data.json    — generated output (copy this to your Next.js project)
output/image-manifest.txt     — WZ paths for the 26 stone icons you need to extract
```

---

## Running the Extractor

```bash
npm install
npm run extract
```

Output is written to `output/erda-link-data.json`.

---

## Maintenance

### Adding a new character (Erel, Iel)

When a new Stellar Detective is added to the game:

1. Get fresh XML exports from the updated WZ files (same three files).
2. Open `extract-erda-link.ts` and find the `CHARACTERS` array near the top:
   ```ts
   const CHARACTERS = [
     { name: 'Sia Astelle', treeId: 182, jobId: 18214 },
     // { name: 'Erel', treeId: 181, jobId: 181XX },
     // { name: 'Iel',  treeId: 183, jobId: 183XX },
   ];
   ```
3. Uncomment the new character and fill in their `jobId`. The `treeId` is known (`181` for Erel, `183` for Iel). The `jobId` is the 5-digit job ID used as the key in `ErdaLink.img/nodePos/` — check the new XML dump for a `<dir name="181xx">` entry under `nodePos`.
4. Re-run `npm run extract`.
5. Copy the new `output/erda-link-data.json` to your Next.js project.
6. Also re-extract images for the new character's stones (new entries in `output/image-manifest.txt`).

### After a balance patch

If stone stats, costs, or the tree layout change:

1. Replace the three XML files with fresh exports from the updated WZ.
2. Re-run `npm run extract`.
3. Copy the new JSON to your Next.js project.

### When locked SHINE stones are released

SHINE stones with `locked: 1` in the WZ data are automatically filtered out by the script. When they're released (stones 1004 and 1005, `order` 4 and 5), re-export the WZ XML and re-run. They'll appear in the output automatically.

---

## Images

The XML exports contain **1×1 placeholder pixels** for all images — the actual artwork is not in these files. To get the real stone icons:

1. Use a WZ extraction tool (e.g. **HaRepacker**) on `Etc.wz`.
2. Navigate to `ErdaLink.img → stone → {category} → {id} → icon` and export as PNG.
3. `output/image-manifest.txt` lists all 26 WZ paths you need.

The board **background image** (`ErdaLink.img.tree.182.right.canvasbackgrnd.png`) is already extracted and in this directory.

For the Next.js project, put extracted images in `/public/erda-link/stones/` and serve them statically.

---

## Output Data Format

`erda-link-data.json` has four top-level keys: `characters`, `stones`, `costs`, `shineStones`.

### `characters[]`

One entry per character. Each has a flat list of all their nodes with positions already joined in.

```jsonc
{
  "name": "Sia Astelle",
  "treeId": 182,
  "jobId": 18214,
  "spPosition": { "x": 800, "y": 550 },  // center SP starting node
  "nodes": [
    {
      "nodeIndex": 0,          // global unique index for this node
      "sector": "top",         // "top" | "right" | "bottom" | "left" | "center" | "SHINE"
      "stoneId": 33,           // key into stones[]
      "position": { "x": 800, "y": 370 },  // pixel coords on 1600×1080 canvas; null for SHINE
      "prereqAnd": [],         // ALL of these nodeIndex values must be activated first
      "prereqOr": []           // at least ONE of these must be activated (empty = no req)
    },
    {
      "nodeIndex": 4,
      "sector": "top",
      "stoneId": 106,
      "position": { "x": 800, "y": 190 },
      "prereqAnd": [1, 2, 3],  // node 4 requires nodes 1, 2, AND 3 all activated
      "prereqOr": []
    }
  ]
}
```

**Unlock logic:** A node is unlockable when:
- All nodes in `prereqAnd` are activated, AND
- At least one node in `prereqOr` is activated (or `prereqOr` is empty)
- If both lists are empty, the node connects directly to the SP starting node

**Sectors and node index ranges:**
- `top`: 0–199
- `right`: 200–399
- `bottom`: 400–599
- `left`: 600–799
- `SHINE`: 800–806 (separate bottom board, `position` is always `null`)
- `center`: 1000–1010 (the six Origin skill stones in the center hexagon)

**`spPosition`** is the visual center of the board where the SP module sits. Nodes with no prerequisites connect to this point.

**Canvas:** The board background is 1600×1080px. Node positions are absolute pixel coordinates within that canvas. The UI should allow panning/scrolling since the canvas is larger than most viewports.

---

### `stones[]`

All stone definitions, flat array. Look up by `id` to match against `node.stoneId`.

```jsonc
{
  "id": 33,
  "category": "rush",     // "rush" | "skill" | "boost" | "ultimate" | "origin" | "SHINE"
  "name": "Buff Duration",
  "desc": "Increases Buff Duration by 2%.",
  "maxLevel": 1,
  "costType": "default",  // used to look up costs — see costs section below
  "passives": [
    {
      "0": { "bufftimeR": 0 },   // level 0 = unactivated (base value)
      "1": { "bufftimeR": 2 }    // level 1 = activated
    }
  ],
  "iconOutlink": "Etc/_Canvas/ErdaLink.img/stone/rush/33/icon"
}
```

**Stone categories and behavior:**

| Category | ID range | maxLevel | Notes |
|----------|----------|----------|-------|
| `rush` | 1–52 | 1 | Activated or not — no upgrade levels. costType: `default` or `rushEnd` |
| `skill` | 100–107 | 15 or 30 | Boosts a character skill. costType: `default`, `half` (max 15), or `solJanus` |
| `boost` | 300–306 | 1 | One has `hasActiveEffect: true` (proc effect, not a flat passive) |
| `ultimate` | 500–501 | 30 | The character's ultimate skill cores |
| `origin` | 10000–10001 | 30 | HEXA origin skills in the center hexagon. costType: `origin` or `ascent` |
| `SHINE` | 1000–1003 | 20 | See `shineStones[]` for full details |

**`costType`** tells you which cost table row to use. Stones without an explicit `costType` in the WZ data default to `"default"`.

**`passives`** is an array of stat groups (most stones have one group, some have two). Each group maps level → stat object. Stat keys are MapleStory internal names:

| Key | Meaning |
|-----|---------|
| `nbdR` | Normal Enemy Damage % |
| `expR` | EXP Obtained % |
| `mesoR` | Meso Obtained % |
| `dropR` | Item Drop Rate % |
| `bufftimeR` | Buff Duration % |
| `allR` | All Stats % |
| `intFX` | INT (flat) |
| `lukFX` | LUK (flat) |
| `madX` | Magic ATT (flat) |
| `damR` | Damage % |
| `bdR` | Boss Damage % |
| `incCrDam` | Critical Damage % |
| `ignoreMobpdpR` | Ignore DEF % |

**`reqForActivation`** (optional): `{ hexaSkillId: requiredLevel }` — the skill at that ID must be leveled to at least that value before this stone can be activated. Only present on skill stones.

**`connectSkills`** (optional): array of Hexa skill IDs that this stone powers. Useful for display ("boosts: Stellar XI - Sirius").

---

### `costs`

Two lookup tables: `activation` (lv 0 → 1) and `enforcement` (lv N → N+1).

```jsonc
{
  "activation": {
    "rush":     { "default": { "solErda": 1, "fragments": 50 },
                  "rushEnd": { "solErda": 5, "fragments": 100 } },
    "skill":    { "default": { "solErda": 4, "fragments": 75 },
                  "half":    { "solErda": 3, "fragments": 37 },
                  "solJanus":{ "solErda": 7, "fragments": 125 } },
    "boost":    { "default": { "solErda": 7, "fragments": 125 } },
    "ultimate": { "default": { "solErda": 2, "fragments": 50 } },
    "origin":   { "origin":  { "solErda": 5, "fragments": 100 },
                  "ascent":  { "solErda": 5, "fragments": 100 } },
    "SHINE":    { "default": { "solErda": 7, "fragments": 100 } }
  },
  "enforcement": {
    "skill": {
      "1":  { "default": { "solErda": 1, "fragments": 23 }, "half": { "solErda": 0, "fragments": 22 }, "solJanus": { "solErda": 2, "fragments": 38 } },
      "9":  { "default": { "solErda": 8, "fragments": 150 }, ... },
      ...
    },
    "SHINE": {
      "1": { "default": { "fragments": 5, "meso": 16000000 } },
      "2": { "default": { "fragments": 5, "meso": 33000000 } },
      ...
    }
  }
}
```

**Cost lookup:**
```ts
// Activation cost (always level 0 → 1):
const activationCost = costs.activation[stone.category][stone.costType];

// Upgrade cost (level N → N+1), for stones with maxLevel > 1:
const upgradeCost = costs.enforcement[stone.category][currentLevel][stone.costType];
```

**Special cases:**
- `rush` and `boost` stones have `maxLevel: 1` — they only ever have an activation cost, no enforcement.
- `SHINE` enforcement costs use `meso` (a large meso amount) + `fragments` only — no `solErda`.
- `skill` enforcement with `costType: "half"` only has entries for levels 1–14 (since `half` stones max at 15).
- Levels 9, 19, and 29 in the enforcement tables are milestone levels with a significant cost spike.

---

### `shineStones[]`

Full definitions for the four released SHINE stones (IDs 1000–1003). SHINE stones have a different progression model from regular stones: enhancement has a chance to fail or downgrade.

```jsonc
{
  "id": 1000,
  "order": 0,
  "maxLevel": 20,
  "desc": "You must meet the conditions to make the Runestone shine.",
  "conditions": [
    { "type": "stone", "stoneType": "ultimate", "count": 1 }
  ],
  "enforceProbs": [
    { "successRate": 100, "failRate": 0, "downgradeRate": 0 },  // lv 0→1
    { "successRate": 100, "failRate": 0, "downgradeRate": 0 },  // lv 1→2
    ...
  ],
  "passives": [ { "0": { "bdR": 0 }, "1": { "bdR": 2 }, ... } ]
}
```

**Condition types** (what must be true before the SHINE stone can be activated):

| `type` | Extra fields | Meaning |
|--------|-------------|---------|
| `stone` | `stoneType`, `count` | Must have `count` stones of `stoneType` activated |
| `skill` | `skillId`, `lv` | A specific Hexa skill must be at level `lv` |
| `level` | `level` | Character must be at least this level |
| `stonelevel` | `stoneType`, `lv` | One stone of `stoneType` must be enhanced to at least `lv` |
| `endstone` | `count` | Must have `count` rushEnd stones activated |
| `all` | `all: 1` | All stones on the board must be activated |

**Enhancement** for SHINE stones uses `costs.enforcement.SHINE[currentLevel].default` and has a probability of failure or downgrade (see `enforceProbs`). This is unlike regular stones where upgrades always succeed.

---

## Using This Data in Next.js

### Importing

Copy `output/erda-link-data.json` into your Next.js project (e.g. `src/data/erda-link-data.json`) and import it:

```ts
import data from '@/data/erda-link-data.json';
import type { ErdaLinkData, Stone, TreeNode, CharacterData } from '@/types/erda-link';
```

The types are defined in the output section of `extract-erda-link.ts` — copy the exported interfaces into a `types/erda-link.ts` file in your Next.js project.

### Lookup helpers

```ts
// Build a stone lookup map once at module level
const stoneMap = new Map(data.stones.map(s => [s.id, s]));

// Get character data
const sia = data.characters.find(c => c.name === 'Sia Astelle')!;

// Get the stone for a node
const stone = stoneMap.get(node.stoneId)!;

// Activation cost
const actCost = data.costs.activation[stone.category][stone.costType];

// Upgrade cost at current level
const upgCost = data.costs.enforcement[stone.category]?.[currentLevel]?.[stone.costType];

// Stat value at a given level (first stat group)
const stats = stone.passives[0]?.[level] ?? {};
```

### State shape

A calculator needs to track each node's current level per character:

```ts
type BuildState = {
  characterName: string;
  // nodeIndex → current level (0 = not activated)
  nodeLevels: Record<number, number>;
};
```

### UI components you'll need

**`<ErdaLinkBoard>`** — the main component:
- Renders the 1600×1080 background image in a pannable/scrollable container
- Iterates `character.nodes` (excluding SHINE sector) and renders each node at `node.position`
- Highlights which nodes are activated vs locked vs available

**`<StoneNode>`** — individual node on the canvas:
- Shows the stone icon (`iconOutlink` → your extracted PNG path)
- Shows current level / max level
- Grayed out (`iconDisabled` variant) if not activated
- Click to open upgrade modal

**`<ShineBoard>`** — separate bottom panel for the 6 SHINE nodes:
- Different visual treatment (shineboard UI, not the main canvas)
- Shows SHINE stone conditions as unlock requirements

**`<StoneModal>`** — appears on node click:
- Stone name, description
- Current level and stat value at that level
- Next level stat value
- Activation or upgrade cost
- Activate / Upgrade / Max button

**`<CostSummary>`** — totals across the whole build:
- Total Sol Erda spent / remaining to target
- Total Sol Erda Fragments spent
- Total Meso (for SHINE)
- Breakdown by stone category

### Connection lines

The WZ data includes PNG connection lines between nodes, but since images are placeholders in this export, you'll need to draw connections in code. Each node's prerequisite list tells you which nodes to draw lines to — draw a line from each node in `prereqAnd`/`prereqOr` to the current node. Use SVG lines or an HTML5 canvas layer rendered behind the node icons.

---

## Context for LLM-Assisted Development

When prompting an LLM to build components with this data, include:

1. **This README** for the data model explanation
2. **The type definitions** from `extract-erda-link.ts` (the exported interfaces section)
3. **A sample slice of the JSON** — specifically one character's nodes, a few stones of each category, and the costs object — rather than the full 71-stone dataset
4. The **background image dimensions** (1600×1080) and the fact that it needs to be pannable
5. The **game mechanic** being modeled: nodes are unlocked in order (prerequisites must be satisfied), each node has a stone that provides stats, upgrading costs Sol Erda + Fragments

The most important data relationships to call out explicitly in your prompt:
- `node.stoneId` → `stones[].id` (join key for stone details)
- `node.prereqAnd / prereqOr` → other `node.nodeIndex` values (prerequisite graph)
- `stone.costType` + `stone.category` → `costs.activation/enforcement` (cost lookup)
- `stone.passives[0][level]` → stat object at that level (what the player gains)
