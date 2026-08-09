"use client";

import React from "react";
import {
  flattenStats,
  sumStats,
  STAT_META,
  formatStat,
} from "@/lib/equip/stats";
import { resolveItemBreakdown } from "@/lib/equip/engine";
import { starCap } from "@/lib/equip/starforce";

// Source colors for the "+921 (382 + 264 + 275)" stat breakdown.
const SOURCE_COLORS = {
  base: "#ffffff",
  starforce: "#ffd75e",
  flame: "#00c896",
};

/**
 * Item tooltip drawn with the game's own frame art.
 *
 * `UIToolTip.img/Equip/frame/common` is a vertical 3-slice: a 324x30 top, a
 * 324x1 middle that stretches to whatever height is needed, and a 324x12
 * bottom. Rebuilding it that way keeps the frame crisp at any content length.
 */
const FRAME_WIDTH = 324;

// Order stats the way the game's tooltip does rather than alphabetically.
const TOOLTIP_ORDER = [
  "str",
  "dex",
  "int",
  "luk",
  "allStat",
  "strP",
  "dexP",
  "intP",
  "lukP",
  "allStatP",
  "hp",
  "mp",
  "hpP",
  "mpP",
  "att",
  "matt",
  "attP",
  "mattP",
  "def",
  "mdef",
  "defP",
  "boss",
  "dmg",
  "ied",
  "critRate",
  "critDmg",
  "speed",
  "jump",
];

export default function ItemTooltip({ hover, lineIndex, containerRect }) {
  if (!hover) return null;

  const { slot, item, config, coveredBy, anchor } = hover;
  if (!item && !coveredBy) return null;

  const shown = coveredBy ?? item;
  const breakdown = resolveItemBreakdown(
    shown,
    coveredBy ? {} : (config ?? {}),
    lineIndex,
  );
  const bySource = {
    base: flattenStats(breakdown.base),
    starforce: flattenStats(breakdown.starforce),
    flame: flattenStats(breakdown.flame),
  };
  const stats = flattenStats(
    sumStats(breakdown.base, breakdown.starforce, breakdown.flame),
  );

  const ordered = [
    ...TOOLTIP_ORDER.filter((k) => stats[k]),
    ...Object.keys(stats).filter((k) => stats[k] && !TOOLTIP_ORDER.includes(k)),
  ];

  // Anchor to the right of the slot, flipping left near the viewport edge.
  const left = anchor.right + 10;
  const flip =
    typeof window !== "undefined" &&
    left + FRAME_WIDTH > window.innerWidth - 12;

  const style = {
    position: "fixed",
    left: flip ? Math.max(8, anchor.left - FRAME_WIDTH - 10) : left,
    top: Math.min(
      anchor.top,
      typeof window !== "undefined"
        ? Math.max(8, window.innerHeight - 340)
        : anchor.top,
    ),
    width: FRAME_WIDTH,
    zIndex: 60,
  };

  const cap = starCap(shown);

  return (
    <div style={style} className="pointer-events-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/equip-ui/tooltip/top.png"
        alt=""
        width={FRAME_WIDTH}
        className="block"
      />

      <div
        className="relative px-4 -mt-[30px] pt-[6px] pb-1"
        style={{
          backgroundImage: "url(/equip-ui/tooltip/mid.png)",
          backgroundRepeat: "repeat-y",
          backgroundSize: `${FRAME_WIDTH}px 1px`,
        }}
      >
        <p className="text-center text-[13px] font-bold text-white leading-5">
          {shown.name}
        </p>

        {config?.stars > 0 && (
          <p className="text-center text-[11px]" style={{ color: "#ffd75e" }}>
            {"★".repeat(Math.min(config.stars, 15))}
            {config.stars > 15 ? ` ${config.stars}` : ""}
            <span className="text-white/40"> / {cap}</span>
          </p>
        )}

        <div className="my-1.5 -mx-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/equip-ui/tooltip/line.png"
            alt=""
            width={FRAME_WIDTH}
            className="block"
          />
        </div>

        <p className="text-[11px] text-white/50 mb-1">
          {slot.name} · REQ LEV {shown.reqLevel}
          {shown.superior ? " · Superior" : ""}
        </p>

        {coveredBy && (
          <p className="text-[11px] mb-1" style={{ color: "#ff9f43" }}>
            Occupied by {coveredBy.name}
          </p>
        )}

        <ul className="space-y-[1px]">
          {ordered.map((key) => {
            const parts = ["base", "starforce", "flame"]
              .map((source) => ({ source, value: bySource[source][key] }))
              .filter((p) => p.value);

            return (
              <li
                key={key}
                className="text-[11px] text-white/90 flex justify-between gap-3"
              >
                <span>{STAT_META[key]?.label ?? key}</span>
                <span className="tabular-nums" style={{ color: "#8ec9ff" }}>
                  +{formatStat(key, stats[key])}
                  {parts.length > 1 && (
                    <span className="text-white/50">
                      {" ("}
                      {parts.map((p, i) => (
                        <React.Fragment key={p.source}>
                          {i > 0 && " + "}
                          <span style={{ color: SOURCE_COLORS[p.source] }}>
                            {formatStat(key, p.value)}
                          </span>
                        </React.Fragment>
                      ))}
                      {")"}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
          {ordered.length === 0 && (
            <li className="text-[11px] text-white/40">No stats.</li>
          )}
        </ul>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/equip-ui/tooltip/btm.png"
        alt=""
        width={FRAME_WIDTH}
        className="block"
      />
    </div>
  );
}
