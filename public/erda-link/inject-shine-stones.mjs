/**
 * inject-shine-stones.mjs
 *
 * Parses the SHINE stone WZ XML export and injects the `shineStones` array into
 * src/data/erda-link-data.json (leaving all other extracted data untouched).
 *
 * This is a dependency-free reimplementation of the SHINE-stone portion of
 * extract-erda-link.ts, used because the project does not install
 * fast-xml-parser. Run: node public/erda-link/inject-shine-stones.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Minimal WZ-XML → plain object ────────────────────────────────────────────
// The export only uses <dir>, <string>, <int32>, <int64>, <double> tags with
// `name`/`value` attributes, so a flat tag scan with a stack is sufficient.

function parseWzXml(xml) {
  const tagRe = /<(\/?)(\w+)([^>]*?)(\/?)>/g;
  const attrRe = /(\w+)="([^"]*)"/g;

  const root = {};
  const stack = [root];
  let match;

  while ((match = tagRe.exec(xml)) !== null) {
    const [, closing, tag, attrStr, selfClose] = match;
    if (tag === 'xml') continue;

    if (closing) {
      stack.pop();
      continue;
    }

    const attrs = {};
    let a;
    while ((a = attrRe.exec(attrStr)) !== null) attrs[a[1]] = a[2];
    attrRe.lastIndex = 0;

    const parent = stack[stack.length - 1];
    const name = attrs.name;

    if (tag === 'dir') {
      const node = {};
      parent[name] = node;
      if (!selfClose) stack.push(node);
      continue;
    }

    const value = attrs.value;
    switch (tag) {
      case 'int32':
      case 'int64':
        parent[name] = parseInt(value, 10);
        break;
      case 'double':
        parent[name] = parseFloat(value);
        break;
      case 'string':
        if (!name.startsWith('_') && name !== 'info' && name !== 'shine') parent[name] = value;
        break;
    }
  }

  // Unwrap the single top-level <dir name="ErdaLinkShineStone.img">.
  return Object.values(root)[0];
}

// ─── Extraction (mirrors extract-erda-link.ts) ────────────────────────────────

function extractPassives(passiveNode) {
  if (!passiveNode) return [];
  const groups = [];
  for (const [groupStr, levels] of Object.entries(passiveNode)) {
    if (typeof levels !== 'object') continue;
    const groupIdx = parseInt(groupStr, 10);
    if (isNaN(groupIdx)) continue;
    const group = {};
    for (const [lvlStr, stats] of Object.entries(levels)) {
      const lvl = parseInt(lvlStr, 10);
      if (isNaN(lvl) || typeof stats !== 'object') continue;
      group[lvl] = Object.fromEntries(
        Object.entries(stats).filter(([, v]) => typeof v === 'number'),
      );
    }
    groups[groupIdx] = group;
  }
  return groups;
}

function extractShineConditions(conditionNode) {
  if (!conditionNode) return [];
  return Object.entries(conditionNode)
    .filter(([, v]) => typeof v === 'object')
    .map(([type, c]) => {
      const cond = { type };
      if (c.type !== undefined) cond.stoneType = c.type;
      if (c.count !== undefined) cond.count = c.count;
      if (c.skillID !== undefined) cond.skillId = c.skillID;
      if (c.level !== undefined) cond.level = parseInt(c.level, 10);
      if (c.lv !== undefined) cond.lv = c.lv;
      if (c.all !== undefined) cond.all = c.all;
      return cond;
    });
}

// SHINE stones are nested per character: stone/{treeId}/SHINE/{id}.
// ids (1000–1005) repeat across characters with DIFFERENT stats, so each stone
// is tagged with its treeId and lookups must key on (treeId, id).
const TREE_IDS = [18212, 18112]; // Sia Astelle, Erel Light

function extractShineStones(shineStoneXml) {
  const stoneRoot = shineStoneXml?.stone;
  if (!stoneRoot) {
    console.warn('  Warning: no SHINE stone data found');
    return [];
  }

  const result = [];
  for (const treeId of TREE_IDS) {
    const shineDir = stoneRoot[treeId]?.SHINE;
    if (!shineDir) {
      console.warn(`  Warning: no SHINE stones for treeId ${treeId}`);
      continue;
    }

    for (const [idStr, s] of Object.entries(shineDir)) {
      const id = parseInt(idStr, 10);
      if (isNaN(id)) continue;
      if (s.locked === 1) continue;

      const enforceProbs = [];
      if (s.enforceProb) {
        for (const [lvlStr, p] of Object.entries(s.enforceProb)) {
          const lvl = parseInt(lvlStr, 10);
          if (isNaN(lvl)) continue;
          enforceProbs[lvl] = {
            successRate: p.successRate,
            failRate: p.failRate,
            downgradeRate: p.downgradeRate,
          };
        }
      }

      result.push({
        id,
        treeId,
        order: s.order,
        maxLevel: s.maxLevel,
        desc: s.desc ?? '',
        conditions: extractShineConditions(s.condition),
        enforceProbs,
        passives: extractPassives(s.passive),
      });
    }
  }

  return result.sort((a, b) => a.treeId - b.treeId || a.order - b.order);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const xml = readFileSync(join(__dirname, 'Etc.ErdaLinkShineStone.img.xml'), 'utf-8');
const parsed = parseWzXml(xml);
const shineStones = extractShineStones(parsed);

const dataPath = join(__dirname, '../../src/data/erda-link-data.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
data.shineStones = shineStones;
writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');

console.log(`Injected ${shineStones.length} SHINE stones:`);
for (const s of shineStones) {
  console.log(
    `  ${s.id} (order ${s.order}, maxLevel ${s.maxLevel}, ${s.passives.length} stat groups, ` +
      `${s.enforceProbs.length} prob levels)`,
  );
}
