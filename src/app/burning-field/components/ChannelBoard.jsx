'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownWideNarrow, Hash, History, Keyboard, Loader2, Snowflake, Trash2 } from 'lucide-react';
import { compareByValue, formatAge, formatCountdown, isFrozen, msUntilThaw } from '@/lib/burning/projection';
import ChannelTile, { ChannelTileLegend } from './ChannelTile';
import { STATUS_KEYS, STATUS_META, bonusPercent, levelColor, levelTextColor, parseQuickEntry } from './burningUi';

const SORTS = {
  channel: { label: 'Channel', icon: Hash },
  level: { label: 'Best burning', icon: ArrowDownWideNarrow },
};

export default function ChannelBoard({
  group,
  board,
  logs,
  now,
  canLog,
  onLog,
  onDeleteLog,
  userId,
}) {
  const [sort, setSort] = useState('channel');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [status, setStatus] = useState('free');
  const [note, setNote] = useState('');
  const [quick, setQuick] = useState('');
  const [quickError, setQuickError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const quickRef = useRef(null);

  const sortedBoard = useMemo(() => {
    const copy = [...board];
    if (sort === 'level') copy.sort(compareByValue);
    return copy;
  }, [board, sort]);

  const selectedEntry = selectedChannel
    ? board.find((entry) => entry.channel === selectedChannel)
    : null;

  const channelHistory = useMemo(() => {
    if (!selectedChannel) return [];
    return logs.filter((log) => log.channel === selectedChannel).slice(0, 25);
  }, [logs, selectedChannel]);

  // "/" focuses the quick-entry bar from anywhere on the board.
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === '/') {
        e.preventDefault();
        quickRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submitLog = async (channel, level, logStatus, logNote) => {
    setSaving(true);
    try {
      await onLog({ channel, level, status: logStatus, note: logNote || null });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseQuickEntry(quick, group.channel_count);
    if (!parsed) {
      setQuickError(`Use "channel level", e.g. "12 7" (or "12 7 ours" / "12 7 taken")`);
      return;
    }
    setQuickError('');
    setQuick('');
    await submitLog(parsed.channel, parsed.level, parsed.status, null);
  };

  const frozen = isFrozen(now);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Object.entries(SORTS).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition border
                  ${sort === key
                    ? 'bg-secondary text-background border-secondary font-bold'
                    : 'bg-background-bright text-primary-dim border-primary-dim hover:text-primary'}`}
              >
                <Icon className="w-3.5 h-3.5" /> {meta.label}
              </button>
            );
          })}
        </div>

        {frozen && (
          <span className="flex items-center gap-1.5 text-sm text-sky-300">
            <Snowflake className="w-4 h-4" />
            Burning frozen — thaws in {formatCountdown(msUntilThaw(now))}
          </span>
        )}
      </div>

      {canLog && (
        <form onSubmit={handleQuickSubmit} className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Keyboard className="w-4 h-4 text-primary-dim shrink-0" />
            <input
              ref={quickRef}
              value={quick}
              onChange={(e) => { setQuick(e.target.value); setQuickError(''); }}
              placeholder={`Quick log — "12 7", "12 7 ours", "12 0 taken"   (press / to focus)`}
              className="flex-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !quick.trim()}
            className="px-4 py-2 rounded bg-secondary text-background font-bold text-sm disabled:opacity-50 hover:brightness-110 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log'}
          </button>
          {quickError && <p className="w-full text-red-400 text-xs">{quickError}</p>}
        </form>
      )}

      <div className="grid gap-1.5 grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-[repeat(auto-fill,minmax(64px,1fr))]">
        {sortedBoard.map((entry) => (
          <ChannelTile
            key={entry.channel}
            entry={entry}
            now={now}
            selected={entry.channel === selectedChannel}
            onSelect={(channel) => setSelectedChannel((prev) => (prev === channel ? null : channel))}
          />
        ))}
      </div>

      <ChannelTileLegend />

      {selectedEntry && (
        <div className="bg-background-bright border border-primary-dim rounded-lg p-4 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-primary-bright text-lg">
              Channel {selectedEntry.channel}
              {selectedEntry.projection && (
                <span className="text-primary-dim text-sm ml-3">
                  projected level {selectedEntry.projection.level} (+{bonusPercent(selectedEntry.projection.level)}% EXP)
                  {' · '}last read {selectedEntry.projection.observedLevel} {formatAge(selectedEntry.projection.ageMs)}
                  {selectedEntry.log?.ign ? ` by ${selectedEntry.log.ign}` : ''}
                </span>
              )}
              {!selectedEntry.projection && (
                <span className="text-primary-dim text-sm ml-3">never scouted</span>
              )}
            </h3>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1 text-sm text-primary-dim hover:text-primary"
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Hide' : 'Show'} history ({channelHistory.length})
            </button>
          </div>

          {canLog ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-primary-dim text-sm w-16">Status</span>
                {STATUS_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    title={STATUS_META[key].hint}
                    className={`px-3 py-1 rounded text-sm border transition
                      ${status === key
                        ? 'bg-secondary text-background border-secondary font-bold'
                        : 'bg-background text-primary-dim border-primary-dim hover:text-primary'}`}
                  >
                    {STATUS_META[key].label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-primary-dim text-sm w-16">Level</span>
                {Array.from({ length: 11 }, (_, level) => (
                  <button
                    key={level}
                    disabled={saving}
                    onClick={() => submitLog(selectedEntry.channel, level, status, note)}
                    className="w-10 h-10 rounded border border-black/30 text-sm font-bold hover:brightness-125 disabled:opacity-50 transition"
                    style={{ background: levelColor(level), color: levelTextColor(level) }}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                placeholder="Optional note (e.g. 'two randoms in map')"
                className="w-full p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
              />
              <p className="text-primary-dim text-xs">
                Clicking a level logs it immediately with the timestamp of right now.
              </p>
            </div>
          ) : (
            <p className="text-primary-dim text-sm">
              You have viewer access to this group, so you can read the board but not log to it.
            </p>
          )}

          {showHistory && (
            <div className="border-t border-primary-dim/40 pt-3">
              {channelHistory.length === 0 ? (
                <p className="text-primary-dim text-sm">No logs yet for this channel.</p>
              ) : (
                <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
                  {channelHistory.map((log) => (
                    <li key={log.id} className="flex items-center gap-2 text-primary-dim">
                      <span className="text-primary-bright font-bold w-8">L{log.level}</span>
                      <span className="w-24">{STATUS_META[log.status]?.label ?? log.status}</span>
                      <span className="w-28">{formatAge(now - new Date(log.observed_at).getTime())}</span>
                      <span className="flex-1 truncate">
                        {log.ign || 'unknown'}{log.note ? ` — ${log.note}` : ''}
                      </span>
                      {(log.user_id === userId || group.owner_id === userId) && (
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          title="Delete this log"
                          className="text-primary-dim hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
