"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type ScoreBreakdown = { criterion: string; score: number; maxScore: number; reasoning: string };
type CandidateStage = "applied" | "screened" | "assessed" | "interview" | "offer" | "hired" | "rejected";

type Candidate = {
  _id: string;
  name: string;
  email: string;
  totalScore: number;
  maxScore: number;
  scoreBreakdown: ScoreBreakdown[];
  aiSummary: string;
  redFlags: string[];
  strengths: string[];
  stage: CandidateStage;
  notes: string;
  interviewBrief: string;
  createdAt: string;
};

type RubricCriteria = { name: string; weight: number; description: string };
type Job = {
  _id: string;
  title: string;
  department: string;
  seniority: string;
  location: string;
  workMode: string;
  status: string;
  generatedJD: string;
  rubric: RubricCriteria[];
  candidateCount: number;
  mustHaveSkills: string;
  createdAt: string;
};

const STAGES: { id: CandidateStage; label: string; color: string; bg: string }[] = [
  { id: "applied", label: "Applied", color: "text-zinc-400", bg: "bg-zinc-500/15 border-zinc-500/20" },
  { id: "screened", label: "Screened", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/20" },
  { id: "assessed", label: "Assessed", color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/20" },
  { id: "interview", label: "Interview", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/20" },
  { id: "offer", label: "Offer", color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/20" },
  { id: "hired", label: "Hired", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20" },
  { id: "rejected", label: "Rejected", color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/20" },
];

function getStageStyle(stage: CandidateStage) {
  return STAGES.find(s => s.id === stage) ?? STAGES[0];
}

function scoreColor(pct: number) {
  if (pct >= 75) return "text-emerald-400";
  if (pct >= 50) return "text-amber-400";
  return "text-rose-400";
}

function scoreBarColor(pct: number) {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

function ChevronLeftIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
}
function SparkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;
}
function AlertIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
}
function CheckCircleIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>;
}

function AddCandidateModal({ jobId, token, onClose, onAdded }: {
  jobId: string; token: string; onClose: () => void; onAdded: () => void;
}) {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add candidate.");
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/[0.09] bg-[#0a0a0f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Add Candidate</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Paste the resume text — AI will score it automatically</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition"><XIcon /></button>
        </div>
        <div className="p-6">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-2">Resume Text *</label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            rows={12}
            placeholder="Paste the full resume text here — name, contact info, work experience, skills, education, projects, etc."
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
          />
          {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
          <div className="mt-4 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.05] px-4 py-3">
            <p className="text-[11px] text-indigo-300/70">
              <SparkIcon /> The AI will extract the candidate's name, score against the job rubric, identify strengths and red flags, and write a summary — automatically.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-white/[0.07] px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-zinc-500 hover:text-white transition">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !resumeText.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Scoring...</>
            ) : (
              <><SparkIcon /> Score & Add</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ c, jobId, token, onUpdate, onDelete }: {
  c: Candidate; jobId: string; token: string;
  onUpdate: (id: string, update: Partial<Candidate>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [brief, setBrief] = useState(c.interviewBrief || "");
  const pct = c.maxScore > 0 ? Math.round((c.totalScore / c.maxScore) * 100) : 0;
  const stageStyle = getStageStyle(c.stage);

  async function updateStage(stage: CandidateStage) {
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates/${c._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) onUpdate(c._id, { stage });
    } catch { /* silent */ }
  }

  async function fetchBrief() {
    if (brief) { setExpanded(true); return; }
    setLoadingBrief(true);
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates/${c._id}/brief`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBrief(data.brief ?? "");
    } catch { /* silent */ }
    finally { setLoadingBrief(false); setExpanded(true); }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${c.name} from this pipeline?`)) return;
    try {
      await fetch(`${API}/recruit/jobs/${jobId}/candidates/${c._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(c._id);
    } catch { /* silent */ }
  }

  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
              {c.redFlags.length > 0 && (
                <span className="flex items-center gap-1 text-rose-400 text-[10px]"><AlertIcon /> {c.redFlags.length} flag{c.redFlags.length > 1 ? "s" : ""}</span>
              )}
            </div>
            {c.email && <p className="text-[11px] text-zinc-600">{c.email}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className={`text-lg font-bold leading-none ${scoreColor(pct)}`}>{pct}%</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{c.totalScore}/{c.maxScore} pts</p>
            </div>
          </div>
        </div>

        <div className="mb-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div className={`h-full rounded-full transition-all ${scoreBarColor(pct)}`} style={{ width: `${pct}%` }} />
        </div>

        <p className="text-xs text-zinc-500 leading-5 line-clamp-2 mb-4">{c.aiSummary}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={c.stage}
            onChange={e => updateStage(e.target.value as CandidateStage)}
            className={`rounded-xl border text-[11px] font-semibold px-3 py-1.5 outline-none cursor-pointer bg-transparent ${stageStyle.bg} ${stageStyle.color}`}
          >
            {STAGES.map(s => (
              <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => setExpanded(e => !e)}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[11px] text-zinc-500 hover:text-white transition"
          >
            {expanded ? "Collapse" : "Score Details"}
          </button>
          <button
            onClick={fetchBrief}
            className="flex items-center gap-1 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] px-3 py-1.5 text-[11px] text-indigo-400 hover:bg-indigo-500/15 transition"
          >
            {loadingBrief ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <SparkIcon />}
            Interview Brief
          </button>
          <button onClick={handleDelete} className="ml-auto text-zinc-700 hover:text-rose-400 transition"><XIcon /></button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] p-5 space-y-4">
          {c.strengths.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 mb-2">Strengths</p>
              <div className="space-y-1">
                {c.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="text-emerald-400 mt-0.5"><CheckCircleIcon /></span>{s}
                  </div>
                ))}
              </div>
            </div>
          )}
          {c.redFlags.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/70 mb-2">Red Flags</p>
              <div className="space-y-1">
                {c.redFlags.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="text-rose-400 mt-0.5"><AlertIcon /></span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}
          {c.scoreBreakdown.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Score Breakdown</p>
              <div className="space-y-3">
                {c.scoreBreakdown.map((b, i) => {
                  const bPct = b.maxScore > 0 ? Math.round((b.score / b.maxScore) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-400">{b.criterion}</span>
                        <span className={`text-xs font-semibold ${scoreColor(bPct)}`}>{b.score}/{b.maxScore}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/[0.05]">
                        <div className={`h-full rounded-full ${scoreBarColor(bPct)}`} style={{ width: `${bPct}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-600">{b.reasoning}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {brief && (
            <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.05] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/70 mb-2 flex items-center gap-1"><SparkIcon /> Interview Brief</p>
              <p className="text-xs text-zinc-300 leading-6 whitespace-pre-wrap">{brief}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"pipeline" | "jd" | "rubric">("pipeline");

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) setToken(await u.getIdToken());
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [jobRes, candRes] = await Promise.all([
        fetch(`${API}/recruit/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/recruit/jobs/${id}/candidates`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const jobData = await jobRes.json();
      const candData = await candRes.json();
      setJob(jobData.job ?? null);
      setCandidates(candData.candidates ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token, id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleUpdate(cid: string, update: Partial<Candidate>) {
    setCandidates(prev => prev.map(c => c._id === cid ? { ...c, ...update } : c));
  }

  function handleDelete(cid: string) {
    setCandidates(prev => prev.filter(c => c._id !== cid));
    setJob(prev => prev ? { ...prev, candidateCount: Math.max(0, prev.candidateCount - 1) } : null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#050506] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <p>Job not found.</p>
        <Link href="/recruit/dashboard" className="text-indigo-400 text-sm hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const topCandidates = [...candidates].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
  const byStage: Record<CandidateStage, Candidate[]> = {
    applied: [], screened: [], assessed: [], interview: [], offer: [], hired: [], rejected: [],
  };
  candidates.forEach(c => { if (byStage[c.stage]) byStage[c.stage].push(c); });

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(99,102,241,0.15),transparent_36%),linear-gradient(180deg,#050506,#07070a)]" />

      <header className="relative z-10 border-b border-white/[0.07] bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/recruit/dashboard" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition">
              <ChevronLeftIcon /> Dashboard
            </Link>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-400 font-medium truncate max-w-[180px] sm:max-w-xs">{job.title}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
          >
            <PlusIcon /> Add Candidate
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-white">{job.title}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {job.seniority}
                {job.department ? ` · ${job.department}` : ""}
                {" · "}{job.location}
                {" · "}{job.workMode}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {topCandidates.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-2">
                  <p className="text-[10px] text-zinc-500">Top Score</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {topCandidates[0] ? `${Math.round((topCandidates[0].totalScore / topCandidates[0].maxScore) * 100)}%` : "—"}
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-2">
                <p className="text-[10px] text-zinc-500">Candidates</p>
                <p className="text-sm font-bold text-white">{candidates.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-1 border-b border-white/[0.06]">
          {(["pipeline", "jd", "rubric"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-indigo-500 text-white font-medium"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "jd" ? "Job Description" : tab === "rubric" ? "Scoring Rubric" : "Pipeline"}
            </button>
          ))}
        </div>

        {activeTab === "pipeline" && (
          <div>
            {candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-zinc-400 text-sm mb-2">No candidates yet</p>
                <p className="text-zinc-600 text-xs mb-6">Add your first candidate — paste a resume and the AI will score it against your rubric.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
                >
                  <PlusIcon /> Add First Candidate
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {STAGES.filter(s => s.id !== "rejected").map(stage => {
                  const stageCandidates = byStage[stage.id];
                  if (stageCandidates.length === 0 && stage.id !== "applied") return null;
                  return (
                    <div key={stage.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${stage.bg} ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="text-xs text-zinc-600">{stageCandidates.length} candidate{stageCandidates.length !== 1 ? "s" : ""}</span>
                      </div>
                      {stageCandidates.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/[0.05] px-4 py-5 text-center text-xs text-zinc-700">
                          No candidates at this stage
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {stageCandidates.map(c => (
                            <CandidateCard key={c._id} c={c} jobId={id} token={token!} onUpdate={handleUpdate} onDelete={handleDelete} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {byStage.rejected.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="rounded-full border border-rose-500/20 bg-rose-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-400">
                        Rejected
                      </span>
                      <span className="text-xs text-zinc-600">{byStage.rejected.length}</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                      {byStage.rejected.map(c => (
                        <CandidateCard key={c._id} c={c} jobId={id} token={token!} onUpdate={handleUpdate} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "jd" && (
          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/70 mb-4 flex items-center gap-1.5"><SparkIcon /> AI-Generated Job Description</p>
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap font-sans">{job.generatedJD}</pre>
            </div>
          </div>
        )}

        {activeTab === "rubric" && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-500 mb-6">This rubric was automatically generated from your job details. It's used to score every candidate you add.</p>
            {job.rubric.map((r, i) => (
              <div key={i} className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{r.name}</h3>
                  <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-0.5 text-xs font-bold text-indigo-300">{r.weight} pts</span>
                </div>
                <p className="text-xs text-zinc-500 leading-6">{r.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddModal && token && (
        <AddCandidateModal
          jobId={id}
          token={token}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchData}
        />
      )}
    </div>
  );
}
