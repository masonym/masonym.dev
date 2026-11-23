"use client";

import { useState } from "react";
import {
  GRADE_THRESHOLDS,
  MISSION_CATEGORIES,
  gradeBadge,
} from "@/data/quanahMissions";
import {
  BOSSES,
  MAX_MODULE_POINTS,
  MILESTONES,
  MODULES,
  MODULE_MAX_LEVEL,
  die,
  gradeInfo,
  ladder,
  missionScore,
  moduleEffects,
  modulePoints,
} from "@/lib/quanah/mapae";
import useParamState from "./useParamState";
import Icon from "../../components/Icon";

const KEYS = ["mlv", "mbs", "msf", "mb", "mx", "mbank", "mod"];
const LADDER_KEY = { level: "mlv", battlesim: "mbs", starforce: "msf" };

const fmt = (n) => Math.round(n).toLocaleString("en-US");
const clampInt = (v, lo, hi) =>
  Math.min(hi, Math.max(lo, Number.parseInt(v, 10) || 0));

// Boss missions done, as a bitmask over BOSSES in base 36.
const encodeBosses = (set) => {
  let mask = 0n;
  BOSSES.forEach((b, i) => {
    if (set.has(b.id)) mask |= 1n << BigInt(i);
  });
  return mask ? mask.toString(36) : null;
};
const decodeBosses = (s) => {
  const set = new Set();
  if (!s) return set;
  let mask = 0n;
  for (const ch of s.toLowerCase()) {
    const d = Number.parseInt(ch, 36);
    if (Number.isNaN(d)) return set;
    mask = mask * 36n + BigInt(d);
  }
  BOSSES.forEach((b, i) => {
    if (mask & (1n << BigInt(i))) set.add(b.id);
  });
  return set;
};

const card = "rounded-lg border border-primary/15 bg-background-bright/30 p-4";
const smallBtn =
  "px-3 py-1 rounded-full border border-primary/20 text-sm text-primary hover:text-primary-bright hover:border-primary-bright/40 transition-colors";

function TypeTag({ type }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs border ${
        type === "round"
          ? "border-progress-orange text-progress-orange"
          : "border-progress-green text-progress-green"
      }`}
      title={
        type === "round"
          ? "Resets when you die"
          : "Stays done when you die"
      }
    >
      {type === "round" ? "Round" : "Permanent"}
    </span>
  );
}

function GradeBar({ score }) {
  const max = GRADE_THRESHOLDS.at(-1);
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div className="pt-1">
      <div className="relative h-2.5 rounded-full bg-background-dim overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-secondary rounded-full transition-[width]"
          style={{ width: `${pct}%` }}
        />
        {GRADE_THRESHOLDS.slice(1, -1).map((t) => (
          <div
            key={t}
            className="absolute inset-y-0 w-px bg-background"
            style={{ left: `${(t / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative h-5 mt-1 text-[11px] text-primary-dim">
        {GRADE_THRESHOLDS.map((t, i) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full whitespace-nowrap"
            style={{ left: `${(t / max) * 100}%` }}
          >
            G{i + 1} · {t / 1000}k
          </span>
        ))}
      </div>
    </div>
  );
}

function Summary({ progress, banked, setBanked, onDie, onUndo, canUndo, onClear }) {
  const s = missionScore(progress);
  const g = gradeInfo(s.score);
  const points = modulePoints(progress, banked);
  // the next multiple of 10, which is where the module perks sit
  const nextTen =
    points >= MAX_MODULE_POINTS ? null : (Math.floor(points / 10) + 1) * 10;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className={`${card} flex gap-4 items-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gradeBadge(g.grade)}
          alt={`Grade ${g.grade}`}
          className="w-16 h-16 object-contain shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs uppercase tracking-wider text-primary-dim">
            Dimensional grade
          </p>
          <p className="text-2xl font-semibold text-primary-bright">
            Grade {g.grade}
            <span className="text-base font-normal text-primary ml-3">
              {fmt(s.score)} points
            </span>
          </p>
          <p className="text-sm">
            {g.nextGrade ? (
              <>
                <span className="text-primary-bright">{fmt(g.toNext)}</span> to
                Grade {g.nextGrade}
                {g.nextGrade < 5 && (
                  <>
                    {" · "}
                    <span className="text-primary-bright">{fmt(g.toMax)}</span>{" "}
                    to Grade 5
                  </>
                )}
              </>
            ) : (
              "Max grade"
            )}
          </p>
          <GradeBar score={s.score} />
        </div>
      </div>

      <div className={`${card} space-y-3`}>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <p className="text-xs uppercase tracking-wider text-primary-dim w-full">
            Mapae Module Points if you die now
          </p>
          <p className="text-2xl font-semibold text-primary-bright">{points}</p>
          <p className="text-sm text-primary-dim">
            {s.count} missions done now ({s.round} Round, {s.permanent}{" "}
            Permanent)
          </p>
        </div>
        {nextTen && (
          <p className="text-sm">
            <span className="text-primary-bright">{nextTen - s.count}</span>{" "}
            more {nextTen - s.count === 1 ? "mission" : "missions"} this run
            for {nextTen} points
          </p>
        )}
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span>Best from earlier runs</span>
          <input
            type="number"
            min={0}
            max={110}
            value={banked}
            onChange={(e) => setBanked(clampInt(e.target.value, 0, 110))}
            className="w-20 px-2 py-1 rounded border border-primary/20 bg-background text-primary-bright"
          />
          <span className="text-primary-dim text-xs">
            Module points never go down, so this is the most missions you have
            had done at once.
          </span>
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onDie}
            className="px-4 py-1.5 rounded-full border border-progress-red text-progress-red hover:bg-progress-red hover:text-primary-bright transition-colors text-sm"
          >
            I died: reset Round missions
          </button>
          {canUndo && (
            <button type="button" onClick={onUndo} className={smallBtn}>
              Undo
            </button>
          )}
          <button type="button" onClick={onClear} className={smallBtn}>
            Clear everything
          </button>
        </div>
      </div>
    </div>
  );
}

function LadderCard({ category, done, onSet }) {
  const rungs = ladder(category.id);
  const pts = rungs.slice(0, done).reduce((a, m) => a + m.points, 0);
  const all = rungs.reduce((a, m) => a + m.points, 0);
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Icon src={category.icon} alt="" />
        <h3 className="font-semibold text-primary-bright">{category.title}</h3>
        <TypeTag type={rungs[0].type} />
        <span className="ml-auto text-sm text-primary-dim">
          {done}/{rungs.length} · {fmt(pts)} / {fmt(all)} pts
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
        {rungs.map((m, i) => {
          const on = i < done;
          return (
            <button
              key={m.id}
              type="button"
              // clicking the top rung that's done steps back one
              onClick={() => onSet(done === i + 1 ? i : i + 1)}
              aria-pressed={on}
              title={m.name}
              className={`rounded-md border px-2 py-1.5 text-left transition-colors ${
                on
                  ? "border-secondary bg-secondary/15 text-primary-bright"
                  : "border-primary/15 text-primary hover:border-primary-bright/40"
              }`}
            >
              <span className="block text-sm font-semibold leading-tight">
                {m.value}
                {category.unit === "★" && "★"}
              </span>
              <span className="block text-[11px] text-primary-dim">
                {fmt(m.points)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BossCard({ bosses, onToggle, onSetAll }) {
  const done = BOSSES.filter((b) => bosses.has(b.id));
  const pts = done.reduce((a, m) => a + m.points, 0);
  const all = BOSSES.reduce((a, m) => a + m.points, 0);
  const category = MISSION_CATEGORIES.find((c) => c.id === "boss");
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Icon src={category.icon} alt="" />
        <h3 className="font-semibold text-primary-bright">
          {category.title}
        </h3>
        <TypeTag type="permanent" />
        <span className="ml-auto text-sm text-primary-dim">
          {done.length}/{BOSSES.length} · {fmt(pts)} / {fmt(all)} pts
        </span>
      </div>
      <p className="text-sm text-primary-dim mb-3">
        Defeat the boss by yourself, outside a party.{" "}
        <button
          type="button"
          className="underline hover:text-primary-bright"
          onClick={() => onSetAll(done.length < BOSSES.length)}
        >
          {done.length < BOSSES.length ? "Mark all" : "Unmark all"}
        </button>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
        {BOSSES.map((b) => {
          const on = bosses.has(b.id);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onToggle(b.id)}
              aria-pressed={on}
              title={b.name}
              className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors ${
                on
                  ? "border-secondary bg-secondary/15"
                  : "border-primary/15 hover:border-primary-bright/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/bossImages/${b.image}.png`}
                alt=""
                loading="lazy"
                className={`h-6 w-auto max-w-[90px] object-contain object-left shrink-0 ${
                  on ? "" : "opacity-60"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-tight text-primary-bright truncate">
                  {b.boss}
                </span>
                <span className="block text-[11px] text-primary-dim">
                  {b.difficulty} · {fmt(b.points)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModuleCard({ module, level, onSet }) {
  const fx = moduleEffects(module, level);
  return (
    <div className={`${card} space-y-3`}>
      <div className="flex items-center gap-3">
        <Icon src={module.icon} alt="" />
        <h3 className="font-semibold text-primary-bright">{module.name}</h3>
        <span className="ml-auto text-lg font-semibold text-primary-bright">
          Lv. {level}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSet(level - 1)}
          disabled={level <= 0}
          className={`${smallBtn} disabled:opacity-30`}
          aria-label={`${module.name} level down`}
        >
          −
        </button>
        <input
          type="range"
          min={0}
          max={MODULE_MAX_LEVEL}
          value={level}
          onChange={(e) => onSet(Number(e.target.value))}
          className="flex-1 accent-[var(--secondary)]"
          aria-label={`${module.name} level`}
        />
        <button
          type="button"
          onClick={() => onSet(level + 1)}
          disabled={level >= MODULE_MAX_LEVEL}
          className={`${smallBtn} disabled:opacity-30`}
          aria-label={`${module.name} level up`}
        >
          +
        </button>
      </div>
      <div className="flex gap-1.5">
        {[0, ...MILESTONES].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onSet(l)}
            className={`flex-1 rounded border py-0.5 text-xs transition-colors ${
              level === l
                ? "border-secondary text-primary-bright"
                : "border-primary/15 text-primary-dim hover:text-primary-bright"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <p>
        <span className="text-primary-bright font-semibold">+{fx.stat}%</span>{" "}
        {module.stat}
      </p>
      <ul className="space-y-1.5">
        {module.perks.map((p) => {
          const on = level >= p.level;
          return (
            <li
              key={p.skill}
              className={`flex items-center gap-2 text-sm ${
                on ? "text-primary-bright" : "text-primary-dim"
              }`}
            >
              <span className={on ? "" : "opacity-40 grayscale"}>
                <Icon src={`/quanah/skills/${p.skill}.png`} alt="" />
              </span>
              <span className="flex-1">{p.text}</span>
              <span className="text-xs whitespace-nowrap">
                {on ? "Active" : `Lv. ${p.level}`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function MissionCalculator() {
  const [get, set] = useParamState(KEYS, "quanah-calc-missions");
  const [undo, setUndo] = useState(null);

  const progress = {
    level: clampInt(get("mlv"), 0, ladder("level").length),
    battlesim: clampInt(get("mbs"), 0, ladder("battlesim").length),
    starforce: clampInt(get("msf"), 0, ladder("starforce").length),
    bosses: decodeBosses(get("mb")),
    extraScore: clampInt(get("mx"), 0, 1e6),
  };
  const banked = clampInt(get("mbank"), 0, 110);
  const modLevels = (get("mod") ?? "")
    .split(".")
    .map((v) => clampInt(v, 0, MODULE_MAX_LEVEL));
  const levels = MODULES.map((_, i) => modLevels[i] ?? 0);

  const snapshot = () => Object.fromEntries(KEYS.map((k) => [k, get(k)]));
  const write = (patch) => {
    setUndo(null);
    set(patch);
  };
  const writeProgress = (p) => ({
    mlv: p.level,
    mbs: p.battlesim,
    msf: p.starforce,
    mb: encodeBosses(p.bosses),
    mx: p.extraScore,
  });

  const onDie = () => {
    const before = snapshot();
    const next = die(progress, banked);
    set({ ...writeProgress(next.progress), mbank: next.bankedPoints });
    setUndo(before);
  };

  const setLevels = (next) =>
    write({ mod: next.some((l) => l > 0) ? next.join(".") : null });

  const available = modulePoints(progress, banked);
  const spent = levels.reduce((a, l) => a + l, 0);
  const s = missionScore(progress);

  return (
    <div className="space-y-6">
      <Summary
        progress={progress}
        banked={banked}
        setBanked={(v) => write({ mbank: v })}
        onDie={onDie}
        canUndo={!!undo}
        onUndo={() => {
          set(undo);
          setUndo(null);
        }}
        onClear={() => {
          const before = snapshot();
          set(Object.fromEntries(KEYS.map((k) => [k, null])));
          setUndo(before);
        }}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-bright">
          Missions done
        </h3>
        <p className="text-sm text-primary-dim">
          Level, Battlesim and Star Force missions are ladders: pick the highest
          one you have reached and everything below it counts too.
        </p>
        <div className="grid xl:grid-cols-3 gap-4">
          {MISSION_CATEGORIES.filter((c) => c.id !== "boss").map((c) => (
            <LadderCard
              key={c.id}
              category={c}
              done={progress[c.id]}
              onSet={(n) => write({ [LADDER_KEY[c.id]]: n })}
            />
          ))}
        </div>
        <BossCard
          bosses={progress.bosses}
          onToggle={(id) => {
            const next = new Set(progress.bosses);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            write({ mb: encodeBosses(next) });
          }}
          onSetAll={(on) =>
            write({
              mb: encodeBosses(on ? new Set(BOSSES.map((b) => b.id)) : new Set()),
            })
          }
        />
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span>Other score this run</span>
          <input
            type="number"
            min={0}
            step={100}
            value={progress.extraScore}
            onChange={(e) => write({ mx: clampInt(e.target.value, 0, 1e6) })}
            className="w-24 px-2 py-1 rounded border border-primary/20 bg-background text-primary-bright"
          />
          <span className="text-primary-dim text-xs">
            Score from outside the mission list, like trading a Dimensional
            Skill Coupon for score or deleting a skill. Counts toward your grade
            but not module points, and is cleared when you die.
          </span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="text-lg font-semibold text-primary-bright">
            Mapae Modules
          </h3>
          <p
            className={`text-sm ${
              spent > available ? "text-progress-orange" : "text-primary-dim"
            }`}
          >
            {spent} of {available} points used
            {spent > available &&
              ` · ${spent - s.count} more ${
                spent - s.count === 1 ? "mission" : "missions"
              } this run before you die`}
            {spent < available && ` · ${available - spent} unspent`}
          </p>
          {spent > 0 && (
            <button
              type="button"
              onClick={() => setLevels(MODULES.map(() => 0))}
              className={`${smallBtn} ml-auto`}
            >
              Reset modules
            </button>
          )}
        </div>
        <p className="text-sm text-primary-dim">
          Every level adds 5% to the module&apos;s main stat, and Lv. 10, 20 and
          30 each unlock a perk. Plan a build here to see how many missions you
          need before dying to afford it.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {MODULES.map((m, i) => (
            <ModuleCard
              key={m.id}
              module={m}
              level={levels[i]}
              onSet={(l) =>
                setLevels(
                  levels.map((x, j) =>
                    j === i ? Math.max(0, Math.min(MODULE_MAX_LEVEL, l)) : x,
                  ),
                )
              }
            />
          ))}
        </div>
        <p className="text-xs text-primary-dim">
          Which perk unlocks at which level is from quanah.wiki; the client only
          has the perk values.
        </p>
      </div>
    </div>
  );
}
