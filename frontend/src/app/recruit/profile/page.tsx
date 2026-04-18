"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import RecruitHeader from "@/components/RecruitHeader";

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

type Section = "basics" | "experience" | "education" | "preferences" | "resume";

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: "basics", label: "Basic Info", icon: "👤" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "preferences", label: "Preferences", icon: "⚙️" },
  { id: "resume", label: "Resume", icon: "📄" },
];

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition" {...props} />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition resize-none" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <select className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition bg-white" {...props}>{children}</select>
    </div>
  );
}

export default function RecruitProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("basics");
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
        setProfile(prev => ({
          ...prev,
          email: prev.email || u.email || "",
          name: prev.name || u.displayName || "",
        }));
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
    if (s && !profile.skills.includes(s)) set("skills", [...profile.skills, s]);
    setSkillInput("");
  }

  function updateExp(idx: number, field: keyof Experience, value: any) {
    set("experience", profile.experience.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }

  function updateEdu(idx: number, field: keyof Education, value: any) {
    set("education", profile.education.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }

  async function save() {
    if (!token) return;
    setSaving(true); setError(""); setSaved(false);
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
      if (profile.resumeText) {
        try { localStorage.setItem("recruit_resume_text", profile.resumeText); } catch { /* ignore */ }
      }
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
      <div className="min-h-screen bg-[#f3f6f8]">
        <RecruitHeader />
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading your profile…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <RecruitHeader />

      <div className="sticky top-[57px] z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between py-2.5">
          <h1 className="text-sm font-bold text-slate-900">My Profile</h1>
          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-red-600 hidden sm:block">{error}</p>}
            {saved && <span className="text-xs font-semibold text-green-600">✓ Saved</span>}
            <button onClick={save} disabled={saving} className="rounded-full bg-[#0a66c2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition active:scale-95">
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
        {error && <p className="mb-3 text-sm text-red-600 sm:hidden">{error}</p>}

        <div className="flex gap-1 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeSection === s.id
                  ? "bg-[#0a66c2] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          {activeSection === "basics" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
                <p className="text-sm text-slate-500 mt-0.5">Your professional identity on Recruit AI.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full Name" value={profile.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" />
                <Input label="Email" value={profile.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" type="email" />
                <Input label="Phone" value={profile.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                <Input label="Headline" value={profile.headline} onChange={e => set("headline", e.target.value)} placeholder="e.g. Software Engineer at Infosys" />
              </div>
              <Textarea label="Bio / Summary" value={profile.bio} onChange={e => set("bio", e.target.value)} placeholder="A short summary about yourself, your goals, and what you bring to the table…" rows={4} />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Skills</label>
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="Type a skill and press Enter…"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition"
                  />
                  <button onClick={addSkill} className="rounded-lg bg-[#0a66c2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004182] transition">
                    Add
                  </button>
                </div>
                {profile.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-[#0a66c2]">
                        {skill}
                        <button onClick={() => set("skills", profile.skills.filter(s => s !== skill))} className="text-[#0a66c2]/50 hover:text-red-500 transition font-bold">×</button>
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
                <div>
                  <h2 className="text-base font-bold text-slate-900">Work Experience</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{profile.experience.length} role{profile.experience.length !== 1 ? "s" : ""} added</p>
                </div>
                <button onClick={() => set("experience", [...profile.experience, { ...EMPTY_EXP }])} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                  + Add role
                </button>
              </div>
              {profile.experience.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <div className="text-3xl mb-2">💼</div>
                  <p className="text-sm text-slate-500">No work experience added yet.</p>
                  <button onClick={() => set("experience", [...profile.experience, { ...EMPTY_EXP }])} className="mt-3 text-sm font-semibold text-[#0a66c2] hover:underline">
                    + Add your first role
                  </button>
                </div>
              ) : (
                profile.experience.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Role {idx + 1}</span>
                      <button onClick={() => set("experience", profile.experience.filter((_, i) => i !== idx))} className="text-xs text-red-400 hover:text-red-600 transition font-semibold">
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Job Title" value={exp.title} onChange={e => updateExp(idx, "title", e.target.value)} placeholder="e.g. Software Engineer" />
                      <Input label="Company" value={exp.company} onChange={e => updateExp(idx, "company", e.target.value)} placeholder="e.g. Infosys" />
                      <Input label="Location" value={exp.location} onChange={e => updateExp(idx, "location", e.target.value)} placeholder="e.g. Bengaluru" />
                      <Input label="Start Date" value={exp.startDate} onChange={e => updateExp(idx, "startDate", e.target.value)} placeholder="e.g. Jan 2022" />
                      {!exp.current && (
                        <Input label="End Date" value={exp.endDate} onChange={e => updateExp(idx, "endDate", e.target.value)} placeholder="e.g. Mar 2024" />
                      )}
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <input type="checkbox" id={`curr-${idx}`} checked={exp.current} onChange={e => updateExp(idx, "current", e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#0a66c2]" />
                        <label htmlFor={`curr-${idx}`} className="text-sm text-slate-700">I currently work here</label>
                      </div>
                    </div>
                    <Textarea label="Description" value={exp.description} onChange={e => updateExp(idx, "description", e.target.value)} placeholder="Describe your responsibilities and achievements…" rows={3} />
                  </div>
                ))
              )}
            </div>
          )}

          {activeSection === "education" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Education</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{profile.education.length} entr{profile.education.length !== 1 ? "ies" : "y"} added</p>
                </div>
                <button onClick={() => set("education", [...profile.education, { ...EMPTY_EDU }])} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                  + Add education
                </button>
              </div>
              {profile.education.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <div className="text-3xl mb-2">🎓</div>
                  <p className="text-sm text-slate-500">No education added yet.</p>
                  <button onClick={() => set("education", [...profile.education, { ...EMPTY_EDU }])} className="mt-3 text-sm font-semibold text-[#0a66c2] hover:underline">
                    + Add your education
                  </button>
                </div>
              ) : (
                profile.education.map((edu, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Entry {idx + 1}</span>
                      <button onClick={() => set("education", profile.education.filter((_, i) => i !== idx))} className="text-xs text-red-400 hover:text-red-600 transition font-semibold">Remove</button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Degree / Certification" value={edu.degree} onChange={e => updateEdu(idx, "degree", e.target.value)} placeholder="e.g. B.Tech Computer Science" />
                      <Input label="Institution" value={edu.institution} onChange={e => updateEdu(idx, "institution", e.target.value)} placeholder="e.g. IIT Delhi" />
                      <Input label="Graduation Year" value={edu.year} onChange={e => updateEdu(idx, "year", e.target.value)} placeholder="e.g. 2023" />
                      <Input label="Notes (optional)" value={edu.description} onChange={e => updateEdu(idx, "description", e.target.value)} placeholder="e.g. Specialization, GPA…" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Job Preferences</h2>
                <p className="text-sm text-slate-500 mt-0.5">Tell us what kind of roles you're looking for.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Preferred Niche" value={profile.preferredNiche} onChange={e => set("preferredNiche", e.target.value)}>
                  <option value="">Any niche</option>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </Select>
                <Select label="Preferred Job Type" value={profile.preferredJobType} onChange={e => set("preferredJobType", e.target.value)}>
                  <option value="">Any</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Select label="Preferred Work Mode" value={profile.preferredWorkMode} onChange={e => set("preferredWorkMode", e.target.value)}>
                  <option value="">Any</option>
                  {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
                <Input label="Preferred Location" value={profile.preferredLocation} onChange={e => set("preferredLocation", e.target.value)} placeholder="e.g. Bengaluru, Remote" />
                <Input label="Min Expected Salary (₹/yr)" type="number" value={profile.preferredSalaryMin} onChange={e => set("preferredSalaryMin", e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 800000" />
                <Input label="Max Expected Salary (₹/yr)" type="number" value={profile.preferredSalaryMax} onChange={e => set("preferredSalaryMax", e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 1500000" />
              </div>
            </div>
          )}

          {activeSection === "resume" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Resume / Work History</h2>
                <p className="text-sm text-slate-500 mt-0.5">Paste your resume once. It auto-fills when you apply to jobs.</p>
              </div>
              <textarea
                value={profile.resumeText}
                onChange={e => set("resumeText", e.target.value)}
                placeholder="Paste your full resume text, LinkedIn summary, or work history here. Include skills, experience, education, certifications and key achievements…"
                rows={20}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition resize-none font-mono"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>{profile.resumeText.length} characters</p>
                <p>Tip: More detail = better AI matching score</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={save} disabled={saving} className="w-full sm:w-auto rounded-full bg-[#0a66c2] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition active:scale-95">
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save profile"}
          </button>
        </div>
      </main>
    </div>
  );
}
