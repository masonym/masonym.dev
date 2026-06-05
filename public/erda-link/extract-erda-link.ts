/**
 * extract-erda-link.ts
 *
 * Parses MapleStory Erda Link WZ XML exports into structured JSON.
 * Run: npm install && npm run extract
 * Output: output/erda-link-data.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Output types ─────────────────────────────────────────────────────────────

export type StoneCategory = 'rush' | 'skill' | 'boost' | 'ultimate' | 'origin' | 'SHINE';
export type Sector = 'top' | 'right' | 'bottom' | 'left' | 'center' | 'SHINE';
export type CostType = 'default' | 'rushEnd' | 'half' | 'solJanus' | 'origin' | 'ascent';

export interface Stone {
  id: number;
  /** treeId of the character this stone belongs to (e.g. 18112 = Erel Light, 18212 = Sia Astelle). */
  treeId: number;
  category: StoneCategory;
  name: string;
  desc: string;
  maxLevel: number;
  /** Cost variant key for looking up activation + enforcement costs. */
  costType: CostType;
  /**
   * passives[statGroup][level] = { statKey: value }
   * level 0 = base (unactivated), level N = stats at that level.
   * Most stones have one stat group; some have two.
   */
  passives: Array<Record<number, Record<string, number>>>;
  connectSkills?: number[];
  /**
   * Skill prerequisite: { hexaSkillId: requiredLevel }
   * This skill must be at that level before the stone can be activated.
   */
  reqForActivation?: Record<number, number>;
  /** Boost stones with a proc/active trigger instead of a flat passive. */
  hasActiveEffect?: true;
  /** WZ outlink path for the icon image (e.g. Etc/_Canvas/ErdaLink.img/stone/rush/1/icon). */
  iconOutlink?: string;
}

export interface TreeNode {
  nodeIndex: number;
  sector: Sector;
  stoneId: number;
  /** Pixel position on the 1600×1080 canvas. Null for SHINE nodes (separate board). */
  position: { x: number; y: number } | null;
  /** ALL of these node indices must be activated before this node is unlockable. */
  prereqAnd: number[];
  /** At least ONE of these node indices must be activated (ignored if empty). */
  prereqOr: number[];
}

export interface CharacterData {
  name: string;
  treeId: number;
  /** Center SP node position — unconnected nodes link here. */
  spPosition: { x: number; y: number };
  nodes: TreeNode[];
}

export interface CostEntry {
  /** Sol Erda cost. Absent for SHINE enforcement (meso-only). */
  solErda?: number;
  /** Sol Erda Fragment cost. */
  fragments: number;
  /** Meso cost. Only present for SHINE enforcement levels. */
  meso?: number;
}

export interface Costs {
  /** activation[category][costType] → cost to go from level 0 → 1. */
  activation: Record<string, Record<string, CostEntry>>;
  /** enforcement[category][level][costType] → cost to go from `level` → `level+1`. */
  enforcement: Record<string, Record<number, Record<string, CostEntry>>>;
}

export interface ShineCondition {
  /** Condition type: 'stone' | 'skill' | 'level' | 'stonelevel' | 'endstone' | 'all' */
  type: string;
  count?: number;
  stoneType?: string;
  skillId?: number;
  level?: number;
  lv?: number;
  all?: number;
}

export interface ShineStone {
  id: number;
  order: number;
  maxLevel: number;
  desc: string;
  conditions: ShineCondition[];
  /** enforceProbs[i] = probability data for level i → i+1 transition. */
  enforceProbs: Array<{ successRate: number; failRate: number; downgradeRate: number }>;
  passives: Array<Record<number, Record<string, number>>>;
}

export interface ErdaLinkData {
  characters: CharacterData[];
  stones: Stone[];
  costs: Costs;
  shineStones: ShineStone[];
}

// ─── Character mapping ────────────────────────────────────────────────────────
// treeId: key in ErdaLink.img/tree/ AND ErdaLink.img/nodePos/ (both use treeId)

const CHARACTERS = [
  { name: 'Sia Astelle', treeId: 18212 },
  { name: 'Erel Light', treeId: 18112 },
  // { name: 'Iel', treeId: 183XX },
] as const;

// ─── WZ XML → plain object ────────────────────────────────────────────────────

type WzNode = Record<string, any>;

function parseWzXml(xmlPath: string): WzNode {
  const xml = readFileSync(xmlPath, 'utf-8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    // Always produce arrays for these tags to avoid single-vs-array inconsistency.
    isArray: (name) =>
      ['dir', 'string', 'int32', 'int64', 'double', 'vector', 'png'].includes(name),
  });
  const raw = parser.parse(xml);
  const root = raw.dir?.[0];
  if (!root) throw new Error(`No root <dir> in ${xmlPath}`);
  return wzToObject(root);
}

function wzToObject(element: any): WzNode {
  const result: WzNode = {};

  for (const [tag, items] of Object.entries(element) as [string, any[]][]) {
    if (tag.startsWith('@_')) continue;

    for (const item of items) {
      const name: string = item['@_name'];
      const value: string = item['@_value'];

      switch (tag) {
        case 'dir':
          result[name] = wzToObject(item);
          break;

        case 'string':
          // Skip WZ-internal metadata keys (e.g. _outlink handled via png case).
          if (!name.startsWith('_') && name !== 'info' && name !== 'shine') {
            result[name] = value;
          }
          break;

        case 'int32':
        case 'int64':
          result[name] = parseInt(value, 10);
          break;

        case 'double':
          result[name] = parseFloat(value);
          break;

        case 'vector': {
          // Some keys use "vector:name" format — normalise by stripping the prefix.
          const key = name.includes(':') ? name.split(':').pop()! : name;
          const [x, y] = value.split(',').map((n) => parseInt(n.trim(), 10));
          result[key] = { x, y };
          break;
        }

        case 'png': {
          // Image data in this export is a 1×1 placeholder pixel — not usable.
          // Capture only the _outlink which points to the real WZ image path.
          const strings: any[] = item.string ?? [];
          const outlink = strings.find((s: any) => s['@_name'] === '_outlink')?.['@_value'];
          if (outlink) result[name] = { _outlink: outlink as string };
          break;
        }
      }
    }
  }

  return result;
}

// ─── Passive stat extraction ──────────────────────────────────────────────────

function extractPassives(
  passiveNode: WzNode | undefined,
): Array<Record<number, Record<string, number>>> {
  if (!passiveNode) return [];
  const groups: Array<Record<number, Record<string, number>>> = [];

  for (const [groupStr, levels] of Object.entries(passiveNode)) {
    if (typeof levels !== 'object') continue;
    const groupIdx = parseInt(groupStr);
    if (isNaN(groupIdx)) continue;

    const group: Record<number, Record<string, number>> = {};
    for (const [lvlStr, stats] of Object.entries(levels as WzNode)) {
      const lvl = parseInt(lvlStr);
      if (isNaN(lvl) || typeof stats !== 'object') continue;
      group[lvl] = Object.fromEntries(
        Object.entries(stats as WzNode).filter(([, v]) => typeof v === 'number'),
      ) as Record<string, number>;
    }
    groups[groupIdx] = group;
  }

  return groups;
}

// ─── Stone extraction ─────────────────────────────────────────────────────────

function extractStonesFromCategory(stoneDir: WzNode, category: StoneCategory, treeId: number): Stone[] {
  const stones: Stone[] = [];

  for (const [idStr, raw] of Object.entries(stoneDir)) {
    const id = parseInt(idStr);
    if (isNaN(id)) continue;

    const s = raw as WzNode;
    if (s.locked === 1) continue;

    // Origin stones always carry an explicit costType ('origin' or 'ascent').
    // All others fall back to 'default'.
    const costType = (s.costType as CostType | undefined) ?? 'default';

    const stone: Stone = {
      id,
      treeId,
      category,
      name: (s.name as string) ?? '',
      desc: (s.desc as string) ?? '',
      maxLevel: (s.maxLevel as number) ?? 1,
      costType,
      passives: extractPassives(s.passive as WzNode | undefined),
    };

    if (s.connectSkill) {
      stone.connectSkills = Object.values(s.connectSkill as WzNode).filter(
        (v): v is number => typeof v === 'number',
      );
    }

    // reqForActivation: { hexaSkillId: requiredLevel }
    const reqNode = (s.condition as WzNode | undefined)?.reqForActivation as WzNode | undefined;
    if (reqNode) {
      stone.reqForActivation = Object.fromEntries(
        Object.entries(reqNode)
          .filter(([, v]) => typeof v === 'number')
          .map(([k, v]) => [parseInt(k), v as number]),
      );
    }

    if (s.spCoreOption) stone.hasActiveEffect = true;

    const icon = s.icon as { _outlink: string } | undefined;
    if (icon?._outlink) stone.iconOutlink = icon._outlink;

    stones.push(stone);
  }

  return stones;
}

function extractAllStones(erdaLink: WzNode): Stone[] {
  const stoneRoot = erdaLink.stone as WzNode;
  const stones: Stone[] = [];

  for (const char of CHARACTERS) {
    const charStones = stoneRoot[char.treeId] as WzNode | undefined;
    if (!charStones) continue;
    stones.push(
      ...extractStonesFromCategory(charStones.rush as WzNode, 'rush', char.treeId),
      ...extractStonesFromCategory(charStones.skill as WzNode, 'skill', char.treeId),
      ...extractStonesFromCategory(charStones.boost as WzNode, 'boost', char.treeId),
      ...extractStonesFromCategory(charStones.ultimate as WzNode, 'ultimate', char.treeId),
      ...extractStonesFromCategory(charStones.origin as WzNode, 'origin', char.treeId),
    );
  }

  return stones;
}

// ─── Character tree + nodePos extraction ─────────────────────────────────────

const SECTORS: Sector[] = ['top', 'right', 'bottom', 'left', 'center', 'SHINE'];

function extractCharacter(
  char: { name: string; treeId: number },
  treeRoot: WzNode,
  nodePosRoot: WzNode,
): CharacterData {
  const treeChar = treeRoot[char.treeId] as WzNode;
  const posChar = nodePosRoot[char.treeId] as WzNode | undefined;

  if (!treeChar) throw new Error(`No tree data for treeId ${char.treeId}`);

  // lightModuleInit is the SP starting node position.
  const spPosition: { x: number; y: number } =
    (posChar?.lightModuleInit as { x: number; y: number } | undefined) ?? { x: 800, y: 550 };

  const nodes: TreeNode[] = [];

  for (const sector of SECTORS) {
    const treeSection = treeChar[sector] as WzNode | undefined;
    if (!treeSection) continue;

    // SHINE nodes have no position in the main nodePos canvas.
    const posSection = (sector !== 'SHINE' ? posChar?.[sector] : undefined) as
      | WzNode
      | undefined;

    for (const [idxStr, raw] of Object.entries(treeSection)) {
      const nodeIndex = parseInt(idxStr);
      if (isNaN(nodeIndex)) continue;

      const n = raw as WzNode;

      const prereqAnd: number[] = [];
      const prereqOr: number[] = [];

      if (n.prevIdx) {
        const prev = n.prevIdx as WzNode;
        if (prev.and) {
          prereqAnd.push(
            ...Object.values(prev.and as WzNode).filter((v): v is number => typeof v === 'number'),
          );
        }
        if (prev.or) {
          prereqOr.push(
            ...Object.values(prev.or as WzNode).filter((v): v is number => typeof v === 'number'),
          );
        }
      }

      nodes.push({
        nodeIndex,
        sector,
        stoneId: n.stoneId as number,
        position: (posSection?.[nodeIndex] as { x: number; y: number } | undefined) ?? null,
        prereqAnd,
        prereqOr,
      });
    }
  }

  return {
    name: char.name,
    treeId: char.treeId,
    spPosition,
    nodes,
  };
}

// ─── Cost extraction ──────────────────────────────────────────────────────────

function extractCosts(solerda: WzNode): Costs {
  const rs = solerda.runeStone as WzNode;
  const activation: Costs['activation'] = {};
  const enforcement: Costs['enforcement'] = {};

  for (const [category, variants] of Object.entries(rs.activation as WzNode)) {
    activation[category] = {};
    for (const [costType, rawCost] of Object.entries(variants as WzNode)) {
      const c = rawCost as WzNode;
      const entry: CostEntry = { fragments: c.sub as number };
      if (c.main !== undefined) entry.solErda = c.main as number;
      if (c.meso !== undefined) entry.meso = c.meso as number;
      activation[category][costType] = entry;
    }
  }

  for (const [category, levels] of Object.entries(rs.enforcement as WzNode)) {
    enforcement[category] = {};
    for (const [lvlStr, variants] of Object.entries(levels as WzNode)) {
      const level = parseInt(lvlStr);
      enforcement[category][level] = {};
      for (const [costType, rawCost] of Object.entries(variants as WzNode)) {
        const c = rawCost as WzNode;
        const entry: CostEntry = { fragments: c.sub as number };
        if (c.main !== undefined) entry.solErda = c.main as number;
        if (c.meso !== undefined) entry.meso = c.meso as number;
        enforcement[category][level][costType] = entry;
      }
    }
  }

  return { activation, enforcement };
}

// ─── SHINE stone extraction ───────────────────────────────────────────────────

function extractShineConditions(conditionNode: WzNode | undefined): ShineCondition[] {
  if (!conditionNode) return [];

  return Object.entries(conditionNode)
    .filter(([, v]) => typeof v === 'object')
    .map(([type, raw]) => {
      const c = raw as WzNode;
      const cond: ShineCondition = { type };
      // 'type' field within a stone/stonelevel condition = the stone category (rush, skill, etc.)
      if (c.type !== undefined) cond.stoneType = c.type as string;
      if (c.count !== undefined) cond.count = c.count as number;
      if (c.skillID !== undefined) cond.skillId = c.skillID as number;
      if (c.level !== undefined) cond.level = c.level as number;
      if (c.lv !== undefined) cond.lv = c.lv as number;
      if (c.all !== undefined) cond.all = c.all as number;
      return cond;
    });
}

function extractShineStones(shineStoneXml: WzNode): ShineStone[] {
  const shineDir = (shineStoneXml.stone as WzNode | undefined)?.SHINE as WzNode | undefined;
  if (!shineDir) {
    console.warn('  Warning: no SHINE stone data found');
    return [];
  }

  const result: ShineStone[] = [];

  for (const [idStr, raw] of Object.entries(shineDir)) {
    const id = parseInt(idStr);
    if (isNaN(id)) continue;

    const s = raw as WzNode;
    if (s.locked === 1) continue;

    const enforceProbs: ShineStone['enforceProbs'] = [];
    if (s.enforceProb) {
      for (const [lvlStr, prob] of Object.entries(s.enforceProb as WzNode)) {
        const lvl = parseInt(lvlStr);
        if (isNaN(lvl)) continue;
        const p = prob as WzNode;
        enforceProbs[lvl] = {
          successRate: p.successRate as number,
          failRate: p.failRate as number,
          downgradeRate: p.downgradeRate as number,
        };
      }
    }

    result.push({
      id,
      order: s.order as number,
      maxLevel: s.maxLevel as number,
      desc: (s.desc as string) ?? '',
      conditions: extractShineConditions(s.condition as WzNode | undefined),
      enforceProbs,
      passives: extractPassives(s.passive as WzNode | undefined),
    });
  }

  return result.sort((a, b) => a.order - b.order);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const dir = __dirname;

  console.log('Parsing XML files...');
  const erdaLink = parseWzXml(join(dir, 'Etc.ErdaLink.img.xml'));
  const solerda = parseWzXml(join(dir, 'Etc.ErdaLinkSolerda.img.xml'));
  const shineStoneXml = parseWzXml(join(dir, 'Etc.ErdaLinkShineStone.img.xml'));

  console.log('Extracting stones...');
  const stones = extractAllStones(erdaLink);
  console.log(`  ${stones.length} stones`);

  console.log('Extracting costs...');
  const costs = extractCosts(solerda);

  console.log('Extracting SHINE stones...');
  const shineStones = extractShineStones(shineStoneXml);
  console.log(`  ${shineStones.length} SHINE stones`);

  console.log('Extracting character trees...');
  const treeRoot = erdaLink.tree as WzNode;
  const nodePosRoot = erdaLink.nodePos as WzNode;
  const characters = CHARACTERS.map((char) => extractCharacter(char, treeRoot, nodePosRoot));
  for (const c of characters) {
    const noPos = c.nodes.filter((n) => n.position === null).length;
    console.log(
      `  ${c.name}: ${c.nodes.length} nodes` +
        (noPos > 0 ? ` (${noPos} without canvas position — SHINE board)` : ''),
    );
  }

  // Summary of unique icon paths for image extraction
  const iconPaths = [...new Set(stones.map((s) => s.iconOutlink).filter(Boolean))];
  console.log(`\n${iconPaths.length} unique stone icon paths (see output/image-manifest.txt)`);

  const output: ErdaLinkData = { characters, stones, costs, shineStones };

  const outDir = join(dir, 'output');
  if (!existsSync(outDir)) mkdirSync(outDir);

  writeFileSync(join(outDir, 'erda-link-data.json'), JSON.stringify(output, null, 2));
  writeFileSync(join(outDir, 'image-manifest.txt'), iconPaths.join('\n') + '\n');

  console.log('\nOutput:');
  console.log(`  output/erda-link-data.json`);
  console.log(`  output/image-manifest.txt  ← WZ paths for all needed stone icons`);
}

main();
