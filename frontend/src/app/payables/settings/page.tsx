"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";
import PayablesShell from "@/components/payables/PayablesShell";

function ArrowLeftIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>;
}
function CheckIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>;
}
function BuildingIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/></svg>;
}
function MailIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function CurrencyIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>;
}
function BellIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
}
function EyeIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function SpinnerIcon() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>;
}
function UploadIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function LinkIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "JPY", "CNY"];

const EMAIL_TYPES = [
  { value: "invoice_received", label: "Invoice Received", desc: "Sent when a new invoice is uploaded or imported" },
  { value: "invoice_approved", label: "Invoice Approved", desc: "Sent when you approve an invoice" },
  { value: "invoice_rejected", label: "Invoice Rejected", desc: "Sent when you reject an invoice with a reason" },
  { value: "invoice_flagged",  label: "Invoice Flagged",  desc: "Sent when AI raises a flag on an invoice" },
  { value: "payment_confirmed", label: "Payment Confirmed", desc: 'Sent when you click "Mark as Paid"' },
];

interface Settings {
  brandName: string;
  senderDisplayName: string;
  supportEmail: string;
  companyAddress: string;
  paymentTermsDays: number;
  defaultCurrency: string;
  logoUrl: string;
  autoEmailOnReceive: boolean;
  autoEmailOnApprove: boolean;
  autoEmailOnReject: boolean;
  autoEmailOnFlag: boolean;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? "bg-violet-600" : "bg-gray-200"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-50 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">{icon}</div>
        <div>
          <h2 className="text-sm font-bold text-[#1d2226]">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-[#1d2226] outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 placeholder:text-gray-300"
    />
  );
}

export default function PayablesSettings() {
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    brandName: "",
    senderDisplayName: "",
    supportEmail: "",
    companyAddress: "",
    paymentTermsDays: 30,
    defaultCurrency: "INR",
    logoUrl: "",
    autoEmailOnReceive: false,
    autoEmailOnApprove: true,
    autoEmailOnReject: true,
    autoEmailOnFlag: false,
  });
  const [previewType, setPreviewType] = useState("invoice_approved");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [fetchingGmail, setFetchingGmail] = useState(false);
  const [disconnectingGmail, setDisconnectingGmail] = useState(false);
  const [gmailMsg, setGmailMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [supplierPortalUrl, setSupplierPortalUrl] = useState<string | null>(null);
  const [supplierLinkLoading, setSupplierLinkLoading] = useState(false);
  const [supplierLinkCopied, setSupplierLinkCopied] = useState(false);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u) {
          const token = await u.getIdToken();
          setUser({ uid: u.uid, token });
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      return unsub;
    } catch { setUser(null); setLoading(false); return undefined; }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND}/payables/settings`, { headers: payablesHeaders(user) })
      .then((r) => r.json())
      .then((d) => {
        setSettings({
          brandName: d.brandName ?? "",
          senderDisplayName: d.senderDisplayName ?? "",
          supportEmail: d.supportEmail ?? "",
          companyAddress: d.companyAddress ?? "",
          paymentTermsDays: d.paymentTermsDays ?? 30,
          defaultCurrency: d.defaultCurrency ?? "INR",
          logoUrl: d.logoUrl ?? "",
          autoEmailOnReceive: d.autoEmailOnReceive ?? false,
          autoEmailOnApprove: d.autoEmailOnApprove ?? true,
          autoEmailOnReject: d.autoEmailOnReject ?? true,
          autoEmailOnFlag: d.autoEmailOnFlag ?? false,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND}/payables/gmail/status`, { headers: payablesHeaders(user) })
      .then((r) => r.json())
      .then((d) => { setGmailConnected(d.connected); setGmailEmail(d.email ?? null); })
      .catch(() => setGmailConnected(false));
    fetch(`${BACKEND}/payables/company`, { headers: payablesHeaders(user) })
      .then((r) => r.json())
      .then((d) => setSupplierPortalUrl(d.supplierPortalUrl ?? null))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const result = new URLSearchParams(window.location.search).get("gmail");
    if (result === "connected") {
      setGmailConnected(true);
      setGmailMsg({ text: "Gmail connected successfully. Invoice emails will be auto-imported.", type: "success" });
      window.history.replaceState({}, "", "/payables/settings");
    }
  }, []);

  const connectGmail = async () => {
    if (!user) return;
    setFetchingGmail(true);
    try {
      const res = await fetch(`${BACKEND}/payables/gmail/auth-url?returnTo=${encodeURIComponent("/payables/settings?gmail=connected")}`, {
        headers: payablesHeaders(user),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start Gmail connection.");
      window.location.href = data.url;
    } catch (err) {
      setGmailMsg({ text: err instanceof Error ? err.message : "Could not start Gmail connection.", type: "error" });
      setFetchingGmail(false);
    }
  };

  const disconnectGmail = async () => {
    if (!user || !confirm("Disconnect Gmail? You can reconnect at any time.")) return;
    setDisconnectingGmail(true);
    try {
      const res = await fetch(`${BACKEND}/payables/gmail/disconnect`, {
        method: "DELETE", headers: payablesHeaders(user),
      });
      if (res.ok) { setGmailConnected(false); setGmailEmail(null); setGmailMsg({ text: "Gmail disconnected.", type: "info" }); }
    } catch {
      setGmailMsg({ text: "Could not disconnect Gmail. Please try again.", type: "error" });
    } finally {
      setDisconnectingGmail(false);
    }
  };

  const createOrCopySupplierLink = async () => {
    if (!user) return;
    setSupplierLinkLoading(true);
    try {
      let url = supplierPortalUrl;
      if (!url) {
        const res = await fetch(`${BACKEND}/payables/supplier-link`, { headers: payablesHeaders(user) });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error ?? "Could not create supplier link.");
        url = data.url;
        setSupplierPortalUrl(url);
      }
      await navigator.clipboard.writeText(url!);
      setSupplierLinkCopied(true);
      setTimeout(() => setSupplierLinkCopied(false), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not create supplier link.");
    } finally {
      setSupplierLinkLoading(false);
    }
  };

  const set = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: val }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`${BACKEND}/payables/settings`, {
        method: "PATCH",
        headers: { ...payablesHeaders(user), "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const loadPreview = async () => {
    if (!user) return;
    setLoadingPreview(true);
    setShowPreviewModal(true);
    try {
      const res = await fetch(`${BACKEND}/payables/settings/email-preview?type=${previewType}`, {
        headers: payablesHeaders(user),
      });
      const d = await res.json();
      setPreviewHtml(d.html ?? "");
      setPreviewSubject(d.subject ?? "");
    } catch { setPreviewHtml("<p>Preview unavailable.</p>"); }
    finally { setLoadingPreview(false); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8fa]">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <PayablesShell
      pageTitle="Settings"
      pageSubtitle="Workspace, email automation, and integrations"
      headerActions={
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <CheckIcon className="h-3 w-3" /> Saved
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2d3238] disabled:opacity-60"
          >
            {saving ? <SpinnerIcon /> : null}
            {saving ? "Saving…" : "Save all changes"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Company Identity */}
        <SectionCard
          icon={<BuildingIcon className="h-5 w-5 text-violet-600" />}
          title="Company Identity"
          subtitle="How your company appears in all supplier communications"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Brand Name" hint="Used in email headers, footers, and subject lines">
              <Input value={settings.brandName} onChange={(v) => set("brandName", v)} placeholder="e.g. InvoFlow Technologies Pvt. Ltd." />
            </Field>
            <Field label="Company Address" hint="Shown in email footer">
              <Input value={settings.companyAddress} onChange={(v) => set("companyAddress", v)} placeholder="e.g. Noida, Uttar Pradesh — 201301" />
            </Field>
          </div>
          <Field label="Logo URL (optional)" hint="Direct link to your logo image (PNG/SVG, shown in email header)">
            <Input value={settings.logoUrl} onChange={(v) => set("logoUrl", v)} placeholder="https://your-cdn.com/logo.png" />
          </Field>
          {settings.logoUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <img src={settings.logoUrl} alt="Logo preview" className="h-8 max-w-[120px] object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
              <span className="text-xs text-gray-400">Logo preview</span>
            </div>
          )}
        </SectionCard>

        {/* Sender Identity */}
        <SectionCard
          icon={<MailIcon className="h-5 w-5 text-violet-600" />}
          title="Sender Identity"
          subtitle="How the system identifies itself when sending emails to suppliers"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sender Display Name" hint="Shown as the system name in email signatures">
              <Input value={settings.senderDisplayName} onChange={(v) => set("senderDisplayName", v)} placeholder="e.g. InvoFlow AP Automation System" />
            </Field>
            <Field label="Support / Reply-to Email" hint="Suppliers can reply to this address for queries">
              <Input type="email" value={settings.supportEmail} onChange={(v) => set("supportEmail", v)} placeholder="e.g. ap-support@yourcompany.in" />
            </Field>
          </div>
          <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
            <p className="text-xs text-violet-700 leading-relaxed">
              <strong>Note:</strong> Emails are sent from your connected Gmail account. The sender display name and support email appear inside the email body and signature — giving it a professional, branded feel without needing a custom SMTP server.
            </p>
          </div>
        </SectionCard>

        {/* Payment Terms */}
        <SectionCard
          icon={<CurrencyIcon className="h-5 w-5 text-violet-600" />}
          title="Payment Terms"
          subtitle="Default payment schedule embedded in all supplier approval emails"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Payment Terms (working days)" hint="e.g. 30 = Net 30">
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={settings.paymentTermsDays}
                  onChange={(e) => set("paymentTermsDays", Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-[#1d2226] outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">days</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Suppliers will see: <em>"Payment within {settings.paymentTermsDays} working days"</em></p>
            </Field>
            <Field label="Default Currency" hint="Used when invoice currency is not detected">
              <select
                value={settings.defaultCurrency}
                onChange={(e) => set("defaultCurrency", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-[#1d2226] outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* Email Automation */}
        <SectionCard
          icon={<BellIcon className="h-5 w-5 text-violet-600" />}
          title="Email Automation"
          subtitle="Control which events automatically send an email to the supplier"
        >
          <div className="space-y-0 divide-y divide-gray-50">
            {[
              { key: "autoEmailOnReceive" as const, label: "Invoice Received", desc: "When a new invoice is uploaded or imported from Gmail", badge: "off by default" },
              { key: "autoEmailOnApprove" as const, label: "Invoice Approved", desc: "When you approve an invoice — tells supplier payment is coming", badge: "recommended" },
              { key: "autoEmailOnReject" as const, label: "Invoice Rejected", desc: "When you reject an invoice — tells supplier the reason", badge: "recommended" },
              { key: "autoEmailOnFlag" as const, label: "AI Flag Raised", desc: "When AI raises a critical concern on an invoice", badge: "optional" },
            ].map(({ key, label, desc, badge }) => (
              <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1d2226]">{label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge === "recommended" ? "bg-emerald-100 text-emerald-700" : badge === "optional" ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-500"}`}>
                      {badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
                </div>
                <Toggle checked={settings[key]} onChange={(v) => set(key, v)} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-700">Payment Confirmation</strong> — always sent when you click "Mark as Paid" on any invoice. This cannot be disabled.
            </p>
          </div>
        </SectionCard>

        {/* Email Preview */}
        <SectionCard
          icon={<EyeIcon className="h-5 w-5 text-violet-600" />}
          title="Email Template Preview"
          subtitle="See exactly what your suppliers will receive for each email type"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email Type</label>
              <select
                value={previewType}
                onChange={(e) => setPreviewType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-[#1d2226] outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
              >
                {EMAIL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                ))}
              </select>
            </div>
            <button
              onClick={loadPreview}
              disabled={loadingPreview}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50"
            >
              {loadingPreview ? <SpinnerIcon /> : <EyeIcon className="h-4 w-4 text-violet-500" />}
              Preview email
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Preview uses sample data with your current brand settings. Save your settings first for accurate preview.
          </p>
        </SectionCard>

        {/* Gmail Integration */}
        <SectionCard
          icon={<MailIcon className="h-5 w-5 text-violet-600" />}
          title="Gmail Integration"
          subtitle="Connect your Gmail to auto-import invoice emails from your inbox"
        >
          {gmailMsg && (
            <div className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${gmailMsg.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : gmailMsg.type === "error" ? "border-rose-100 bg-rose-50 text-rose-700" : "border-violet-100 bg-violet-50 text-violet-700"}`}>
              <span className="flex-1">{gmailMsg.text}</span>
              <button onClick={() => setGmailMsg(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
            </div>
          )}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#1d2226]">Connection status</p>
              {gmailConnected && gmailEmail && <p className="text-xs text-gray-400 mt-0.5">{gmailEmail}</p>}
            </div>
            {gmailConnected === null ? (
              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
            ) : gmailConnected ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Not connected
              </span>
            )}
          </div>
          {gmailConnected === false && (
            <button
              onClick={connectGmail}
              disabled={fetchingGmail}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d2226] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d3238] disabled:opacity-50"
            >
              {fetchingGmail ? <SpinnerIcon /> : <MailIcon className="h-4 w-4" />}
              Connect Gmail
            </button>
          )}
          {gmailConnected === true && (
            <button
              onClick={disconnectGmail}
              disabled={disconnectingGmail}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
            >
              {disconnectingGmail ? <SpinnerIcon /> : null}
              Disconnect Gmail
            </button>
          )}
          <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
            <p className="text-xs text-violet-700 leading-relaxed">
              <strong>How it works:</strong> Connecting Gmail allows Plyndrox to automatically detect invoice emails in your inbox and import them for AI extraction. Emails are scanned, not stored. You can disconnect at any time.
            </p>
          </div>
        </SectionCard>

        {/* Supplier Portal */}
        <SectionCard
          icon={<LinkIcon className="h-5 w-5 text-violet-600" />}
          title="Supplier Portal"
          subtitle="Let suppliers submit invoices directly via a permanent branded link"
        >
          <div>
            <p className="text-sm font-semibold text-[#1d2226]">Your supplier upload link</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Share this permanent link with your vendors. Their invoices appear in your dashboard automatically and AI begins extracting data immediately in the background.
            </p>
          </div>
          {supplierPortalUrl && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="truncate text-xs font-mono text-gray-500">{supplierPortalUrl}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={createOrCopySupplierLink}
              disabled={supplierLinkLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {supplierLinkLoading ? <SpinnerIcon /> : <UploadIcon className="h-4 w-4" />}
              {supplierPortalUrl ? (supplierLinkCopied ? "Copied!" : "Copy link") : "Create link"}
            </button>
            {supplierPortalUrl && (
              <a
                href={supplierPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                Open
              </a>
            )}
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700 leading-relaxed">
              <strong>Tip:</strong> The supplier portal link is permanent. You can share it with all your vendors and they can use it to upload invoices at any time — no account needed on their end.
            </p>
          </div>
        </SectionCard>

        {/* Save button at bottom too */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-[#1d2226]">All changes are saved per workspace</p>
            <p className="text-xs text-gray-400 mt-0.5">Settings apply to all future invoices and emails in your Payables workspace.</p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          >
            {saving ? <SpinnerIcon /> : <CheckIcon className="h-4 w-4" />}
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-black text-[#1d2226]">Email Preview</h3>
                {previewSubject && <p className="text-xs text-gray-400 mt-0.5 font-mono">Subject: {previewSubject}</p>}
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-2xl max-h-[70vh] overflow-y-auto">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-16"><SpinnerIcon /></div>
              ) : previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full rounded-xl border border-gray-200 bg-white"
                  style={{ height: "600px" }}
                  title="Email preview"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
  </PayablesShell>
  );
}
