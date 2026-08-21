'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Flame, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildBoard, compareByValue, formatAge } from '@/lib/burning/projection';
import { useAuth } from './AuthProvider';
import { LoginForm } from './LoginForm';
import GroupPicker from './GroupPicker';
import GroupPanel from './GroupPanel';
import ChannelBoard from './ChannelBoard';
import { bonusPercent } from './burningUi';

/** How far back we pull logs. Older readings are useless for projection anyway. */
const LOG_WINDOW_HOURS = 48;
const TICK_MS = 15 * 1000;

export default function BurningFieldClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groupIdFromUrl = searchParams.get('group');

  const [myGroups, setMyGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');

  const activeGroup = useMemo(
    () => myGroups.find((group) => group.id === groupIdFromUrl) || null,
    [myGroups, groupIdFromUrl],
  );
  const myMembership = useMemo(
    () => members.find((member) => member.user_id === user?.id) || null,
    [members, user],
  );
  const canLog = myMembership ? myMembership.role !== 'viewer' : false;

  // Re-project the board on a timer so countdowns and levels stay honest.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const selectGroup = useCallback((groupId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (groupId) params.set('group', groupId);
    else params.delete('group');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const loadMyGroups = useCallback(async () => {
    if (!user) {
      setMyGroups([]);
      setLoadingGroups(false);
      return;
    }
    setLoadingGroups(true);
    const { data, error: loadError } = await supabase
      .from('burning_group_members')
      .select('role, ign, group:burning_groups(*)')
      .eq('user_id', user.id);
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

  useEffect(() => { loadMyGroups(); }, [loadMyGroups]);

  const loadGroupData = useCallback(async (groupId) => {
    if (!groupId) {
      setMembers([]);
      setLogs([]);
      return;
    }
    setLoadingLogs(true);
    const since = new Date(Date.now() - LOG_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const [memberResult, logResult] = await Promise.all([
      supabase
        .from('burning_group_members')
        .select('user_id, role, ign, joined_at')
        .eq('group_id', groupId)
        .order('joined_at'),
      supabase
        .from('burning_logs')
        .select('*')
        .eq('group_id', groupId)
        .gte('observed_at', since)
        .order('observed_at', { ascending: false })
        .limit(2000),
    ]);
    setLoadingLogs(false);
    if (memberResult.error || logResult.error) {
      setError((memberResult.error || logResult.error).message);
      return;
    }
    setMembers(memberResult.data || []);
    setLogs(logResult.data || []);
    setNow(Date.now());
  }, []);

  useEffect(() => { loadGroupData(groupIdFromUrl); }, [groupIdFromUrl, loadGroupData]);

  // Live updates so a scouting party sees each other's readings appear.
  useEffect(() => {
    if (!groupIdFromUrl) return;
    const channel = supabase
      .channel(`burning-logs-${groupIdFromUrl}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'burning_logs', filter: `group_id=eq.${groupIdFromUrl}` },
        (payload) => {
          setLogs((prev) => (
            prev.some((log) => log.id === payload.new.id) ? prev : [payload.new, ...prev]
          ));
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'burning_logs', filter: `group_id=eq.${groupIdFromUrl}` },
        (payload) => setLogs((prev) => prev.filter((log) => log.id !== payload.old.id)),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupIdFromUrl]);

  const board = useMemo(
    () => (activeGroup ? buildBoard(logs, activeGroup.channel_count, now) : []),
    [logs, activeGroup, now],
  );

  const bestFree = useMemo(() => {
    const free = board.filter((entry) => entry.projection && entry.projection.status === 'free');
    if (free.length === 0) return null;
    return [...free].sort(compareByValue)[0];
  }, [board]);

  const unscoutedCount = board.filter((entry) => !entry.projection).length;

  const handleLog = useCallback(async ({ channel, level, status, note }) => {
    if (!activeGroup || !user) return;
    setError('');
    const { data, error: insertError } = await supabase
      .from('burning_logs')
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
      return;
    }
    setLogs((prev) => (prev.some((log) => log.id === data.id) ? prev : [data, ...prev]));
    setNow(Date.now());
  }, [activeGroup, user, myMembership]);

  const handleDeleteLog = useCallback(async (logId) => {
    const { error: deleteError } = await supabase.from('burning_logs').delete().eq('id', logId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setLogs((prev) => prev.filter((log) => log.id !== logId));
  }, []);

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
            Burning climbs one level an hour per channel while a map sits empty (frozen
            00:00–08:00 UTC) and drains a level every 15 minutes while someone hunts there.
            Log what you see, and the board projects every channel forward from the last reading.
          </p>
        </div>
        <LoginForm />
      </header>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded p-2">{error}</p>
      )}

      {!user ? (
        <p className="text-primary-dim">
          Sign in above to create a tracking group or join one you were invited to.
        </p>
      ) : !activeGroup ? (
        <GroupPicker
          myGroups={myGroups}
          loading={loadingGroups}
          onSelect={selectGroup}
          onChanged={loadMyGroups}
          defaultIgn={myGroups[0]?.myIgn || ''}
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
                <h2 className="text-primary-bright text-lg leading-tight">{activeGroup.name}</h2>
                <p className="flex items-center gap-1.5 text-sm text-primary-dim">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeGroup.map_name} · {activeGroup.world} · {activeGroup.channel_count} channels
                </p>
              </div>
            </div>
            <button
              onClick={() => loadGroupData(activeGroup.id)}
              className="flex items-center gap-1 text-sm text-primary-dim hover:text-primary"
            >
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm bg-background-bright border border-primary-dim rounded-lg p-3">
            {bestFree ? (
              <span className="text-primary">
                Best free channel:{' '}
                <strong className="text-secondary">Ch {bestFree.channel}</strong> at level{' '}
                <strong className="text-secondary">{bestFree.projection.level}</strong>{' '}
                (+{bonusPercent(bestFree.projection.level)}% EXP), read{' '}
                {formatAge(bestFree.projection.ageMs)}
              </span>
            ) : (
              <span className="text-primary-dim">No channel readings yet — start scouting.</span>
            )}
            {unscoutedCount > 0 && (
              <span className="text-primary-dim">{unscoutedCount} channel(s) never scouted</span>
            )}
          </div>

          <ChannelBoard
            group={activeGroup}
            board={board}
            logs={logs}
            now={now}
            canLog={canLog}
            onLog={handleLog}
            onDeleteLog={handleDeleteLog}
            userId={user.id}
          />

          <GroupPanel
            group={activeGroup}
            members={members}
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
