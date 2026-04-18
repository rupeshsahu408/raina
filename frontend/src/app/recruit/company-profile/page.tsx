"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Link from "next/link";
import RecruitHeader from "@/components/RecruitHeader";

const API = "/backend";

const COMPANY_TYPES = ["Startup", "MNC", "Agency", "Product Company", "Consultancy", "Hospital", "Fintech", "NGO", "Government", "Other"];
const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500–1000", "1000+"];
const INDUSTRIES = [
  "AI, Data & Technology", "Sales & Business Development", "Finance, Banking & Fintech",
  "Healthcare & Pharma", "Logistics & Industrial", "Creative, Marketing & Media",
  "Education", "Real Estate", "Manufacturing", "Other",
];

type CompanyProfile = {
  companyName: string; companyType: string; industry: string; companySize: string;
  website: string; location: string; description: string; mission: string;
  benefits: string; linkedinUrl: string; logoUrl: string;
};

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
  const [verificationStatus, setVerificationStatus] = useState<"none" | "requested" | "verified" | "rejected">("none");
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [authToken, setAuthToken] = useState<string>("");

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }
      try {
        const token = await u.getIdToken();
        setAuthToken(token);
        const res = await fetch(`${API}/recruit/company/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            setVerificationStatus(data.profile.verificationStatus || "none");
          }
        }
      } catch { /* ignore, use defaults */ }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  async function requestVerification() {
    if (!authToken) return;
    setRequestingVerification(true);
    setVerificationMessage("");
    try {
      const res = await fetch(`${API}/recruit/company/request-verification`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request verification.");
      setVerificationStatus(data.status);
      setVerificationMessage(data.message);
    } catch (e: any) {
      setVerificationMessage(e.message);
    } finally {
      setRequestingVerification(false);
    }
  }

  function set<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("You must be signed in to save.");
      const token = await user.getIdToken();
      const res = await fetch(`${API}/recruit/company/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save profile.");
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
            Loading…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <RecruitHeader />

      <div className="sticky top-[57px] z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <Link href="/recruit/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition">← Dashboard</Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-sm font-bold text-slate-900">Company Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-red-600 hidden sm:block">{error}</p>}
            {saved && <span className="text-xs font-semibold text-green-600">✓ Saved</span>}
            <button onClick={save} disabled={saving} className="rounded-full bg-[#0a66c2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition active:scale-95">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-6 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Basic Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company Name" value={profile.companyName} onChange={e => set("companyName", e.target.value)} placeholder="e.g. Infosys" />
            <Select label="Company Type" value={profile.companyType} onChange={e => set("companyType", e.target.value)}>
              <option value="">Select type</option>
              {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select label="Industry" value={profile.industry} onChange={e => set("industry", e.target.value)}>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </Select>
            <Select label="Company Size" value={profile.companySize} onChange={e => set("companySize", e.target.value)}>
              <option value="">Select size</option>
              {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </Select>
            <Input label="HQ Location" value={profile.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Bengaluru, Karnataka" />
            <Input label="Website" value={profile.website} onChange={e => set("website", e.target.value)} placeholder="https://yourcompany.com" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">About the Company</h2>
          <Textarea label="Company Description" value={profile.description} onChange={e => set("description", e.target.value)} placeholder="Tell candidates what your company does, your products, and your culture…" rows={4} />
          <Textarea label="Mission & Values" value={profile.mission} onChange={e => set("mission", e.target.value)} placeholder="What is your company's mission? What values do you stand for?" rows={3} />
          <Textarea label="Benefits & Perks" value={profile.benefits} onChange={e => set("benefits", e.target.value)} placeholder="e.g. Health insurance, flexible hours, remote work, learning budget, equity…" rows={3} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Links & Logo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="LinkedIn URL" value={profile.linkedinUrl} onChange={e => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/company/…" />
            <Input label="Logo URL" value={profile.logoUrl} onChange={e => set("logoUrl", e.target.value)} placeholder="https://… (image URL)" />
          </div>
          {profile.logoUrl && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <img src={profile.logoUrl} alt="Logo preview" className="h-12 w-12 rounded-lg object-contain border border-slate-200 bg-white" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <p className="text-xs text-slate-500">Logo preview</p>
            </div>
          )}
        </div>

        <div className={`rounded-2xl border shadow-sm overflow-hidden ${verificationStatus === "verified" ? "border-green-200 bg-green-50" : verificationStatus === "requested" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
          {verificationStatus === "verified" ? (
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-lg font-black">✓</div>
              <div>
                <p className="text-sm font-bold text-green-800">Company Verified</p>
                <p className="text-xs text-green-700 mt-0.5">Your company has been verified by the Plyndrox team. A "Verified" badge appears on all your job listings.</p>
              </div>
            </div>
          ) : verificationStatus === "requested" ? (
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-lg">⏳</div>
              <div>
                <p className="text-sm font-bold text-amber-800">Verification Under Review</p>
                <p className="text-xs text-amber-700 mt-0.5">Your verification request has been submitted. Our team will review within 2–3 business days.</p>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0a66c2]">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Get your company verified</h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Verified companies get a ✓ badge on every job listing, appear higher in search results, and earn more trust from job seekers. To qualify, your company profile must include a name, description, and website.
                  </p>
                </div>
              </div>
              <ul className="mb-4 grid gap-2 sm:grid-cols-3">
                {["Higher listing visibility", "✓ Verified badge on all jobs", "More candidate applications"].map(b => (
                  <li key={b} className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0a66c2]">
                    <span className="text-green-600">✓</span> {b}
                  </li>
                ))}
              </ul>
              {verificationMessage && (
                <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{verificationMessage}</p>
              )}
              <button
                onClick={requestVerification}
                disabled={requestingVerification}
                className="rounded-full bg-[#0a66c2] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition"
              >
                {requestingVerification ? "Submitting…" : "Request company verification"}
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 pb-6">
          <button onClick={save} disabled={saving} className="w-full sm:w-auto rounded-full bg-[#0a66c2] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-60 transition active:scale-95">
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save company profile"}
          </button>
        </div>
      </main>
    </div>
  );
}
