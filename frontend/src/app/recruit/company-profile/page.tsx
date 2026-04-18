"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Link from "next/link";

const API = "/backend";

const COMPANY_TYPES = ["Startup", "MNC", "Agency", "Product Company", "Consultancy", "Hospital", "Fintech", "NGO", "Government", "Other"];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500-1000", "1000+"];
const INDUSTRIES = [
  "AI, Data & Technology",
  "Sales & Business Development",
  "Finance, Banking & Fintech",
  "Healthcare & Pharma",
  "Logistics & Industrial",
  "Creative, Marketing & Media",
  "Education",
  "Real Estate",
  "Manufacturing",
  "Other",
];

type CompanyProfile = {
  companyName: string;
  companyType: string;
  industry: string;
  companySize: string;
  website: string;
  location: string;
  description: string;
  mission: string;
  benefits: string;
  linkedinUrl: string;
  logoUrl: string;
};

function ArrowLeft() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>;
}

const STORAGE_KEY = "recruit_company_profile";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: "", companyType: "", industry: "", companySize: "",
    website: "", location: "", description: "", mission: "", benefits: "",
    linkedinUrl: "", logoUrl: "",
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [loading]);

  function set<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      await new Promise(r => setTimeout(r, 400));
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
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/recruit/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-sm">
              <ArrowLeft /> Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a66c2] text-xs font-black text-white">R</span>
            <span className="text-sm font-bold">Company Profile</span>
          </div>
          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-red-600">{error}</p>}
            {saved && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <CheckIcon /> Saved
              </span>
            )}
            <button onClick={save} disabled={saving} className="rounded-full bg-[#0a66c2] px-5 py-2 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition">
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Company Profile</h1>
          <p className="text-sm text-slate-500">This information helps candidates learn about your company. A complete profile attracts better applicants.</p>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Basic Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Company Name</label>
                <input value={profile.companyName} onChange={e => set("companyName", e.target.value)} placeholder="e.g. Infosys" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Company Type</label>
                <select value={profile.companyType} onChange={e => set("companyType", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="">Select type</option>
                  {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Industry</label>
                <select value={profile.industry} onChange={e => set("industry", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Company Size</label>
                <select value={profile.companySize} onChange={e => set("companySize", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition">
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Headquarters Location</label>
                <input value={profile.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Bengaluru, Karnataka" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Website</label>
                <input value={profile.website} onChange={e => set("website", e.target.value)} placeholder="https://yourcompany.com" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">About the Company</h2>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Company Description</label>
              <textarea value={profile.description} onChange={e => set("description", e.target.value)} placeholder="Tell candidates what your company does, your products, and your culture..." rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mission & Values</label>
              <textarea value={profile.mission} onChange={e => set("mission", e.target.value)} placeholder="What is your company's mission? What values do you stand for?" rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Benefits & Perks</label>
              <textarea value={profile.benefits} onChange={e => set("benefits", e.target.value)} placeholder="e.g. Health insurance, flexible hours, remote work, learning budget, equity..." rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition resize-none" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Links</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">LinkedIn URL</label>
                <input value={profile.linkedinUrl} onChange={e => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/company/..." className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Logo URL</label>
                <input value={profile.logoUrl} onChange={e => set("logoUrl", e.target.value)} placeholder="https://... (image URL)" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition" />
              </div>
            </div>
            {profile.logoUrl && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <img src={profile.logoUrl} alt="Company logo" className="h-12 w-12 rounded-lg object-contain border border-slate-200 bg-white" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <p className="text-xs text-slate-500">Logo preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
