"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl, readApiJson } from "@/lib/api";

type Mode = "feedback" | "report";
type Status = "idle" | "submitting" | "success" | "error";

const productAreas = [
  "Overall platform",
  "Personal AI",
  "Bihar AI",
  "Business AI / WhatsApp",
  "Inbox AI",
  "Payable AI",
  "Recruit AI",
  "Smart Ledger",
  "Account / Login",
  "Other",
];

const feedbackCategories = ["Suggestion", "Feature request", "Improvement idea", "General experience", "Design / usability", "Other"];
const reportKinds = ["Page not loading", "Login issue", "Button or form not working", "Wrong information", "Slow performance", "Visual/layout issue", "Payment or finance issue", "Other"];
const severityOptions = ["Low", "Medium", "High", "Critical"];

const emptyForm = {
  name: "",
  email: "",
  productArea: "Overall platform",
  category: "Suggestion",
  title: "",
  message: "",
  page: "",
  errorKind: "Page not loading",
  severity: "Medium",
  steps: "",
  expected: "",
  actual: "",
};

function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function BugIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m8 2 1.9 1.9" /><path d="M14.1 3.9 16 2" /><path d="M9 7.5h6" /><path d="M7 10h10" /><path d="M5 13h14" /><path d="M12 20v-9" /><path d="M8 20h8" /><path d="M6 10.5C6 6.9 8.7 4 12 4s6 2.9 6 6.5V14c0 3.3-2.7 6-6 6s-6-2.7-6-6Z" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 28 }).map((_, index) => (
        <span
          key={index}
          className="absolute top-4 h-2 w-2 animate-[confetti-pop_1.4s_ease-out_forwards] rounded-full"
          style={{
            left: `${8 + ((index * 13) % 84)}%`,
            background: ["#4f46e5", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9"][index % 5],
            animationDelay: `${(index % 8) * 0.045}s`,
            transform: `translateY(0) rotate(${index * 24}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function FeedbackReportSection() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const isReport = mode === "report";
  const modalTitle = isReport ? "Report an error" : "Share feedback";
  const modalSubtitle = isReport ? "Tell us where the issue happened so we can fix it faster." : "Tell us what to improve or what feature you want next.";

  const pageOptions = useMemo(() => [
    typeof window !== "undefined" ? window.location.pathname : "/",
    "/",
    "/login",
    "/signup",
    "/features",
    "/contact",
    "/chat",
    "/business-ai",
    "/inbox",
    "/payables",
    "/recruit",
    "/ledger",
    "/bihar-ai",
    "Other",
  ], []);

  useEffect(() => {
    if (!mode) return;
    setStatus("idle");
    setError("");
    setForm({
      ...emptyForm,
      category: mode === "feedback" ? "Suggestion" : "",
      page: typeof window !== "undefined" ? window.location.pathname : "",
    });
  }, [mode]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function closeModal() {
    setMode(null);
    setStatus("idle");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!mode) return;
    setStatus("submitting");
    setError("");
    try {
      const payload = {
        ...form,
        type: mode,
        currentUrl: typeof window !== "undefined" ? window.location.href : "",
        browserInfo: typeof navigator !== "undefined" ? navigator.userAgent : "",
        category: isReport ? "" : form.category,
      };
      const response = await fetch(apiUrl("/support/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readApiJson<{ error?: string; message?: string }>(response);
      if (!response.ok) throw new Error(data.error || "Submission failed.");
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const canSubmit = form.email.trim() && form.title.trim() && form.message.trim() && (!isReport || (form.page.trim() && form.errorKind.trim()));

  return (
    <section id="feedback-report" className="relative overflow-hidden bg-white py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.08),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              <SparkIcon className="h-4 w-4" />
              Help shape Plyndrox
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              Send feedback or report an issue in seconds.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-600">
              Tell us what to build next, what can be improved, or where something broke. Your message goes directly to the Plyndrox team.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("feedback")}
              className="group rounded-3xl border border-indigo-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <SparkIcon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-xl font-black text-zinc-950">Give Feedback</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Suggestions, feature requests, product ideas, and general experience notes.
              </p>
              <span className="mt-6 inline-flex text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition">Open feedback form →</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("report")}
              className="group rounded-3xl border border-rose-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <BugIcon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-xl font-black text-zinc-950">Report Error</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Share the page, error type, steps, expected result, and actual problem.
              </p>
              <span className="mt-6 inline-flex text-sm font-bold text-rose-600 group-hover:translate-x-1 transition">Open report form →</span>
            </button>
          </div>
        </div>
      </div>

      {mode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {status === "success" && <Confetti />}
            <div className={`sticky top-0 z-10 border-b border-zinc-100 bg-white/95 px-6 py-5 backdrop-blur ${isReport ? "shadow-rose-50" : "shadow-indigo-50"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${isReport ? "text-rose-600" : "text-indigo-600"}`}>{isReport ? "Error report" : "Feedback"}</p>
                  <h3 className="mt-1 text-2xl font-black text-zinc-950">{modalTitle}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{modalSubtitle}</p>
                </div>
                <button type="button" onClick={closeModal} className="rounded-full border border-zinc-200 p-2 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950">
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {status === "success" ? (
              <div className="relative px-6 py-14 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-indigo-100 text-emerald-600 shadow-inner">
                  <SparkIcon className="h-9 w-9 animate-pulse" />
                </div>
                <h4 className="mt-6 text-2xl font-black text-zinc-950">Thank you, we received it.</h4>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500">
                  Your {isReport ? "error report" : "feedback"} has been sent directly to our team. We appreciate you helping improve Plyndrox.
                </p>
                <button type="button" onClick={closeModal} className="mt-8 rounded-full bg-zinc-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-zinc-800">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Name</span>
                    <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" className="h-12 w-full rounded-2xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Email *</span>
                    <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-2xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Product area</span>
                    <select value={form.productArea} onChange={(event) => updateField("productArea", event.target.value)} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50">
                      {productAreas.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  {isReport ? (
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Error type *</span>
                      <select required value={form.errorKind} onChange={(event) => updateField("errorKind", event.target.value)} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-50">
                        {reportKinds.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  ) : (
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Feedback type</span>
                      <select value={form.category} onChange={(event) => updateField("category", event.target.value)} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50">
                        {feedbackCategories.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  )}
                </div>

                {isReport && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Page where it happened *</span>
                      <select required value={form.page} onChange={(event) => updateField("page", event.target.value)} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-50">
                        {Array.from(new Set(pageOptions)).map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Impact</span>
                      <select value={form.severity} onChange={(event) => updateField("severity", event.target.value)} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-50">
                        {severityOptions.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  </div>
                )}

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">{isReport ? "Short issue title *" : "Short title *"}</span>
                  <input required maxLength={140} value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder={isReport ? "Example: Login button keeps loading" : "Example: Add voice replies to Inbox AI"} className="h-12 w-full rounded-2xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">{isReport ? "What happened? *" : "Your feedback *"}</span>
                  <textarea required rows={5} value={form.message} onChange={(event) => updateField("message", event.target.value)} placeholder={isReport ? "Describe the error, what you were trying to do, and what you saw." : "Share your suggestion, feature request, or experience feedback."} className="w-full resize-none rounded-2xl border border-zinc-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
                </label>

                {isReport && (
                  <div className="space-y-4 rounded-3xl border border-rose-100 bg-rose-50/50 p-4">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-rose-700">Steps to reproduce</span>
                      <textarea rows={3} value={form.steps} onChange={(event) => updateField("steps", event.target.value)} placeholder="1. Open login page  2. Enter email  3. Click login..." className="w-full resize-none rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-rose-700">Expected result</span>
                        <input value={form.expected} onChange={(event) => updateField("expected", event.target.value)} placeholder="What should happen?" className="h-12 w-full rounded-2xl border border-rose-100 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-rose-700">Actual result</span>
                        <input value={form.actual} onChange={(event) => updateField("actual", event.target.value)} placeholder="What happened instead?" className="h-12 w-full rounded-2xl border border-rose-100 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
                      </label>
                    </div>
                  </div>
                )}

                {error && <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeModal} className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={!canSubmit || status === "submitting"} className={`rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${isReport ? "bg-rose-600 shadow-rose-100 hover:bg-rose-700" : "bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700"}`}>
                    {status === "submitting" ? "Sending..." : isReport ? "Send report" : "Send feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}