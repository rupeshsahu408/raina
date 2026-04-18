import Link from "next/link";

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
  ["q", "niche", "workMode", "jobType", "minSalary", "freshersAllowed", "verifiedCompany"].forEach(key => {
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

export default async function RecruitOpportunitiesPage({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  const params = await searchParams;
  const jobs = await loadJobs(params);
  const q = paramValue(params, "q");
  const niche = paramValue(params, "niche") || "all";
  const workMode = paramValue(params, "workMode") || "all";
  const jobType = paramValue(params, "jobType") || "all";
  const minSalary = paramValue(params, "minSalary");
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
          <div className="flex items-center gap-2">
            <Link href="/recruit/dashboard" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">For recruiters</Link>
            <Link href="/recruit/jobs/new" className="rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#004182]">Post a job</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-lg font-bold">Find your next role</h1>
          <p className="mt-1 text-sm text-slate-500">Search across six high-value India-focused niches with deep filters.</p>

          <form className="mt-5 space-y-4" action="/recruit/opportunities">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search</label>
              <input name="q" defaultValue={q} placeholder="Role, skill, company, city" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Niche</label>
              <select name="niche" defaultValue={niche} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]">
                <option value="all">All niches</option>
                {NICHES.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Work mode</label>
                <select name="workMode" defaultValue={workMode} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]">
                  <option value="all">All</option>
                  {WORK_MODES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Job type</label>
                <select name="jobType" defaultValue={jobType} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]">
                  <option value="all">All</option>
                  {JOB_TYPES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Minimum salary</label>
              <input type="number" name="minSalary" defaultValue={minSalary} placeholder="e.g. 600000" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]" />
            </div>
            <button className="w-full rounded-xl bg-[#0a66c2] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#004182]">Apply filters</button>
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <Link href={checkedLink(params, "freshersAllowed")} className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold ${freshersAllowed ? "border-[#0a66c2] bg-blue-50 text-[#0a66c2]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Freshers allowed</Link>
              <Link href={checkedLink(params, "verifiedCompany")} className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold ${verifiedCompany ? "border-[#0a66c2] bg-blue-50 text-[#0a66c2]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Verified company only</Link>
            </div>
          </form>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Open opportunities</h2>
              <p className="text-sm text-slate-500">{jobs.length} role{jobs.length === 1 ? "" : "s"} found</p>
            </div>
            <Link href="/recruit" className="text-sm font-semibold text-[#0a66c2]">Platform overview</Link>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h3 className="font-semibold">No jobs match these filters</h3>
              <p className="mt-1 text-sm text-slate-500">Try changing niche, salary, work mode, or search terms.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <Link key={job._id} href={`/recruit/opportunities/${job._id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0a66c2]/40 hover:shadow-md">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-[#0a66c2]">{(job.companyName || job.title).slice(0, 1).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{job.title}</h3>
                        {job.verifiedCompany && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">Verified</span>}
                        {job.freshersAllowed && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Freshers</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{job.companyName || "Company"} · {job.location || "India"} · {job.workMode || "flexible"} · {job.jobType || "Full-time"}</p>
                      <p className="mt-2 text-xs text-slate-500">{job.niche || job.department || "General hiring"}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{formatSalary(job)}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.experienceMin ?? 0}-{job.experienceMax ?? "∞"} yrs</span>
                        {job.noticePeriod && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.noticePeriod}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
