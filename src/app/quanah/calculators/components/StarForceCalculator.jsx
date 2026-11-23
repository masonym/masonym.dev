"use client";

import { useMemo } from "react";
import {
  EQUIP_CAP,
  ITEMS,
  MAX_STAR,
  buildQuanahTable,
  expected,
  simulate,
} from "@/lib/quanah/starforce";
import useParamState from "./useParamState";
import Icon from "../../components/Icon";

const KEYS = ["sfi", "sff", "sft", "sfb", "sfr", "sfce", "sfcm"];
const COST_KEY = { equip: "sfce", mapae: "sfcm" };

// Byte Shop prices (Etc/GL_QuanahDungeon.img/shopItem), to put a total in Bytes.
const BYTE_PRICE = { equip: 50, mapae: 600 };

// Monte Carlo is only for the spread; the averages are exact. Cap the work so a 0 -> 30 run on a
// slow phone doesn't hang the page.
const SIM_BUDGET = 2e7;

const fmt = (n) => Math.round(n).toLocaleString("en-US");
const pct = (p) =>
  p === 0 ? "-" : `${(p * 100).toFixed(p < 0.01 ? 2 : 1).replace(/\.0+$/, "")}%`;
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

function Stat({ label, value, sub }) {
  return (
    <div className={card}>
      <p className="text-xs uppercase tracking-wider text-primary-dim">{label}</p>
      <p className="text-2xl font-semibold text-primary-bright mt-1">{value}</p>
      {sub && <p className="text-sm text-primary-dim mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StarForceCalculator() {
  const [get, set] = useParamState(KEYS, "quanah-calc-starforce");

  const itemId = get("sfi") === "mapae" ? "mapae" : "equip";
  const item = ITEMS[itemId];
  const from = clampInt(get("sff"), 0, MAX_STAR - 1, 0);
  const to = Math.max(from + 1, clampInt(get("sft"), 1, MAX_STAR, EQUIP_CAP));
  const boomReduction = get("sfb") === "1";
  const boomCost = clampInt(get("sfr"), 0, 1e9, 0);
  const costParam = get(COST_KEY[itemId]);
  const costs = useMemo(() => decodeCosts(costParam), [costParam]);

  const table = useMemo(
    () => buildQuanahTable({ item, costs, boomReduction }),
    [item, costs, boomReduction],
  );
  const exp = useMemo(
    () => expected(table, from, to, boomCost),
    [table, from, to, boomCost],
  );
  const spread = useMemo(() => {
    const runs = Math.min(10000, Math.floor(SIM_BUDGET / exp.attempts));
    return runs >= 500 ? simulate(table, from, to, boomCost, runs) : null;
  }, [table, from, to, boomCost, exp.attempts]);

  const rows = useMemo(
    () =>
      table.slice(from, to).map((e, i) => {
        const star = from + i;
        return { star, ...e, step: expected(table, star, star + 1, boomCost) };
      }),
    [table, from, to, boomCost],
  );

  const setCost = (star, value) => {
    const next = { ...costs };
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n) || n === item.defaultCost(star)) delete next[star];
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
          <label className="text-sm space-y-1">
            <span className="block text-primary-dim">Current star</span>
            <input
              type="number"
              min={0}
              max={MAX_STAR - 1}
              value={from}
              onChange={(e) =>
                set({ sff: clampInt(e.target.value, 0, MAX_STAR - 1, 0) })
              }
              className={input}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="block text-primary-dim">Target star</span>
            <input
              type="number"
              min={1}
              max={MAX_STAR}
              value={to}
              onChange={(e) => {
                const t = clampInt(e.target.value, 1, MAX_STAR, EQUIP_CAP);
                set({ sft: t === EQUIP_CAP ? null : t });
              }}
              className={input}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="block text-primary-dim">
              Cost per boom ({item.short})
            </span>
            <input
              type="number"
              min={0}
              value={boomCost}
              onChange={(e) => set({ sfr: clampInt(e.target.value, 0, 1e9, 0) })}
              className={`${input} w-28`}
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
          </label>
        </div>
        {to > EQUIP_CAP && (
          <p className="text-sm text-progress-orange">
            Quanah gear can&apos;t be equipped at 23★ or higher. Past 22★ is
            only for the Star Force missions.
          </p>
        )}
        <p className="text-xs text-primary-dim">
          Sunny Sunday&apos;s 30% cost discount doesn&apos;t apply to{" "}
          {item.currency}, only the destruction reduction does. Cost per boom
          is anything you spend to replace or restore the item after it is
          destroyed; the climb back up from the recovered star is already
          counted.
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
          sub={`≈ ${fmt(exp.cost * BYTE_PRICE[itemId])} Bytes at the shop price`}
        />
        <Stat
          label="Average attempts"
          value={fmt(exp.attempts)}
          sub={`${from}★ → ${to}★`}
        />
        <Stat
          label="Average booms"
          value={exp.booms.toFixed(2)}
          sub={
            spread
              ? `${pct(spread.noBoomChance)} chance of none`
              : "Too long a climb to simulate"
          }
        />
        <Stat
          label="Unlucky cases"
          value={spread ? fmt(spread.p90) : "-"}
          sub={
            spread
              ? `1 in 10 spend more · median ${fmt(spread.p50)} · 1 in 100: ${fmt(spread.p99)}`
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
        <p className="text-sm text-primary-dim">
          The cost of an attempt isn&apos;t in the game files, so the defaults
          are{" "}
          {itemId === "equip"
            ? "community-reported numbers"
            : "a placeholder of 1 fragment"}
          . Change any cost to what your enhancement window shows and
          everything updates; the costs are kept in the link.
        </p>
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
        <p className="text-xs text-primary-dim">
          Rates are the standard GMS Star Force rates with the always-on Star
          Catch bonus, the same as the{" "}
          <a href="/star-force" className="underline hover:text-primary-bright">
            Star Force calculator
          </a>
          . &quot;Avg to next ★&quot; includes climbing back after a boom.
        </p>
      </div>
    </div>
  );
}
