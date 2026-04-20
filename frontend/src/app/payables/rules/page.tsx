"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

type Rule = { _id: string; name: string; minAmount: number; maxAmount?: number; currency?: string; approverEmail: string; approverName?: string; active: boolean };

export default function PayablesRulesPage() {
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState({ name: "", minAmount: "0", maxAmount: "", currency: "", approverEmail: "", approverName: "" });
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

  const headers = user ? { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" } : undefined;

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/payables/approval-rules`, { headers });
      if (res.ok) setRules((await res.json()).rules ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const createRule = async () => {
    if (!user || !form.name.trim() || !form.approverEmail.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/payables/approval-rules`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...form, minAmount: Number(form.minAmount || 0), maxAmount: form.maxAmount ? Number(form.maxAmount) : undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setForm({ name: "", minAmount: "0", maxAmount: "", currency: "", approverEmail: "", approverName: "" });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (rule: Rule) => {
    if (!user) return;
    await fetch(`${BACKEND}/payables/approval-rules/${rule._id}`, { method: "PATCH", headers, body: JSON.stringify({ active: !rule.active }) });
    await load();
  };

  const deleteRule = async (id: string) => {
    if (!user || !confirm("Delete this approval rule?")) return;
    await fetch(`${BACKEND}/payables/approval-rules/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid } });
    await load();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/payables/dashboard" className="text-sm text-gray-400 hover:text-[#1d2226]">Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Approval rules</span>
          </div>
          <Link href="/payables/team" className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600">Team & roles</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-[#1d2226]">Approval rules</h1>
          <p className="mt-2 text-sm text-gray-500">Route invoices by amount or currency to the right approver before payment.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">New rule</h2>
            <div className="mt-5 space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rule name, e.g. High-value invoices" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} placeholder="Min" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
                <input type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} placeholder="Max optional" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
              </div>
              <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} placeholder="Currency optional, e.g. USD" maxLength={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
              <input value={form.approverName} onChange={(e) => setForm({ ...form, approverName: e.target.value })} placeholder="Approver name optional" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
              <input value={form.approverEmail} onChange={(e) => setForm({ ...form, approverEmail: e.target.value })} placeholder="approver@company.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
              <button onClick={createRule} disabled={saving || !form.name.trim() || !form.approverEmail.trim()} className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Create rule"}</button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">Rules</h2>
            {loading ? <div className="h-32 animate-pulse rounded-xl bg-gray-100" /> : rules.length === 0 ? <p className="text-sm text-gray-400">No approval rules yet. Create one to automate routing.</p> : (
              <div className="space-y-3">
                {rules.map((r) => (
                  <div key={r._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-[#1d2226]">{r.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>{r.active ? "Active" : "Paused"}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {r.currency ? `${r.currency} ` : ""}{r.minAmount?.toLocaleString()}+
                          {r.maxAmount ? ` up to ${r.maxAmount.toLocaleString()}` : ""} → {r.approverName || r.approverEmail}
                        </p>
                        {r.approverName && <p className="mt-1 text-xs text-gray-400">{r.approverEmail}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toggleRule(r)} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">{r.active ? "Pause" : "Activate"}</button>
                        <button onClick={() => deleteRule(r._id)} className="rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">Delete</button>
                      </div>
                    </div>
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
