"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/trackEvent";
import { apiUrl, readApiJson } from "@/lib/api";

export default function ApplyForm({ jobId, jobTitle, companyName }: { jobId: string; jobTitle?: string; companyName?: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", resumeText: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [savedProfileDetected, setSavedProfileDetected] = useState(false);

  useEffect(() => {
    try {
      const email = localStorage.getItem("recruit_applicant_email");
      const name = localStorage.getItem("recruit_applicant_name");
      const phone = localStorage.getItem("recruit_applicant_phone");
      const resume = localStorage.getItem("recruit_resume_text");
      setSavedProfileDetected(Boolean(email || name || phone || resume));
      setForm(prev => ({
        ...prev,
        email: email || prev.email,
        name: name || prev.name,
        phone: phone || prev.phone,
        resumeText: resume || prev.resumeText,
      }));
    } catch { /* ignore */ }
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function apply() {
    if (!form.name.trim()) { setError("Please enter your full name."); return; }
    if (!form.email.trim()) { setError("Please enter your email so recruiters can contact you."); return; }
    if (!form.resumeText.trim()) { setError("Please paste your resume or work history."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(apiUrl(`/recruit-public/jobs/${jobId}/apply`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "Plyndrox Jobs" }),
      });
      const data = await readApiJson(res);
      if (!res.ok) throw new Error(data.error || "Application failed. Please try again.");
      try {
        if (form.email) localStorage.setItem("recruit_applicant_email", form.email);
        if (form.name) localStorage.setItem("recruit_applicant_name", form.name);
        if (form.phone) localStorage.setItem("recruit_applicant_phone", form.phone);
        if (form.resumeText) localStorage.setItem("recruit_resume_text", form.resumeText);
      } catch { /* ignore */ }
      trackEvent("application_submitted", { jobId });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 sm:p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">✅</div>
        <h3 className="font-bold text-lg text-slate-900">Application sent!</h3>
        <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">
          The recruiter will review your profile and AI match score shortly.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/recruit/my-applications"
            className="rounded-full bg-[#0a66c2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#004182] transition text-center"
          >
            Track applications
          </Link>
          <Link
            href="/recruit/opportunities"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
          >
            Browse more jobs
          </Link>
        </div>
      </div>
    );
  }

  const progress = [
    !!form.name.trim(),
    !!form.email.trim(),
    !!form.resumeText.trim(),
  ].filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#0a66c2] to-[#004182] p-4 sm:p-5">
        <h2 className="text-base font-bold text-white">Apply now</h2>
        {(jobTitle || companyName) && (
          <p className="mt-0.5 text-xs text-blue-200 truncate">
            {jobTitle}{companyName ? ` at ${companyName}` : ""}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(progress / 3) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-blue-100 font-semibold">{progress}/3 fields</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {savedProfileDetected && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-[#0a66c2]">
            Saved profile details were filled automatically. Review once and submit.
          </div>
        )}
        {!savedProfileDetected && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            Tip: create your seeker profile once to make future applications faster.
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Full name *</label>
          <input
            value={form.name}
            onChange={e => update("name", e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Email *</label>
          <input
            value={form.email}
            onChange={e => update("email", e.target.value)}
            placeholder="you@email.com"
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</label>
          <input
            value={form.phone}
            onChange={e => update("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resume / Work history *</label>
            <Link href="/recruit/profile" className="text-[11px] text-[#0a66c2] hover:underline">Set up profile →</Link>
          </div>
          <textarea
            value={form.resumeText}
            onChange={e => update("resumeText", e.target.value)}
            placeholder="Paste your resume text, LinkedIn summary, or work history. Include skills, experience, education and achievements for the best AI match score…"
            rows={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition resize-none"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          onClick={apply}
          disabled={submitting}
          className="w-full rounded-full bg-[#0a66c2] px-5 py-3 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition active:scale-[0.98]"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </span>
          ) : "Submit application"}
        </button>

        <p className="text-center text-xs text-slate-400">
          Applied before?{" "}
          <Link href="/recruit/my-applications" className="text-[#0a66c2] hover:underline">Track your applications</Link>
        </p>
        <p className="text-center text-[11px] text-slate-400">
          Free to apply. Your details are sent only to the recruiter for this role.
        </p>
      </div>
    </div>
  );
}
