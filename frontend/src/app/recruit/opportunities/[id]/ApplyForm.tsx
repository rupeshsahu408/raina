"use client";

import { useState } from "react";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", resumeText: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function apply() {
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/recruit-public/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "Plyndrox Jobs" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed.");
      setMessage("Application submitted successfully. The recruiter can now review your AI-scored profile.");
      setForm({ name: "", email: "", phone: "", resumeText: "" });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Apply with resume text</h2>
      <p className="mt-1 text-sm text-slate-500">Phase 1 captures profile basics and runs AI scoring for the recruiter.</p>
      <div className="mt-4 space-y-3">
        <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        <input value={form.email} onChange={e => update("email", e.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Phone" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        <textarea value={form.resumeText} onChange={e => update("resumeText", e.target.value)} placeholder="Paste resume, LinkedIn summary, or work history" rows={9} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        <button onClick={apply} disabled={submitting} className="w-full rounded-full bg-[#0a66c2] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit application"}
        </button>
      </div>
    </aside>
  );
}
