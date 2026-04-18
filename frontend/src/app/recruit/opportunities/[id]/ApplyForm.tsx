"use client";

import { useState, useEffect } from "react";

export default function ApplyForm({ jobId, jobTitle, companyName }: { jobId: string; jobTitle?: string; companyName?: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", resumeText: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("recruit_applicant_email");
      if (savedEmail) setForm(prev => ({ ...prev, email: savedEmail }));
      const savedProfile = localStorage.getItem("recruit_applicant_name");
      if (savedProfile) setForm(prev => ({ ...prev, name: savedProfile }));
      const savedResume = localStorage.getItem("recruit_resume_text");
      if (savedResume) setForm(prev => ({ ...prev, resumeText: savedResume }));
    } catch { /* ignore */ }
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function apply() {
    if (!form.name.trim() || !form.resumeText.trim()) {
      setError("Please fill in your name and resume text before submitting.");
      return;
    }
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
      setMessage("Application submitted! The recruiter will review your AI-scored profile.");
      try {
        localStorage.setItem("recruit_applicant_email", form.email);
        localStorage.setItem("recruit_applicant_name", form.name);
        if (form.resumeText) localStorage.setItem("recruit_resume_text", form.resumeText);
      } catch { /* ignore */ }
      setForm(prev => ({ ...prev, phone: "", resumeText: "" }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (message) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 mb-3">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900">Application sent!</h3>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          <a href="/recruit/my-applications" className="mt-4 rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
            Track your applications →
          </a>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Apply now</h2>
      {(jobTitle || companyName) && (
        <p className="mt-1 text-sm text-slate-500">
          {jobTitle}{companyName ? ` at ${companyName}` : ""}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-400">Your resume is scored by AI instantly. The recruiter sees your match score and a detailed breakdown.</p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Full name *</label>
          <input
            value={form.name}
            onChange={e => update("name", e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Email *</label>
          <input
            value={form.email}
            onChange={e => update("email", e.target.value)}
            placeholder="you@email.com"
            type="email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
          <input
            value={form.phone}
            onChange={e => update("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Resume / Work history *</label>
          <textarea
            value={form.resumeText}
            onChange={e => update("resumeText", e.target.value)}
            placeholder="Paste your resume, LinkedIn summary, or work history. Include skills, experience, education and achievements..."
            rows={9}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition resize-none"
          />
          <p className="mt-1 text-xs text-slate-400">Tip: <a href="/recruit/profile" className="text-[#0a66c2] hover:underline">Set up your profile</a> once and it auto-fills here.</p>
        </div>
        {error && <p className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</p>}
        <button
          onClick={apply}
          disabled={submitting}
          className="w-full rounded-full bg-[#0a66c2] px-5 py-3 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition"
        >
          {submitting ? "Submitting..." : "Submit application"}
        </button>
        <p className="text-center text-xs text-slate-400">
          Applied before? <a href="/recruit/my-applications" className="text-[#0a66c2] hover:underline">Track your applications</a>
        </p>
      </div>
    </aside>
  );
}
