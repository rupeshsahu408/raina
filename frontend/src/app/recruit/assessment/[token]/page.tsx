"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Question = { id: string; text: string };

type AssessmentData = {
  completed: boolean;
  candidateName: string;
  jobTitle?: string;
  jobDepartment?: string;
  jobLocation?: string;
  questions?: Question[];
};

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function AssessmentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/recruit-public/assessment/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Assessment not found.");
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentQ]);

  const handleAnswerChange = useCallback((qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }, []);

  function recordTimingAndAdvance() {
    const questions = data?.questions ?? [];
    const q = questions[currentQ];
    if (!q) return;
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    setTimings(prev => ({ ...prev, [q.id]: elapsed }));
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    }
  }

  function goBack() {
    if (currentQ > 0) setCurrentQ(c => c - 1);
  }

  async function handleSubmit() {
    const questions = data?.questions ?? [];
    const q = questions[currentQ];
    const elapsed = q ? Math.round((Date.now() - questionStartRef.current) / 1000) : 0;
    const finalTimings = q ? { ...timings, [q.id]: elapsed } : timings;

    const answerPayload = questions.map(question => ({
      questionId: question.id,
      answer: answers[question.id] ?? "",
      timeTakenSeconds: finalTimings[question.id] ?? 0,
    }));

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/recruit-public/assessment/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerPayload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed.");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-500 text-sm">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
          </div>
          <p className="text-white font-semibold mb-1">Assessment not found</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (data.completed || submitted) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckIcon />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {submitted ? "Assessment Submitted!" : "Already Completed"}
          </h1>
          <p className="text-zinc-400 text-sm leading-6">
            {submitted
              ? `Thank you, ${data.candidateName}. Your answers have been received and our AI will analyze them shortly. The recruiting team will be in touch.`
              : `This assessment has already been completed. Thank you for your time, ${data.candidateName}.`}
          </p>
          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
            <p className="text-xs text-zinc-600">Powered by</p>
            <p className="text-sm font-bold text-indigo-400 mt-0.5">Plyndrox Recruit AI</p>
          </div>
        </div>
      </div>
    );
  }

  const questions = data.questions ?? [];
  const totalQ = questions.length;
  const currentQuestion = questions[currentQ];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";
  const progress = totalQ > 0 ? ((currentQ) / totalQ) * 100 : 0;
  const isLastQuestion = currentQ === totalQ - 1;
  const allAnswered = questions.every(q => (answers[q.id] ?? "").trim().length > 0);

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.1),transparent_50%),radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.06),transparent_50%)]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-white/[0.06] bg-black/20 backdrop-blur-xl px-6 py-4">
          <div className="mx-auto max-w-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10">
                <SparkIcon />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wide">Recruit AI</p>
                <p className="text-[10px] text-zinc-600">by Plyndrox</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-zinc-500 font-medium">{data.jobTitle}</p>
              {data.jobLocation && <p className="text-[10px] text-zinc-700">{data.jobLocation}</p>}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-zinc-500">
                  Question {currentQ + 1} of {totalQ}
                </p>
                <p className="text-xs text-zinc-600">~10 minutes total</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i < currentQ
                        ? "bg-indigo-400"
                        : i === currentQ
                        ? "bg-white"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {currentQ === 0 && (
              <div className="mb-6 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.06] px-5 py-4">
                <p className="text-sm text-indigo-300 font-medium mb-1">
                  Welcome, {data.candidateName}
                </p>
                <p className="text-xs text-zinc-500 leading-5">
                  This is a written assessment for the <span className="text-zinc-400">{data.jobTitle}</span> role.
                  Answer each question in your own words — be specific and draw from real experience.
                  There are no trick questions. This takes approximately 10 minutes.
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 mb-6">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-[11px] font-bold text-indigo-400">
                  {currentQ + 1}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Question</span>
              </div>

              <p className="text-base font-medium text-white leading-7 mb-5 mt-3">
                {currentQuestion?.text}
              </p>

              <div className="mb-2">
                <p className="text-[10px] text-zinc-700 mb-2 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Answer in your own words — AI will evaluate your thinking, clarity, and real experience
                </p>
                <textarea
                  value={currentAnswer}
                  onChange={e => currentQuestion && handleAnswerChange(currentQuestion.id, e.target.value)}
                  rows={7}
                  placeholder="Write your answer here. Be specific — mention real situations, tools, decisions, and outcomes you were involved in..."
                  className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 resize-none leading-6"
                />
              </div>

              {currentAnswer.trim().length > 0 && currentAnswer.trim().length < 80 && (
                <p className="text-[11px] text-amber-500/70 mt-1">
                  Try to be more detailed — a stronger answer helps us evaluate you better.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={goBack}
                disabled={currentQ === 0}
                className="flex items-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-2.5 text-sm text-zinc-500 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon /> Back
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !allAnswered}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckIcon /> Submit Assessment
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={recordTimingAndAdvance}
                  disabled={!currentAnswer.trim()}
                  className="flex items-center gap-1.5 rounded-2xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRightIcon />
                </button>
              )}
            </div>

            {isLastQuestion && !allAnswered && (
              <p className="text-center text-xs text-zinc-600 mt-3">
                Please answer all questions before submitting.
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.07] px-4 py-3">
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-white/[0.05] px-6 py-4">
          <div className="mx-auto max-w-2xl flex items-center justify-between">
            <p className="text-[10px] text-zinc-700">Your responses are securely processed by AI</p>
            <p className="text-[10px] text-zinc-700">Plyndrox Recruit AI</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
