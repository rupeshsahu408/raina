import Link from "next/link";
import ApplyForm from "./ApplyForm";

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
  return `${job.salaryCurrency || "INR"} ${job.salaryMin?.toLocaleString("en-IN") ?? "0"}${job.salaryMax ? ` - ${job.salaryMax.toLocaleString("en-IN")}` : "+"}`;
}

function splitLines(value?: string) {
  return (value || "").split("\n").map(item => item.trim()).filter(Boolean);
}

async function loadJob(id: string) {
  const res = await fetch(`${API}/recruit-public/jobs/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.job ?? null) as Job | null;
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await loadJob(id);

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f3f6f8] p-10 text-center">
        <h1 className="text-xl font-bold">Opportunity not found</h1>
        <Link href="/recruit/opportunities" className="mt-3 inline-block text-sm font-semibold text-[#0a66c2]">Back to opportunities</Link>
      </div>
    );
  }

  const mustHave = splitLines(job.mustHaveSkills);
  const niceToHave = splitLines(job.niceToHaveSkills);

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/recruit/opportunities" className="text-sm font-semibold text-[#0a66c2]">← Back to jobs</Link>
          <Link href="/recruit" className="text-sm font-bold text-slate-700">Recruit AI</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[#0a66c2]">{(job.companyName || job.title).slice(0, 1).toUpperCase()}</div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                <p className="mt-1 text-sm text-slate-600">{job.companyName || "Company"} · {job.location || "India"} · {job.workMode || "flexible"}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{salary(job)}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.jobType || "Full-time"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.seniority || "Open level"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.experienceMin ?? 0}-{job.experienceMax ?? "∞"} yrs</span>
                  {job.freshersAllowed && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Freshers allowed</span>}
                  {job.verifiedCompany && <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Verified company</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Role overview</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.generatedJD || "The recruiter has not published a full job description yet."}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold">Must-have skills</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {(mustHave.length ? mustHave : ["Relevant experience for this role"]).map(item => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold">Good-to-have</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {(niceToHave.length ? niceToHave : ["Strong communication and ownership"]).map(item => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold">Deep filter metadata</h2>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Niche:</span> {job.niche || job.department || "General hiring"}</p>
              <p><span className="font-semibold text-slate-900">Company type:</span> {job.companyType || "Not specified"}</p>
              <p><span className="font-semibold text-slate-900">Education:</span> {job.educationRequirement || "Flexible"}</p>
              <p><span className="font-semibold text-slate-900">Notice period:</span> {job.noticePeriod || "Flexible"}</p>
            </div>
          </div>
        </section>

        <ApplyForm jobId={id} jobTitle={job.title} companyName={job.companyName} />
      </main>
    </div>
  );
}
