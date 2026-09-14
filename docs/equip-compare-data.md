# Equip Comparison - WZ Data Spec

Reference for the `/equip-compare` tool. Everything below was verified against GMS WZ data
extracted by `WzDataExtractor/EquipmentExtractor`, and spot-checked against known in-game values.

Source WZ: `C:\Program Files (x86)\Steam\steamapps\common\MapleStory\Data`

## Regenerating the source data

```bash
cd /mnt/c/Users/Mason/Documents/coding_projects/WzDataExtractor
"/mnt/c/Program Files/dotnet/dotnet.exe" run \
  --project "C:\Users\Mason\Documents\coding_projects\WzDataExtractor\EquipmentExtractor\EquipmentExtractor.csproj" \
  -c Release -- \
  --data "C:\Program Files (x86)\Steam\steamapps\common\MapleStory\Data" \
  --out  "C:\Users\Mason\Documents\coding_projects\WzDataExtractor\output\equipment" \
  --verbose --min-level 100 --dump-options --dump-exceptional
```

Add `--no-icons` to skip icon extraction when only the stat data has changed.

Takes ~4 minutes (`Weapon/` alone is 620MB). `dotnet` is not installed inside WSL - the Windows
binary must be invoked by path. Produces four files:

| File | Size | Contents |
|---|---|---|
| `equipment.json` | ~4.0 MB | 5,039 equips, level 100+ |
| `item_options.json` | ~2.2 MB | 743 potential lines (whole pool) |
| `set_items.json` | ~138 KB | 182 set definitions |
| `exceptional.json` | ~4 KB | 9 Exceptional Enhancement consumables (see below) |

## Core architectural constraint

**You cannot compare two items - only two loadouts.** Set effects are counted across the whole
equipped set, so swapping one piece changes the bonuses granted by pieces you kept. A two-item diff
is structurally incapable of being correct. The engine takes two full loadouts and diffs them.

## `equipment.json`

Record shape:

```json
{
  "ItemId": 1004808,
  "Category": "Cap",
  "Name": "Arcane Umbra Knight Hat",
  "ReqLevel": 200,
  "Cash": false,
  "Icon": "",
  "Stats":   { "reqLevel": 200, "incSTR": 80, "incPAD": 12, "setItemID": 617, ... },
  "Strings": { "islot": "Cp", "vslot": "Cp", ... },
  "Nested":  { "option": {...}, "level": {...} }
}
```

### Slots - use `islot`, never item-ID ranges

`islot` / `vslot` are the game's authoritative equip-slot codes and are present on **all 5,039**
records. Distribution:

| `islot` | n | Slot |
|---|---|---|
| `Wp` | 2095 | Weapon (one-handed) |
| `WpSi` | 534 | Weapon (two-handed - occupies weapon **and** secondary) |
| `Si` | 445 | Secondary (shields, katara, misc secondaries) **and emblems** - see below |
| `Me` | 316 | Medal |
| `Cp` | 222 | Hat |
| `Gv` | 185 | Gloves |
| `Ri` | 184 | Ring |
| `So` | 170 | Shoes |
| `MaPn` | 164 | Overall (occupies top **and** bottom) |
| `Sr` | 124 | Cape |
| `Be` | 97 | Belt |
| `Pe` | 95 | Pendant |
| `Sh` | 93 | Shoulder |
| `Ae` | 64 | Earrings |
| `Af` | 63 | Face accessory |
| `Ba` | 47 | Badge |
| `Ma` | 44 | Top |
| `Pn` | 43 | Bottom |
| `Ay` | 22 | Eye accessory |
| `Po` | 20 | Pocket |
| `Tm` | 12 | Mechanical heart - see below |

Multi-slot codes (`WpSi`, `MaPn`) are concatenated slot codes, and the loadout model must honour
them: equipping a `WpSi` blanks the secondary slot, equipping a `MaPn` blanks top and bottom.

**Occupancy is not the same as eligibility.** A `WpSi` *occupies* weapon and secondary but can only
be *equipped into* weapon; a `MaPn` occupies top and bottom but is only equipped into top. Treating
the occupancy list as a pick list is what put every two-handed weapon in the Secondary picker.
`occupiedSlots()` and `equippableSlots()` in the engine are deliberately separate for this reason.

An ID-prefix heuristic would be **wrong** as a general rule: prefix `140` splits across both `Wp`
(67 items) and `WpSi` (101 items). Per-item `islot` is required.

#### …with two exceptions, where `islot` is genuinely ambiguous

Two codes cover items that sit in different equipment-window slots, and the game separates them by
item ID. `build-equip-data.mjs` synthesises a slot code for these and keeps the original on `islot`,
because the potential tables are keyed by the WZ code and know nothing about the split.

| Code | ID range | Synthesised slot | Why |
|---|---|---|---|
| `Si` | 1190000–1199999 | `Em` (47 items) | Emblems share `Si` with shields and secondary weapons |
| `Tm` | 1670000–1679999 | `Ht` (12 items) | Mechanical hearts share `Tm` with androids (166xxxx) and mounts |

Hearts were missing entirely until this was handled: they live in `Character/Android`, a directory
the extractor did not scan, and their IDs fall inside the `>= 121 and <= 171 => "Weapon"` arm of
`GetCategoryFromItemId`. They are not trivia - **Total Control** (lv200) is +25 all stat / +15 ATT /
+30% IED and belongs to set 677; **Black Heart** carries +77 ATT. Androids themselves are cosmetic
and are dropped.

### Stats

`Stats` holds every numeric child of the item's `info` node, under raw WZ keys. Keys relevant to
damage:

| Key | Meaning |
|---|---|
| `incSTR` / `incDEX` / `incINT` / `incLUK` | Flat main/sub stat |
| `incPAD` / `incMAD` | Attack / Magic Attack |
| `incMHP` / `incMMP` | Flat HP / MP |
| `incPDD` / `incMDD` | Physical / Magic DEF |
| `bdR` | Boss damage % |
| `imdR` | Ignore enemy DEF % |
| `tuc` | Base upgrade (scroll) slot count |
| `setItemID` | Set membership (see below) |
| `fixedPotential` | Item ships with preset potential (469 items) |
| `reqJob` / `reqSpecJob` | Job restriction bitmask |

> **Extractor bug fixed during this work.** The original info loop captured only
> `WzIntProperty`/`WzLongProperty`. 86 items store `incPAD` as a *string* (e.g. Loveless Grim
> Seeker = `"147"`) and **none** of them also carry an int form - so their attack power read as
> zero. Also affected `incSTR` (11), `incACC` (5), `incMAD` (2), `incSpeed` (2), `incJump` (2),
> `incDEX` (1), `incEVA` (1), `incAttackCount` (1). String values that parse as integers are now
> coerced into `Stats`. Item count carrying `incPAD` went 3,977 → 4,063, exactly +86.
> **This bug affected every consumer of `EquipmentExtractor`, not just this tool.**

### `Nested` - structured `info` children

Captured via a whitelist; the scalar passes cannot represent these.

| Key | n | Shape / meaning |
|---|---|---|
| `option` | 313 | Fixed potential lines: `{"0": {"option": 60057, "level": 1}, ...}`. All referenced IDs are gradeCode 6. 5 items have an empty node. |
| `level` | 334 | Growth equips. `info.<lvl>` gives `incXXXMin`/`incXXXMax` per level plus `exp`; `case` holds proc/skill rolls. Gains are **random ranges**, so these cannot be resolved deterministically - the UI must ask for current level and actual rolled stats. |
| `variableStat` | 62 | Float multipliers, e.g. `{"incPAD": 0.8, "incMAD": 1.3}`. Purpose not yet pinned down. |
| `addition` | 58 | Conditional bonuses, e.g. `{"critical": {"con": {"lv": 30}, "prob": 15, "damage": 3}}` (crit rings). |
| `reqSpecJobs` | 30 | Job restriction lists. |
| `dayOfWeekItemStat` | 14 | Day-gated stats, e.g. `{"1": {"imdR": 10}}` (Monster Park medals). |
| `addtion` | 1 | WZ's own typo for `addition`. |

Deliberately **not** captured (cosmetic): `head`, `0`/`1`/`2`, `onlyUpgrade`,
`onlyUpgradeThousand`, `abilityTimeLimited`, `showTuc`, `showOption`, `showExOption`, `bonusExp`,
`bonusDrop`, `replace`, `sealed`.

## `set_items.json` - set effects

```json
{
  "SetItemId": 617,
  "Name": "Arcane Umbra Set (Warrior)",
  "ItemIds": [ ... ],
  "Effects": { "2": { "incPAD": 30, "bdR": 10 }, "3": { ... } },
  "OptionEffectsNormalized": { "6": { "ignore_enemy_def_percent": 30, ... } }
}
```

`Effects` is keyed by **piece count**, and effects are cumulative: a 4-piece set grants the 2, 3,
and 4 entries together.

### Set effects arrive on two channels - both must be merged

- `Effects[count]` - plain stats (`incPAD`, `incAllStat`, `incMHP`, …). Note set boss damage here
  uses **`nbdR`**, not `bdR` (37 occurrences, e.g. 7th Warrior Set 3-piece `{"nbdR": 2}`).
- `OptionEffectsNormalized[count]` - resolved `ItemOption` references, which is where most boss
  damage (135) and IED (98) actually live, under `boss_damage_percent` /
  `ignore_enemy_def_percent`.

Reading only `Effects` would miss the majority of set boss damage and IED entirely. Set 617's
2-piece is `{"incPAD": 30}` in `Effects` plus `{"boss_damage_percent": 10}` in
`OptionEffectsNormalized` - together the +30 ATT / +10% boss the game shows.

### Membership must come from the item side

`ItemIds` in `SetItemInfo.img` is **stale and incomplete**. Cross-checking both directions:

- 286 items backlink via `setItemID` to a set whose `ItemIds` omits them.
- Worst offenders: Chaos Pink Bean Set II (29 missing), Root Abyss Set Warrior (19), Thief (16),
  Magician (16), Party Quest Set (15).

**Build membership by scanning every item's `Stats.setItemID`.** Treat `ItemIds` as advisory only.

Sentinels / gaps: `setItemID = -1` (Synergy Ring) means *no set* and must be filtered.
`setItemID = 407` (Sealed Root Abyss Spirit Walker Fan) references a set absent from
`set_items.json` - a single unresolved item.

Validated against the game: Arcane Umbra Set (Warrior), setId 617 - 2-set +30 ATT / +10% boss;
3-set +400 DEF / +10% IED; 4-set +35 ATT, +50 all stat, +10% boss; 5-set +2000 HP/MP, +40 ATT,
+10% boss. Matches in-game exactly.

## `item_options.json` - the potential pool

743 lines. This is the **catalog**, which is all a comparison tool needs; roll probabilities are
server-side in GMS and are not required (`weight` is present on only 151 lines).

```json
{
  "OptionId": 40601,
  "OptionType": 10,
  "ReqLevel": null,
  "Description": "Boss Damage +#incDAMr%",
  "GradeCode": 4,
  "Info": { "optionType": 10 },
  "Levels":           { "20": { "incDAMr": 30, "boss": 1 }, ... },
  "LevelsNormalized": { ... }
}
```

### Option ID encoding - **verified**

```
optionId = GRADE * 10000 + KIND * 1000 + line
             KIND 0 = regular potential
             KIND 2 = bonus (additional) potential
```

Confirmed by paired lines and cross-checked against in-game values:

| Line | Regular | value | Bonus | value |
|---|---|---|---|---|
| Rare %STR | `10041` | 3–4% | `12041` | 3% |
| Epic %STR | `20041` | 7% | `22041` | 5% |
| Unique %STR | `30041` | 10% | `32041` | 6–7% |
| Legendary %STR | `40041` | 13% | `42041` | 8–9% |
| Legendary Boss | `40601/2/3` | 30/35/40% | `42602` | 18–20% |
| Legendary IED | `40291/2` | 35/40% | `42291/2` | 3/5% |

Legendary regular boss damage at 30/35/40% and IED at 35/40% match the game exactly.

### Grade codes

| Grade | n | Meaning |
|---|---|---|
| 0 | 149 | Legacy / pre-grade lines |
| 1 | 87 | Rare |
| 2 | 81 | Epic |
| 3 | 103 | Unique |
| 4 | 125 | Legendary |
| 6 | 78 | **Fixed-potential presets** - verified: all 916 `Nested.option` references resolve here |
| 7 | 120 | Flat stats + procs; shape of nebulites. Unverified. |

Grades 1–4 are the live cubing pool (396 lines across regular + bonus).

### `Levels` is indexed by item level tier - **verified**

```
levelIndex = ceil(item.reqLevel / 10)     // clamped to 1..25
```

Verified on `40291` (regular Legendary IED): 35% for levelIndex 1–20, stepping to 40% at 21+.
A level-200 weapon uses index 20 → 35%, which is exactly the in-game value. Indices 21–25 cover
item levels 201–250 and are currently unreachable in GMS.

### `optionType` - slot restriction

Derived from the descriptions of the **grade 1–4** lines.

> **Do not infer the slot map from grade-6 fixed-potential references.** On presets the
> `optionType` field is vestigial - the potential is assigned by the item, not rolled, so it is not
> filtered by slot. The Dominator Pendant (`1122376`, `islot=Pe`) carries two `optionType=11`
> ("armor") `%HP` lines, which would otherwise look like a contradiction. Slot-restriction
> semantics apply only to the rollable grades 1–4.

| `optionType` | n | Slot | Evidence |
|---|---|---|---|
| *(absent)* | 291 | Any slot | %stat lines (`40041` etc.) roll everywhere |
| `10` | 235 | Weapon / secondary / emblem | ATT, %ATT, Boss, IED |
| `11` | 125 | Armor | DEF, %DEF, %HP/MP |
| `20` | 9 | **Unresolved** | 7 defensive "ignore damage when attacked" lines + 2 bonus-pot crit damage |
| `40` | 19 | Accessory | HP/MP recovery, meso/drop rate |
| `51` | 22 | Hat | Decent Mystic Door, Decent Advanced Blessing |
| `52` | 9 | Top / Overall | invincibility, damage reflect |
| `53` | 4 | Bottom | Decent Hyper Body |
| `54` | 17 | Gloves | Decent Sharp Eyes, Decent Speed Infusion, **Critical Damage** |
| `55` | 12 | Shoes | Decent Haste, Decent Combat Orders |

The 51–55 assignments match well-known GMS slot restrictions (crit damage is gloves-only; Decent
Haste is shoes-only; Decent Hyper Body is bottom-only), which is strong independent confirmation.

Note there is **no `optionType` of 0** - 291 lines carry no `optionType` field at all, which is
semantically distinct and is represented as `null`.

## Site-ready output - `public/equip-data/`

Built by `npm run build-equip-data` (`src/scripts/build-equip-data.mjs`), which reads the three
extractor files and emits fetched-at-runtime JSON. Dependency-free `.mjs`, matching the
`inject-shine-stones.mjs` precedent.

| File | Size | Contents |
|---|---|---|
| `items.json` | 1073 KB | 4,794 items: id, name, slot, reqLevel, normalized stats, setId, flags |
| `potentials.json` | 167 KB | 623 usable lines (335 rollable at grades 1–4) |
| `sets.json` | 52 KB | 177 sets with merged effects and backlink-derived membership |
| `meta.json` | 2 KB | slot table, counts, optionType→slot map |

Raw WZ keys are mapped to a normalized vocabulary (`incSTR`→`str`, `bdR`/`nbdR`→`boss`,
`imdR`/`ignoreTargetDEF`→`ied`, …). Any key that is neither mapped nor explicitly ignored is
**reported at the end of the run** rather than dropped, so a future WZ update cannot silently lose
a stat. That report is what caught `damR` (real damage % on 40 Meister weapons) and `icnSTR` (a WZ
typo for `incSTR` on both Special Casa Crow records).

Potential `tiers` are run-length encoded over the level index - look up the last tier whose `from`
is `<=` the item's level index. Legendary boss `40601` compresses from 25 entries to 2.

Item flags that change how modifiers apply, rather than being stats themselves:

| Flag | n | Why it matters |
|---|---|---|
| `superior` (`superiorEqp`) | 35 | Superior/Tyrant gear uses a **different star force stat table** |
| `exceptionalSlots` (`Etuc`) | 6 | Exceptional Enhancement slots (boss accessories) |
| `growth` | 334 | Random per-level rolls - UI must ask for actual rolled stats |
| `fixedPotential` / `fixedGrade` / `noPotential` | - | Potential availability rules |
| `presetPotential` | 269 | The item's potential lines, already decided (see below) |
| `bossDrop` (`bossReward`) | 1,806 | Feeds the notability filter |
| `notable` | 2,751 | Whether the picker shows the item by default |
| `tuc` | 4,950 | Total upgrade count - scroll slots. Kept even when **0**, see below |
| `starMin` / `starMax` | 334 / 908 | The item's own star force range, overriding the level table |
| `aliases` | - | Ids of re-issued duplicates folded into this record |

### Star force is per item, not per level

`starforce.js` derives a star ceiling from item level, and for most gear that is right. Two things
break it, and the WZ states neither as a rule, so the build resolves both into an explicit
`starMin` (the stars the item is granted with and cannot go below) and `starMax` (0 = cannot be
star forced at all).

**Items that cannot be enhanced.** `tuc: 0` - no upgrade slots - is what stops an item being star
forced, and it is the one signal the game does give us. It holds across every medal, emblem, pocket
item, event ring and quest weapon in the dump.

`Si` is exempt. The whole Princess No and Astra secondary generation carries `tuc: 0`, and that is
exactly the gear people star, so for that slot the upgrade count is plainly not tracking star
force.

**Badges** are the opposite case, and `tuc` gets them exactly right. Only two badges in the game
can be star forced or take potential - Sengoku Hakase and Ghost Ship Exorcist, both capped at 22 -
and they are the only two badges in the dump with any upgrade slots. Every other badge gets
`starMax: 0` and `noPotential: true`. Badges also enhance off [their own
table](https://maplestorywiki.net/w/Star_Force_Enhancement/Stat_Tables): All Stats and nothing else,
no attack at any star, no Max HP, no DEF. At 22★ that is +131 All Stat on a level 160 badge, which
is why those two are the badges everyone wears.

**Fixed-star gear**, curated by set, name and stat rank:

| Item | Range | How it is identified |
|---|---|---|
| Genesis weapons | 22 fixed | Weapon in an Eternal set (886–890), name `Genesis …` |
| Destiny weapons, stage 1 | 22 fixed | Same, name `Destiny …`, `tuc` 8 |
| Destiny weapons, stage 2 | 22 → 25 | Same, `tuc` 9 |
| Red Beryl accessories | 20 fixed | `fixedPotential` and name `Red Beryl …` |
| Astra secondaries | 15 / 20 / 30 | Three same-named `Si` records, ranked by stat total |

The two Destiny stages carry **identical stats** and differ only in that upgrade count, so they
cannot be folded together - the ceiling is the only thing separating them, and it is the thing
being compared. The picker prints the ceiling on any row that disagrees with its level, which is
also what tells the three Astra grades apart in a list where they share a name.

There is no `onlyUpgrade` or `onlyUpgradeThousand` key anywhere in this dump; whatever records the
Destiny stage in the client is not in the extractor's output.

The ranking uses this too. Ordering the picker on base stats alone put unstarrable gear at the top
of lists it does not belong in, because the biggest single source of stat on endgame gear is star
force. `itemScore()` now scores every item at **22★ or its own ceiling, whichever is lower** - a
shared reference point rather than each item's own cap, since comparing at each item's cap rewards
the cap instead of the item (it ranked the unliberated Sealed Genesis weapons, which reach 30,
above the Genesis weapons they turn into).

### What the picker's ordering is worth

`itemScore()` prices everything in points of **main stat**:

| | worth |
|---|---|
| 1 attack / magic attack | 3 |
| 1% main stat, All Stat, attack | 10 |
| 1% boss damage, damage | 10 |
| 1% ignore DEF | 5 |

plus the star force an item would gain at the reference star count, plus its share of any set
bonus. That last term is `set.perPiece` in `sets.json`: the whole set effect divided by the pieces
needed to earn all of it. It is a sort key only - the engine's own set resolution is exact and does
not use it - but leaving it out misjudged exactly the gear that has *no* set. A 15★ Tyrant piece
really does carry more attack than the Arcane Umbra piece that replaced it; the only reason it is
not the better item is the set bonus, so the score has to know about the set bonus.

Superior (Tyrant) gear still ranks second or third in the slots it competes in, and that is not a
bug: 15 superior stars is +115 All Stat and +150 ATT, which genuinely beats a 22★ level-200 piece
on raw stats. What it does not beat is a 22★ level-250 Eternal piece with a set behind it.

### Duplicates are folded at build time

The game ships the same item under several ids - five Royal Warrior Helms, two Time Traveler's
Laurels - usually because it was re-issued for a later event. 245 of them collapse into their
lowest id.

The key covers every field that could make two same-named items behave differently: slot, level,
`reqJob`, `setItemID`, the whole stat block, `presetPotential`, `superior`, `Etuc`, `growth`,
`fixedGrade` and `tuc`. `reqJob` and `presetPotential` in particular have to be in it - the two
Dominator Pendants are identical apart from their preset potential lines, and collapsing them would
hide the magician's.

Dropped ids are kept on the survivor as `aliases`, and `buildIndexes()` maps them back, so a
loadout saved before the fold still resolves.

### The picker ranks; it does not hide

The dump is every level-100+ equip in the game, and most of it is event gear, old questlines and
achievement medals nobody will ever compare. The obvious move is to infer which items matter and
hide the rest. **That was tried and reverted, and the reason is worth keeping.**

Nothing in the WZ says "this item matters", so notability has to be inferred from boss-drop and
set-membership flags - and those flags miss real gear. The Princess No secondaries carry neither,
so an entire generation of endgame secondaries disappeared from the picker and bowmen and pirates
were left with nothing but old event gear. Chaos Horntail Necklace and Sweetwater Pendant miss them
too. There is no fix short of curating several thousand items by hand, because the game does not
record what the heuristic is trying to infer.

So the picker shows everything and **orders by an estimate of power** instead. Ranking cannot hide
anything: being wrong about an item costs it a few rows rather than removing it from the tool. The
score (`itemScore` in `itemFilter.js`) is a sort key, not a damage model, and is judged only on
whether the six items you might equip sit above the two hundred you never will.

Two things it must get right, both of which the first version got wrong:

- **Attack and main stat are counted once, not once per variant.** A heart with 77 ATT and 77 MATT
  is a 77-attack item to every class. Summing the raw keys made all-stat gear look twice as good as
  it is.
- **It is class-aware.** With a class picked it scores off that job's main stat and its attack
  type; without one it takes the best variant, which is the right guess.

Sanity anchors, all asserted in `verify-equip-engine.mjs` as relative orderings rather than
absolute ranks: Eternal Knight Helm > Arcane Umbra Knight Hat > Royal Warrior Helm, Astra Talisman >
Thousand Soul Talisman, Superior Engraved Gollux Pendant > Reinforced, Immortal Legacy > the
level-200 achievement medals, and Princess No's Floral Jewel > Maple Treasure Ereve Brilliance -
the exact regression that caused the rewrite.

### Notability - still computed, no longer applied by default

The flag remains, as a filter the user can switch on and as an honest signal in its own right:

```
notable = has a damage-relevant stat
          AND (bossReward OR belongs to a set with effects OR (reqLevel >= 200 AND slot != Me))
```

The level clause is a fallback for gear too new to be flagged or set-bound - the Astra secondaries
carry neither signal but are current endgame items. **Medals are excluded from that clause**: a
level-200 requirement on a medal says the player was level 200, not that the medal is endgame gear.
108 of them carry 3 ATT. Every medal worth comparing is a boss reward or a set piece anyway.

`src/lib/equip/itemFilter.js` owns the rule so the picker and the verify script cannot drift apart,
and a check asserts that **the default filters hide nothing** for every slot and class.

The picker also offers a **minimum level**, likewise off by default, and only on slots where level
orders the tiers: hat, top, bottom, shoes, gloves, cape, shoulder and weapon. It is hidden elsewhere
rather than applied invisibly, because elsewhere it costs real gear and buys nothing - Crystal
Ventus Badge is level 130, Black Heart 120, and a floor of 140 empties the secondary slot outright
for bowmen and pirates.

Class is still a hard constraint, so a magician's weapon list is ~490 rather than ~2,400. That is
the one slot ordering has to carry alone: neither class nor level distinguishes a wand from a staff
from a shining rod. Filtering by weapon type would need a hand-maintained id-prefix → type table.

### Preset potential - the 269 items whose lines are already decided

`Nested.option` holds `{option, level}` children for items whose potential is fixed: Dominator
Pendant, the Tower of Oz emblems, the Krrr rings. Those option ids point at **grade 6** lines,
which are the fixed-potential pool and carry exactly one tier each, so the item's level index does
not affect them. `effectivePotentials()` applies them unless the user has entered their own, so the
item resolves correctly the moment it is equipped instead of reading as unpotentialed.

The rest of the `fixedPotential` items - Red Beryl and the other rental sets - carry only the flag.
Their lines are chosen per job when the item is granted and are genuinely absent from the data, as
are the bonus stats they arrive with.

For Red Beryl that configuration is transcribed instead, in `src/lib/equip/specialItems.js`, keyed
by the branch's main stat: Unique potential (10% / 7% / 7% main stat, which is `30041` plus two of
`20041` for a warrior) and four tier-5 bonus stat lines - main stat, main + secondary, All Stat %,
and attack. The star count lives in the data as `starMin`/`starMax`, because that is a property of
the item rather than of the character wearing it. Everything transcribed is a *default*: the moment
the item is equipped its configuration belongs to the user and every value can be changed.

Nothing is filled in when no class is selected - which lines a preset rolls depends entirely on the
main stat, so the editor asks for a class rather than guessing one. Every other `fixedPotential`
item still says so and asks the user to enter it.

Validated end to end: Arcane Umbra Knight Hat = 65 STR/DEX, 600 DEF, 7 ATT, 15% IED; Arcane Umbra
Whispershot = 100 STR/DEX, 276 ATT, 20% IED, 30% boss; set 617 2-piece = +30 ATT / +10% boss. All
match the game.

## Stat bucketing for the engine

Stats must be kept in separate buckets and never pre-summed, because they combine differently:

- **Flat stat** (`incSTR`…) - additive
- **Stat %** (`incSTRr`…) - multiplies a base that includes AP and every other flat source
- **ATT / MATT** (`incPAD`/`incMAD`) - additive
- **ATT %** (`incPADr`/`incMADr`) - multiplicative on attack
- **Boss %** (`bdR`) - additive
- **Damage %** (`incDAMr`) - additive; `boss: 1` on the same line marks it boss-only
- **IED** (`imdR`/`ignoreTargetDEF`) - **multiplicative**: `1 - Π(1 - ied_i)`
- **Crit damage %** - additive

## UI assets - `UI.wz`

The equipment window is a rebuild of the client's own UI, not an approximation. Assets come from
`UI/UIEquip.img` and `UI/UIToolTip.img` via `WzDataExtractor/UIExtractor`:

```bash
cd /mnt/c/Users/Mason/Documents/coding_projects/WzDataExtractor
"/mnt/c/Program Files/dotnet/dotnet.exe" run --project ".\UIExtractor\UIExtractor.csproj" -c Release -- \
  --data "C:\Program Files (x86)\Steam\steamapps\common\MapleStory\Data" \
  --img UIEquip.img --path "Equip/EquipTab" --images --out ".\output\ui"
```

`UIExtractor` also takes `--dir` to point at any WZ subtree (e.g. `Character\Cap`), which is how the
icon bug below was diagnosed.

### How UI canvases are stored

The logical tree lives in `UI.wz/<name>.img`, but **the pixels live in `UI/_Canvas/<name>.img` at
the same node path**. In the main tree every canvas is a 1×1 stub carrying an `_inlink`/`_outlink`
string. Origins live on the `_Canvas` node too, not the stub.

### Window geometry

| Node | Meaning |
|---|---|
| `Equip/EquipTab/canvas:equip` | Window background, 342×349, origin (−12, −61) |
| `Equip/EquipTab/Slots/<n>` | Per-slot canvas whose **origin is the slot position** |
| `Equip/EquipTab/SlotName/<n>` | 42×42 label tile drawn in an empty slot |
| `Equip/EquipTab/SlotsText/<n>` | Slot display name |
| `Equip/EquipTab/SlotSize` | 42 |

WZ origins are *negated* positions in the window's coordinate space. Subtracting the background's
own origin (12, 61) converts them to offsets inside the background image. The result is a clean
45px grid: x ∈ {15, 60, 105, 150, 195, 240, 285}, y ∈ {39, 84, 129, 174, 219, 264}. All 25
positions in `src/lib/equip/uiLayout.js` were verified against the WZ origins with zero mismatches.

`SlotsText` gives the authoritative slot numbering (1 Hat, 2 Face, … 30 Emblem). Indices 49–65
duplicate earlier slots at the same positions and are legacy. Ring slots share a single label
sprite (12), as does the second pendant (17).

Slot 28 is Heart and slot 27 is Android. Only Android is left inert - it is cosmetic and has no
items in the dataset. Heart is a real, fillable slot; it looked broken purely because hearts were
never extracted.

### Tooltip

`UIToolTip.img/Equip/frame/common` is a vertical 3-slice, 324px wide: `top` (324×30), `mid`
(324×1, repeated to any height), `btm` (324×12), plus a `line` separator (324×3).

### Item icons - a use-after-dispose bug in the extractor

Icons initially resolved for only **2,813 of 5,027** items. Every one of the 2,214 failures logged
the same GDI+ message, `"Parameter is not valid."`, and the failures were *interleaved* with
successes rather than clustered - which ruled out resource exhaustion and pointed at something
data-dependent.

The cause was bitmap ownership. `WzPngProperty.GetImage()` decodes once and **caches the `Bitmap`
on the property**, handing out the same instance on every later call:

```csharp
public Bitmap GetImage(bool saveInMemory)
{
    if (png == null) ParsePng(saveInMemory);
    return png;                      // cached - the caller does not own this
}
```

`TryWriteIcon` called `bmp.Dispose()` after saving. Large numbers of equips share a single canvas
node, so the first item through disposed the cached bitmap and every subsequent item resolving to
that same node received a **disposed** `Bitmap` - throwing as soon as `.Width` or `.Save()` touched
it. Removing the three `Dispose()` calls on WZ-owned bitmaps fixes it.

Worth noting for future work in this extractor: anything `GetImage()` returns belongs to the WZ
object graph and must not be disposed by the caller.

**This affected every consumer of `EquipmentExtractor`, not just this tool.**

## What is built

| Path | Role |
|---|---|
| `src/scripts/build-equip-data.mjs` | WZ extractor output → `public/equip-data/` (`npm run build-equip-data`) |
| `src/lib/equip/stats.js` | Bucketed stat model, `addInto` / `sumStats` / `diffStats`, multiplicative IED |
| `src/lib/equip/starforce.js` | Star force gain tables and `starForceGains()` |
| `src/lib/equip/flames.js` | Flame value tables, `resolveFlames()`, and which slots take flames at all |
| `src/lib/equip/engine.js` | `resolveItem` → `resolveLoadout` → `diffLoadouts`, set effects, slot occupancy vs eligibility |
| `src/lib/equip/classes.js` | Job branches and the `reqJob` bitmask filter |
| `src/lib/equip/itemFilter.js` | What the picker offers for a slot: hard constraints vs the user's noise filter |
| `src/app/equip-compare/` | The UI |
| `src/scripts/verify-equip-tables.mjs` | `npm run verify-equip-tables` - table transcription checks |
| `src/scripts/verify-equip-engine.mjs` | `npm run verify-equip-engine` - end-to-end checks against real data |

### Modifier order

Order matters and follows the game:

1. base stats
2. scrolls / soul / exceptional (flat)
3. **star force** - below 15 stars a weapon's attack gain compounds
   (`+1 + floor(current * 0.02)` per star) over base **+ scroll** attack, so scrolls must already
   be applied
4. **flames** - attack flames scale off *base* attack only, deliberately excluding scroll attack
5. potential and bonus potential

**Badges are the one slot star force never gives attack to.** They still take the flat stat from
every star, but the 16+ attack table is skipped, so a 22★ badge shows no ATT gain. This is encoded
as `SLOTS_WITHOUT_STAR_ATTACK` in `starforce.js` rather than as a special case at the call site.

### Not every slot takes flames

A Rebirth Flame cannot be used on **rings, shoulders, medals, emblems, badges, mechanical hearts or
secondaries** (`Si`, which covers shields and katara as well as class secondaries). Nothing in the
WZ records this - no flag distinguishes a flameable item from an unflameable one - so it is
transcribed from the MapleStory Wiki's Rebirth Flame page into `SLOTS_WITHOUT_FLAMES` in
`flames.js`, keyed by slot, which is the granularity the rule is stated at.

Two per-item exceptions exist in the GMS dump and beat their slot: **Scarlet Shoulder** (1152155)
and **Immortal Legacy** (1143471). The wiki also names Secret Ring, Boss Arena Emblem and Ancient
Slate Replica, none of which match anything in the data.

`resolveItem` checks this rather than trusting the config, because a saved slot config can outlive
the item it was entered against.

### Flame values, and what "flame advantaged" actually changes

All of `flames.js` is transcribed from the wiki's [Bonus Stats stat
tables](https://maplestorywiki.net/w/Bonus_Stats/Stat_Tables). Three things there are easy to get
wrong, and the earlier transcription got all three:

1. **Attack on a non-weapon is flat: +1 per tier, at every level.** It is not a share of the item's
   base attack - that is the *weapon* rule. Applying the weapon rule to accessories printed a
   column of 1s (`ceil(0.04 × 1)` through `ceil(0.41 × 1)`) and hid the line entirely on armour
   with no attack of its own, which is exactly the armour that rolls it.
2. **Max HP flattens above level 209.** The 30-per-tier step drops to 20 from 210 and caps at 700
   per tier at 250+. Level 250 equipment exists, so the old `30 × bucket` formula overstated HP
   flames on the Eternal set and the Destiny weapons by up to 7%.
3. **Single stat and DEF share one bucket for 200-229**, so a `level / 20` formula is wrong for
   220-229.

Flame advantage is a **rolling rule**, not a value: advantaged equipment rolls higher tiers and is
guaranteed all four lines. For every line except weapon attack, a tier-5 roll is worth the same
either way - which is why the editor has no advantaged toggle.

Weapon attack is the exception, and the wiki publishes it as two tables:

```
percent = bucket × tier × 1.1^(tier − offset)      bucket = the 40-level dual-stat bucket
                                                   offset = 1 ordinary, 3 flame advantaged
```

Ordinary weapons roll tiers 1-5 off the first, advantaged weapons tiers 3-7 off the second, and at
a shared tier number the two do not agree (level 200, tier 5: 43.93% against 36.3%). So they are
offered as two rows in the editor - "Attack Power" and "Attack Power (boss)" - each clickable only
at the tiers it can reach, and taking one replaces the other. Nothing is hidden behind a toggle and
the value you can read off your weapon is the value you click.

Lines are also restricted by item type, which the editor honours: Boss Damage and Damage are
weapons-only (boss damage also needs level 90), Speed and Jump are armour-only, and All Stat needs
level 70 on anything that is not a weapon.

**Not modelled:** the Required Level bonus stat (−5 per tier). It lowers the item's effective level,
which would feed back into every level-scaled table above.

### Exceptional Enhancement

Six items accept an Exceptional Hammer - Berserked, Original Sin of Pride, Magic Eyepatch,
Commanding Force Earring, Dreamy Belt and Immortal Legacy - and `Etuc` on the equipment says how
many times (1, or 3 on Original Sin of Pride and Immortal Legacy).

What a hammer is *worth* lives in `Item/Consume`, nowhere near the equipment it modifies, so
`EquipmentExtractor --dump-exceptional` writes it to `exceptional.json`. Nothing in a hammer marks
it as one - hundreds of ordinary scrolls carry the same `req` node naming the items they may be
used on - so the search runs from the other side: a consumable is an Exceptional Enhancement
exactly when its `req` names a piece of equipment carrying `Etuc`. That finds nine, the four
boss-drop Exceptional Parts (Nightmare Fragment, Gravity Module, Mark of Destruction, Helmet of
Loyalty) and the five Exceptional Hammers, which are two routes to one bonus:

| slot | per application |
|---|---|
| Belt, Earrings, Medal | All Stats +20, ATT/MATT +15, Max HP/MP +1000 |
| Face Accessory, Eye Accessory | All Stats +15, ATT/MATT +10, Max HP/MP +750 |

The build resolves the bonus **by slot** rather than by item id, because the hammers' `req` lists
have not kept up with the equipment: Original Sin of Pride carries three `Etuc` slots and appears in
no hammer's list, though the Face Acc hammer's description names it.

The slot config stores `exceptional` as a count of hammers applied, and `exceptionalGains()`
multiplies the block by it, clamped to `Etuc`.

### IED and floating point

`combineIed` rounds its result. `1 - (1 - 5/100)` does not round trip in binary floating point and
comes back as `5.000000000000004`, which reads as a real difference in `diffStats` and used to
print in full. `formatStat` rounds unconditionally for the same reason - it previously returned the
raw value whenever it was already close to an integer, which is exactly the case where the dust
survives.

### Set membership in the engine

A two-handed weapon fills two slots but counts as **one** set piece, so `resolveLoadout` collects
one entry per distinct item before counting. Equipping a `WpSi` or `MaPn` clears the slots it
displaces, otherwise the displaced item would keep contributing stats.

## Known gaps - not in WZ

These must be hand-encoded from the wiki and validated against in-game tooltips:

1. **Star force stat gain tables** (by item level tier and star count). The existing
   `src/app/star-force/utils.js` is a *cost/probability* simulator and contains no stat-gain logic.
2. **Flame / bonus stat value tables**.
3. **The character damage formula** (needed only for Tier 2 output).

## Open questions

- What `optionType = 20` restricts. Low stakes: 7 of its 9 lines are defensive and irrelevant to a
  damage comparison.
- What gradeCode 7 actually is. Shape suggests nebulites; unverified.
- Extractor noise: option IDs `8840000` and `8840007` are referenced by sets but resolve to
  nothing.
- **Which potential lines mechanical hearts can roll.** No `optionType` names `Tm`, so `Tm` is
  grouped with the accessories in `OPTION_TYPE_SLOTS` on inference alone. Hearts do take potential
  in game; the exact pool is unconfirmed.
- Whether `Si` items other than the Princess No and Astra generations are star forceable. The slot
  is exempted from the `tuc: 0` rule wholesale, which is the safe direction (it leaves the choice
  with the user) but is not individually confirmed.
- The level 250-300 weapon star force attack row. Not on the wiki; taken from the misaomaki
  simulator, which flags it as a guess. `starForceGainsAreUnverified()` reports it.
- Whether the two star-forceable badges are still the only two. The rule is derived from `tuc`, so a
  future badge with upgrade slots picks it up automatically - but a badge made enhanceable without
  gaining `tuc` would be missed.
- **Whether pocket items take flames.** They are not on the wiki's exclusion list, so they are
  currently treated as flameable. Guessing the other way would be no better than following the
  source, but this is worth an in-game check.
- What `fixedGrade` actually enumerates. The values in the dump are 2, 3, 5 and 7. Red Beryl and
  Dominator Pendant are both `5` and both show **Unique** in game, which fits `1/3/5/7 =
  rare/epic/unique/legendary` - but that would make the Arcane Umbra weapons at `7` legendary,
  which is unconfirmed. Nothing depends on it today: the grade is displayed, never used to compute
  stats.

## Output tiers

- **Tier 1** (ship first) - raw per-stat deltas. Needs no character context.
- **Tier 2** (later) - a single effective-damage %. Requires the user's character totals. The stat
  model above is bucketed specifically so this drops in without a rewrite.
