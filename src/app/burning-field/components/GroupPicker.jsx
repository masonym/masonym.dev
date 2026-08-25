"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  Loader2,
  MapPin,
  Plus,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatAge } from "@/lib/burning/projection";

const TABS = {
  mine: { label: "My groups", icon: Users },
  browse: { label: "Browse", icon: Compass },
  join: { label: "Join by code", icon: Ticket },
  create: { label: "Create", icon: Plus },
};

export default function GroupPicker({
  myGroups,
  loading,
  onSelect,
  onChanged,
  defaultIgn,
}) {
  const [tab, setTab] = useState(myGroups.length ? "mine" : "create");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Asked for up front: a member with no IGN shows up as "unknown" on every log
  // they make until they find it in the group settings panel.
  const [ign, setIgn] = useState(defaultIgn || "");
  const trimmedIgn = ign.trim();

  // create form
  const [name, setName] = useState("");
  const [mapName, setMapName] = useState("");
  const [world, setWorld] = useState("Kronos");
  const [channelCount, setChannelCount] = useState(40);
  const [isPublic, setIsPublic] = useState(true);

  // join form
  const [code, setCode] = useState("");

  // browse
  const [search, setSearch] = useState("");
  const [publicGroups, setPublicGroups] = useState([]);
  const [browsing, setBrowsing] = useState(false);

  useEffect(() => {
    if (tab !== "browse") return;
    let cancelled = false;
    setBrowsing(true);
    const timer = setTimeout(async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "burning_public_groups",
        {
          p_search: search || null,
        },
      );
      if (cancelled) return;
      if (rpcError) setError(rpcError.message);
      setPublicGroups(data || []);
      setBrowsing(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mapName.trim()) return;
    setBusy(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase
      .from("burning_groups")
      .insert({
        name: name.trim(),
        map_name: mapName.trim(),
        world: world.trim() || "Kronos",
        channel_count: Number(channelCount) || 40,
        is_public: isPublic,
        owner_id: user.id,
      })
      .select()
      .single();

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (trimmedIgn) {
      await supabase
        .from("burning_group_members")
        .update({ ign: trimmedIgn })
        .eq("group_id", data.id)
        .eq("user_id", user.id);
    }
    await onChanged();
    onSelect(data.id);
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    const { data, error: rpcError } = await supabase.rpc("burning_join_group", {
      p_code: code.trim(),
      p_ign: trimmedIgn || null,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    await onChanged();
    onSelect(data);
  };

  const handleJoinPublic = async (groupId) => {
    setBusy(true);
    setError("");
    const { error: rpcError } = await supabase.rpc(
      "burning_join_public_group",
      {
        p_group_id: groupId,
        p_ign: trimmedIgn || null,
      },
    );
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    await onChanged();
    onSelect(groupId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(TABS).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setError("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition
                ${
                  tab === key
                    ? "bg-secondary text-background border-secondary font-bold"
                    : "bg-background-bright text-primary-dim border-primary-dim hover:text-primary"
                }`}
            >
              <Icon className="w-4 h-4" /> {meta.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {tab !== "mine" && (
        <label className="block max-w-md">
          <span className="text-sm text-primary-dim">
            Your in-game name{" "}
            <span className="text-primary">
              (shown on every reading you log)
            </span>
          </span>
          <input
            value={ign}
            onChange={(e) => setIgn(e.target.value)}
            maxLength={30}
            placeholder="e.g. Zakum"
            className="w-full mt-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
          />
        </label>
      )}

      {tab === "mine" &&
        (loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary-dim" />
        ) : myGroups.length === 0 ? (
          <p className="text-primary-dim text-sm">
            You are not in any groups yet. Create one for the map you train on,
            or join someone else&apos;s with their invite code.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {myGroups.map((group) => (
              <li key={group.id}>
                <button
                  onClick={() => onSelect(group.id)}
                  className="w-full text-left bg-background-bright border border-primary-dim rounded-lg p-3 hover:border-secondary transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-primary-bright font-bold truncate">
                      {group.name}
                    </span>
                    <span className="text-xs text-primary-dim">
                      {group.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-primary-dim mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{group.map_name}</span>
                    <span>· {group.world}</span>
                    <span>· {group.channel_count} ch</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ))}

      {tab === "browse" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary-dim" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search public groups by name, map or world"
              className="flex-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
            />
          </div>
          {browsing ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary-dim" />
          ) : publicGroups.length === 0 ? (
            <p className="text-primary-dim text-sm">
              No public groups match that.
            </p>
          ) : (
            <ul className="space-y-2">
              {publicGroups.map((group) => (
                <li
                  key={group.id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-background-bright border border-primary-dim rounded-lg p-3"
                >
                  <div className="min-w-0">
                    <p className="text-primary-bright truncate">{group.name}</p>
                    <p className="text-sm text-primary-dim truncate">
                      {group.map_name} · {group.world} · {group.channel_count}{" "}
                      ch · {group.member_count} member
                      {group.member_count === 1 ? "" : "s"} ·{" "}
                      {group.last_log_at
                        ? `last log ${formatAge(Date.now() - new Date(group.last_log_at).getTime())}`
                        : "no logs yet"}
                    </p>
                  </div>
                  <button
                    disabled={busy || (!group.is_member && !trimmedIgn)}
                    title={
                      !group.is_member && !trimmedIgn
                        ? "Enter your in-game name first"
                        : undefined
                    }
                    onClick={() =>
                      group.is_member
                        ? onSelect(group.id)
                        : handleJoinPublic(group.id)
                    }
                    className="px-3 py-1.5 rounded bg-secondary text-background font-bold text-sm disabled:opacity-50 hover:brightness-110 transition"
                  >
                    {group.is_member ? "Open" : "Join"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "join" && (
        <form
          onSubmit={handleJoinByCode}
          className="flex flex-wrap items-center gap-2 max-w-md"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Invite code"
            className="flex-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
          />
          <button
            type="submit"
            disabled={busy || !code.trim() || !trimmedIgn}
            className="px-4 py-2 rounded bg-secondary text-background font-bold text-sm disabled:opacity-50 hover:brightness-110 transition"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
          </button>
          {!trimmedIgn && (
            <p className="w-full text-primary-dim text-xs">
              Add your in-game name above so the group can tell whose readings
              are whose.
            </p>
          )}
        </form>
      )}

      {tab === "create" && (
        <form onSubmit={handleCreate} className="space-y-3 max-w-md">
          <label className="block">
            <span className="text-sm text-primary-dim">Group name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Robot Depot crew"
              className="w-full mt-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm text-primary-dim">Map</span>
            <input
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              maxLength={80}
              placeholder="Robot Depot 8"
              className="w-full mt-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
            />
          </label>
          <div className="flex gap-3">
            <label className="flex-1">
              <span className="text-sm text-primary-dim">World</span>
              <input
                value={world}
                onChange={(e) => setWorld(e.target.value)}
                maxLength={40}
                className="w-full mt-1 p-2 rounded bg-background border border-primary-dim text-primary text-sm"
              />
            </label>
            <label className="w-32">
              <span className="text-sm text-primary-dim">Channels</span>
              <input
                type="number"
                min={1}
                max={100}
                value={channelCount}
                onChange={(e) => setChannelCount(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-background border border-primary-dim text-primary text-sm"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-primary-dim">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Listed publicly so others can find and join it
          </label>
          <button
            type="submit"
            disabled={busy || !name.trim() || !mapName.trim()}
            className="px-4 py-2 rounded bg-secondary text-background font-bold text-sm disabled:opacity-50 hover:brightness-110 transition"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create group"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
