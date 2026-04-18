"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RecruitHeader from "@/components/RecruitHeader";

type SavedJob = {
  jobId: string;
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  jobType: string;
  niche: string;
  savedAt: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("recruit_saved_jobs");
      if (raw) setSavedJobs(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  function remove(jobId: string) {
    const updated = savedJobs.filter(j => j.jobId !== jobId);
    setSavedJobs(updated);
    localStorage.setItem("recruit_saved_jobs", JSON.stringify(updated));
  }

  function clearAll() {
    setSavedJobs([]);
    localStorage.removeItem("recruit_saved_jobs");
  }

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <RecruitHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Saved Jobs</h1>
            <p className="text-sm text-slate-500">
              {mounted ? `${savedJobs.length} job${savedJobs.length !== 1 ? "s" : ""} saved` : "Loading…"}
            </p>
          </div>
          {mounted && savedJobs.length > 0 && (
            <button onClick={clearAll} className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
              Clear all
            </button>
          )}
        </div>

        {!mounted ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading…
            </div>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">🔖</div>
            <h2 className="font-bold text-lg text-slate-800">No saved jobs yet</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
              Tap the bookmark icon on any job listing to save it here for later.
            </p>
            <Link href="/recruit/opportunities" className="mt-6 inline-block rounded-full bg-[#0a66c2] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#004182] transition">
              Browse opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map(job => (
              <div key={job.jobId} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-[#0a66c2]/30 transition">
                <div className="flex items-start gap-3 p-4 sm:p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-base font-black text-[#0a66c2]">
                    {(job.companyName || job.title).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/recruit/opportunities/${job.jobId}`} className="font-bold text-slate-900 hover:text-[#0a66c2] transition leading-snug">
                      {job.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {job.companyName || "Company"}
                      {job.location ? ` · ${job.location}` : ""}
                      {job.workMode ? ` · ${job.workMode}` : ""}
                    </p>
                    {job.niche && <p className="mt-0.5 text-xs text-slate-400 truncate">{job.niche}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {job.jobType && <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600">{job.jobType}</span>}
                      <span className="text-xs text-slate-400">Saved {timeAgo(job.savedAt)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Link href={`/recruit/opportunities/${job.jobId}`} className="rounded-full bg-[#0a66c2] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#004182] transition whitespace-nowrap">
                      Apply now
                    </Link>
                    <button onClick={() => remove(job.jobId)} className="text-xs text-slate-400 hover:text-red-500 transition">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <Link href="/recruit/opportunities" className="text-sm font-semibold text-[#0a66c2] hover:underline">
                Find more jobs →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
