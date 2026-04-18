"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Link from "next/link";

const API = "/backend";

const NICHES = [
  "AI, Data, Software & Product Tech",
  "Sales, Business Development & Revenue Roles",
  "Finance, Accounting, Banking & Fintech",
  "Healthcare, Pharma & Allied Medical Workforce",
  "Skilled Blue-Collar, Logistics & Industrial Workforce",
  "Creative, Marketing, Media & Design",
];

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Freelance"];
const WORK_MODES = ["Remote", "Hybrid", "Onsite"];

type Experience = { title: string; company: string; location: string; startDate: string; endDate: string; current: boolean; description: string };
type Education = { degree: string; institution: string; year: string; description: string };

type Profile = {
  name: string; email: string; phone: string; headline: string; bio: string;
  skills: string[]; experience: Experience[]; education: Education[];
  preferredJobType: string; preferredWorkMode: string; preferredLocation: string;
  preferredSalaryMin: number | ""; preferredSalaryMax: number | "";
  preferredNiche: string; resumeText: string;
};

const EMPTY_EXP: Experience = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };
const EMPTY_EDU: Education = { degree: "", institution: "", year: "", description: "" };

function ArrowLeft() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>;
}

function PlusIcon() {
  return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}

function TrashIcon() {
  return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
}

export default function RecruitProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [activeSection, setActiveSection] = useState<"basics" | "experience" | "education" | "preferences" | "resume">("basics");

  const [profile, setProfile] = useState<Profile>({
    name: "", email: "", phone: "", headline: "", bio: "",
    skills: [], experience: [], education: [],
    preferredJobType: "", preferredWorkMode: "", preferredLocation: "",
    preferredSalaryMin: "", preferredSalaryMax: "",
    preferredNiche: "", resumeText: "",
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const t = await u.getIdToken();
        setToken(t);
        if (!profile.email && u.email) {
          setProfile(prev => ({ ...prev, email: u.email || "", name: prev.name || u.displayName || "" }));
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/recruit/seeker/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.profile) {
        const p = data.profile;
        setProfile({
          name: p.name || "", email: p.email || "", phone: p.phone || "",
          headline: p.headline || "", bio: p.bio || "",
          skills: p.skills || [], experience: p.experience || [], education: p.education || [],
          preferredJobType: p.preferredJobType || "", preferredWorkMode: p.preferredWorkMode || "",
          preferredLocation: p.preferredLocation || "",
          preferredSalaryMin: p.preferredSalaryMin || "",
          preferredSalaryMax: p.preferredSalaryMax || "",
          preferredNiche: p.preferredNiche || "", resumeText: p.resumeText || "",
        });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !profile.skills.includes(s)) {
      set("skills", [...profile.skills, s]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    set("skills", profile.skills.filter(s => s !== skill));
  }

  function addExperience() {
    set("experience", [...profile.experience, { ...EMPTY_EXP }]);
  }

  function updateExp(idx: number, field: keyof Experience, value: any) {
    const updated = profile.experience.map((e, i) => i === idx ? { ...e, [field]: value } : e);
    set("experience", updated);
  }

  function removeExp(idx: number) {
    set("experience", profile.experience.filter((_, i) => i !== idx));
  }

  function addEducation() {
    set("education", [...profile.education, { ...EMPTY_EDU }]);
  }

  function updateEdu(idx: number, field: keyof Education, value: any) {
    const updated = profile.education.map((e, i) => i === idx ? { ...e, [field]: value } : e);
    set("education", updated);
  }

  function removeEdu(idx: number) {
    set("education", profile.education.filter((_, i) => i !== idx));
  }

  async function save() {
    if (!token) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`${API}/recruit/seeker/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...profile,
          preferredSalaryMin: profile.preferredSalaryMin !== "" ? Number(profile.preferredSalaryMin) : undefined,
          preferredSalaryMax: profile.preferredSalaryMax !== "" ? Number(profile.preferredSalaryMax) : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed"); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f6f8] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading your profile...
        </div>
      </div>
    );
  }

  const sections = [
    { id: "basics", label: "Basic Info" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "preferences", label: "Job Preferences" },
    { id: "resume", label: "Resume" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/recruit/opportunities" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-sm">
              <ArrowLeft /> Opportunities
            </Link>
            <span className="text-slate-300">|</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a66c2] text-xs font-black text-white">R</span>
            <span className="text-sm font-bold text-slate-900">My Profile</span>
          </div>
          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-red-600">{error}</p>}
            {saved && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <CheckIcon /> Saved
              </span>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-[#0a66c2] px-5 py-2 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        <nav className="mb-4 flex gap-2 overflow-x-auto lg:mb-0 lg:flex-col lg:h-fit lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-3 lg:shadow-sm">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap text-left ${
                activeSection === s.id
                  ? "bg-blue-50 text-[#0a66c2]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {activeSection === "basics" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
                  <input value={profile.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
                  <input value={profile.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" type="email" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</label>
                  <input value={profile.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Headline</label>
                  <input value={profile.headline} onChange={e => set("headline", e.target.value)} placeholder="e.g. Software Engineer at Infosys" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Bio / Summary</label>
                <textarea value={profile.bio} onChange={e => set("bio", e.target.value)} placeholder="A short summary about yourself, your goals, and what you bring to the table..." rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition resize-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Skills</label>
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition"
                  />
                  <button onClick={addSkill} className="flex items-center gap-1.5 rounded-xl bg-[#0a66c2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004182] transition">
                    <PlusIcon /> Add
                  </button>
                </div>
                {profile.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-[#0a66c2]">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "experience" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
                <button onClick={addExperience} className="flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                  <PlusIcon /> Add experience
                </button>
              </div>
              {profile.experience.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-sm text-slate-500">No experience added yet.</p>
                  <button onClick={addExperience} className="mt-3 text-sm font-semibold text-[#0a66c2] hover:underline">+ Add your first role</button>
                </div>
              )}
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Role {idx + 1}</span>
                    <button onClick={() => removeExp(idx)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition">
                      <TrashIcon /> Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Job Title</label>
                      <input value={exp.title} onChange={e => updateExp(idx, "title", e.target.value)} placeholder="e.g. Software Engineer" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Company</label>
                      <input value={exp.company} onChange={e => updateExp(idx, "company", e.target.value)} placeholder="e.g. Infosys" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Location</label>
                      <input value={exp.location} onChange={e => updateExp(idx, "location", e.target.value)} placeholder="e.g. Bengaluru, Remote" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Start Date</label>
                      <input value={exp.startDate} onChange={e => updateExp(idx, "startDate", e.target.value)} placeholder="e.g. Jan 2022" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                    {!exp.current && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">End Date</label>
                        <input value={exp.endDate} onChange={e => updateExp(idx, "endDate", e.target.value)} placeholder="e.g. Mar 2024" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <input type="checkbox" id={`current-${idx}`} checked={exp.current} onChange={e => updateExp(idx, "current", e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#0a66c2]" />
                      <label htmlFor={`current-${idx}`} className="text-sm text-slate-700">I currently work here</label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
                    <textarea value={exp.description} onChange={e => updateExp(idx, "description", e.target.value)} placeholder="Describe your responsibilities, achievements..." rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition resize-none" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === "education" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Education</h2>
                <button onClick={addEducation} className="flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                  <PlusIcon /> Add education
                </button>
              </div>
              {profile.education.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-sm text-slate-500">No education added yet.</p>
                  <button onClick={addEducation} className="mt-3 text-sm font-semibold text-[#0a66c2] hover:underline">+ Add your education</button>
                </div>
              )}
              {profile.education.map((edu, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Entry {idx + 1}</span>
                    <button onClick={() => removeEdu(idx)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition">
                      <TrashIcon /> Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Degree / Certification</label>
                      <input value={edu.degree} onChange={e => updateEdu(idx, "degree", e.target.value)} placeholder="e.g. B.Tech Computer Science" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Institution</label>
                      <input value={edu.institution} onChange={e => updateEdu(idx, "institution", e.target.value)} placeholder="e.g. IIT Delhi" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Graduation Year</label>
                      <input value={edu.year} onChange={e => updateEdu(idx, "year", e.target.value)} placeholder="e.g. 2023" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Notes (optional)</label>
                      <input value={edu.description} onChange={e => updateEdu(idx, "description", e.target.value)} placeholder="e.g. Specialization, GPA..." className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Job Preferences</h2>
              <p className="text-sm text-slate-500">Tell us what kind of roles you are looking for so we can surface the best matches.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Preferred Niche</label>
                  <select value={profile.preferredNiche} onChange={e => set("preferredNiche", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                    <option value="">Select niche</option>
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Preferred Job Type</label>
                  <select value={profile.preferredJobType} onChange={e => set("preferredJobType", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                    <option value="">Any</option>
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Preferred Work Mode</label>
                  <select value={profile.preferredWorkMode} onChange={e => set("preferredWorkMode", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                    <option value="">Any</option>
                    {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Preferred Location</label>
                  <input value={profile.preferredLocation} onChange={e => set("preferredLocation", e.target.value)} placeholder="e.g. Bengaluru, Mumbai, Remote" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Min Expected Salary (₹/yr)</label>
                  <input type="number" value={profile.preferredSalaryMin} onChange={e => set("preferredSalaryMin", e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 800000" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Max Expected Salary (₹/yr)</label>
                  <input type="number" value={profile.preferredSalaryMax} onChange={e => set("preferredSalaryMax", e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 1500000" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "resume" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Resume / Work History</h2>
              <p className="text-sm text-slate-500">Paste your resume text here. When you apply to a job, this will be pre-filled automatically, saving you time.</p>
              <textarea
                value={profile.resumeText}
                onChange={e => set("resumeText", e.target.value)}
                placeholder="Paste your full resume text, LinkedIn summary, or work history here. Include skills, experience, education, and achievements..."
                rows={18}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition resize-none font-mono"
              />
              <p className="text-xs text-slate-400">Tip: The more detailed your resume text, the better AI can score your fit for each role.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
