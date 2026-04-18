import Link from "next/link";
import ClientSaveButton from "./SaveButton";

const NICHES = [
  "AI, Data, Software & Product Tech",
  "Sales, Business Development & Revenue Roles",
  "Finance, Accounting, Banking & Fintech",
  "Healthcare, Pharma & Allied Medical Workforce",
  "Skilled Blue-Collar, Logistics & Industrial Workforce",
  "Creative, Marketing, Media & Design",
];

const WORK_MODES = ["remote", "hybrid", "onsite"];
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Freelance"];
const SENIORITY_LEVELS = ["Fresher", "Junior", "Mid-level", "Senior", "Lead", "Manager", "Director", "VP", "C-Level"];
const COMPANY_TYPES = ["Startup", "MNC", "Agency", "Product Company", "Consultancy", "Hospital", "Fintech", "Government", "NGO"];
const NOTICE_PERIODS = ["Immediate", "15 days", "30 days", "60 days", "90 days"];
const EDUCATION_LEVELS = ["10th / Diploma", "12th / Higher Secondary", "Bachelor's", "Master's", "MBA", "PhD", "Any"];
const POSTED_WITHIN = [
  { label: "Any time", value: "" },
  { label: "Last 24 hours", value: "1" },
  { label: "Last 3 days", value: "3" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
];

const API = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

type PageSearchParams = Record<string, string | string[] | undefined>;

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
  candidateCount?: number;
  mustHaveSkills?: string;
  createdAt?: string;
};

function paramValue(params: PageSearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatSalary(job: Job) {
  if (!job.salaryMin && !job.salaryMax) return "Salary not disclosed";
  const min = job.salaryMin ? job.salaryMin.toLocaleString("en-IN") : "0";
  const max = job.salaryMax ? job.salaryMax.toLocaleString("en-IN") : "";
  return `${job.salaryCurrency || "INR"} ${min}${max ? ` - ${max}` : "+"}`;
}

function buildQuery(params: PageSearchParams) {
  const query = new URLSearchParams();
  const keys = ["q", "niche", "workMode", "jobType", "seniority", "companyType", "minSalary", "noticePeriod", "educationRequirement", "postedAfterDays", "freshersAllowed", "verifiedCompany"];
  keys.forEach(key => {
    const value = paramValue(params, key);
    if (value && value !== "all") query.set(key, value);
  });
  return query;
}

async function loadJobs(params: PageSearchParams) {
  const query = buildQuery(params);
  const response = await fetch(`${API}/recruit-public/jobs?${query.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load opportunities");
  const data = await response.json();
  return (data.jobs ?? []) as Job[];
}

function checkedLink(params: PageSearchParams, key: "freshersAllowed" | "verifiedCompany") {
  const query = buildQuery(params);
  if (paramValue(params, key) === "true") query.delete(key);
  else query.set(key, "true");
  const qs = query.toString();
  return `/recruit/opportunities${qs ? `?${qs}` : ""}`;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default async function RecruitOpportunitiesPage({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  const params = await searchParams;
  const jobs = await loadJobs(params);
  const q = paramValue(params, "q");
  const niche = paramValue(params, "niche") || "all";
  const workMode = paramValue(params, "workMode") || "all";
  const jobType = paramValue(params, "jobType") || "all";
  const seniority = paramValue(params, "seniority") || "all";
  const companyType = paramValue(params, "companyType") || "all";
  const minSalary = paramValue(params, "minSalary");
  const noticePeriod = paramValue(params, "noticePeriod") || "all";
  const educationRequirement = paramValue(params, "educationRequirement") || "all";
  const postedAfterDays = paramValue(params, "postedAfterDays") || "";
  const freshersAllowed = paramValue(params, "freshersAllowed") === "true";
  const verifiedCompany = paramValue(params, "verifiedCompany") === "true";

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/recruit" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a66c2] text-sm font-black text-white">R</span>
            <span>
              <span className="block text-sm font-bold">Recruit AI</span>
              <span className="block text-[11px] text-slate-500">India Jobs Network</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/recruit/opportunities" className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#0a66c2] bg-blue-50">Jobs</Link>
            <Link href="/recruit/saved-jobs" className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Saved</Link>
            <Link href="/recruit/my-applications" className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">My Applications</Link>
            <Link href="/recruit/profile" className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">My Profile</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/recruit/dashboard" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">For recruiters</Link>
            <Link href="/recruit/jobs/new" className="rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#004182] transition">Post a job</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20">
          <h1 className="text-lg font-bold">Find your next role</h1>
          <p className="mt-1 text-sm text-slate-500">Search across six high-value India-focused niches.</p>

          <form className="mt-5 space-y-4" action="/recruit/opportunities">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search</label>
              <input name="q" defaultValue={q} placeholder="Role, skill, company, city" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Niche</label>
              <select name="niche" defaultValue={niche} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                <option value="all">All niches</option>
                {NICHES.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Work mode</label>
                <select name="workMode" defaultValue={workMode} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="all">All</option>
                  {WORK_MODES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Job type</label>
                <select name="jobType" defaultValue={jobType} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="all">All</option>
                  {JOB_TYPES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Seniority</label>
                <select name="seniority" defaultValue={seniority} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="all">Any</option>
                  {SENIORITY_LEVELS.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Company type</label>
                <select name="companyType" defaultValue={companyType} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="all">Any</option>
                  {COMPANY_TYPES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Min salary (₹/yr)</label>
              <input type="number" name="minSalary" defaultValue={minSalary} placeholder="e.g. 600000" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Notice period</label>
                <select name="noticePeriod" defaultValue={noticePeriod} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="all">Any</option>
                  {NOTICE_PERIODS.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Education</label>
                <select name="educationRequirement" defaultValue={educationRequirement} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="all">Any</option>
                  {EDUCATION_LEVELS.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Posted within</label>
              <select name="postedAfterDays" defaultValue={postedAfterDays} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                {POSTED_WITHIN.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>

            <button className="w-full rounded-xl bg-[#0a66c2] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#004182] transition">Apply filters</button>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <Link href={checkedLink(params, "freshersAllowed")} className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${freshersAllowed ? "border-[#0a66c2] bg-blue-50 text-[#0a66c2]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                ✓ Freshers allowed
              </Link>
              <Link href={checkedLink(params, "verifiedCompany")} className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${verifiedCompany ? "border-[#0a66c2] bg-blue-50 text-[#0a66c2]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                ✓ Verified company only
              </Link>
            </div>

            <Link href="/recruit/opportunities" className="block text-center text-xs text-slate-400 hover:text-slate-700 transition">Clear all filters</Link>
          </form>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Open opportunities</h2>
              <p className="text-sm text-slate-500">{jobs.length} role{jobs.length === 1 ? "" : "s"} found</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/recruit/saved-jobs" className="text-xs font-semibold text-slate-500 hover:text-[#0a66c2] transition">Saved jobs</Link>
              <Link href="/recruit/my-applications" className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">My Applications</Link>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h3 className="font-semibold">No jobs match these filters</h3>
              <p className="mt-1 text-sm text-slate-500">Try changing niche, salary, work mode, or search terms.</p>
              <Link href="/recruit/opportunities" className="mt-4 inline-block text-sm font-semibold text-[#0a66c2] hover:underline">Clear filters</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job._id} className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0a66c2]/40 hover:shadow-md">
                  <Link href={`/recruit/opportunities/${job._id}`} className="absolute inset-0 rounded-2xl" />
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-[#0a66c2]">
                      {(job.companyName || job.title).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-[#0a66c2] transition">{job.title}</h3>
                        {job.verifiedCompany && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">Verified</span>}
                        {job.freshersAllowed && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">Freshers welcome</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {job.companyName || "Company"}
                        {job.companyType ? ` · ${job.companyType}` : ""}
                        {" · "}{job.location || "India"}
                        {" · "}{job.workMode || "flexible"}
                        {" · "}{job.jobType || "Full-time"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{job.niche || job.department || "General hiring"}</p>
                      {job.mustHaveSkills && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {job.mustHaveSkills.split(",").slice(0, 4).map(s => s.trim()).filter(Boolean).map(s => (
                            <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{formatSalary(job)}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          {job.experienceMin ?? 0}{job.experienceMax ? `-${job.experienceMax}` : "+"} yrs exp
                        </span>
                        {job.seniority && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.seniority}</span>}
                        {job.noticePeriod && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.noticePeriod} notice</span>}
                        {job.educationRequirement && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.educationRequirement}</span>}
                        {job.createdAt && <span className="text-slate-400 flex items-center">{timeAgo(job.createdAt)}</span>}
                      </div>
                    </div>
                    <div className="relative z-10 shrink-0 self-start">
                      <ClientSaveButton
                        jobId={job._id}
                        title={job.title}
                        companyName={job.companyName}
                        location={job.location}
                        workMode={job.workMode}
                        jobType={job.jobType}
                        niche={job.niche}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
