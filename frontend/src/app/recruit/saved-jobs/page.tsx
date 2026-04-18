"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function ArrowLeft() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>;
}

function TrashIcon() {
  return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
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
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/recruit/opportunities" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-sm">
              <ArrowLeft /> Opportunities
            </Link>
            <span className="text-slate-300">|</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a66c2] text-xs font-black text-white">R</span>
            <span className="text-sm font-bold">Saved Jobs</span>
          </div>
          {savedJobs.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-semibold transition">Clear all</button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Saved Jobs</h1>
          <p className="text-sm text-slate-500">{savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <BookmarkIcon />
            </div>
            <h2 className="font-semibold text-slate-800">No saved jobs yet</h2>
            <p className="mt-1 text-sm text-slate-500">Tap the bookmark icon on any job listing to save it here.</p>
            <Link href="/recruit/opportunities" className="mt-5 inline-block rounded-full bg-[#0a66c2] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#004182] transition">
              Browse opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map(job => (
              <div key={job.jobId} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-[#0a66c2]">
                  {(job.companyName || job.title).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/recruit/opportunities/${job.jobId}`} className="font-bold text-slate-900 hover:text-[#0a66c2] transition">
                    {job.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-600">{job.companyName || "Company"} · {job.location || "India"} · {job.workMode || "Flexible"}</p>
                  <p className="mt-1 text-xs text-slate-500">{job.niche}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{job.jobType}</span>
                    <span className="text-xs text-slate-400">Saved {timeAgo(job.savedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Link href={`/recruit/opportunities/${job.jobId}`} className="rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#004182] transition">
                    View & Apply
                  </Link>
                  <button onClick={() => remove(job.jobId)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition">
                    <TrashIcon /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
