"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownWideNarrow,
  Check,
  Eraser,
  Hash,
  History,
  Keyboard,
  Loader2,
  Moon,
  Pause,
  Trash2,
  Undo2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  MAP_CAPACITY,
  compareByValue,
  formatAge,
  formatCountdown,
  isCurfew,
  isFull,
  msUntilCurfewEnd,
} from "@/lib/burning/projection";
import ChannelTile, { ChannelTileLegend } from "./ChannelTile";
import {
  STATUS_KEYS,
  STATUS_META,
  bonusPercent,
  levelColor,
  levelTextColor,
  nextStrangerLabel,
  parseQuickEntry,
} from "./burningUi";

const SORTS = {
  channel: { label: "Channel", icon: Hash },
  level: { label: "Best burning", icon: ArrowDownWideNarrow },
};

/** How long the "logged Ch 12" confirmation stays up. */
const FLASH_MS = 4000;

export default function ChannelBoard({
  group,
  board,
  logs,
  occupants,
  members,
  now,
  canLog,
  onLog,
  onDeleteLog,
  onClearChannel,
  onSetOccupant,
  onClearOccupants,
  onRemoveOccupant,
  userId,
}) {
  const [sort, setSort] = useState("channel");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [status, setStatus] = useState("free");
  const [note, setNote] = useState("");
  const [quick, setQuick] = useState("");
  const [strangerName, setStrangerName] = useState("");
  const [quickError, setQuickError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [flash, setFlash] = useState(null);
  // Channel order held still while the pointer is over the grid, so tiles don't
  // move out from under a click when a level ticks over mid-hover.
  const [heldOrder, setHeldOrder] = useState(null);
  const quickRef = useRef(null);
  const flashTimer = useRef(null);

  const sortedBoard = useMemo(() => {
    const copy = [...board];
    if (sort === "level") copy.sort(compareByValue);
    return copy;
  }, [board, sort]);

  // Apply the held order (if any) to the freshly projected entries, so the
  // numbers stay live even while the arrangement is pinned.
  const displayedBoard = useMemo(() => {
    if (!heldOrder) return sortedBoard;
    const byChannel = new Map(
      sortedBoard.map((entry) => [entry.channel, entry]),
    );
    const held = heldOrder
      .map((channel) => byChannel.get(channel))
      .filter(Boolean);
    // Anything that appeared since the snapshot goes on the end rather than vanishing.
    const seen = new Set(heldOrder);
    return [
      ...held,
      ...sortedBoard.filter((entry) => !seen.has(entry.channel)),
    ];
  }, [sortedBoard, heldOrder]);

  const holdOrder = useCallback(() => {
    if (sort !== "level") return;
    setHeldOrder((prev) => prev || sortedBoard.map((entry) => entry.channel));
  }, [sort, sortedBoard]);

  const releaseOrder = useCallback(() => setHeldOrder(null), []);

  // Switching sorts should never leave a stale pin behind.
  useEffect(() => {
    setHeldOrder(null);
  }, [sort]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const showFlash = useCallback((message) => {
    setFlash(message);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS);
  }, []);

  const selectedEntry = selectedChannel
    ? board.find((entry) => entry.channel === selectedChannel)
    : null;

  const channelHistory = useMemo(() => {
    if (!selectedChannel) return [];
    return logs.filter((log) => log.channel === selectedChannel).slice(0, 25);
  }, [logs, selectedChannel]);

  const myLatestForChannel = useMemo(
    () =>
      channelHistory.find(
        (log) => log.user_id === userId || group.owner_id === userId,
      ) || null,
    [channelHistory, userId, group.owner_id],
  );

  // "/" focuses the quick-entry bar from anywhere on the board.
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "/") {
        e.preventDefault();
        quickRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const submitLog = async (channel, level, logStatus, logNote) => {
    setSaving(true);
    try {
      const ok = await onLog({
        channel,
        level,
        status: logStatus,
        note: logNote || null,
      });
      if (ok) {
        showFlash(
          `Logged Ch ${channel} - level ${level}, ${STATUS_META[logStatus].label.toLowerCase()}`,
        );
      }
      return ok;
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseQuickEntry(quick, group.channel_count);
    if (!parsed) {
      setQuickError(
        `Use "channel level", e.g. "12 7" (or "12 7 ours" / "12 0 taken" / "12 0 camped")`,
      );
      return;
    }
    setQuickError("");
    setQuick("");
    await submitLog(parsed.channel, parsed.level, parsed.status, null);
  };

  const handleClearChannel = async () => {
    if (!selectedEntry) return;
    if (
      !confirm(
        `Discard your readings for channel ${selectedEntry.channel}? It goes back to unscouted unless somebody else has logged it.`,
      )
    )
      return;
    setSaving(true);
    try {
      const removed = await onClearChannel(selectedEntry.channel);
      if (removed != null) {
        showFlash(
          removed === 0
            ? `Nothing to clear on Ch ${selectedEntry.channel} - those readings are somebody else's`
            : `Cleared ${removed} reading${removed === 1 ? "" : "s"} from Ch ${selectedEntry.channel}`,
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUndoLast = async () => {
    if (!myLatestForChannel) return;
    setSaving(true);
    try {
      await onDeleteLog(myLatestForChannel.id);
      showFlash(`Removed the last reading on Ch ${myLatestForChannel.channel}`);
    } finally {
      setSaving(false);
    }
  };

  const curfew = isCurfew(now);

  const selectedOccupants = selectedEntry?.occupants || [];
  const selectedFull = selectedEntry ? isFull(selectedEntry) : false;

  /** Where each member is standing right now, so a button can say "move them". */
  const occupantByMember = useMemo(
    () =>
      new Map(occupants.filter((o) => o.user_id).map((o) => [o.user_id, o])),
    [occupants],
  );

  // Members already in this map are listed above; the rest are things you can
  // click to place, whether they are unplaced or standing somewhere else.
  const placeableMembers = useMemo(() => {
    const here = new Set(selectedOccupants.map((o) => o.user_id));
    return members.filter((member) => !here.has(member.user_id));
  }, [members, selectedOccupants]);

  const placeOccupant = async (channel, { memberId = null, label = null }) => {
    setSaving(true);
    try {
      const placed = await onSetOccupant({ channel, userId: memberId, label });
      if (placed) showFlash(`${placed.label} is on Ch ${channel}`);
      return placed;
    } finally {
      setSaving(false);
    }
  };

  const handleAddStranger = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return;
    const label = strangerName.trim() || nextStrangerLabel(occupants);
    const placed = await placeOccupant(selectedEntry.channel, { label });
    if (placed) setStrangerName("");
  };

  const handleRemoveOccupant = async (occupant) => {
    setSaving(true);
    try {
      const ok = await onRemoveOccupant(occupant.id);
      if (ok) showFlash(`${occupant.label} left Ch ${occupant.channel}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEmptyChannel = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    try {
      const removed = await onClearOccupants(selectedEntry.channel);
      if (removed != null)
        showFlash(`Cleared everyone off Ch ${selectedEntry.channel}`);
    } finally {
      setSaving(false);
    }
  };

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
                  ${
                    sort === key
                      ? "bg-secondary text-background border-secondary font-bold"
                      : "bg-background-bright text-primary-dim border-primary-dim hover:text-primary"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" /> {meta.label}
              </button>
            );
          })}
          {heldOrder && (
            <span className="flex items-center gap-1 text-xs text-primary-dim">
              <Pause className="w-3 h-3" /> order held while you hover
            </span>
          )}
        </div>

        {curfew && (
          <span className="flex items-center gap-1.5 text-sm text-sky-300">
            <Moon className="w-4 h-4" />
            Burning curfew - levels can only drop for another{" "}
            {formatCountdown(msUntilCurfewEnd(now))}
          </span>
        )}
      </div>

      {canLog && (
        <form
          onSubmit={handleQuickSubmit}
          className="flex flex-wrap items-center gap-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Keyboard className="w-4 h-4 text-primary-dim shrink-0" />
            <input
              ref={quickRef}
              value={quick}
              onChange={(e) => {
                setQuick(e.target.value);
                setQuickError("");
              }}
              placeholder={`Quick log - "12 7", "12 7 ours", "12 0 taken", "12 0 camped"   (press / to focus)`}
              className="flex-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !quick.trim()}
            className="px-4 py-2 rounded bg-secondary text-background font-bold text-sm disabled:opacity-50 hover:brightness-110 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log"}
          </button>
          {quickError && (
            <p className="w-full text-red-400 text-xs">{quickError}</p>
          )}
        </form>
      )}

      {/*
        aria-live so the confirmation is announced even though the tile that
        changed may be scrolled off the board or sorted somewhere else.
      */}
      <p
        aria-live="polite"
        className={`flex items-center gap-1.5 text-sm text-green-400 transition-opacity ${flash ? "opacity-100" : "opacity-0"}`}
      >
        {flash && (
          <>
            <Check className="w-4 h-4 shrink-0" />
            {flash}
          </>
        )}
      </p>

      <div
        className="grid gap-1.5 grid-cols-5 max-w-lg"
        onPointerEnter={holdOrder}
        onPointerLeave={releaseOrder}
      >
        {displayedBoard.map((entry) => (
          <ChannelTile
            key={entry.channel}
            entry={entry}
            now={now}
            selected={entry.channel === selectedChannel}
            onSelect={(channel) =>
              setSelectedChannel((prev) => (prev === channel ? null : channel))
            }
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
                  projected level {selectedEntry.projection.level} (+
                  {bonusPercent(selectedEntry.projection.level)}% EXP)
                  {" · "}last read {selectedEntry.projection.observedLevel}{" "}
                  {formatAge(selectedEntry.projection.ageMs)}
                  {selectedEntry.log?.ign ? ` by ${selectedEntry.log.ign}` : ""}
                </span>
              )}
              {!selectedEntry.projection && (
                <span className="text-primary-dim text-sm ml-3">
                  never scouted
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1 text-sm text-primary-dim hover:text-primary"
            >
              <History className="w-4 h-4" />
              {showHistory ? "Hide" : "Show"} history ({channelHistory.length})
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
                      ${
                        status === key
                          ? "bg-secondary text-background border-secondary font-bold"
                          : "bg-background text-primary-dim border-primary-dim hover:text-primary"
                      }`}
                  >
                    {STATUS_META[key].label}
                  </button>
                ))}
              </div>
              <p className="text-primary-dim text-xs -mt-1">
                {STATUS_META[status].hint}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-primary-dim text-sm w-16">Level</span>
                {Array.from({ length: 11 }, (_, level) => (
                  <button
                    key={level}
                    disabled={saving}
                    onClick={() =>
                      submitLog(selectedEntry.channel, level, status, note)
                    }
                    className="w-10 h-10 rounded border border-black/30 text-sm font-bold hover:brightness-125 disabled:opacity-50 transition"
                    style={{
                      background: levelColor(level),
                      color: levelTextColor(level),
                    }}
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
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-primary-dim text-xs flex-1 min-w-[200px]">
                  Clicking a level logs it immediately with the timestamp of
                  right now.
                </p>
                <button
                  onClick={handleUndoLast}
                  disabled={saving || !myLatestForChannel}
                  title={
                    myLatestForChannel
                      ? "Delete the most recent reading here and fall back to the one before it"
                      : "Nothing here you can remove"
                  }
                  className="flex items-center gap-1 px-2 py-1 rounded border border-primary-dim text-primary-dim text-xs hover:text-primary disabled:opacity-40"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo last reading
                </button>
                <button
                  onClick={handleClearChannel}
                  disabled={saving || channelHistory.length === 0}
                  title="I was wrong about this channel - discard my readings and treat it as unscouted"
                  className="flex items-center gap-1 px-2 py-1 rounded border border-primary-dim text-primary-dim text-xs hover:text-red-400 disabled:opacity-40"
                >
                  <Eraser className="w-3.5 h-3.5" /> Mark unscouted
                </button>
              </div>
            </div>
          ) : (
            <p className="text-primary-dim text-sm">
              You have viewer access to this group, so you can read the board
              but not log to it.
            </p>
          )}

          {/*
            Occupancy. Manual, and shown to viewers too - knowing a channel is
            4/4 is the difference between hopping to it and wasting the trip.
          */}
          <div className="border-t border-primary-dim/40 pt-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-1.5 text-sm text-primary-bright">
                <Users className="w-4 h-4" />
                In the map - {selectedOccupants.length}/{MAP_CAPACITY}
                {selectedFull && (
                  <span className="text-orange-300">· full</span>
                )}
              </h4>
              {canLog && selectedOccupants.length > 0 && (
                <button
                  onClick={handleEmptyChannel}
                  disabled={saving}
                  title="Nobody is in this map any more"
                  className="flex items-center gap-1 text-xs text-primary-dim hover:text-primary disabled:opacity-40"
                >
                  <UserMinus className="w-3.5 h-3.5" /> Empty the map
                </button>
              )}
            </div>

            {selectedOccupants.length === 0 ? (
              <p className="text-primary-dim text-sm">Nobody marked here.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {selectedOccupants.map((occupant) => (
                  <li
                    key={occupant.id}
                    className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded border border-primary-dim bg-background text-sm"
                  >
                    <span
                      className={
                        occupant.user_id
                          ? "text-primary"
                          : "text-primary-dim italic"
                      }
                    >
                      {occupant.label}
                    </span>
                    {occupant.user_id === userId && (
                      <span className="text-primary-dim text-xs">(you)</span>
                    )}
                    <span className="text-primary-dim text-xs">
                      {formatAge(now - new Date(occupant.placed_at).getTime())}
                    </span>
                    {canLog && (
                      <button
                        onClick={() => handleRemoveOccupant(occupant)}
                        disabled={saving}
                        title={`Take ${occupant.label} out of this map`}
                        className="text-primary-dim hover:text-red-400 disabled:opacity-40"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {canLog && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {placeableMembers.map((member) => {
                    const elsewhere = occupantByMember.get(member.user_id);
                    const name =
                      member.ign || `member ${member.user_id.slice(0, 8)}`;
                    return (
                      <button
                        key={member.user_id}
                        onClick={() =>
                          placeOccupant(selectedEntry.channel, {
                            memberId: member.user_id,
                          })
                        }
                        disabled={saving || selectedFull}
                        title={
                          elsewhere
                            ? `Move ${name} here from Ch ${elsewhere.channel}`
                            : `Mark ${name} in this map`
                        }
                        className="flex items-center gap-1 px-2 py-1 rounded border border-primary-dim text-primary-dim text-xs hover:text-primary disabled:opacity-40"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {name}
                        {elsewhere && (
                          <span className="opacity-70">
                            · on Ch {elsewhere.channel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <form
                  onSubmit={handleAddStranger}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    value={strangerName}
                    onChange={(e) => setStrangerName(e.target.value)}
                    maxLength={40}
                    placeholder={`Somebody not in the group - IGN, or blank for "${nextStrangerLabel(occupants)}"`}
                    className="flex-1 min-w-[220px] p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
                  />
                  <button
                    type="submit"
                    disabled={saving || selectedFull}
                    className="px-3 py-2 rounded border border-primary-dim text-primary-dim text-sm hover:text-primary disabled:opacity-40"
                  >
                    Add
                  </button>
                </form>

                <p className="text-primary-dim text-xs">
                  {selectedFull
                    ? `This map is full at ${MAP_CAPACITY}/${MAP_CAPACITY} - take somebody out before adding another.`
                    : "Marking somebody here takes them off whatever channel they were on - nobody can be in two maps at once."}
                </p>
              </div>
            )}
          </div>

          {showHistory && (
            <div className="border-t border-primary-dim/40 pt-3">
              {channelHistory.length === 0 ? (
                <p className="text-primary-dim text-sm">
                  No logs yet for this channel.
                </p>
              ) : (
                <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
                  {channelHistory.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center gap-2 text-primary-dim"
                    >
                      <span className="text-primary-bright font-bold w-8">
                        L{log.level}
                      </span>
                      <span className="w-24">
                        {STATUS_META[log.status]?.label ?? log.status}
                      </span>
                      <span className="w-28">
                        {formatAge(now - new Date(log.observed_at).getTime())}
                      </span>
                      <span className="flex-1 truncate">
                        {log.ign || "unknown"}
                        {log.note ? ` - ${log.note}` : ""}
                      </span>
                      {(log.user_id === userId ||
                        group.owner_id === userId) && (
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
