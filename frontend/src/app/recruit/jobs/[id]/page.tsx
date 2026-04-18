"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Link from "next/link";
import { trackEvent } from "@/lib/trackEvent";

const FRONTEND_URL = "https://www.plyndrox.app";

const API = "/backend";

type Confidence = "high" | "medium" | "low";
type ScoreBreakdown = { criterion: string; score: number; maxScore: number; reasoning: string; confidence?: Confidence; tier?: 1 | 2 | 3 };
type CandidateStage = "applied" | "screened" | "assessed" | "interview" | "offer" | "hired" | "rejected";
type AssessmentStatus = "not_sent" | "sent" | "completed";
type HiringDecision = "strong_yes" | "maybe" | "no" | null;

type AssessmentImpact = {
  strengths: string[];
  weaknesses: string[];
  reasoning: string;
};

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
  assessmentStatus: AssessmentStatus;
  assessmentToken?: string;
  assessmentSentAt?: string;
  assessmentCompletedAt?: string;
  assessmentReminderSentAt?: string;
  previousResumeScore: number;
  hiringDecision: HiringDecision;
  assessmentImpact?: AssessmentImpact;
  scoringFailed?: boolean;
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

function confidenceStyle(c: Confidence) {
  if (c === "high") return { dot: "bg-emerald-400", text: "text-emerald-400", label: "High confidence", pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  if (c === "low")  return { dot: "bg-rose-400",    text: "text-rose-400",    label: "Low confidence",  pill: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  return               { dot: "bg-amber-400",   text: "text-amber-400",   label: "Med. confidence", pill: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
}

function overallConfidence(breakdown: ScoreBreakdown[]): Confidence {
  if (breakdown.length === 0) return "medium";

  const tier1 = breakdown.filter(b => (b.tier ?? 1) === 1);

  // If any Tier 1 criterion is low, the overall can never be High
  const tier1HasLow = tier1.some(b => (b.confidence ?? "medium") === "low");

  // Weighted score: high=2, medium=1, low=0
  // Tier 1 carries 3× weight, Tier 2 carries 2×, Tier 3 carries 1×
  let totalWeight = 0;
  let weightedScore = 0;
  for (const b of breakdown) {
    const weight = b.tier === 3 ? 1 : b.tier === 2 ? 2 : 3;
    const score  = b.confidence === "high" ? 2 : b.confidence === "low" ? 0 : 1;
    totalWeight  += weight;
    weightedScore += weight * score;
  }

  const avg = totalWeight > 0 ? weightedScore / totalWeight : 1;
  if (avg >= 1.4 && !tier1HasLow) return "high";
  if (avg <= 0.6) return "low";
  return "medium";
}

function decisionBadge(decision: HiringDecision) {
  if (!decision) return null;
  const map = {
    strong_yes: { label: "Strong Yes", icon: "✅", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
    maybe: { label: "Maybe", icon: "🤔", cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
    no: { label: "No", icon: "❌", cls: "bg-rose-500/15 text-rose-400 border-rose-500/25" },
  };
  return map[decision] ?? null;
}

function assessmentStatusBadge(status: AssessmentStatus) {
  const map = {
    not_sent: { label: "Not Sent", cls: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
    sent: { label: "Pending", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    completed: { label: "Completed", cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  };
  return map[status] ?? map.not_sent;
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
function SendIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
}
function CopyIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;
}
function BellIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
}

function AssessmentLinkModal({ link, candidateName, candidateEmail, onClose }: {
  link: string; candidateName: string; candidateEmail: string; onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/[0.09] bg-[#0a0a0f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Assessment Link Ready</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Share this with {candidateName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition"><XIcon /></button>
        </div>
        <div className="p-6 space-y-4">
          {candidateEmail && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
              <p className="text-[10px] text-zinc-600 mb-0.5">Email</p>
              <p className="text-sm text-zinc-300">{candidateEmail}</p>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Assessment URL</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs text-zinc-400 break-all min-w-0">
                {link}
              </div>
              <button
                onClick={copy}
                className={`shrink-0 flex items-center gap-1.5 rounded-2xl px-4 py-3 text-xs font-semibold transition ${
                  copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/25"
                }`}
              >
                <CopyIcon /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.05] px-4 py-3">
            <p className="text-[11px] text-indigo-300/70 leading-5">
              Send this link to <strong>{candidateName}</strong> via email or WhatsApp. When they complete it, the AI will analyze their answers and update their score automatically.
            </p>
          </div>
        </div>
        <div className="flex justify-end border-t border-white/[0.07] px-6 py-4">
          <button onClick={onClose} className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-400 transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectionEmailModal({ email, candidateName, candidateEmail, onClose }: {
  email: string; candidateName: string; candidateEmail: string; onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/[0.09] bg-[#0a0a0f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">AI Rejection Email</h2>
            <p className="text-xs text-zinc-500 mt-0.5">For {candidateName}{candidateEmail ? ` · ${candidateEmail}` : ""}</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition"><XIcon /></button>
        </div>
        <div className="p-6">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 max-h-72 overflow-y-auto">
            <p className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap">{email}</p>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">Copy and send via your email client. You can edit before sending.</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-white/[0.07] px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-zinc-500 hover:text-white transition">Close</button>
          <button
            onClick={copy}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition ${
              copied ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white hover:bg-indigo-400"
            }`}
          >
            <CopyIcon /> {copied ? "Copied!" : "Copy Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

const SOURCE_OPTIONS = ["LinkedIn", "Indeed", "Naukri", "Referral", "Company Website", "Angel List", "Walk-in", "Other"];

function OfferLetterModal({ candidate, job, token, onClose }: {
  candidate: Candidate & { name: string; email: string };
  job: Job;
  token: string;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [salary, setSalary] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [signingBonus, setSigningBonus] = useState("");
  const [benefits, setBenefits] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hiringManagerName, setHiringManagerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(regenerate = false) {
    if (!startDate.trim() || !salary.trim()) { setError("Start date and salary are required."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/recruit/jobs/${job._id}/candidates/${candidate._id}/offer-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate, salary, salaryCurrency: currency, signingBonus, benefits, companyName, hiringManagerName, regenerate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate offer letter.");
      setLetter(data.offerLetter);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function copyLetter() {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/[0.09] bg-[#0a0a0f] shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">Offer Letter — {candidate.name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{job.title} · AI-generated, ready to send or copy</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition"><XIcon /></button>
        </div>

        {!letter ? (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Start Date *</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50">
                  {["INR", "USD", "GBP", "EUR", "AED", "SGD", "AUD"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Annual Salary *</label>
              <input type="text" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 12,00,000 or 1,200,000"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Signing Bonus <span className="text-zinc-700 normal-case tracking-normal">(optional)</span></label>
                <input type="text" value={signingBonus} onChange={e => setSigningBonus(e.target.value)} placeholder="e.g. 50,000"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Company Name <span className="text-zinc-700 normal-case tracking-normal">(optional)</span></label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Key Benefits <span className="text-zinc-700 normal-case tracking-normal">(optional)</span></label>
              <input type="text" value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="e.g. Health insurance, 25 days PTO, flexible hours"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Hiring Manager Name <span className="text-zinc-700 normal-case tracking-normal">(optional)</span></label>
              <input type="text" value={hiringManagerName} onChange={e => setHiringManagerName(e.target.value)} placeholder="Name that will sign the letter"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap font-mono text-[13px]">{letter}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-6 py-4 shrink-0">
          {letter ? (
            <>
              <button onClick={() => setLetter("")} className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-zinc-500 hover:text-white transition">Edit Details</button>
              <div className="flex items-center gap-2">
                <button onClick={() => generate(true)} disabled={loading} className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] px-4 py-2 text-xs text-indigo-400 hover:bg-indigo-500/15 transition disabled:opacity-50">
                  Regenerate
                </button>
                <button onClick={copyLetter} className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-400 transition">
                  {copied ? "Copied!" : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy Letter</>}
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-zinc-500 hover:text-white transition">Cancel</button>
              <button onClick={() => generate(false)} disabled={loading || !startDate || !salary} className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-400 disabled:opacity-50 transition">
                {loading ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generating...</> : <><SparkIcon /> Generate Offer Letter</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type PreviousApplication = {
  jobTitle: string;
  stage: string;
  totalScore: number;
  maxScore: number;
  rejectedAt: string;
  aiSummary: string;
};

function AddCandidateModal({ jobId, token, onClose, onAdded }: {
  jobId: string; token: string; onClose: () => void; onAdded: () => void;
}) {
  const [resumeText, setResumeText] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previousApp, setPreviousApp] = useState<PreviousApplication | null>(null);
  const [added, setAdded] = useState(false);

  async function handleSubmit() {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError("");
    setPreviousApp(null);
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resumeText, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add candidate.");
      if (data.previousApplication) {
        setPreviousApp(data.previousApplication);
        setAdded(true);
        onAdded();
      } else {
        onAdded();
        onClose();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (previousApp && added) {
    const scorePct = previousApp.maxScore > 0 ? Math.round((previousApp.totalScore / previousApp.maxScore) * 100) : 0;
    const rejectedDate = new Date(previousApp.rejectedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-[2rem] border border-amber-500/20 bg-[#0a0a0f] shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Returning Candidate Detected</h2>
              <p className="text-xs text-zinc-500 mt-0.5">AI Memory found a previous application on record</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-4 space-y-2">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">Previous Application</p>
              <p className="text-sm text-white font-medium">{previousApp.jobTitle}</p>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>Stage reached: <span className="text-zinc-300 capitalize">{previousApp.stage}</span></span>
                <span>·</span>
                <span>Score: <span className="text-zinc-300">{scorePct}%</span></span>
                <span>·</span>
                <span>{rejectedDate}</span>
              </div>
              {previousApp.aiSummary && (
                <p className="text-xs text-zinc-400 pt-1 border-t border-white/[0.06]">{previousApp.aiSummary}</p>
              )}
            </div>
            <p className="text-xs text-zinc-500">The candidate has been added to the pipeline. Keep this history in mind during evaluation.</p>
          </div>
          <div className="flex justify-end border-t border-white/[0.07] px-6 py-4">
            <button onClick={onClose} className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-400 transition">Got it</button>
          </div>
        </div>
      </div>
    );
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
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-2">Resume Text *</label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={10}
              placeholder="Paste the full resume text here — name, contact info, work experience, skills, education, projects, etc."
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-2">Source <span className="text-zinc-700 normal-case tracking-normal">(optional)</span></label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            >
              <option value="">Select source...</option>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.05] px-4 py-3">
            <p className="text-[11px] text-indigo-300/70 flex items-center gap-1">
              <SparkIcon /> AI will score the resume, detect strengths & red flags, and check if this candidate has applied before.
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

function RetryIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>;
}

function CandidateCard({ c, jobId, job, token, onUpdate, onDelete }: {
  c: Candidate; jobId: string; job: Job; token: string;
  onUpdate: (id: string, update: Partial<Candidate>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [brief, setBrief] = useState(c.interviewBrief || "");
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [assessmentLink, setAssessmentLink] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [rejectionEmail, setRejectionEmail] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);

  const scoringFailed = c.scoringFailed === true;
  const pct = (!scoringFailed && c.maxScore > 0) ? Math.round((c.totalScore / c.maxScore) * 100) : 0;
  const prevPct = c.maxScore > 0 && c.previousResumeScore ? Math.round((c.previousResumeScore / c.maxScore) * 100) : null;
  const stageStyle = getStageStyle(c.stage);
  const decision = decisionBadge(c.hiringDecision);
  const assessBadge = assessmentStatusBadge(c.assessmentStatus ?? "not_sent");
  const scoreChanged = c.assessmentStatus === "completed" && prevPct !== null && prevPct !== pct;

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

  async function sendAssessment() {
    setLoadingAssessment(true);
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates/${c._id}/assessment/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const link = data.assessmentUrl;
      setAssessmentLink(link);
      setShowAssessmentModal(true);
      onUpdate(c._id, { assessmentStatus: "sent", assessmentSentAt: new Date().toISOString() });
    } catch (e: any) {
      alert(e.message || "Failed to send assessment.");
    } finally {
      setLoadingAssessment(false);
    }
  }

  async function sendReminder() {
    setLoadingReminder(true);
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates/${c._id}/reminder`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAssessmentLink(data.assessmentUrl);
      setShowAssessmentModal(true);
      onUpdate(c._id, { assessmentReminderSentAt: new Date().toISOString() });
    } catch (e: any) {
      alert(e.message || "Failed to send reminder.");
    } finally {
      setLoadingReminder(false);
    }
  }

  async function generateRejectionEmail() {
    setLoadingReject(true);
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates/${c._id}/reject-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRejectionEmail(data.email);
      setShowRejectModal(true);
    } catch (e: any) {
      alert(e.message || "Failed to generate rejection email.");
    } finally {
      setLoadingReject(false);
    }
  }

  async function retryScoring() {
    setLoadingRetry(true);
    setRetryError("");
    try {
      const res = await fetch(`${API}/recruit/jobs/${jobId}/candidates/${c._id}/retry-score`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed.");
      onUpdate(c._id, {
        name: data.candidate.name,
        email: data.candidate.email,
        totalScore: data.candidate.totalScore,
        maxScore: data.candidate.maxScore,
        scoreBreakdown: data.candidate.scoreBreakdown,
        aiSummary: data.candidate.aiSummary,
        redFlags: data.candidate.redFlags,
        strengths: data.candidate.strengths,
        scoringFailed: data.candidate.scoringFailed,
      });
    } catch (e: any) {
      setRetryError(e.message || "Retry failed. Please try again.");
    } finally {
      setLoadingRetry(false);
    }
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
    <>
      {showAssessmentModal && assessmentLink && (
        <AssessmentLinkModal
          link={assessmentLink}
          candidateName={c.name}
          candidateEmail={c.email}
          onClose={() => setShowAssessmentModal(false)}
        />
      )}
      {showRejectModal && rejectionEmail && (
        <RejectionEmailModal
          email={rejectionEmail}
          candidateName={c.name}
          candidateEmail={c.email}
          onClose={() => setShowRejectModal(false)}
        />
      )}
      {showOfferLetterModal && (
        <OfferLetterModal
          candidate={c}
          job={job}
          token={token}
          onClose={() => setShowOfferLetterModal(false)}
        />
      )}

      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                {decision && (
                  <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${decision.cls}`}>
                    {decision.icon} {decision.label}
                  </span>
                )}
                {c.redFlags.length > 0 && (
                  <span className="flex items-center gap-1 text-rose-400 text-[10px]"><AlertIcon /> {c.redFlags.length} flag{c.redFlags.length > 1 ? "s" : ""}</span>
                )}
              </div>
              {c.email && <p className="text-[11px] text-zinc-600">{c.email}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                {scoringFailed ? (
                  <p className="text-sm font-semibold leading-none text-amber-400">Scoring<br/>unavailable</p>
                ) : (
                  <>
                    <p className={`text-lg font-bold leading-none ${scoreColor(pct)}`}>{pct}%</p>
                    {scoreChanged && prevPct !== null && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        <span className="line-through text-zinc-700">{prevPct}%</span>
                        <span className={pct > prevPct ? " text-emerald-500" : " text-rose-500"}>
                          {" "}{pct > prevPct ? "▲" : "▼"}
                        </span>
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-600 mt-0.5">{c.totalScore}/{c.maxScore} pts</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mb-2 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            {!scoringFailed && (
              <div className={`h-full rounded-full transition-all ${scoreBarColor(pct)}`} style={{ width: `${pct}%` }} />
            )}
          </div>
          {!scoringFailed && c.scoreBreakdown.length > 0 && (() => {
            const conf = overallConfidence(c.scoreBreakdown);
            const cs = confidenceStyle(conf);
            return (
              <div className="mb-3 flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${cs.dot}`} />
                <span className={`text-[10px] font-medium ${cs.text}`}>{cs.label}</span>
              </div>
            );
          })()}

          {scoringFailed ? (
            <div className="mb-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
              <p className="text-[11px] text-amber-300/80 leading-5">Scoring temporarily unavailable — the AI couldn&apos;t analyze this resume. Use &ldquo;Retry Scoring&rdquo; to try again.</p>
              {retryError && <p className="mt-1 text-[11px] text-rose-400">{retryError}</p>}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 leading-5 line-clamp-2 mb-3">{c.aiSummary}</p>
          )}

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${assessBadge.cls}`}>
              Assessment: {assessBadge.label}
            </span>
            {c.assessmentSentAt && c.assessmentStatus === "sent" && (
              <span className="text-[10px] text-zinc-700">
                Sent {new Date(c.assessmentSentAt).toLocaleDateString()}
              </span>
            )}
            {c.assessmentCompletedAt && (
              <span className="text-[10px] text-zinc-700">
                Completed {new Date(c.assessmentCompletedAt).toLocaleDateString()}
              </span>
            )}
          </div>

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
              {expanded ? "Collapse" : "Details"}
            </button>

            <button
              onClick={fetchBrief}
              className="flex items-center gap-1 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] px-3 py-1.5 text-[11px] text-indigo-400 hover:bg-indigo-500/15 transition"
            >
              {loadingBrief ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <SparkIcon />}
              Brief
            </button>

            {c.assessmentStatus === "not_sent" && (
              <button
                onClick={sendAssessment}
                disabled={loadingAssessment}
                className="flex items-center gap-1 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] px-3 py-1.5 text-[11px] text-violet-400 hover:bg-violet-500/15 transition disabled:opacity-50"
              >
                {loadingAssessment ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <SendIcon />}
                Send Assessment
              </button>
            )}

            {c.assessmentStatus === "sent" && (
              <button
                onClick={sendReminder}
                disabled={loadingReminder}
                className="flex items-center gap-1 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1.5 text-[11px] text-amber-400 hover:bg-amber-500/15 transition disabled:opacity-50"
              >
                {loadingReminder ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <BellIcon />}
                Reminder
              </button>
            )}

            <button
              onClick={generateRejectionEmail}
              disabled={loadingReject}
              className="flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/15 transition disabled:opacity-50"
            >
              {loadingReject ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <XIcon />}
              Reject
            </button>

            {(c.stage === "offer" || c.stage === "hired") && (
              <button
                onClick={() => setShowOfferLetterModal(true)}
                className="flex items-center gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-[11px] text-emerald-400 hover:bg-emerald-500/15 transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Offer Letter
              </button>
            )}

            {scoringFailed && (
              <button
                onClick={retryScoring}
                disabled={loadingRetry}
                className="flex items-center gap-1 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-1.5 text-[11px] text-amber-400 hover:bg-amber-500/15 transition disabled:opacity-50"
              >
                {loadingRetry ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <RetryIcon />}
                {loadingRetry ? "Retrying…" : "Retry Scoring"}
              </button>
            )}

            <button onClick={handleDelete} className="ml-auto text-zinc-700 hover:text-rose-400 transition"><XIcon /></button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-white/[0.06] p-5 space-y-4">
            {c.assessmentStatus === "completed" && c.assessmentImpact && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70 mb-2 flex items-center gap-1"><SparkIcon /> Assessment Impact</p>
                {scoreChanged && prevPct !== null && (
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-zinc-500">{prevPct}%</span>
                    <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M1 6h16M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className={`text-lg font-bold ${scoreColor(pct)}`}>{pct}%</span>
                    <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${pct > prevPct ? "bg-emerald-500/15 text-emerald-400" : pct < prevPct ? "bg-rose-500/15 text-rose-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                      {pct > prevPct ? `+${pct - prevPct}%` : pct < prevPct ? `-${prevPct - pct}%` : "No change"}
                    </span>
                  </div>
                )}
                <p className="text-xs text-zinc-400 leading-5 mb-3">{c.assessmentImpact.reasoning}</p>
                {c.assessmentImpact.strengths.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {c.assessmentImpact.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-400">
                        <CheckCircleIcon /> {s}
                      </div>
                    ))}
                  </div>
                )}
                {c.assessmentImpact.weaknesses.length > 0 && (
                  <div className="space-y-1">
                    {c.assessmentImpact.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-400">
                        <AlertIcon /> {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {c.strengths.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 mb-2">Resume Strengths</p>
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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Score Breakdown</p>
                  {(() => {
                    const conf = overallConfidence(c.scoreBreakdown);
                    const cs = confidenceStyle(conf);
                    const fullLabel = conf === "high" ? "High Confidence" : conf === "low" ? "Low Confidence" : "Medium Confidence";
                    return (
                      <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cs.pill}`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${cs.dot}`} />
                        {fullLabel}
                      </span>
                    );
                  })()}
                </div>
                <div className="space-y-3">
                  {c.scoreBreakdown.map((b, i) => {
                    const bPct = b.maxScore > 0 ? Math.round((b.score / b.maxScore) * 100) : 0;
                    const conf = b.confidence ?? "medium";
                    const cs = confidenceStyle(conf);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cs.dot}`} title={cs.label} />
                            <span className="text-xs text-zinc-400 truncate">{b.criterion}</span>
                          </div>
                          <span className={`ml-2 shrink-0 text-xs font-semibold ${scoreColor(bPct)}`}>{b.score}/{b.maxScore}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/[0.05]">
                          <div className={`h-full rounded-full ${scoreBarColor(bPct)}`} style={{ width: `${bPct}%` }} />
                        </div>
                        <div className="mt-1 flex items-start justify-between gap-2">
                          <p className="text-[10px] text-zinc-600 leading-4">{b.reasoning}</p>
                          <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wide ${cs.text}`}>{conf}</span>
                        </div>
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
    </>
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
  const [activeTab, setActiveTab] = useState<"pipeline" | "jd" | "rubric" | "post">("pipeline");
  const [linkCopied, setLinkCopied] = useState(false);

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

  const strongYesCount = candidates.filter(c => c.hiringDecision === "strong_yes").length;
  const maybeCount = candidates.filter(c => c.hiringDecision === "maybe").length;
  const assessedCount = candidates.filter(c => c.assessmentStatus === "completed").length;

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(99,102,241,0.15),transparent_36%),linear-gradient(180deg,#050506,#07070a)]" />

      {showAddModal && (
        <AddCandidateModal
          jobId={id}
          token={token!}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchData}
        />
      )}

      <header className="relative z-10 border-b border-white/[0.07] bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/recruit/dashboard" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition">
              <ChevronLeftIcon /> Dashboard
            </Link>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-400 font-medium truncate max-w-[180px] sm:max-w-xs">{job.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const url = `${FRONTEND_URL}/recruit/opportunities/${id}`;
                navigator.clipboard.writeText(url).then(() => {
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                });
                trackEvent("recruiter_profile_viewed", { jobId: id, action: "share_link_copied" });
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                linkCopied
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              {linkCopied ? "Link Copied!" : "Share Listing"}
            </button>
            {candidates.length > 0 && (
              <a
                href={`${API}/recruit/jobs/${id}/export?format=csv`}
                download
                onClick={async (e) => {
                  e.preventDefault();
                  const res = await fetch(`${API}/recruit/jobs/${id}/export?format=csv`, {
                    headers: { Authorization: `Bearer ${token!}` },
                  });
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `${job.title.replace(/[^a-z0-9]/gi, "_")}_candidates.csv`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3.5 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white hover:border-white/20"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </a>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
            >
              <PlusIcon /> Add Candidate
            </button>
          </div>
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
            <div className="flex items-center gap-3 flex-wrap">
              {assessedCount > 0 && (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-2">
                  <p className="text-[10px] text-zinc-500">Assessed</p>
                  <p className="text-sm font-bold text-violet-400">{assessedCount}</p>
                </div>
              )}
              {strongYesCount > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-2">
                  <p className="text-[10px] text-zinc-500">Strong Yes</p>
                  <p className="text-sm font-bold text-emerald-400">{strongYesCount}</p>
                </div>
              )}
              {maybeCount > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-2">
                  <p className="text-[10px] text-zinc-500">Maybe</p>
                  <p className="text-sm font-bold text-amber-400">{maybeCount}</p>
                </div>
              )}
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
          {(["pipeline", "jd", "rubric", "post"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-indigo-500 text-white font-medium"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "jd" ? "Job Description" : tab === "rubric" ? "Scoring Rubric" : tab === "post" ? "Post to Boards" : "Pipeline"}
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
                            <CandidateCard key={c._id} c={c} jobId={id} job={job} token={token!} onUpdate={handleUpdate} onDelete={handleDelete} />
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {byStage.rejected.map(c => (
                        <CandidateCard key={c._id} c={c} jobId={id} job={job} token={token!} onUpdate={handleUpdate} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "jd" && (
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
            <p className="text-sm text-zinc-300 leading-8 whitespace-pre-wrap">{job.generatedJD}</p>
          </div>
        )}

        {activeTab === "rubric" && (
          <div className="space-y-4">
            {job.rubric.map((r, i) => (
              <div key={i} className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{r.name}</h3>
                  <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400">{r.weight} pts</span>
                </div>
                <p className="text-xs text-zinc-500 leading-5">{r.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "post" && (
          <PostToBoardsTab job={job} />
        )}
      </main>
    </div>
  );
}

function PostToBoardsTab({ job }: { job: Job }) {
  const [copiedBoard, setCopiedBoard] = useState<string | null>(null);
  const [linkCopiedPost, setLinkCopiedPost] = useState(false);
  const plyndroxUrl = `${FRONTEND_URL}/recruit/opportunities/${job._id}`;

  const linkedinPost = `🚀 We're Hiring: ${job.title}

${job.seniority ? `Seniority: ${job.seniority}` : ""}
📍 Location: ${job.location} (${job.workMode})
${job.department ? `🏢 Department: ${job.department}` : ""}

${job.generatedJD}

Interested? Apply by clicking the link in our bio or DM us directly.

#Hiring #${job.title.replace(/\s+/g, "")} #Jobs #Careers #NowHiring`;

  const indeedPost = `${job.title}

${job.generatedJD}

Job Type: Full-time
Location: ${job.location}
Work Mode: ${job.workMode}
${job.department ? `Department: ${job.department}` : ""}
Seniority: ${job.seniority || "Mid-level"}`;

  const naukariPost = `Position: ${job.title}
Location: ${job.location}
Work Mode: ${job.workMode}
Experience Level: ${job.seniority || "Mid-level"}
${job.department ? `Department: ${job.department}` : ""}

${job.generatedJD}`;

  const boards = [
    {
      id: "linkedin",
      name: "LinkedIn",
      color: "border-blue-500/20 bg-blue-500/[0.04]",
      badge: "text-blue-400 bg-blue-500/15 border-blue-500/20",
      content: linkedinPost,
      instructions: [
        "Go to LinkedIn → Jobs → Post a free job",
        "Paste the content below into the job description field",
        "Set location, employment type, and seniority",
        "Add your company page and publish",
      ],
      applyUrl: "https://www.linkedin.com/jobs/post/",
    },
    {
      id: "indeed",
      name: "Indeed",
      color: "border-violet-500/20 bg-violet-500/[0.04]",
      badge: "text-violet-400 bg-violet-500/15 border-violet-500/20",
      content: indeedPost,
      instructions: [
        "Go to Indeed Employer → Post a Job",
        "Enter the job title and location",
        "Paste the content below into the job description",
        "Choose sponsored or free posting and publish",
      ],
      applyUrl: "https://employers.indeed.com/",
    },
    {
      id: "naukri",
      name: "Naukri",
      color: "border-amber-500/20 bg-amber-500/[0.04]",
      badge: "text-amber-400 bg-amber-500/15 border-amber-500/20",
      content: naukariPost,
      instructions: [
        "Log in to Naukri RMS → Post a Job",
        "Fill in the role title, location, and experience level",
        "Paste the content below into the job description box",
        "Review and publish",
      ],
      applyUrl: "https://www.naukri.com/recruiter/",
    },
  ];

  function copyContent(boardId: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedBoard(boardId);
    setTimeout(() => setCopiedBoard(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-indigo-300 mb-1">Share your Plyndrox listing</p>
            <p className="text-xs text-zinc-500 leading-relaxed break-all">{plyndroxUrl}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(plyndroxUrl).then(() => {
                setLinkCopiedPost(true);
                setTimeout(() => setLinkCopiedPost(false), 2000);
              });
            }}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
              linkCopiedPost
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-indigo-500/25 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
            }`}
          >
            <CopyIcon />
            {linkCopiedPost ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <p className="text-sm text-zinc-400 leading-relaxed">
          Your AI-generated job description is ready to post. Copy the formatted content for each platform below — each version is optimized for that board&apos;s format and character style.
        </p>
        <p className="text-xs text-zinc-600 mt-2">
          Note: Direct API posting to LinkedIn, Indeed, and Naukri requires OAuth credentials from each platform&apos;s developer program. Until those are connected, use the copy buttons below to paste into each platform.
        </p>
      </div>

      {boards.map(board => (
        <div key={board.id} className={`rounded-3xl border p-5 ${board.color}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${board.badge}`}>{board.name}</span>
              <a href={board.applyUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-400 transition">
                Open {board.name}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
            <button
              onClick={() => copyContent(board.id, board.content)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-1.5 text-xs font-semibold transition ${board.badge} hover:opacity-80`}
            >
              {copiedBoard === board.id ? "Copied!" : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy for {board.name}</>
              )}
            </button>
          </div>

          <div className="mb-4">
            <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wide mb-2">How to post on {board.name}:</p>
            <ol className="space-y-1">
              {board.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                  <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.05] text-[10px] font-bold text-zinc-600 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 max-h-52 overflow-y-auto">
            <p className="text-xs text-zinc-400 leading-6 whitespace-pre-wrap font-mono">{board.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
