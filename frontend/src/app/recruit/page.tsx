"use client";

import Link from "next/link";

const NICHES = [
  "AI, Data, Software & Product Tech",
  "Sales, Business Development & Revenue Roles",
  "Finance, Accounting, Banking & Fintech",
  "Healthcare, Pharma & Allied Medical Workforce",
  "Skilled Blue-Collar, Logistics & Industrial Workforce",
  "Creative, Marketing, Media & Design",
];

const SEEKER_FILTERS = [
  "Niche", "Role", "Location", "Remote / Hybrid / On-site", "Salary range", "Experience", "Job type", "Company type", "Skills", "Education", "Notice period", "Freshers allowed", "Verified company", "Posted date",
];

const CREATOR_TOOLS = [
  "Company profile", "AI job posting", "Applicant pipeline", "Candidate scoring", "Advanced candidate filters", "Talent pool", "Interview briefs", "Offer letters",
];

function ArrowRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
}

function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

function SparkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;
}

export default function RecruitLandingPage() {
  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a66c2] text-sm font-black text-white">R</span>
            <span>
              <span className="block text-sm font-bold tracking-tight">Recruit AI</span>
              <span className="block text-[11px] text-slate-500">Plyndrox Jobs Network</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/recruit/opportunities" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Find jobs</Link>
            <Link href="/recruit/dashboard" className="hidden rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex">Recruiter dashboard</Link>
            <Link href="/recruit/jobs/new" className="rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#004182]">Post a job</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-bold text-[#0a66c2] shadow-sm">
              <SparkIcon /> India-first hiring network across 6 niches
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              LinkedIn-style networking meets serious job search for India.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Recruit AI is becoming a two-sided professional platform for job seekers, recruiters, and companies: deep job filtering, AI-powered matching, public opportunities, and SaaS-grade hiring workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/recruit/opportunities" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a66c2] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#004182]">
                Explore jobs <ArrowRightIcon />
              </Link>
              <Link href="/recruit/jobs/new" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50">
                Create a job
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <SearchIcon /> Search role, skill, city, company
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["Niche", "Salary", "Experience", "Verified", "Remote", "Freshers"].map(item => (
                  <div key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">{item}</div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {["Senior AI Engineer", "B2B Sales Manager", "Healthcare Operations Lead"].map((title, index) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{title}</p>
                      <p className="mt-1 text-sm text-slate-500">{NICHES[index]} · Bengaluru · Hybrid</p>
                    </div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0a66c2]">Six focused markets</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Built niche-first, not generic-first</h2>
              </div>
              <Link href="/recruit/opportunities" className="text-sm font-bold text-[#0a66c2]">Browse opportunities</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {NICHES.map(niche => (
                <div key={niche} className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="font-bold text-slate-900">{niche}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Dedicated jobs, filters, profiles, and hiring workflows for this market.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0a66c2]"><SearchIcon /></div>
            <h2 className="mt-5 text-xl font-bold">For job seekers</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">Find better opportunities with the deep filtering you specifically wanted: salary, work mode, niche, skills, experience, company type, freshness, verification, and fresher-friendly jobs.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SEEKER_FILTERS.map(item => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item}</span>)}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0a66c2]"><UsersIcon /></div>
            <h2 className="mt-5 text-xl font-bold">For job creators</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">Companies and recruiters get a SaaS-style hiring command center: job creation, applicant management, candidate scoring, talent pool, and AI hiring tools.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {CREATOR_TOOLS.map(item => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item}</span>)}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
