"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Job = {
  _id: string;
  title: string;
  department: string;
  seniority: string;
  location: string;
  workMode: string;
  status: "active" | "paused" | "closed";
  candidateCount: number;
  createdAt: string;
};

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

function BriefcaseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function UsersIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote", onsite: "On-site", hybrid: "Hybrid",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function RecruitDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "closed">("all");

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) { const t = await u.getIdToken(); setToken(t); }
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/recruit/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filtered = jobs.filter(j => filter === "all" || j.status === filter);
  const totalCandidates = jobs.reduce((s, j) => s + (j.candidateCount || 0), 0);
  const activeJobs = jobs.filter(j => j.status === "active").length;

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(99,102,241,0.15),transparent_36%),linear-gradient(180deg,#050506,#07070a)]" />

      <header className="relative z-10 border-b border-white/[0.07] bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/recruit" className="group flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/8 transition group-hover:border-indigo-400/40">
              <img src="/evara-logo.png" alt="Plyndrox" className="h-5 w-5 object-contain" draggable={false} />
            </span>
            <span>
              <span className="block text-xs font-bold tracking-[0.2em] text-white uppercase">Recruit AI</span>
              <span className="block text-[10px] text-zinc-600">Dashboard</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/recruit/talent-pool"
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3.5 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white hover:border-white/20"
            >
              <UsersIcon size={13} /> Talent Pool
            </Link>
            <Link
              href="/recruit/analytics"
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3.5 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white hover:border-white/20"
            >
              <SparkIcon /> Analytics
            </Link>
            <Link
              href="/recruit/jobs/new"
              className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
            >
              <PlusIcon /> New Job
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Your Recruitment Pipeline</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage all your open roles and candidate pipelines from one place.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: "Total Jobs", value: jobs.length, accent: "text-white" },
            { label: "Active Roles", value: activeJobs, accent: "text-emerald-400" },
            { label: "Total Candidates", value: totalCandidates, accent: "text-indigo-400" },
            { label: "Roles Closed", value: jobs.filter(j => j.status === "closed").length, accent: "text-zinc-400" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="mt-0.5 text-[11px] text-zinc-600">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-2">
          {(["all", "active", "paused", "closed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-zinc-600">{filtered.length} role{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-zinc-500 text-sm">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading jobs...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.03] text-zinc-600 mb-5">
              <BriefcaseIcon size={28} />
            </div>
            <h2 className="text-base font-semibold text-zinc-300">
              {filter === "all" ? "No jobs yet" : `No ${filter} jobs`}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 max-w-xs">
              {filter === "all"
                ? "Create your first job posting and let AI generate the JD and scoring rubric in seconds."
                : `You don't have any ${filter} jobs at the moment.`}
            </p>
            {filter === "all" && (
              <Link
                href="/recruit/jobs/new"
                className="mt-6 flex items-center gap-2 rounded-2xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
              >
                <PlusIcon /> Create First Job
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(job => (
              <Link
                key={job._id}
                href={`/recruit/jobs/${job._id}`}
                className="group rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5 transition hover:border-indigo-500/25 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                    <BriefcaseIcon />
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[job.status]}`}>
                    {job.status}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition line-clamp-1">{job.title}</h3>
                <p className="mt-0.5 text-xs text-zinc-600">{job.seniority}{job.department ? ` · ${job.department}` : ""}</p>

                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-600">
                  <span className="flex items-center gap-1"><MapPinIcon /> {job.location}</span>
                  <span>{WORK_MODE_LABELS[job.workMode] ?? job.workMode}</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <UsersIcon /> {job.candidateCount} candidate{job.candidateCount !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                    {timeAgo(job.createdAt)}
                    <ChevronRightIcon />
                  </div>
                </div>
              </Link>
            ))}

            <Link
              href="/recruit/jobs/new"
              className="group flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.08] p-8 text-center transition hover:border-indigo-500/30 hover:bg-indigo-500/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-zinc-600 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition mb-3">
                <PlusIcon />
              </div>
              <p className="text-xs font-semibold text-zinc-500 group-hover:text-indigo-400 transition">New Job Posting</p>
              <p className="mt-1 text-[11px] text-zinc-700">AI generates the JD in 30 seconds</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
