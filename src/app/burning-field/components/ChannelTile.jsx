"use client";

import { Flame, Lock, Moon, Tent } from "lucide-react";
import {
  MAP_CAPACITY,
  formatAge,
  formatCountdown,
  isFull,
  msUntilNextLevel,
} from "@/lib/burning/projection";
import {
  BOUND_GLYPH,
  CONFIDENCE_META,
  STATUS_META,
  levelColor,
  levelTextColor,
} from "./burningUi";

/** Status icons live in the top-right; the curfew moon lives in the bottom-right. */
const STATUS_ICON = {
  ours: { Icon: Flame, className: "text-orange-300" },
  taken: { Icon: Lock, className: "text-red-300" },
  camped: { Icon: Tent, className: "text-red-200" },
};

/**
 * A tile states what was last *logged*, not what we guess is true now.
 *
 * The projection is a chain of assumptions - that nobody wandered in, that the
 * stranger we saw left after half an hour - and in practice it is wrong more
 * often than it is right. So the big number is the reading somebody actually
 * took, coloured by that reading, and the guess sits under it in small type as
 * "may be N". Where the two disagree the tile shows both rather than picking.
 */
export default function ChannelTile({ entry, now, selected, onSelect }) {
  const { channel, projection, log, occupants = [] } = entry;
  const full = isFull(entry);

  const stale = projection?.confidence === "low";
  // Colour follows the reading, not the guess: a tile that looks green should
  // mean somebody saw it green.
  const background = projection
    ? levelColor(projection.observedLevel, { stale })
    : "var(--background-bright)";

  const nextLevelMs = projection ? msUntilNextLevel(projection, now) : null;
  const confidence = projection ? CONFIDENCE_META[projection.confidence] : null;
  const statusIcon = projection ? STATUS_ICON[projection.status] : null;
  const boundGlyph = projection ? BOUND_GLYPH[projection.bound] : null;
  const drifted = projection && projection.level !== projection.observedLevel;

  const titleParts = projection
    ? [
        `Ch ${channel} - logged at level ${projection.observedLevel} (${STATUS_META[projection.status]?.label ?? projection.status}) ${formatAge(projection.ageMs)}`,
        log?.ign ? `by ${log.ign}` : null,
        `if nothing has changed since, it may be level ${projection.level} now`,
        projection.curfew
          ? "burning curfew - cannot climb until 08:00 UTC"
          : null,
      ].filter(Boolean)
    : [`Ch ${channel} - never scouted`];

  if (occupants.length > 0) {
    titleParts.push(
      `${occupants.length}/${MAP_CAPACITY}${full ? " (full)" : ""}: ${occupants.map((o) => o.label).join(", ")}`,
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      title={titleParts.join(" · ")}
      className={`relative flex flex-col items-center justify-center rounded-md px-1 py-2 border transition overflow-hidden
        ${selected ? "border-secondary ring-2 ring-secondary" : full ? "border-white/80" : "border-black/30 hover:border-primary"}
        ${stale ? "border-dashed" : ""}`}
      style={{
        background,
        color: projection
          ? levelTextColor(projection.observedLevel, { stale })
          : "var(--primary-dim)",
      }}
    >
      {/*
        Redundant, non-colour encoding of the level: a bar up the left edge that
        fills level/10 of the tile height. The ramp is red -> green, which is
        exactly the pair red/green colour blindness collapses.

        Solid = what was logged. The ghost behind it is where the projection
        thinks the level has drifted to, so the gap between the two is the size
        of the guess.
      */}
      {projection && (
        <>
          <span
            aria-hidden
            className="absolute left-0 bottom-0 w-1 bg-white/25"
            style={{ height: `${(projection.level / 10) * 100}%` }}
          />
          <span
            aria-hidden
            className="absolute left-0 bottom-0 w-1 bg-white/70"
            style={{ height: `${(projection.observedLevel / 10) * 100}%` }}
          />
        </>
      )}

      <span className="absolute top-0.5 left-1.5 text-[10px] opacity-80">
        {channel}
      </span>

      {statusIcon && (
        <statusIcon.Icon
          className={`absolute top-0.5 right-1 w-3 h-3 ${statusIcon.className}`}
        />
      )}
      {projection?.curfew && (
        <Moon className="absolute bottom-1 right-1 w-3 h-3 text-sky-200" />
      )}

      <span className="text-xl leading-none font-bold mt-2">
        {projection ? projection.observedLevel : "?"}
      </span>

      <span className="text-[10px] leading-tight opacity-80">
        {projection ? formatAge(projection.ageMs) : "no data"}
      </span>

      {/*
        Occupancy as one pip per slot in the map, so "how full is it" reads at a
        glance without a number. Light pip = somebody in our group, dark pip = a
        stranger; luminance rather than hue, since the tile behind them is
        already using the whole red-green ramp.
      */}
      {occupants.length > 0 && (
        <span aria-hidden className="absolute bottom-1 left-2 flex gap-0.5">
          {Array.from({ length: MAP_CAPACITY }, (_, slot) => {
            const occupant = occupants[slot];
            const className = !occupant
              ? "bg-white/20 ring-1 ring-black/30"
              : occupant.user_id
                ? "bg-white"
                : "bg-black/70";
            return (
              <span
                key={slot}
                className={`w-1.5 h-1.5 rounded-full ${className}`}
              />
            );
          })}
        </span>
      )}

      {/*
        The guess, in the smallest type on the tile: where the maths thinks the
        level has drifted to, or - when it hasn't drifted yet - how long until
        it does. Never where the eye lands first.
      */}
      {projection && (
        <span className={`text-[9px] leading-tight ${confidence.className}`}>
          {drifted ? (
            <>
              may be {boundGlyph}
              {projection.level}
            </>
          ) : nextLevelMs != null ? (
            `+1 in ${formatCountdown(nextLevelMs)}`
          ) : (
            confidence.label
          )}
        </span>
      )}

      {projection && projection.growing && (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-0.5 bg-white/70"
          style={{ width: `${Math.round(projection.progress * 100)}%` }}
        />
      )}
    </button>
  );
}

export function ChannelTileLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-dim">
      <span className="flex items-center gap-1">
        <Flame className="w-3 h-3 text-orange-300" /> our party is hunting
      </span>
      <span className="flex items-center gap-1">
        <Lock className="w-3 h-3 text-red-300" /> someone else there
      </span>
      <span className="flex items-center gap-1">
        <Tent className="w-3 h-3 text-red-200" /> camped long-term
      </span>
      <span className="flex items-center gap-1">
        <Moon className="w-3 h-3 text-sky-300" /> burning curfew (00:00–08:00
        UTC)
      </span>
      <span className="flex items-center gap-1">
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white ring-1 ring-black/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/70 ring-1 ring-white/30" />
        </span>
        pips = who is in the map (light = your group, dark = a stranger);{" "}
        {MAP_CAPACITY} pips + white border = full
      </span>
      <span>big number + colour = the level somebody last logged</span>
      <span>
        &ldquo;may be N&rdquo; = the projection&apos;s guess for now, a guess
        and nothing more
      </span>
      <span>bar up the left edge = logged level, ghost bar = the guess</span>
      <span>dashed + washed-out tile = nobody has looked in a long time</span>
    </div>
  );
}
