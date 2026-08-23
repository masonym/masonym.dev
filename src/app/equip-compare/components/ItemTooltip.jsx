"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import {
  flattenStats,
  sumStats,
  STAT_META,
  HIDDEN_DIFF_GROUPS,
  formatStat,
} from "@/lib/equip/stats";
import { resolveItemBreakdown, setProgress } from "@/lib/equip/engine";
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

/** Gap between the item tooltip and the set panel beside it. */
const PANEL_GAP = 8;

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
  "att",
  "matt",
  "attP",
  "mattP",
  "boss",
  "dmg",
  "ied",
  "critRate",
  "critDmg",
  "speed",
  "jump",
];

/**
 * Defence, MP and the resistances are dropped rather than printed.
 *
 * The game's own tooltip shows them, so this deliberately does not - the DEF %
 * on a starred item comes from the star force table and the flat DEF from the
 * item, and neither reads as an answer to "should I equip this?". They are the
 * same stats the difference panel leaves out (HIDDEN_DIFF_GROUPS); this keeps
 * the two views telling the same story. They still resolve and are still summed.
 */
const isShown = (key) => !HIDDEN_DIFF_GROUPS.has(STAT_META[key]?.group);

/**
 * Mount guard.
 *
 * Split from the body so the body can use hooks unconditionally - there is
 * nothing to draw at all when no slot is hovered, and a tooltip that measures
 * itself needs its hooks to run every time it is on screen.
 */
export default function ItemTooltip(props) {
  const { hover } = props;
  if (!hover || (!hover.item && !hover.coveredBy)) return null;
  return <Tooltip {...props} />;
}

function Tooltip({ hover, lineIndex, setIndex, itemIndex, loadout }) {
  const frame = useRef(null);
  const [height, setHeight] = useState(0);

  const { slot, item, config, coveredBy, anchor } = hover;

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
    ...Object.keys(stats).filter(
      (k) => stats[k] && isShown(k) && !TOOLTIP_ORDER.includes(k),
    ),
  ];

  // The set panel, if this item belongs to one. Counted against the loadout the
  // hovered slot is in, so the header reads as that character's progress.
  const set = shown.setId ? setIndex?.get(shown.setId) : null;
  const progress = set ? setProgress(set, loadout ?? {}, itemIndex) : null;

  // Anchor to the right of the slot, flipping left near the viewport edge. The
  // set panel is part of the same block, so the flip is decided on the pair's
  // width - otherwise it fits going right and then runs off the screen anyway.
  const width = FRAME_WIDTH + (progress ? PANEL_GAP + FRAME_WIDTH : 0);
  const left = anchor.right + 10;
  const flip =
    typeof window !== "undefined" && left + width > window.innerWidth - 12;

  // Measured rather than estimated: a set panel's height depends on how many
  // pieces the set has and how many of its effect lines wrap, which ranges from
  // shorter than the item tooltip to twice its length. Guessing a reserve cut
  // the last thresholds off the bottom of the screen - the ones furthest from
  // being reached, and so the ones most worth reading.
  //
  // Observed rather than measured once, because the frame art is three <img>
  // slices: a layout-effect measurement taken before they decode comes back 42px
  // short per panel, which is exactly enough to push the last row off again.
  useLayoutEffect(() => {
    const node = frame.current;
    if (!node) return undefined;

    const measure = () => setHeight(node.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style = {
    position: "fixed",
    left: flip ? Math.max(8, anchor.left - width - 10) : left,
    top: height
      ? Math.max(8, Math.min(anchor.top, window.innerHeight - height - 8))
      : anchor.top,
    zIndex: 60,
  };

  const cap = starCap(shown);

  return (
    <div
      ref={frame}
      style={style}
      // Flipped, the item tooltip keeps the side nearest the slot it describes
      // and the set panel goes out past it.
      className={`pointer-events-none flex items-start ${flip ? "flex-row-reverse" : "flex-row"}`}
    >
      <Frame>
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

        <Divider />

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
      </Frame>

      {progress && <SetPanel progress={progress} flip={flip} />}
    </div>
  );
}

/**
 * The game's tooltip frame around whatever it is given.
 *
 * `UIToolTip.img/Equip/frame/common` is a vertical 3-slice - a 324x30 top, a
 * 324x1 middle repeated to whatever height is needed, and a 324x12 bottom - so
 * it stays crisp at any content length. The slices carry their intrinsic heights
 * so the frame occupies its full size before the images decode; the tooltip
 * measures itself to stay on screen, and a frame that starts 42px short measures
 * 42px short.
 */
function Frame({ children, style }) {
  return (
    <div style={{ width: FRAME_WIDTH, ...style }} className="shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/equip-ui/tooltip/top.png"
        alt=""
        width={FRAME_WIDTH}
        height={30}
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
        {children}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/equip-ui/tooltip/btm.png"
        alt=""
        width={FRAME_WIDTH}
        height={12}
        className="block"
      />
    </div>
  );
}

/** The frame's horizontal divider, drawn full-bleed inside the padded body. */
function Divider() {
  return (
    <div className="my-1.5 -mx-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/equip-ui/tooltip/line.png"
        alt=""
        width={FRAME_WIDTH}
        height={3}
        className="block"
      />
    </div>
  );
}

/**
 * One set effect written the way it reads: "Boss Damage +10%".
 *
 * The stat labels carry their own trailing "%", which is right in a two-column
 * table and wrong inline - "Boss Damage % +10%" - so it is dropped here.
 */
function effectPhrase(stats) {
  return Object.entries(stats)
    .filter(([key]) => isShown(key))
    .map(([key, value]) => {
      const label = (STAT_META[key]?.label ?? key).replace(/\s*%$/, "");
      return `${label} +${formatStat(key, value)}`;
    })
    .join(", ");
}

/**
 * The set panel, beside the item tooltip, as the game draws it.
 *
 * Two questions in one panel: which pieces the set is made of and which of them
 * you are wearing, then what each piece count grants. Thresholds you have
 * reached are lit and the ones above are dimmed rather than hidden - the point
 * of looking at this is usually to see what the *next* piece would be worth.
 */
function SetPanel({ progress, flip }) {
  const { name, pieces, total, listed, groups, thresholds } = progress;

  return (
    <Frame style={{ [flip ? "marginRight" : "marginLeft"]: PANEL_GAP }}>
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] font-bold text-white leading-5">
          <span
            className="mr-1.5 px-1 py-px rounded text-[9px] font-bold align-[2px]"
            style={{ background: "rgba(255, 255, 255, 0.18)" }}
          >
            SET
          </span>
          {name}
        </p>
        <span
          className="shrink-0 text-[11px] tabular-nums"
          style={{ color: pieces > 0 ? "#ffd75e" : "rgba(255,255,255,0.4)" }}
        >
          {pieces} / {total}
        </span>
      </div>

      <Divider />

      <ul className="space-y-[1px]">
        {groups.map((group) => (
          <li key={group.key} className="flex gap-2 text-[11px] leading-4">
            <span
              className="w-[74px] shrink-0"
              style={{
                color: group.equipped ? "#8ec9ff" : "rgba(255,255,255,0.3)",
              }}
            >
              {group.label}
            </span>
            <span
              className="min-w-0 flex-1 truncate"
              style={{
                color: group.equipped ? "#ffffff" : "rgba(255,255,255,0.35)",
              }}
              title={group.options.join(", ")}
            >
              {group.equipped ?? describeOptions(group.options)}
            </span>
          </li>
        ))}
        {listed < total && (
          // A totem or a Use item: real pieces of the set that are not equipment
          // and so are not in the dataset this is built from.
          <li
            className="text-[11px] leading-4"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            +{total - listed} more not in the equipment data
          </li>
        )}
      </ul>

      <Divider />

      <ul className="space-y-[3px] pb-0.5">
        {thresholds.map(({ at, stats, active }) => {
          const phrase = effectPhrase(stats);
          return (
            <li key={at} className="flex gap-2 text-[11px] leading-4">
              <span
                className="w-[52px] shrink-0 tabular-nums"
                style={{ color: active ? "#ffd75e" : "rgba(255,255,255,0.3)" }}
              >
                {at}-set
              </span>
              <span
                className="min-w-0 flex-1"
                style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.35)" }}
              >
                {phrase || "defensive stats only"}
              </span>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

/**
 * What to call a slot you have not filled yet.
 *
 * Several sets offer alternatives for one slot - five branch emblems, four
 * coloured pocket items - and naming all of them costs more room than the panel
 * has. The first plus a count says "one of these" without pretending there is
 * only one; the full list is on the row's title.
 */
function describeOptions(names) {
  if (!names.length) return "-";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1} more`;
}
