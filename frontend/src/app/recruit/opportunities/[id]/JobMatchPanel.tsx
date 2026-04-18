"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type MatchResult = {
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  profileSuggestions: string[];
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-green-600" :
    score >= 50 ? "text-amber-500" :
    "text-slate-400";
  const bg =
    score >= 75 ? "bg-green-50 border-green-200" :
    score >= 50 ? "bg-amber-50 border-amber-200" :
    "bg-slate-50 border-slate-200";
  const label =
    score >= 75 ? "Strong match" :
    score >= 50 ? "Partial match" :
    "Low match";

  return (
    <div className={`inline-flex flex-col items-center justify-center rounded-2xl border px-5 py-3 ${bg}`}>
      <span className={`text-3xl font-black ${color}`}>{score}%</span>
      <span className={`text-[11px] font-bold ${color} mt-0.5`}>{label}</span>
    </div>
  );
}

export default function JobMatchPanel({ jobId }: { jobId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "no-profile" | "error">("idle");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const hasResume = Boolean(localStorage.getItem("recruit_resume_text")?.trim());
      const hasSkills = (() => {
        try {
          const raw = localStorage.getItem("recruit_seeker_profile");
          if (!raw) return false;
          const p = JSON.parse(raw);
          return Array.isArray(p.skills) && p.skills.length > 0;
        } catch { return false; }
      })();
      if (!hasResume && !hasSkills) setState("no-profile");
    } catch { /* ignore */ }
  }, []);

  async function analyze() {
    setState("loading");
    setError("");
    try {
      let skills: string[] = [];
      let resumeText = "";
      let preferredNiche = "";
      let preferredWorkMode = "";
      let preferredLocation = "";
      let preferredSalaryMin: number | undefined;
      let preferredSalaryMax: number | undefined;

      try {
        resumeText = localStorage.getItem("recruit_resume_text") || "";
        const raw = localStorage.getItem("recruit_seeker_profile");
        if (raw) {
          const p = JSON.parse(raw);
          skills = Array.isArray(p.skills) ? p.skills : [];
          preferredNiche = p.preferredNiche || "";
          preferredWorkMode = p.preferredWorkMode || "";
          preferredLocation = p.preferredLocation || "";
          preferredSalaryMin = p.preferredSalaryMin ? Number(p.preferredSalaryMin) : undefined;
          preferredSalaryMax = p.preferredSalaryMax ? Number(p.preferredSalaryMax) : undefined;
        }
      } catch { /* ignore */ }

      const res = await fetch(`/recruit-public/jobs/${jobId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, resumeText, preferredNiche, preferredWorkMode, preferredLocation, preferredSalaryMin, preferredSalaryMax }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Analysis failed.");
      }

      const data: MatchResult = await res.json();
      setResult(data);
      setState("done");
    } catch (e: any) {
      setError(e.message);
      setState("error");
    }
  }

  if (state === "no-profile") {
    return (
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0a66c2] text-white text-base">✨</div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">See why this job matches you</h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Set up your seeker profile once and get an instant AI analysis of how well any job fits your skills, preferences, and salary expectations.
            </p>
            <Link
              href="/recruit/profile"
              className="mt-3 inline-flex rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#004182] transition"
            >
              Set up profile to unlock match
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0a66c2] text-white text-base">✨</div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-900">Why this job matches you</h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Get an AI-powered breakdown of how well this role fits your profile — including match reasons, skill gaps, and what to improve.
            </p>
            <button
              onClick={analyze}
              className="mt-3 inline-flex rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#004182] transition"
            >
              Analyze my match
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 shadow-sm">
        <div className="flex items-center gap-3 text-[#0a66c2]">
          <svg className="animate-spin h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-slate-900">Analyzing your match…</p>
            <p className="text-xs text-slate-500 mt-0.5">Comparing your profile to this role's requirements</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <p className="text-sm font-semibold text-red-700">Could not analyze match</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <button onClick={() => setState("idle")} className="mt-3 text-xs font-semibold text-[#0a66c2] hover:underline">Try again</button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">✨</span>
            <h2 className="text-sm font-bold text-slate-900">Your match score</h2>
          </div>
          <p className="text-xs text-slate-500">Based on your skills, preferences, and resume</p>
        </div>
        <ScoreRing score={result.matchScore} />
      </div>

      {result.matchReasons.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Why this job fits you</h3>
          <ul className="space-y-2">
            {result.matchReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-[10px] font-bold">✓</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.missingSkills.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Skills to develop</h3>
          <div className="flex flex-wrap gap-1.5">
            {result.missingSkills.map((skill, i) => (
              <span key={i} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.profileSuggestions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">How to improve your chances</h3>
          <ul className="space-y-2">
            {result.profileSuggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                <span className="mt-0.5 text-[#0a66c2] font-bold shrink-0">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <Link href="/recruit/profile" className="text-xs font-semibold text-[#0a66c2] hover:underline">Update your profile</Link>
        <button onClick={analyze} className="text-xs text-slate-400 hover:text-slate-600 transition">Refresh analysis</button>
      </div>
    </div>
  );
}
