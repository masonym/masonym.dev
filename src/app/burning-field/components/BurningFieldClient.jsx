"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Flame, Loader2, MapPin, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  buildBoard,
  compareByValue,
  formatAge,
} from "@/lib/burning/projection";
import { useAuth } from "./AuthProvider";
import { LoginForm } from "./LoginForm";
import GroupPicker from "./GroupPicker";
import GroupPanel from "./GroupPanel";
import ChannelBoard from "./ChannelBoard";
import RulesPanel from "./RulesPanel";
import { bonusPercent } from "./burningUi";

/** How far back we pull logs. Older readings are useless for projection anyway. */
const LOG_WINDOW_HOURS = 48;

/**
 * Two occupancy rows describe the same character: same member, or - for people
 * outside the group, who have no id - the same name. Used to drop the stale row
 * when somebody is moved, without waiting for the realtime delete.
 */
const sameOccupant = (a, b) =>
  a.user_id && b.user_id
    ? a.user_id === b.user_id
    : !a.user_id &&
      !b.user_id &&
      a.label?.toLowerCase() === b.label?.toLowerCase();
const TICK_MS = 15 * 1000;

export default function BurningFieldClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groupIdFromUrl = searchParams.get("group");

  const [myGroups, setMyGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [occupants, setOccupants] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");

  const activeGroup = useMemo(
    () => myGroups.find((group) => group.id === groupIdFromUrl) || null,
    [myGroups, groupIdFromUrl],
  );
  const myMembership = useMemo(
    () => members.find((member) => member.user_id === user?.id) || null,
    [members, user],
  );
  const canLog = myMembership ? myMembership.role !== "viewer" : false;

  // Re-project the board on a timer so countdowns and levels stay honest.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const selectGroup = useCallback(
    (groupId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (groupId) params.set("group", groupId);
      else params.delete("group");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const loadMyGroups = useCallback(async () => {
    if (!user) {
      setMyGroups([]);
      setLoadingGroups(false);
      return;
    }
    setLoadingGroups(true);
    const { data, error: loadError } = await supabase
      .from("burning_group_members")
      .select("role, ign, group:burning_groups(*)")
      .eq("user_id", user.id);
    setLoadingGroups(false);
    if (loadError) {
      setError(loadError.message);
      return;
    }
    const groups = (data || [])
      .filter((row) => row.group)
      .map((row) => ({ ...row.group, role: row.role, myIgn: row.ign }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setMyGroups(groups);
  }, [user]);

  useEffect(() => {
    loadMyGroups();
  }, [loadMyGroups]);

  const loadGroupData = useCallback(async (groupId) => {
    if (!groupId) {
      setMembers([]);
      setLogs([]);
      setOccupants([]);
      return;
    }
    setLoadingLogs(true);
    const since = new Date(
      Date.now() - LOG_WINDOW_HOURS * 60 * 60 * 1000,
    ).toISOString();
    const [memberResult, logResult, occupantResult] = await Promise.all([
      supabase
        .from("burning_group_members")
        .select("user_id, role, ign, joined_at")
        .eq("group_id", groupId)
        .order("joined_at"),
      supabase
        .from("burning_logs")
        .select("*")
        .eq("group_id", groupId)
        .gte("observed_at", since)
        .order("observed_at", { ascending: false })
        .limit(2000),
      supabase
        .from("burning_occupants")
        .select("*")
        .eq("group_id", groupId)
        .order("placed_at"),
    ]);
    setLoadingLogs(false);
    const loadFailure =
      memberResult.error || logResult.error || occupantResult.error;
    if (loadFailure) {
      setError(loadFailure.message);
      return;
    }
    setMembers(memberResult.data || []);
    setLogs(logResult.data || []);
    setOccupants(occupantResult.data || []);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    loadGroupData(groupIdFromUrl);
  }, [groupIdFromUrl, loadGroupData]);

  // Live updates so a scouting party sees each other's readings appear.
  useEffect(() => {
    if (!groupIdFromUrl) return;
    const channel = supabase
      .channel(`burning-logs-${groupIdFromUrl}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "burning_logs",
          filter: `group_id=eq.${groupIdFromUrl}`,
        },
        (payload) => {
          setLogs((prev) =>
            prev.some((log) => log.id === payload.new.id)
              ? prev
              : [payload.new, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "burning_logs",
          filter: `group_id=eq.${groupIdFromUrl}`,
        },
        (payload) =>
          setLogs((prev) => prev.filter((log) => log.id !== payload.old.id)),
      )
      // Occupancy moves far more often than a reading does, so all three events
      // matter. `burning_occupants` publishes full rows (replica identity full),
      // which is what lets the group_id filter match a DELETE at all.
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "burning_occupants",
          filter: `group_id=eq.${groupIdFromUrl}`,
        },
        (payload) => {
          setOccupants((prev) => {
            const withoutOld = prev.filter(
              (row) => row.id !== payload.old?.id && row.id !== payload.new?.id,
            );
            if (payload.eventType === "DELETE") return withoutOld;
            return [...withoutOld, payload.new];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupIdFromUrl]);

  const board = useMemo(
    () =>
      activeGroup
        ? buildBoard(logs, activeGroup.channel_count, now, occupants)
        : [],
    [logs, activeGroup, now, occupants],
  );

  const bestFree = useMemo(() => {
    const free = board.filter(
      (entry) => entry.projection && entry.projection.status === "free",
    );
    if (free.length === 0) return null;
    return [...free].sort(compareByValue)[0];
  }, [board]);

  const unscoutedCount = board.filter((entry) => !entry.projection).length;

  const handleLog = useCallback(
    async ({ channel, level, status, note }) => {
      if (!activeGroup || !user) return false;
      setError("");
      const { data, error: insertError } = await supabase
        .from("burning_logs")
        .insert({
          group_id: activeGroup.id,
          channel,
          level,
          status,
          note,
          user_id: user.id,
          ign: myMembership?.ign || null,
          observed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return false;
      }
      setLogs((prev) =>
        prev.some((log) => log.id === data.id) ? prev : [data, ...prev],
      );
      setNow(Date.now());
      return true;
    },
    [activeGroup, user, myMembership],
  );

  const handleDeleteLog = useCallback(async (logId) => {
    const { error: deleteError } = await supabase
      .from("burning_logs")
      .delete()
      .eq("id", logId);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setLogs((prev) => prev.filter((log) => log.id !== logId));
    return true;
  }, []);

  /**
   * Retract every reading on a channel that we are allowed to delete, so a
   * fat-fingered level can go back to unscouted instead of standing as fact.
   * RLS only lets us remove our own logs (or anyone's, if we own the group),
   * so `.select()` tells us what actually went.
   */
  const handleClearChannel = useCallback(
    async (channel) => {
      if (!activeGroup) return null;
      const { data, error: deleteError } = await supabase
        .from("burning_logs")
        .delete()
        .eq("group_id", activeGroup.id)
        .eq("channel", channel)
        .select("id");
      if (deleteError) {
        setError(deleteError.message);
        return null;
      }
      const removed = new Set((data || []).map((row) => row.id));
      setLogs((prev) => prev.filter((log) => !removed.has(log.id)));
      return removed.size;
    },
    [activeGroup],
  );

  /**
   * Put somebody in a channel. The RPC does the moving - it drops whatever row
   * they had elsewhere first - so "one person, one place" holds even when two
   * people are dragging the same marker about at once.
   */
  const handleSetOccupant = useCallback(
    async ({ channel, userId: memberId = null, label = null }) => {
      if (!activeGroup) return null;
      setError("");
      const { data, error: rpcError } = await supabase.rpc(
        "burning_set_occupant",
        {
          p_group_id: activeGroup.id,
          p_channel: channel,
          p_user_id: memberId,
          p_label: label,
        },
      );
      if (rpcError) {
        setError(rpcError.message);
        return null;
      }
      setOccupants((prev) => [
        ...prev.filter((row) => row.id !== data.id && !sameOccupant(row, data)),
        data,
      ]);
      return data;
    },
    [activeGroup],
  );

  const handleRemoveOccupant = useCallback(async (occupantId) => {
    const { error: deleteError } = await supabase
      .from("burning_occupants")
      .delete()
      .eq("id", occupantId);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setOccupants((prev) => prev.filter((row) => row.id !== occupantId));
    return true;
  }, []);

  const handleClearOccupants = useCallback(
    async (channel) => {
      if (!activeGroup) return null;
      const { data, error: deleteError } = await supabase
        .from("burning_occupants")
        .delete()
        .eq("group_id", activeGroup.id)
        .eq("channel", channel)
        .select("id");
      if (deleteError) {
        setError(deleteError.message);
        return null;
      }
      const removed = new Set((data || []).map((row) => row.id));
      setOccupants((prev) => prev.filter((row) => !removed.has(row.id)));
      return removed.size;
    },
    [activeGroup],
  );

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary-dim" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl text-primary-bright flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" />
            Burning Field Tracker
          </h1>
          <p className="text-primary-dim text-sm mt-1 max-w-2xl">
            Log the burning level you see on each channel; the board projects
            every channel forward from its last reading so you know where to hop
            next.
          </p>
        </div>
        <LoginForm />
      </header>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded p-2">
          {error}
        </p>
      )}

      <RulesPanel />

      {!user ? (
        <p className="text-primary-dim">
          Sign in above to create a tracking group or join one you were invited
          to.
        </p>
      ) : !activeGroup ? (
        <GroupPicker
          myGroups={myGroups}
          loading={loadingGroups}
          onSelect={selectGroup}
          onChanged={loadMyGroups}
          defaultIgn={myGroups[0]?.myIgn || ""}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => selectGroup(null)}
                className="flex items-center gap-1 text-sm text-primary-dim hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" /> Groups
              </button>
              <div>
                <h2 className="text-primary-bright text-lg leading-tight">
                  {activeGroup.name}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-primary-dim">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeGroup.map_name} · {activeGroup.world} ·{" "}
                  {activeGroup.channel_count} channels
                </p>
              </div>
            </div>
            <button
              onClick={() => loadGroupData(activeGroup.id)}
              className="flex items-center gap-1 text-sm text-primary-dim hover:text-primary"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingLogs ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm bg-background-bright border border-primary-dim rounded-lg p-3">
            {bestFree ? (
              <span className="text-primary">
                Best free channel:{" "}
                <strong className="text-secondary">
                  Ch {bestFree.channel}
                </strong>{" "}
                at level{" "}
                <strong className="text-secondary">
                  {bestFree.projection.level}
                </strong>{" "}
                (+{bonusPercent(bestFree.projection.level)}% EXP), read{" "}
                {formatAge(bestFree.projection.ageMs)}
              </span>
            ) : (
              <span className="text-primary-dim">
                No channel readings yet - start scouting.
              </span>
            )}
            {unscoutedCount > 0 && (
              <span className="text-primary-dim">
                {unscoutedCount} channel(s) never scouted
              </span>
            )}
          </div>

          <ChannelBoard
            group={activeGroup}
            board={board}
            logs={logs}
            occupants={occupants}
            members={members}
            now={now}
            canLog={canLog}
            onLog={handleLog}
            onDeleteLog={handleDeleteLog}
            onClearChannel={handleClearChannel}
            onSetOccupant={handleSetOccupant}
            onRemoveOccupant={handleRemoveOccupant}
            onClearOccupants={handleClearOccupants}
            userId={user.id}
          />

          <GroupPanel
            group={activeGroup}
            members={members}
            occupants={occupants}
            myMembership={myMembership}
            myGroups={myGroups}
            userId={user.id}
            onChanged={async () => {
              await loadMyGroups();
              await loadGroupData(activeGroup.id);
            }}
            onLeave={() => selectGroup(null)}
          />
        </div>
      )}
    </div>
  );
}
