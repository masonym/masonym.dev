"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  GitMerge,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Settings,
  Trash2,
  UserMinus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ROLES = ["owner", "logger", "viewer"];

export default function GroupPanel({
  group,
  members,
  occupants,
  myMembership,
  myGroups,
  userId,
  onChanged,
  onLeave,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ign, setIgn] = useState(myMembership?.ign || "");
  const [ignSaved, setIgnSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mergeSource, setMergeSource] = useState("");
  const [visibilityNote, setVisibilityNote] = useState("");
  // Bumped to remount the visibility checkbox. It is controlled by
  // `group.is_public`, so backing out of the confirm below would otherwise leave
  // the box visually flipped: nothing re-renders, and React only restores a
  // controlled input's DOM value when something does.
  const [visibilityNonce, setVisibilityNonce] = useState(0);

  const isOwner = group.owner_id === userId;
  const channelByMember = new Map(
    (occupants || [])
      .filter((o) => o.user_id)
      .map((o) => [o.user_id, o.channel]),
  );
  const mergeCandidates = myGroups.filter(
    (g) => g.id !== group.id && g.owner_id === userId,
  );

  const copyInvite = async () => {
    await navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Going private regenerates the invite code, so warn before the old one dies.
  const setVisibility = async (nextPublic) => {
    if (
      !nextPublic &&
      !confirm(
        "Make this group invite-only? Its invite code is regenerated, so anyone holding the old one loses access.",
      )
    ) {
      setVisibilityNonce((n) => n + 1);
      return;
    }
    setBusy(true);
    setError("");
    const { error: rpcError } = await supabase.rpc(
      "burning_set_group_visibility",
      { p_group_id: group.id, p_is_public: nextPublic },
    );
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    if (!nextPublic) {
      setVisibilityNote("Invite code regenerated - share the new one.");
      setTimeout(() => setVisibilityNote(""), 6000);
    }
    onChanged();
  };

  const saveIgn = async () => {
    setBusy(true);
    const { error: updateError } = await supabase
      .from("burning_group_members")
      .update({ ign: ign.trim() || null })
      .eq("group_id", group.id)
      .eq("user_id", userId);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setIgnSaved(true);
    setTimeout(() => setIgnSaved(false), 1500);
    onChanged();
  };

  const setRole = async (memberId, role) => {
    setBusy(true);
    const { error: updateError } = await supabase
      .from("burning_group_members")
      .update({ role })
      .eq("group_id", group.id)
      .eq("user_id", memberId);
    setBusy(false);
    if (updateError) setError(updateError.message);
    else onChanged();
  };

  const removeMember = async (memberId) => {
    setBusy(true);
    // Their occupancy marker would otherwise outlive the membership, leaving a
    // name on the board that nobody in the group can account for.
    await supabase
      .from("burning_occupants")
      .delete()
      .eq("group_id", group.id)
      .eq("user_id", memberId);
    const { error: deleteError } = await supabase
      .from("burning_group_members")
      .delete()
      .eq("group_id", group.id)
      .eq("user_id", memberId);
    setBusy(false);
    if (deleteError) setError(deleteError.message);
    else onChanged();
  };

  const kickMember = (member) => {
    const label = member.ign || `member ${member.user_id.slice(0, 8)}`;
    if (
      !confirm(
        `Remove ${label} from "${group.name}"? Their past logs stay on the board, but they lose access and can only return through the invite code.`,
      )
    )
      return;
    removeMember(member.user_id);
  };

  const leaveGroup = async () => {
    if (!confirm("Leave this group? You will need the invite code to rejoin."))
      return;
    await removeMember(userId);
    onLeave();
  };

  const deleteGroup = async () => {
    if (
      !confirm(
        `Delete "${group.name}" and all of its logs? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    const { error: deleteError } = await supabase
      .from("burning_groups")
      .delete()
      .eq("id", group.id);
    setBusy(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await onChanged();
    onLeave();
  };

  const mergeInto = async () => {
    if (!mergeSource) return;
    const source = mergeCandidates.find((g) => g.id === mergeSource);
    if (
      !confirm(
        `Move every log from "${source.name}" into "${group.name}" and delete "${source.name}"?`,
      )
    )
      return;
    setBusy(true);
    const { error: rpcError } = await supabase.rpc("burning_merge_groups", {
      p_source: mergeSource,
      p_target: group.id,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setMergeSource("");
    onChanged();
  };

  return (
    <div className="bg-background-bright border border-primary-dim rounded-lg">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-3 text-primary-dim hover:text-primary"
      >
        <span className="flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4" />
          Group settings &amp; members ({members.length})
        </span>
        <span className="text-xs">{open ? "hide" : "show"}</span>
      </button>

      {open && (
        <div className="p-4 pt-0 space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[200px]">
              <span className="text-sm text-primary-dim">
                Your IGN in this group
              </span>
              <input
                value={ign}
                onChange={(e) => {
                  setIgn(e.target.value);
                  setIgnSaved(false);
                }}
                placeholder="Shown next to your logs"
                className="w-full mt-1 p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim text-sm"
              />
            </label>
            <button
              onClick={saveIgn}
              disabled={busy}
              className="px-3 py-2 rounded bg-background border border-primary-dim text-primary-dim hover:text-primary text-sm disabled:opacity-50"
            >
              {ignSaved ? <Check className="w-4 h-4 text-green-400" /> : "Save"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-primary-dim">Invite code</span>
              <code className="px-2 py-1 rounded bg-background text-secondary text-sm">
                {group.invite_code}
              </code>
              <button
                onClick={copyInvite}
                className="flex items-center gap-1 text-sm text-primary-dim hover:text-primary"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {isOwner ? (
              <label className="flex items-center gap-2 text-sm text-primary-dim">
                <input
                  key={visibilityNonce}
                  type="checkbox"
                  checked={group.is_public}
                  disabled={busy}
                  onChange={(e) => setVisibility(e.target.checked)}
                />
                Listed publicly so others can find and join it
              </label>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-primary-dim">
                {group.is_public ? (
                  <Globe className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                {group.is_public
                  ? "Listed publicly - anyone can find and join this group."
                  : "Invite-only - joining needs the code above."}
              </p>
            )}

            {visibilityNote && (
              <p className="text-sm text-secondary">{visibilityNote}</p>
            )}
          </div>

          <div>
            <h4 className="text-primary-bright text-sm mb-2">Members</h4>
            <ul className="space-y-1">
              {members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className="text-primary flex-1 min-w-[120px] truncate">
                    {member.ign || `member ${member.user_id.slice(0, 8)}`}
                    {member.user_id === userId && (
                      <span className="text-primary-dim"> (you)</span>
                    )}
                    {channelByMember.has(member.user_id) && (
                      <span className="text-secondary">
                        {" "}
                        · Ch {channelByMember.get(member.user_id)}
                      </span>
                    )}
                  </span>
                  {isOwner && member.user_id !== group.owner_id ? (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          setRole(member.user_id, e.target.value)
                        }
                        disabled={busy}
                        className="p-1 rounded bg-background border border-primary-dim text-primary text-xs"
                      >
                        {ROLES.filter((r) => r !== "owner").map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => kickMember(member)}
                        disabled={busy}
                        title="Remove from group"
                        className="text-primary-dim hover:text-red-400"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-primary-dim text-xs">
                      {member.role}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isOwner && mergeCandidates.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-primary-dim/40 pt-3">
              <GitMerge className="w-4 h-4 text-primary-dim" />
              <span className="text-sm text-primary-dim">
                Merge another group you own into this one
              </span>
              <select
                value={mergeSource}
                onChange={(e) => setMergeSource(e.target.value)}
                className="p-1.5 rounded bg-background border border-primary-dim text-primary text-sm"
              >
                <option value="">Select group…</option>
                {mergeCandidates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} - {g.map_name}
                  </option>
                ))}
              </select>
              <button
                onClick={mergeInto}
                disabled={busy || !mergeSource}
                className="px-3 py-1.5 rounded bg-background border border-primary-dim text-primary-dim hover:text-primary text-sm disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Merge"}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-primary-dim/40 pt-3">
            {!isOwner && (
              <button
                onClick={leaveGroup}
                disabled={busy}
                className="flex items-center gap-1 text-sm text-primary-dim hover:text-red-400"
              >
                <LogOut className="w-4 h-4" /> Leave group
              </button>
            )}
            {isOwner && (
              <button
                onClick={deleteGroup}
                disabled={busy}
                className="flex items-center gap-1 text-sm text-primary-dim hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" /> Delete group
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
