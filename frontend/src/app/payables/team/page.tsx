"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

type Member = { _id: string; email: string; name?: string; role: "owner" | "admin" | "approver" | "member"; status: "pending" | "active" | "disabled"; inviteToken?: string };

export default function PayablesTeamPage() {
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("approver");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const res = await fetch(`${BACKEND}/payables/team`, { headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid } });
      if (res.ok) setMembers((await res.json()).members ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    fetch(`${BACKEND}/payables/team/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setInviteMessage(ok ? "Invite accepted. You can now collaborate in this Payables workspace." : (data.error ?? "Could not accept invite."));
        return load();
      })
      .catch(() => setInviteMessage("Could not accept invite."));
  }, [user]);

  const invite = async () => {
    if (!user || !email.trim()) return;
    setSaving(true);
    setInviteUrl("");
    try {
      const res = await fetch(`${BACKEND}/payables/team`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invite failed");
      setInviteUrl(data.inviteUrl ?? "");
      setEmail("");
      setName("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (id: string, patch: Partial<Member>) => {
    if (!user) return;
    await fetch(`${BACKEND}/payables/team/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  };

  const removeMember = async (id: string) => {
    if (!user || !confirm("Remove this team member?")) return;
    await fetch(`${BACKEND}/payables/team/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid } });
    await load();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/payables/dashboard" className="text-sm text-gray-400 hover:text-[#1d2226]">Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Team & roles</span>
          </div>
          <Link href="/payables/rules" className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600">Approval rules</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-[#1d2226]">Team & roles</h1>
          <p className="mt-2 text-sm text-gray-500">Invite finance teammates, assign approvers, and control who can review invoices.</p>
        </div>
        {inviteMessage && <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm font-semibold text-violet-700">{inviteMessage}</div>}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">Invite member</h2>
            <div className="mt-5 space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@company.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100">
                <option value="admin">Admin</option>
                <option value="approver">Approver</option>
                <option value="member">Member</option>
              </select>
              <button onClick={invite} disabled={saving || !email.trim()} className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Inviting…" : "Create invite"}</button>
              {inviteUrl && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">Invite created. Copy and share this link:<br /><span className="break-all font-semibold">{inviteUrl}</span></div>}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">Members</h2>
            {loading ? <div className="h-32 animate-pulse rounded-xl bg-gray-100" /> : members.length === 0 ? <p className="text-sm text-gray-400">No team members yet.</p> : (
              <div className="divide-y divide-gray-100">
                {members.map((m) => (
                  <div key={m._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className="font-bold text-[#1d2226]">{m.name || m.email}</p>
                      <p className="text-sm text-gray-400">{m.email}</p>
                    </div>
                    <select value={m.role} disabled={m.role === "owner"} onChange={(e) => updateMember(m._id, { role: e.target.value as Member["role"] })} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold capitalize text-gray-600">
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="approver">Approver</option>
                      <option value="member">Member</option>
                    </select>
                    <select value={m.status} disabled={m.role === "owner"} onChange={(e) => updateMember(m._id, { status: e.target.value as Member["status"] })} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold capitalize text-gray-600">
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                    {m.role !== "owner" && <button onClick={() => removeMember(m._id)} className="rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">Remove</button>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
