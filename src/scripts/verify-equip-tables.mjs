/**
 * Checks the flame and star force formulas against the MapleStory Wiki tables
 * they were transcribed from. Run: npm run verify-equip-tables
 *
 * The expectations below are the wiki's published rows, written out literally so
 * a formula that drifts is caught by the number it was derived from rather than
 * by another formula. Sources:
 *   https://maplestorywiki.net/w/Bonus_Stats/Stat_Tables
 *   https://maplestorywiki.net/w/Star_Force_Enhancement/Stat_Tables
 */
import {
  singleStatFlame, dualStatFlame, hpFlame, weaponAttackFlame, nonWeaponAttackFlame,
  flameLineValue, flameLinesFor,
} from '../lib/equip/flames.js';
import { starForceGains, maxStars, starTier, starForceWeaponAttack } from
  '../lib/equip/starforce.js';

let fails = 0;
const eq = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails += 1;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}: got ${JSON.stringify(got)}${ok ? '' : `, want ${JSON.stringify(want)}`}`);
};

/** Checks one published row: the tier-1..7 values at a level. */
const row = (label, fn, level, want) => {
  const got = [1, 2, 3, 4, 5, 6, 7].map((t) => fn(level, t));
  eq(`${label} @ lv${level}`, got, want);
};

// ── Single stat and DEF ──────────────────────────────────────────────────────
// Twenty levels per bucket, except that 200-229 share one and 230+ is the last.
console.log('=== single-stat flame (STR / DEX / INT / LUK / DEF) ===');
row('single stat', singleStatFlame, 0, [1, 2, 3, 4, 5, 6, 7]);
row('single stat', singleStatFlame, 150, [8, 16, 24, 32, 40, 48, 56]);
row('single stat', singleStatFlame, 199, [10, 20, 30, 40, 50, 60, 70]);
row('single stat', singleStatFlame, 200, [11, 22, 33, 44, 55, 66, 77]);
// The bucket that a `level / 20` formula gets wrong: 220 is still the 200-229 row.
row('single stat', singleStatFlame, 220, [11, 22, 33, 44, 55, 66, 77]);
row('single stat', singleStatFlame, 230, [12, 24, 36, 48, 60, 72, 84]);
row('single stat', singleStatFlame, 250, [12, 24, 36, 48, 60, 72, 84]);

// ── Dual stat ────────────────────────────────────────────────────────────────
console.log('\n=== dual-stat flame (value applies to each of the two stats) ===');
row('dual stat', dualStatFlame, 120, [4, 8, 12, 16, 20, 24, 28]);
row('dual stat', dualStatFlame, 200, [6, 12, 18, 24, 30, 36, 42]);
row('dual stat', dualStatFlame, 249, [6, 12, 18, 24, 30, 36, 42]);
row('dual stat', dualStatFlame, 250, [7, 14, 21, 28, 35, 42, 49]);

// ── Max HP / MP ──────────────────────────────────────────────────────────────
// Ten levels per bucket, stepping 30 per tier — until 210, where it drops to 20.
console.log('\n=== HP / MP flame ===');
row('hp', hpFlame, 0, [3, 6, 9, 12, 15, 18, 21]);
row('hp', hpFlame, 10, [30, 60, 90, 120, 150, 180, 210]);
row('hp', hpFlame, 200, [600, 1200, 1800, 2400, 3000, 3600, 4200]);
row('hp', hpFlame, 210, [620, 1240, 1860, 2480, 3100, 3720, 4340]);
row('hp', hpFlame, 230, [660, 1320, 1980, 2640, 3300, 3960, 4620]);
row('hp', hpFlame, 250, [700, 1400, 2100, 2800, 3500, 4200, 4900]);
row('hp', hpFlame, 300, [700, 1400, 2100, 2800, 3500, 4200, 4900]);

// ── Attack ───────────────────────────────────────────────────────────────────
// On a weapon the wiki publishes a multiplier; the value is that share of base
// attack. Checked against a round 10,000 base so the percentage reads directly.
console.log('\n=== weapon attack flame (percent of base attack) ===');
const pct = (level, tier, advantaged) => weaponAttackFlame(10000, level, tier, advantaged) / 100;

eq('lv120-159 ordinary t1..t5',
  [1, 2, 3, 4, 5].map((t) => pct(120, t, false)), [4, 8.8, 14.52, 21.3, 29.29]);
eq('lv200-249 ordinary t1..t5',
  [1, 2, 3, 4, 5].map((t) => pct(200, t, false)), [6, 13.2, 21.78, 31.95, 43.93]);
eq('lv200-249 boss flame t3..t7',
  [3, 4, 5, 6, 7].map((t) => pct(200, t, true)), [18, 26.4, 36.3, 47.92, 61.5]);
eq('lv250+ boss flame t7', pct(250, 7, true), 71.75);
eq('no attack flame without base attack', weaponAttackFlame(0, 200, 7, true), 0);

// The two curves are not the same at the tiers they share — the whole reason the
// boss-flame line is offered separately rather than behind a hidden toggle.
eq('ordinary and boss flame differ at t5', pct(200, 5, false) === pct(200, 5, true), false);

console.log('\n=== non-weapon attack flame ===');
// Flat, every level, regardless of the item's own attack. Scaling this off base
// attack the way weapons do is what printed a column of 1s on every accessory.
eq('flat +1 per tier', [1, 2, 3, 4, 5, 6, 7].map(nonWeaponAttackFlame), [1, 2, 3, 4, 5, 6, 7]);

console.log('\n=== which lines roll where ===');
const hat = { id: 1, slot: 'Cp', reqLevel: 200, stats: {} };
const ring = { id: 2, slot: 'Ri', reqLevel: 200, stats: {} };
const weapon = { id: 3, slot: 'WpSi', reqLevel: 200, stats: { att: 276 } };
const lowHat = { id: 4, slot: 'Cp', reqLevel: 60, stats: {} };

eq('boss damage is weapons only', flameLinesFor(hat).includes('boss'), false);
eq('boss damage rolls on weapons', flameLinesFor(weapon).includes('boss'), true);
eq('damage% is weapons only', flameLinesFor(hat).includes('dmg'), false);
eq('speed is armour only', flameLinesFor(weapon).includes('speed'), false);
eq('the boss-flame attack line is weapons only', flameLinesFor(hat).includes('attBoss'), false);
eq('All Stat needs level 70 off a weapon', flameLinesFor(lowHat).includes('allStat'), false);
eq('All Stat rolls on a level 200 hat', flameLinesFor(hat).includes('allStat'), true);

// A hat with no attack of its own still rolls the flat attack line, all 7 tiers.
eq('a hat with no attack still rolls attack',
  [1, 4, 7].map((t) => flameLineValue('att', t, { level: 200, isWeapon: false })?.value), [1, 4, 7]);
// An ordinary weapon's attack line stops at tier 5; the boss line starts at 3.
eq('ordinary weapon attack stops at t5',
  flameLineValue('att', 6, { level: 200, baseAttack: 276, isWeapon: true }), null);
eq('boss flame attack starts at t3',
  flameLineValue('attBoss', 2, { level: 200, baseAttack: 276, isWeapon: true }), null);
// Rings take no bonus stats at all, but that is acceptsFlames()' job, not this.
eq('rings are not weapons', flameLinesFor(ring).includes('boss'), false);

// ── Star force ───────────────────────────────────────────────────────────────
console.log('\n=== star force ===');
eq('starTier(200)', starTier(200), 5);
eq('maxStars(200)', maxStars(200), 30);
eq('maxStars(130)', maxStars(130), 20);
eq('maxStars(200, superior)', maxStars(200, true), 15);

const armor22 = starForceGains({ level: 200, stars: 22, slot: 'Cp' });
console.log('  lvl200 hat @22*:', JSON.stringify(armor22));
eq('  main stat @22*', armor22.str, 5 * 2 + 10 * 3 + 7 * 15);
eq('  attack @22*', armor22.att, 12 + 13 + 14 + 15 + 16 + 17 + 19);
// Armour: 5, 5, 10, 10, 10, 15, 15, 20, 20, then 25 to fifteen stars.
eq('  Max HP @15*', starForceGains({ level: 200, stars: 15, slot: 'Cp' }).hp,
  5 * 2 + 10 * 3 + 15 * 2 + 20 * 2 + 25 * 6);
eq('  gloves take no Max HP', starForceGains({ level: 200, stars: 15, slot: 'Gv' }).hp, 0);
eq('  eye accessories take no Max HP', starForceGains({ level: 200, stars: 15, slot: 'Ay' }).hp, 0);

const armor30 = starForceGains({ level: 200, stars: 30, slot: 'Cp' });
console.log('  lvl200 hat @30*:', JSON.stringify(armor30));
eq('  stat unchanged past 22*', armor30.str, armor22.str);

const wep22 = starForceGains({ level: 200, stars: 22, slot: 'WpSi', baseAttack: 276, baseMagic: 0 });
console.log('  lvl200 2H weapon @22* (276 base att):', JSON.stringify(wep22));
eq('  sub-15 compounding att', starForceWeaponAttack(276, 15), wep22.att - (13 + 13 + 14 + 14 + 15 + 16 + 17));
// A weapon's third star is still worth 5 Max HP where armour's is already 10.
eq('  weapon Max HP @15*', starForceGains({ level: 200, stars: 15, slot: 'WpSi' }).hp,
  5 * 3 + 10 * 2 + 15 * 2 + 20 * 2 + 25 * 6);

const glove = starForceGains({ level: 200, stars: 15, slot: 'Gv', baseAttack: 10 });
eq('gloves +1 att at 7 specific stars', glove.att, 7);
const gloveNoAtt = starForceGains({ level: 200, stars: 15, slot: 'Gv', baseAttack: 0 });
eq('gloves with no base att gain none', gloveNoAtt.att, 0);

// ── Badges have their own table: all stats, and nothing else ─────────────────
console.log('\n=== badge star force ===');
const badge22 = starForceGains({ level: 200, stars: 22, slot: 'Ba', gainsAtt: false });
console.log('  lvl200 badge @22*:', JSON.stringify(badge22));
eq('all stats @22*', badge22.str, 5 * 2 + 10 * 3 + 7 * 15);
eq('every stat moves together', [badge22.dex, badge22.int, badge22.luk],
  [badge22.str, badge22.str, badge22.str]);
eq('no attack, ever', [badge22.att, badge22.matt], [0, 0]);
eq('no Max HP', badge22.hp, 0);
eq('no DEF', badge22.defP, 0);

const sup = starForceGains({ level: 150, stars: 15, slot: 'Cp', superior: true });
console.log('  lvl150 superior @15*:', JSON.stringify(sup));
// Wiki superior table, level 150+: all stats 19+20+22+25+29, attack 9..23.
eq('superior all-stat @15*', sup.str, 19 + 20 + 22 + 25 + 29);
eq('superior attack @15*', sup.att, 9 + 10 + 11 + 12 + 13 + 15 + 17 + 19 + 21 + 23);

console.log(`\n${fails === 0 ? 'All checks passed.' : `${fails} FAILURES`}`);
process.exit(fails === 0 ? 0 : 1);
