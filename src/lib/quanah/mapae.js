// Quanah Mapae: Dimensional Mission score, Dimensional grade, and Mapae Module points.
//
// Rules (GMS v272 Quanah, Nov 2026):
// - Each Dimensional Mission is worth a score (src/data/quanahMissions.js, from the client). The
//   total score sets the Dimensional grade (GRADE_THRESHOLDS).
// - "Round" missions reset when you die, "Permanent" ones never do.
// - Every completed mission is also worth 1 Mapae Module Point. Module points are spent after
//   death (SEN-D in the Emergency Escape Room), and the total you have to spend never goes down:
//   it is the most missions you have ever had completed at once. Dying before redoing your Round
//   missions doesn't lose points you had before.
// - Each module (Power, Survival, Efficiency) goes to Lv. 30. Every level adds +5% to its main
//   stat (skill data: 80013179 / 80013180 / 80013188, `x` or `nbdR` = 5*x), and Lv. 10, 20 and 30
//   unlock a one-off perk. The perk values are in the client (80013181-80013190); which level
//   unlocks which perk is not, and comes from quanah.wiki/guide/mapae-modules (2026-11-21).
import { GRADE_THRESHOLDS, MISSIONS } from "../../data/quanahMissions.js";

export const MODULE_MAX_LEVEL = 30;
export const MODULE_STEP = 5; // % per level on the main stat
export const MILESTONES = [10, 20, 30];

export const MODULES = [
  {
    id: "power",
    name: "Power Module",
    icon: "/quanah/skills/80013179.png",
    stat: "Active Skill Appearance Rate",
    perks: [
      { level: 10, skill: "80013182", text: "Attack Power & Magic ATT +18%" },
      { level: 20, skill: "80013184", text: "Critical Damage +12%" },
      { level: 30, skill: "80013183", text: "Skill Cooldown -2 sec" },
    ],
  },
  {
    id: "survival",
    name: "Survival Module",
    icon: "/quanah/skills/80013180.png",
    stat: "Passive Skill Appearance Rate",
    perks: [
      {
        level: 10,
        skill: "80013186",
        text: "10% chance to ignore damage when attacked",
      },
      {
        level: 20,
        skill: "80013185",
        text: "4% chance to become invincible for 7 sec when attacked",
      },
      {
        level: 30,
        skill: "80013187",
        text: "10% chance to prevent HP from reaching 0",
      },
    ],
  },
  {
    id: "efficiency",
    name: "Efficiency Module",
    icon: "/quanah/skills/80013188.png",
    stat: "Normal Enemy Damage",
    perks: [
      { level: 10, skill: "80013189", text: "EXP Obtained +30%" },
      { level: 20, skill: "80013181", text: "Mesos Obtained +30%" },
      { level: 30, skill: "80013190", text: "Item Drop Rate +30%" },
    ],
  },
];

export const MAX_MODULE_POINTS = MODULES.length * MODULE_MAX_LEVEL;

const LADDERS = ["level", "battlesim", "starforce"];
export const ladder = (category) =>
  MISSIONS.filter((m) => m.category === category);
export const BOSSES = MISSIONS.filter((m) => m.category === "boss");

// Progress is kept as how far up each ladder you are (0 = none, n = the first n rungs done) plus
// the set of boss mission IDs done. `extraScore` is score from outside the mission list (trading
// a Dimensional Skill Coupon for score, deleting skills), treated as resetting on death.
export const emptyProgress = () => ({
  level: 0,
  battlesim: 0,
  starforce: 0,
  bosses: new Set(),
  extraScore: 0,
});

export function completedMissions(progress) {
  const done = [];
  for (const cat of LADDERS) done.push(...ladder(cat).slice(0, progress[cat]));
  done.push(...BOSSES.filter((m) => progress.bosses.has(m.id)));
  return done;
}

export function missionScore(progress) {
  const done = completedMissions(progress);
  const score =
    done.reduce((sum, m) => sum + m.points, 0) + (progress.extraScore || 0);
  return {
    score,
    count: done.length,
    round: done.filter((m) => m.type === "round").length,
    permanent: done.filter((m) => m.type === "permanent").length,
  };
}

// Grade 1-5 for a score, and how far it is to the next grade and to grade 5.
export function gradeInfo(score) {
  let grade = 1;
  GRADE_THRESHOLDS.forEach((t, i) => {
    if (score >= t) grade = i + 1;
  });
  const next = GRADE_THRESHOLDS[grade]; // undefined at grade 5
  const top = GRADE_THRESHOLDS.at(-1);
  return {
    grade,
    nextGrade: next === undefined ? null : grade + 1,
    toNext: next === undefined ? 0 : next - score,
    toMax: Math.max(0, top - score),
  };
}

// Death: Round missions and extra score are lost, Permanent missions stay. The module point total
// keeps the most missions ever held at once.
export function die(progress, bankedPoints) {
  const { count } = missionScore(progress);
  return {
    progress: {
      ...emptyProgress(),
      starforce: progress.starforce,
      bosses: new Set(progress.bosses),
    },
    bankedPoints: Math.max(bankedPoints, count),
  };
}

// Module points available to spend if you died now.
export const modulePoints = (progress, bankedPoints) =>
  Math.max(bankedPoints, missionScore(progress).count);

// What a module at `level` gives.
export function moduleEffects(module, level) {
  return {
    stat: level * MODULE_STEP,
    perks: module.perks.filter((p) => level >= p.level),
    nextPerk: module.perks.find((p) => level < p.level) ?? null,
  };
}
