import Link from "next/link";
import ApplyForm from "./ApplyForm";
import RecruitHeader from "@/components/RecruitHeader";
import ClientSaveButton from "../SaveButton";
import ShareJobButton from "./ShareJobButton";
import RecentlyViewedTracker from "./RecentlyViewedTracker";

const API = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

type Job = {
  _id: string;
  title: string;
  niche?: string;
  companyName?: string;
  companyType?: string;
  jobType?: string;
  department?: string;
  seniority?: string;
  location?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceMin?: number;
  experienceMax?: number;
  educationRequirement?: string;
  noticePeriod?: string;
  freshersAllowed?: boolean;
  verifiedCompany?: boolean;
  generatedJD?: string;
  mustHaveSkills?: string;
  niceToHaveSkills?: string;
};

function salary(job: Job) {
  if (!job.salaryMin && !job.salaryMax) return "Salary not disclosed";
  return `${job.salaryCurrency || "INR"} ${job.salaryMin?.toLocaleString("en-IN") ?? "0"}${job.salaryMax ? `–${job.salaryMax.toLocaleString("en-IN")}` : "+"}`;
}

function splitLines(value?: string) {
  return (value || "").split(/[\n,]/).map(item => item.trim()).filter(Boolean);
}

async function loadJob(id: string) {
  try {
    const res = await fetch(`${API}/recruit-public/jobs/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.job ?? null) as Job | null;
  } catch {
    return null;
  }
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await loadJob(id);

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <RecruitHeader />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-slate-900">Opportunity not found</h1>
          <p className="mt-2 text-sm text-slate-500">This job may have been closed or removed.</p>
          <Link href="/recruit/opportunities" className="mt-5 inline-block rounded-full bg-[#0a66c2] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#004182] transition">
            Browse all jobs
          </Link>
        </div>
      </div>
    );
  }

  const mustHave = splitLines(job.mustHaveSkills);
  const niceToHave = splitLines(job.niceToHaveSkills);

  const tags = [
    { label: salary(job), color: "bg-slate-100 text-slate-700" },
    { label: job.jobType || "Full-time", color: "bg-slate-100 text-slate-700" },
    { label: job.seniority || "Open level", color: "bg-slate-100 text-slate-700" },
    { label: `${job.experienceMin ?? 0}${job.experienceMax ? `–${job.experienceMax}` : "+"} yrs exp`, color: "bg-slate-100 text-slate-700" },
    ...(job.workMode ? [{ label: job.workMode.charAt(0).toUpperCase() + job.workMode.slice(1), color: "bg-blue-50 text-[#0a66c2]" }] : []),
    ...(job.freshersAllowed ? [{ label: "Freshers welcome", color: "bg-amber-50 text-amber-700" }] : []),
    ...(job.verifiedCompany ? [{ label: "✓ Verified company", color: "bg-green-50 text-green-700" }] : []),
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <RecruitHeader />
      <RecentlyViewedTracker
        job={{
          jobId: id,
          title: job.title,
          companyName: job.companyName,
          location: job.location,
          workMode: job.workMode,
          jobType: job.jobType,
          niche: job.niche,
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/recruit/opportunities" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0a66c2] transition py-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>
          Back to jobs
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start">
        <section className="space-y-4 mt-0">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/40 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-xl font-black text-[#0a66c2]">
                {(job.companyName || job.title).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {job.verifiedCompany && <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">✓ Verified company</span>}
                  {job.freshersAllowed && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Freshers welcome</span>}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">{job.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{job.companyName || "Company"}</span>
                  {job.companyType ? ` · ${job.companyType}` : ""}
                  {` · ${job.location || "India"}`}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{job.niche || job.department}</p>
              </div>
              <div className="relative z-10 flex shrink-0 items-center gap-2">
                <ClientSaveButton
                  jobId={id}
                  title={job.title}
                  companyName={job.companyName}
                  location={job.location}
                  workMode={job.workMode}
                  jobType={job.jobType}
                  niche={job.niche}
                />
                <ShareJobButton title={job.title} companyName={job.companyName} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <span key={i} className={`rounded-full px-3 py-1 text-xs font-semibold ${t.color}`}>{t.label}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">Role overview</h2>
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.generatedJD || "The recruiter has not published a full job description yet."}
            </div>
          </div>

          {(mustHave.length > 0 || niceToHave.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0a66c2] text-white text-[10px]">✓</span>
                  Must-have skills
                </h2>
                <ul className="space-y-2">
                  {(mustHave.length ? mustHave : ["Relevant experience for this role"]).map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0a66c2] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px]">+</span>
                  Good-to-have
                </h2>
                <ul className="space-y-2">
                  {(niceToHave.length ? niceToHave : ["Strong communication and ownership"]).map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Job details</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
              {[
                { label: "Niche", value: job.niche || job.department || "General" },
                { label: "Company type", value: job.companyType || "Not specified" },
                { label: "Education", value: job.educationRequirement || "Flexible" },
                { label: "Notice period", value: job.noticePeriod || "Flexible" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="font-medium text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Trust signals</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-900">Free application</p>
                <p className="mt-1 text-xs text-slate-500">Candidates are not charged to apply.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-900">{job.salaryMin || job.salaryMax ? "Salary visible" : "Salary not disclosed"}</p>
                <p className="mt-1 text-xs text-slate-500">Salary transparency is shown wherever recruiters provide it.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-900">{job.verifiedCompany ? "Verified company" : "Company info shown"}</p>
                <p className="mt-1 text-xs text-slate-500">Review company and role details before applying.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Apply faster with your saved profile</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Save your profile once and Plyndrox can reuse your name, contact details, and resume text when you apply to similar jobs.
            </p>
            <Link href="/recruit/profile" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0a66c2] shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-50">
              Update seeker profile
            </Link>
          </div>
        </section>

        <div className="mt-4 lg:mt-0 lg:sticky lg:top-24">
          <ApplyForm jobId={id} jobTitle={job.title} companyName={job.companyName} />
        </div>
      </main>
    </div>
  );
}
