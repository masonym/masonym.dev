'use client';

import { Flame, Lock, Snowflake, User } from 'lucide-react';
import { formatAge, formatCountdown, msUntilNextLevel } from '@/lib/burning/projection';
import { CONFIDENCE_META, levelColor, levelTextColor } from './burningUi';

export default function ChannelTile({ entry, now, selected, onSelect }) {
  const { channel, projection, log } = entry;

  const background = projection
    ? levelColor(projection.level, projection.confidence === 'low' ? 0.4 : 1)
    : 'var(--background-bright)';

  const nextLevelMs = projection ? msUntilNextLevel(projection, now) : null;
  const confidence = projection ? CONFIDENCE_META[projection.confidence] : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      title={
        projection
          ? `Ch ${channel} — logged at level ${projection.observedLevel} ${formatAge(projection.ageMs)}${log?.ign ? ` by ${log.ign}` : ''}`
          : `Ch ${channel} — never scouted`
      }
      className={`relative flex flex-col items-center justify-center rounded-md px-1 py-2 border transition
        ${selected ? 'border-secondary ring-2 ring-secondary' : 'border-black/30 hover:border-primary'}`}
      style={{ background, color: projection ? levelTextColor(projection.level) : 'var(--primary-dim)' }}
    >
      <span className="absolute top-0.5 left-1 text-[10px] opacity-80">{channel}</span>

      {projection?.status === 'ours' && (
        <Flame className="absolute top-0.5 right-1 w-3 h-3 text-orange-300" />
      )}
      {projection?.status === 'taken' && (
        <Lock className="absolute top-0.5 right-1 w-3 h-3 text-red-300" />
      )}
      {projection?.frozen && (
        <Snowflake className="absolute top-0.5 right-1 w-3 h-3 text-sky-200" />
      )}

      <span className="text-xl leading-none font-bold mt-2">
        {projection ? (
          <>
            {projection.bound === 'atLeast' && <span className="text-xs align-top opacity-70">≥</span>}
            {projection.bound === 'atMost' && <span className="text-xs align-top opacity-70">≤</span>}
            {projection.level}
          </>
        ) : '?'}
      </span>

      <span className="text-[10px] leading-tight opacity-80">
        {projection ? formatAge(projection.ageMs) : 'no data'}
      </span>

      {projection && (
        <span className={`text-[9px] leading-tight ${confidence.className}`}>
          {nextLevelMs != null ? `+1 in ${formatCountdown(nextLevelMs)}` : confidence.label}
        </span>
      )}

      {projection && projection.level < 10 && projection.status === 'free' && (
        <span
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
      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-300" /> our party is hunting</span>
      <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-red-300" /> someone else there</span>
      <span className="flex items-center gap-1"><Snowflake className="w-3 h-3 text-sky-300" /> frozen (00:00–08:00 UTC)</span>
      <span className="flex items-center gap-1"><User className="w-3 h-3" /> faded tile = stale reading</span>
      <span>≥ / ≤ = projection is a bound, not a reading</span>
    </div>
  );
}
