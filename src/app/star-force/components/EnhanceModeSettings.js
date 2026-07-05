"use client";

import React, { useMemo } from "react";
import {
  ENHANCE_MODE_STARS,
  getEnhanceModeInfo,
  getMaxStars,
  buildStarTable,
  evaluateStrategy,
  computeEnhanceFrontier,
} from "../utils";

const MAX_STRATEGY_ROWS = 8;

const formatPercent = (p) => `${parseFloat((p * 100).toFixed(2))}%`;

const formatMesos = (n) => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}t`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}b`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}m`;
  return new Intl.NumberFormat("en-US").format(Math.round(n));
};

export default function EnhanceModeSettings({
  settings,
  onChange,
  equipmentInfo,
  starCatchStars,
  eventTypes,
  mvpType,
  spareItemSettings,
}) {
  const level = Number(equipmentInfo.level) || 0;
  const currentStars = Number(equipmentInfo.currentStars) || 0;
  const targetStars = Number(equipmentInfo.targetStars) || 0;
  const ready = level > 0 && targetStars > currentStars;
  const maxStars = getMaxStars(level);

  const spareMesos =
    spareItemSettings.currency === "mesos" ? spareItemSettings.sparePrice : 0;
  const spareInOtherCurrency =
    spareItemSettings.sparePrice > 0 && spareItemSettings.currency !== "mesos";

  const setMode = (star, mode) => {
    onChange({ ...settings, modes: { ...settings.modes, [star]: mode } });
  };

  const applyModes = (modes) => {
    onChange({ ...settings, modes: { ...modes } });
  };

  // Stars the climb can actually visit given the target (a boom resets below
  // 15★, so everything from 15★ up to target-1 stays relevant).
  const starIsUsed = (star) => !ready || star < Math.min(targetStars, maxStars);

  // The efficient meso <-> boom tradeoffs. Independent of the user's current
  // selection and spare price, so it only recomputes when the setup changes.
  const frontier = useMemo(() => {
    if (!ready) return null;
    return computeEnhanceFrontier({
      level,
      startingStar: currentStars,
      targetStar: targetStars,
      starCatchStars,
      eventTypes,
      mvpType,
    });
  }, [
    ready,
    level,
    currentStars,
    targetStars,
    starCatchStars,
    eventTypes,
    mvpType,
  ]);

  const current = useMemo(() => {
    if (!ready) return null;
    const table = buildStarTable({
      level,
      enhanceModes: settings.modes,
      starCatchStars,
      eventTypes,
      mvpType,
    });
    const { expectedCost, expectedBooms } = evaluateStrategy(
      table,
      currentStars,
      targetStars,
    );
    return {
      expectedCost,
      expectedBooms,
      expectedTotal: expectedCost + expectedBooms * spareMesos,
    };
  }, [
    ready,
    level,
    currentStars,
    targetStars,
    settings.modes,
    starCatchStars,
    eventTypes,
    mvpType,
    spareMesos,
  ]);

  // The frontier row that minimizes total cost at the user's spare price
  // (equivalently: the row whose [spareFrom, spareTo) range contains it).
  const bestIndex = useMemo(() => {
    if (!frontier || frontier.length === 0 || spareMesos <= 0) return -1;
    return frontier.findIndex(
      (p) => spareMesos >= p.spareFrom && spareMesos < p.spareTo,
    );
  }, [frontier, spareMesos]);

  // Thin long frontiers for display: always keep both endpoints and the
  // user's best row; fill the rest with the points that win over the widest
  // (log-scale) spare-price ranges.
  const displayRows = useMemo(() => {
    if (!frontier) return null;
    if (frontier.length <= MAX_STRATEGY_ROWS) return frontier;
    const keep = new Set([0, frontier.length - 1]);
    if (bestIndex >= 0) keep.add(bestIndex);
    frontier
      .map((p, i) => ({
        i,
        width: Math.log10(p.spareTo / Math.max(p.spareFrom, 1)),
      }))
      .filter(({ i }) => !keep.has(i))
      .sort((a, b) => b.width - a.width)
      .slice(0, MAX_STRATEGY_ROWS - keep.size)
      .forEach(({ i }) => keep.add(i));
    return [...keep].sort((a, b) => a - b).map((i) => frontier[i]);
  }, [frontier, bestIndex]);

  const matchesCurrent = (modes) =>
    ENHANCE_MODE_STARS.every(
      (s) => !starIsUsed(s) || (settings.modes[s] || 1) === modes[s],
    );

  const rowTitle = (point, isFirst, isLast) => {
    if (frontier.length === 1) return "Only efficient strategy";
    if (isFirst) return "Cheapest meso";
    if (isLast)
      return point.expectedBooms < 1e-9
        ? "Boomless (below 22★)"
        : "Fewest booms";
    return "Balanced";
  };

  const rowRange = (point, isFirst, isLast) => {
    if (frontier.length === 1) return "Best at any spare price";
    if (isFirst) return `when a spare is worth under ${formatMesos(point.spareTo)}`;
    if (isLast) return `when a spare is worth over ${formatMesos(point.spareFrom)}`;
    return `when a spare is worth ${formatMesos(point.spareFrom)} - ${formatMesos(point.spareTo)}`;
  };

  const modesTooltip = (modes) =>
    ENHANCE_MODE_STARS.filter((s) => starIsUsed(s))
      .map((s) => `${s}★: Mode ${modes[s]}`)
      .join(" · ");

  return (
    <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-1 text-[color:var(--primary-bright)]">
        Enhancement Mode
      </h2>
      <p className="text-sm text-[color:var(--primary-dim)] mb-4">
        Pick a mode per star (15★-21★). Higher modes cost more meso but boom
        less - Mode 4 can&apos;t boom. At 18★+ higher modes also lower the
        success rate. Not available on Superior equipment.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 items-start">
        {/* Left: per-star mode picker */}
        <div>
          <div className="grid grid-cols-[auto_repeat(4,1fr)] gap-1 items-stretch">
            <div />
            {[1, 2, 3, 4].map((m) => (
              <div
                key={m}
                className="text-center text-sm font-semibold text-[color:var(--primary-bright)] pb-1"
              >
                Mode {m}
              </div>
            ))}

            {ENHANCE_MODE_STARS.map((star) => {
              const used = starIsUsed(star);
              return (
                <React.Fragment key={star}>
                  <div
                    className={`flex items-center pr-2 text-sm font-medium text-[color:var(--primary)] ${used ? "" : "opacity-40"}`}
                  >
                    {star}★→{star + 1}★
                  </div>
                  {[1, 2, 3, 4].map((mode) => {
                    const info = getEnhanceModeInfo(star, mode);
                    const selected = (settings.modes[star] || 1) === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setMode(star, mode)}
                        disabled={!used}
                        title={`${star}★ Mode ${mode}: ${formatPercent(info.success)} success · ${formatPercent(info.boom)} destroy · ×${info.mult} cost`}
                        className={`px-1 py-1.5 rounded text-center transition-colors leading-tight ${
                          !used
                            ? "bg-[color:var(--background)] text-[color:var(--primary-dim)] opacity-40 cursor-not-allowed"
                            : selected
                              ? "bg-[color:var(--secondary)] text-[color:var(--primary-dark)] hover:bg-[color:var(--secondary-bright)]"
                              : "bg-[color:var(--background)] text-[color:var(--primary)] hover:bg-[color:var(--primary-dim)]"
                        }`}
                      >
                        <span className="block text-xs font-semibold">
                          {formatPercent(info.success)} /{" "}
                          {formatPercent(info.boom)}
                        </span>
                        <span
                          className={`block text-xs ${selected ? "" : "text-[color:var(--primary-dim)]"}`}
                        >
                          ×{info.mult}
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[color:var(--primary-dim)]">
            Each cell: success % / destroy % and meso cost multiplier.
          </p>
        </div>

        {/* Right: expected outcome + efficient strategies */}
        <div className="space-y-3">
          {!ready && (
            <p className="text-sm text-[color:var(--primary-dim)]">
              Enter equipment level, current and target stars to see expected
              costs and the efficient strategies.
            </p>
          )}

          {current && (
            <div className="p-2.5 bg-[color:var(--background)] rounded">
              <div className="text-xs text-[color:var(--primary-dim)]">
                Expected with current selection
              </div>
              <div className="text-sm font-semibold text-[color:var(--primary)]">
                {formatMesos(current.expectedCost)} mesos
                <span className="mx-1 text-[color:var(--primary-dim)]">·</span>
                <span className="text-[color:var(--progress-red)]">
                  {current.expectedBooms.toFixed(2)} booms
                </span>
                {spareMesos > 0 && (
                  <>
                    <span className="mx-1 text-[color:var(--primary-dim)]">
                      ·
                    </span>
                    <span className="text-[color:var(--secondary)]">
                      {formatMesos(current.expectedTotal)} incl. spares
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {displayRows && displayRows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--primary-bright)] mb-1">
                Efficient strategies
              </h3>
              <p className="text-xs text-[color:var(--primary-dim)] mb-2">
                Every meso ↔ boom tradeoff that can&apos;t be beaten on both at
                once, from cheapest to safest. Click a row to apply it.
              </p>
              <div className="space-y-1.5">
                {displayRows.map((point) => {
                  const i = frontier.indexOf(point);
                  const isFirst = i === 0;
                  const isLast = i === frontier.length - 1;
                  const isBest = i === bestIndex;
                  const active = matchesCurrent(point.modes);
                  return (
                    <button
                      key={point.key}
                      onClick={() => applyModes(point.modes)}
                      title={modesTooltip(point.modes)}
                      className={`w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded text-left transition-colors border ${
                        active
                          ? "bg-[color:var(--background)] border-[color:var(--secondary)]"
                          : "bg-[color:var(--background)] border-transparent hover:bg-[color:var(--primary-dim)]"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-[color:var(--primary)]">
                          {rowTitle(point, isFirst, isLast)}
                          {isBest && (
                            <span className="ml-2 text-xs text-[color:var(--secondary)]">
                              ★ best for your {formatMesos(spareMesos)} spare
                            </span>
                          )}
                          {active && (
                            <span className="ml-2 text-xs text-[color:var(--secondary)]">
                              applied
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-[color:var(--primary-dim)]">
                          {rowRange(point, isFirst, isLast)}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="block text-xs text-[color:var(--primary)]">
                          {formatMesos(point.expectedCost)} mesos
                          <span className="mx-1 text-[color:var(--primary-dim)]">
                            ·
                          </span>
                          <span className="text-[color:var(--progress-red)]">
                            {point.expectedBooms.toFixed(2)} booms
                          </span>
                        </span>
                        {spareMesos > 0 && (
                          <span className="block text-xs text-[color:var(--secondary)]">
                            {formatMesos(
                              point.expectedCost +
                                point.expectedBooms * spareMesos,
                            )}{" "}
                            incl. spares
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {spareInOtherCurrency && (
                <p className="mt-2 text-xs text-[color:var(--primary-dim)]">
                  Your spare is priced in {spareItemSettings.currency} -
                  estimate what it&apos;s worth in mesos and use the ranges
                  above to pick your row.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
