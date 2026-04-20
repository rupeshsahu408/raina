"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders, ROLE_LABELS, ROLE_DESCRIPTIONS, type PayablesRole } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

type Member = {
  _id: string;
  email: string;
  name?: string;
  role: PayablesRole;
  status: "pending" | "active" | "disabled";
  inviteToken?: string;
};

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

const INVITE_ROLES: PayablesRole[] = ["admin", "approver", "member", "viewer"];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  disabled: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function PayablesTeamPage() {
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [myRole, setMyRole] = useState<PayablesRole | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<PayablesRole>("approver");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteEmailSent, setInviteEmailSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, async (u) => {
        if (u) setUser({ uid: u.uid, token: await u.getIdToken() });
        else setLoading(false);
      });
    } catch {
      setLoading(false);
      return undefined;
    }
  }, []);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [membersRes, roleRes] = await Promise.all([
        fetch(`${BACKEND}/payables/team`, { headers: payablesHeaders(user) }),
        fetch(`${BACKEND}/payables/team/my-role`, { headers: payablesHeaders(user) }),
      ]);
      if (membersRes.ok) setMembers((await membersRes.json()).members ?? []);
      if (roleRes.ok) setMyRole((await roleRes.json()).role ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const canManage = myRole === "owner" || myRole === "admin";

  const invite = async () => {
    if (!user || !email.trim()) return;
    setSaving(true);
    setInviteUrl("");
    setInviteEmailSent(false);
    try {
      const res = await fetch(`${BACKEND}/payables/team`, {
        method: "POST",
        headers: payablesHeaders(user, true),
        body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invite failed");
      setInviteUrl(data.inviteUrl ?? "");
      setInviteEmailSent(true);
      setEmail("");
      setName("");
      showToast("Invitation created and email sent.");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create invite.", "error");
    } finally {
      setSaving(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    } catch {
      showToast("Could not copy link.", "error");
    }
  };

  const updateMember = async (id: string, patch: Partial<Member>) => {
    if (!user) return;
    const res = await fetch(`${BACKEND}/payables/team/${id}`, {
      method: "PATCH",
      headers: payablesHeaders(user, true),
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      showToast("Member updated.");
      await load();
    } else {
      const d = await res.json();
      showToast(d.error ?? "Update failed.", "error");
    }
  };

  const removeMember = async (id: string, memberEmail: string) => {
    if (!user || !confirm(`Remove ${memberEmail} from the workspace?`)) return;
    const res = await fetch(`${BACKEND}/payables/team/${id}`, {
      method: "DELETE",
      headers: payablesHeaders(user),
    });
    if (res.ok) {
      showToast("Member removed.");
      await load();
    } else {
      showToast("Could not remove member.", "error");
    }
  };

  const resendInvite = async (memberEmail: string, memberName: string | undefined, memberRole: PayablesRole) => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/payables/team`, {
        method: "POST",
        headers: payablesHeaders(user, true),
        body: JSON.stringify({ email: memberEmail, name: memberName ?? "", role: memberRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Resend failed");
      showToast("Invite resent successfully.");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to resend invite.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-lg transition-all ${toast.type === "error" ? "border-rose-100 bg-rose-50 text-rose-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
          {toast.text}
        </div>
      )}

      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/payables/dashboard" className="text-sm text-gray-400 hover:text-[#1d2226] transition-colors">Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Team &amp; Roles</span>
          </div>
          <div className="flex items-center gap-3">
            {myRole && (
              <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold capitalize text-violet-700">
                {ROLE_LABELS[myRole]}
              </span>
            )}
            <Link href="/payables/rules" className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:border-gray-300 transition-colors">
              Approval rules
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-[#1d2226]">Team &amp; Roles</h1>
          <p className="mt-2 text-sm text-gray-500">
            Invite finance teammates, assign approvers, and control who can access this workspace.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {canManage && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-5">Invite a member</h2>
              <div className="space-y-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name (optional)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  type="email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as PayablesRole)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                  >
                    {INVITE_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <p className="mt-1.5 px-1 text-xs text-gray-400">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
                <button
                  onClick={invite}
                  disabled={saving || !email.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-50 transition-opacity"
                >
                  {saving ? <><Spinner /> Sending…</> : "Send invitation"}
                </button>

                {inviteUrl && (
                  <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 space-y-2">
                    {inviteEmailSent && (
                      <p className="text-xs font-semibold text-violet-700">
                        Invite email sent to <strong>{email || "the invitee"}</strong>.
                      </p>
                    )}
                    <p className="text-xs text-violet-600">You can also share this link directly:</p>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 break-all rounded-lg bg-white border border-violet-100 px-3 py-2 text-xs text-violet-800 font-mono">{inviteUrl}</span>
                      <button
                        onClick={copyInviteLink}
                        className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
                      >
                        {inviteCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${!canManage ? "lg:col-span-2" : ""}`}>
            <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">
              Members <span className="ml-1 text-gray-300 font-normal normal-case tracking-normal">({members.length})</span>
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-400">No team members yet.</p>
                {canManage && <p className="mt-1 text-xs text-gray-400">Use the form to invite your first teammate.</p>}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map((m) => (
                  <div key={m._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1d2226] truncate">{m.name || m.email}</p>
                      {m.name && <p className="text-xs text-gray-400 truncate">{m.email}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {canManage && m.role !== "owner" ? (
                        <select
                          value={m.role}
                          onChange={(e) => updateMember(m._id, { role: e.target.value as PayablesRole })}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 outline-none hover:border-gray-300 transition-colors"
                        >
                          {INVITE_ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold capitalize text-gray-600">
                          {ROLE_LABELS[m.role] ?? m.role}
                        </span>
                      )}

                      <span className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${STATUS_BADGE[m.status] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                        {m.status}
                      </span>

                      {canManage && m.role !== "owner" && m.status === "active" && (
                        <select
                          value={m.status}
                          onChange={(e) => updateMember(m._id, { status: e.target.value as Member["status"] })}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 outline-none hover:border-gray-300 transition-colors"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disable</option>
                        </select>
                      )}

                      {canManage && m.status === "pending" && (
                        <button
                          onClick={() => resendInvite(m.email, m.name, m.role)}
                          disabled={saving}
                          className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50"
                        >
                          Resend invite
                        </button>
                      )}

                      {canManage && m.role !== "owner" && (
                        <button
                          onClick={() => removeMember(m._id, m.email)}
                          className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">Role permissions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(["admin", "approver", "member", "viewer"] as PayablesRole[]).map((r) => (
              <div key={r} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-black text-[#1d2226] mb-1">{ROLE_LABELS[r]}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
