"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STAGE_LABELS: Record<string, string> = {
  applied: "Applied", screened: "Screened", assessed: "Assessment sent",
  interview: "Interview", offer: "Offer", hired: "Hired", rejected: "Rejected",
};

const STAGE_COLORS: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  screened: "bg-purple-50 text-purple-700 border-purple-200",
  assessed: "bg-amber-50 text-amber-700 border-amber-200",
  interview: "bg-indigo-50 text-indigo-700 border-indigo-200",
  offer: "bg-green-50 text-green-700 border-green-200",
  hired: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

type Application = {
  _id: string;
  jobId: string;
  job: { title: string; companyName: string; location: string; workMode: string; niche: string } | null;
  stage: string;
  totalScore: number;
  maxScore: number;
  assessmentStatus: string;
  appliedAt: string;
};

function ArrowLeft() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function MyApplicationsPage() {
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("recruit_applicant_email");
      if (savedEmail) {
        setInputEmail(savedEmail);
        setEmail(savedEmail);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!email) return;
    fetchApplications(email);
  }, [email]);

  async function fetchApplications(emailToSearch: string) {
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const res = await fetch(`/recruit-public/my-applications?email=${encodeURIComponent(emailToSearch)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch applications");
      setApplications(data.applications || []);
      setSearched(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    const trimmed = inputEmail.trim().toLowerCase();
    try { localStorage.setItem("recruit_applicant_email", trimmed); } catch { /* ignore */ }
    setEmail(trimmed);
  }

  const scorePercent = (app: Application) =>
    app.maxScore > 0 ? Math.round((app.totalScore / app.maxScore) * 100) : null;

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/recruit/opportunities" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-sm">
            <ArrowLeft /> Opportunities
          </Link>
          <span className="text-slate-300">|</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a66c2] text-xs font-black text-white">R</span>
          <span className="text-sm font-bold">My Applications</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Track your applications</h1>
          <p className="text-sm text-slate-500">Enter the email you used when applying to see your application status.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
          <input
            type="email"
            value={inputEmail}
            onChange={e => setInputEmail(e.target.value)}
            placeholder="Enter your application email"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition"
            required
          />
          <button type="submit" disabled={loading} className="rounded-xl bg-[#0a66c2] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Looking up your applications...
            </div>
          </div>
        )}

        {!loading && searched && applications.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="font-semibold text-slate-800">No applications found</h2>
            <p className="mt-1 text-sm text-slate-500">We couldn't find any applications for this email address.</p>
            <Link href="/recruit/opportunities" className="mt-5 inline-block rounded-full bg-[#0a66c2] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#004182] transition">
              Browse & apply to jobs
            </Link>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">{applications.length} application{applications.length !== 1 ? "s" : ""} found</p>
            {applications.map(app => {
              const pct = scorePercent(app);
              return (
                <div key={app._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-[#0a66c2]">
                      {(app.job?.companyName || app.job?.title || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{app.job?.title || "Unknown job"}</h3>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STAGE_COLORS[app.stage] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {STAGE_LABELS[app.stage] || app.stage}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {app.job?.companyName || "Company"}{app.job?.location ? ` · ${app.job.location}` : ""}{app.job?.workMode ? ` · ${app.job.workMode}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">Applied {timeAgo(app.appliedAt)}</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {pct !== null && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{pct}% match</span>
                          </div>
                        )}
                        {app.assessmentStatus === "sent" && (
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">Assessment pending</span>
                        )}
                        {app.assessmentStatus === "completed" && (
                          <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[10px] font-bold text-green-700">Assessment done</span>
                        )}
                      </div>
                    </div>
                    {app.job && (
                      <Link href={`/recruit/opportunities/${app.jobId}`} className="shrink-0 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                        View job
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
