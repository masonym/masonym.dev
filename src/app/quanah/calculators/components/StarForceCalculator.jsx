"use client";

import { useMemo } from "react";
import {
  EQUIP_CAP,
  ITEMS,
  MAPAE_LEVEL,
  MAX_STAR,
  buildQuanahTable,
  expected,
  simulate,
} from "@/lib/quanah/starforce";
import useParamState from "./useParamState";
import Icon from "../../components/Icon";

const KEYS = ["sfi", "sfl", "sff", "sft", "sfb", "sfce", "sfcm", "fqc", "fmf"];
const COST_KEY = { equip: "sfce", mapae: "sfcm" };

const DEFAULT_LEVEL = 200;
const LEVEL_PICKS = [140, 150, 160, 200, 250];

// Farming rates (per 30 minutes) turn amounts into farming time, one per currency. Only the item's
// own currency is asked for: the Mapae's restore crystals are never what holds you up.
const RATE_KEY = { crystals: "fqc", fragments: "fmf" };
const parseRate = (v) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 1e6) : 0;
};
// "12 min", "3.4 h", "41 h"
const farmTime = (amount, rate) => {
  const min = (amount / rate) * 30;
  if (min < 60) return `${Math.max(1, Math.round(min))} min`;
  const h = min / 60;
  return `${h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString("en-US")} h`;
};

// Monte Carlo is only for the spread; the averages are exact. Cap the work so a 0 -> 30 run on a
// slow phone doesn't hang the page.
const SIM_BUDGET = 2e7;

const fmt = (n) => Math.round(n).toLocaleString("en-US");
const pct = (p) =>
  p === 0
    ? "-"
    : `${(p * 100).toFixed(p < 0.01 ? 2 : 1).replace(/\.0+$/, "")}%`;
const clampInt = (v, lo, hi, dflt) => {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? dflt : Math.min(hi, Math.max(lo, n));
};

// Cost overrides as "star:cost,star:cost".
const decodeCosts = (s) => {
  const out = {};
  for (const part of (s ?? "").split(",")) {
    const [k, v] = part.split(":").map(Number);
    if (Number.isInteger(k) && k >= 0 && k <= MAX_STAR && v >= 0) out[k] = v;
  }
  return out;
};
const encodeCosts = (costs) =>
  Object.entries(costs)
    .map(([k, v]) => `${k}:${v}`)
    .join(",") || null;

const card = "rounded-lg border border-primary/15 bg-background-bright/30 p-4";
const input =
  "w-20 px-2 py-1 rounded border border-primary/20 bg-background text-primary-bright";

// An (i) that shows `children` on hover, and on focus so it also works by keyboard and tap.
// `below` opens it downwards, for spots where the space above is clipped (the table header).
function Tip({ children, below = false }) {
  return (
    <span className="relative inline-flex align-middle group normal-case tracking-normal font-normal">
      <button
        type="button"
        aria-label="More info"
        className="ml-1 inline-flex rounded-full text-primary-dim hover:text-primary-bright focus-visible:outline focus-visible:outline-1 focus-visible:outline-secondary"
      >
        {/* drawn rather than a text "i": the site font sits it off-centre */}
        <svg
          viewBox="0 0 16 16"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="8" cy="8" r="6.75" />
          <path d="M8 7.25v4" strokeWidth="1.5" />
          <circle cx="8" cy="4.9" r="0.85" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-20 w-60 rounded-md border border-primary/20 bg-background-bright px-3 py-2 text-xs text-primary shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${
          below ? "top-full mt-1.5" : "bottom-full mb-1.5"
        }`}
      >
        {children}
      </span>
    </span>
  );
}

function Stat({ label, tip, value, sub }) {
  return (
    <div className={card}>
      <p className="text-xs uppercase tracking-wider text-primary-dim">
        {label}
        {tip && <Tip>{tip}</Tip>}
      </p>
      <p className="text-2xl font-semibold text-primary-bright mt-1">{value}</p>
      {sub && <p className="text-sm text-primary-dim mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StarForceCalculator() {
  const [get, set] = useParamState(KEYS, "quanah-calc-starforce");

  const itemId = get("sfi") === "mapae" ? "mapae" : "equip";
  const item = ITEMS[itemId];
  const level =
    itemId === "mapae"
      ? MAPAE_LEVEL
      : clampInt(get("sfl"), 1, 300, DEFAULT_LEVEL);
  // the default target is 22★ for both: the Mapae's cap, and the most a leap-out item can have
  const maxStar = item.maxStar;
  const from = clampInt(get("sff"), 0, maxStar - 1, 0);
  const to = Math.max(from + 1, clampInt(get("sft"), 1, maxStar, EQUIP_CAP));
  const boomReduction = get("sfb") === "1";
  // Restoring destroyed Quanah equipment is free. The Mapae costs a fixed 100 Quanah Crystals
  // per restore, a different currency from its fragments, so it's reported on its own.
  const restoreEach = item.restoreCrystals ?? 0;
  const costParam = get(COST_KEY[itemId]);
  const costs = useMemo(() => decodeCosts(costParam), [costParam]);

  const table = useMemo(
    () => buildQuanahTable({ item, level, costs, boomReduction }),
    [item, level, costs, boomReduction],
  );
  const exp = useMemo(() => expected(table, from, to), [table, from, to]);
  const restoreCrystals = exp.booms * restoreEach;

  const rates = {
    crystals: parseRate(get(RATE_KEY.crystals)),
    fragments: parseRate(get(RATE_KEY.fragments)),
  };
  const itemRate = rates[item.short];
  // time for `amount` of the item's own currency, or null without a rate
  const timeFor = (amount) => (itemRate ? farmTime(amount, itemRate) : null);
  const spread = useMemo(() => {
    const runs = Math.min(10000, Math.floor(SIM_BUDGET / exp.attempts));
    return runs >= 500 ? { ...simulate(table, from, to, runs), runs } : null;
  }, [table, from, to, exp.attempts]);

  const rows = useMemo(
    () =>
      table.slice(from, to).map((e, i) => {
        const star = from + i;
        return { star, ...e, step: expected(table, star, star + 1) };
      }),
    [table, from, to],
  );

  const setCost = (star, value) => {
    const next = { ...costs };
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n) || n === item.defaultCost(star, level))
      delete next[star];
    else next[star] = Math.max(0, n);
    set({ [COST_KEY[itemId]]: encodeCosts(next) });
  };
  const edited = Object.keys(costs).length > 0;

  return (
    <div className="space-y-6">
      <div className={`${card} space-y-4`}>
        <div className="flex flex-wrap gap-2">
          {Object.values(ITEMS).map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => set({ sfi: it.id === "equip" ? null : it.id })}
              aria-pressed={it.id === itemId}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                it.id === itemId
                  ? "border-secondary text-primary-bright bg-secondary/15"
                  : "border-primary/20 text-primary hover:text-primary-bright"
              }`}
            >
              <Icon src={it.itemIcon ?? it.icon} alt="" />
              {it.name}
              <span className="text-primary-dim">({it.currency})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          {itemId === "equip" && (
            <div className="text-sm space-y-1">
              <label htmlFor="sf-level" className="block text-primary-dim">
                Item level
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  id="sf-level"
                  type="number"
                  min={1}
                  max={300}
                  value={level}
                  onChange={(e) => {
                    const l = clampInt(e.target.value, 1, 300, DEFAULT_LEVEL);
                    set({ sfl: l === DEFAULT_LEVEL ? null : l });
                  }}
                  className={input}
                />
                {LEVEL_PICKS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set({ sfl: l === DEFAULT_LEVEL ? null : l })}
                    className={`px-2 py-1 rounded border text-xs transition-colors ${
                      level === l
                        ? "border-secondary text-primary-bright"
                        : "border-primary/15 text-primary-dim hover:text-primary-bright"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="text-sm space-y-1">
            <span className="block text-primary-dim">Current star</span>
            <input
              type="number"
              min={0}
              max={maxStar - 1}
              value={from}
              onChange={(e) =>
                set({ sff: clampInt(e.target.value, 0, maxStar - 1, 0) })
              }
              className={input}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="block text-primary-dim">Target star</span>
            <input
              type="number"
              min={1}
              max={maxStar}
              value={to}
              onChange={(e) => {
                const t = clampInt(e.target.value, 1, maxStar, EQUIP_CAP);
                set({ sft: t === EQUIP_CAP ? null : t });
              }}
              className={input}
            />
          </label>
          <label className="flex items-center gap-2 text-sm pb-1.5">
            <input
              type="checkbox"
              checked={boomReduction}
              onChange={(e) => set({ sfb: e.target.checked ? 1 : null })}
              className="accent-[var(--secondary)]"
            />
            Sunny Sunday: 30% less destruction (to 21★)
            <Tip>
              Sunny Sunday&apos;s 30% cost discount doesn&apos;t apply to{" "}
              {item.currency}.
            </Tip>
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <label className="text-sm space-y-1">
            <span className="flex items-center gap-1.5 text-primary-dim">
              <Icon src={item.icon} alt="" />
              {item.currency} you farm per 30 min
            </span>
            <span className="block text-xs text-primary-dim">
              Add your farming rate to see the totals as farming time.
            </span>
            <input
              type="number"
              min={0}
              step="any"
              placeholder="optional"
              value={itemRate || ""}
              onChange={(e) =>
                set({
                  [RATE_KEY[item.short]]: parseRate(e.target.value) || null,
                })
              }
              className={`${input} w-28`}
            />
          </label>
        </div>
        {to > EQUIP_CAP && (
          <p className="text-sm text-progress-orange">
            Quanah gear can be starred past 22★, but items you will leap back to
            a regular world (pitched boss gear, Eternal and so on) cannot be.
          </p>
        )}
        <p className="text-xs text-primary-dim">
          {restoreEach
            ? `Restoring a destroyed Mapae costs ${restoreEach} Quanah Crystals.`
            : ""}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label={`Average ${item.short}`}
          value={
            <span className="inline-flex items-center gap-2">
              <Icon src={item.icon} alt="" />
              {fmt(exp.cost)}
            </span>
          }
          sub={
            timeFor(exp.cost)
              ? `≈ ${timeFor(exp.cost)} of farming${restoreEach ? " fragments" : ""}`
              : null
          }
        />
        <Stat
          label="Average attempts"
          value={fmt(exp.attempts)}
          sub={`${from}★ → ${to}★`}
        />
        <Stat
          label="Average booms"
          value={exp.booms.toFixed(2)}
          sub={[
            restoreEach > 0 && `${fmt(restoreCrystals)} crystals to restore`,
            spread
              ? `${pct(spread.noBoomChance)} chance of none`
              : "Too long a climb to simulate",
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <Stat
          label="1 in 10 spend more than"
          tip={
            spread &&
            `Spread (how many spend more or less) comes from simulating ${fmt(spread.runs)} times.`
          }
          value={spread ? fmt(spread.p90) : "-"}
          sub={
            spread
              ? [
                  timeFor(spread.p90) && `≈ ${timeFor(spread.p90)}`,
                  `Half spend under ${fmt(spread.p50)}`,
                  `1 in 100 spend over ${fmt(spread.p99)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "Too long a climb to simulate"
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h3 className="text-lg font-semibold text-primary-bright">
            Per star
          </h3>
          {edited && (
            <button
              type="button"
              onClick={() => set({ [COST_KEY[itemId]]: null })}
              className="text-sm text-primary-dim underline hover:text-primary-bright"
            >
              Reset costs to defaults
            </button>
          )}
        </div>
        {/*
        <p className="text-sm text-primary-dim">
          The cost of an attempt isn&apos;t in the game files.{" "}
          {itemId === "equip" ? (
            <>
              The defaults are a formula fitted to costs checked in game on
              level 160 and 200 items: flat 10 / 20 / 30 crystals below 15★,
              then level³ × (star+1)^2.7 / 200,000,000. Other levels, and the
              costs below 15★ on anything but level 160, are extrapolated.
            </>
          ) : (
            <>
              The defaults are the same formula divided by ten, fitted to
              fragment costs checked in game from 15★ to 22★. Below 15★ (1 / 2
              / 3) is a guess.
            </>
          )}{" "}
          Change any cost to what your enhancement window shows and everything
          updates; your costs are kept in the link.
        </p>
      */}
        <div className="overflow-x-auto rounded-lg border border-primary/15">
          <table className="w-full text-sm">
            <thead className="bg-background-bright/40 text-primary-dim">
              <tr>
                {[
                  "Star",
                  "Success",
                  "Destroy",
                  `Cost (${item.short})`,
                  "Avg to next ★",
                  "Boom drops to",
                ].map((h) => (
                  <th key={h} className="text-left font-semibold px-3 py-2">
                    {h}
                    {h === "Avg to next ★" && (
                      <Tip below>Includes climbing back after a boom.</Tip>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {rows.map((r) => (
                <tr key={r.star}>
                  <td className="px-3 py-1.5 whitespace-nowrap text-primary-bright">
                    {r.star}★ → {r.star + 1}★
                  </td>
                  <td className="px-3 py-1.5">{pct(r.pSuccess)}</td>
                  <td
                    className={`px-3 py-1.5 ${r.pBoom > 0 ? "text-progress-red" : ""}`}
                  >
                    {pct(r.pBoom)}
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      min={0}
                      value={r.cost}
                      onChange={(e) => setCost(r.star, e.target.value)}
                      className={`w-20 px-2 py-0.5 rounded border bg-background text-primary-bright ${
                        r.star in costs
                          ? "border-secondary"
                          : "border-primary/20"
                      }`}
                      aria-label={`Cost at ${r.star} stars`}
                    />
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    {fmt(r.step.cost)}
                  </td>
                  <td className="px-3 py-1.5 text-primary-dim">
                    {r.pBoom > 0 ? `${r.recoverStar}★` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
