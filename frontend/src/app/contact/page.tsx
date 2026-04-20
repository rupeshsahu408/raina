"use client";

import { useState } from "react";
import Link from "next/link";

const SUPPORT_EMAIL = "support@plyndrox.app";

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.16Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.16Z" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const contactRoutes = [
  {
    id: "general",
    label: "General Support",
    description: "Account issues, billing questions, platform feedback, or anything else",
    icon: <MailIcon className="h-5 w-5" />,
    color: "text-violet-600",
    border: "border-gray-200",
    bg: "bg-white",
    activeBorder: "border-violet-300",
    activeBg: "bg-violet-50",
    badge: "bg-violet-50 border-violet-200 text-violet-600",
  },
  {
    id: "plyndrox",
    label: "Plyndrox AI",
    description: "Questions or issues with the Plyndrox AI web/app assistant",
    icon: <BrainIcon className="h-5 w-5" />,
    color: "text-fuchsia-600",
    border: "border-gray-200",
    bg: "bg-white",
    activeBorder: "border-fuchsia-200",
    activeBg: "bg-fuchsia-50",
    badge: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600",
  },
  {
    id: "whatsapp",
    label: "Plyndrox WhatsApp AI",
    description: "Setup, automation, Business API issues, or integration support",
    icon: <WhatsAppIcon className="h-5 w-5" />,
    color: "text-emerald-600",
    border: "border-gray-200",
    bg: "bg-white",
    activeBorder: "border-emerald-200",
    activeBg: "bg-emerald-50",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-600",
  },
];

const subjectsByRoute: Record<string, string[]> = {
  general: [
    "Account access or login issue",
    "Billing or subscription question",
    "Feature request or suggestion",
    "Platform bug or technical error",
    "Privacy or data request",
    "Partnership or business inquiry",
    "Other",
  ],
  plyndrox: [
    "AI response quality issue",
    "Chat history not loading",
    "Account or profile settings",
    "Feature not working as expected",
    "Progressive web app issue",
    "Performance or speed issue",
    "Other",
  ],
  whatsapp: [
    "WhatsApp Business API setup help",
    "Automated reply not working",
    "Message delivery failure",
    "Phone number verification issue",
    "Knowledge base configuration",
    "Business dashboard question",
    "Meta / API policy question",
    "Other",
  ],
};

export default function ContactPage() {
  const [selectedRoute, setSelectedRoute] = useState("general");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const route = contactRoutes.find((r) => r.id === selectedRoute)!;
  const subjects = subjectsByRoute[selectedRoute];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleRouteChange(id: string) {
    setSelectedRoute(id);
    setForm((prev) => ({ ...prev, subject: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const routeLabel = route.label;
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nRoute: ${routeLabel}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`
    );
    const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[${routeLabel}] ${form.subject}`)}&body=${body}`;
    setTimeout(() => {
      window.location.href = mailtoLink;
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  const isValid = form.name.trim() && form.email.trim() && form.subject && form.message.trim();

  return (
    <div className="min-h-screen bg-white text-[#1d2226]">

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/about" className="hidden text-sm text-gray-500 transition hover:text-[#1d2226] sm:block">About</Link>
            <Link href="/privacy-policy" className="hidden text-sm text-gray-500 transition hover:text-[#1d2226] sm:block">Privacy</Link>
            <Link href="/" className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238]">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 mb-6">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Contact Us</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1d2226] sm:text-5xl lg:text-6xl">
            We&apos;re Here to{" "}
            <span className="text-violet-600">Help</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-gray-500">
            Choose your inquiry type below and we&apos;ll route your message to the right team. We aim to respond within 24 hours.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-6">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Select inquiry type</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {contactRoutes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRouteChange(r.id)}
                    className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      selectedRoute === r.id
                        ? "border-violet-300 bg-violet-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`mb-3 flex h-6 w-6 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 ${r.color}`}>
                      {r.icon}
                    </div>
                    <p className="font-semibold text-[#1d2226] text-sm">{r.label}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{r.description}</p>
                    {selectedRoute === r.id && (
                      <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs">
                        <CheckCircleIcon className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#1d2226]">Message Ready to Send</h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Your email client should have opened with your message pre-filled and addressed to{" "}
                  <span className="text-violet-600">{SUPPORT_EMAIL}</span>. If it didn&apos;t open automatically, you can email us directly.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    <MailIcon className="h-4 w-4" />
                    Email Us Directly
                  </a>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-6 flex items-center gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 ${route.color}`}>
                    {route.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1d2226]">{route.label} Inquiry</p>
                    <p className="text-xs text-gray-500">Fill in your details and we&apos;ll be in touch</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1d2226] outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1d2226] outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1d2226] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"
                    >
                      <option value="" disabled>Select a subject…</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      placeholder={
                        selectedRoute === "whatsapp"
                          ? "Describe your issue in detail. Include your business phone number or WhatsApp Business Account ID if relevant…"
                          : selectedRoute === "plyndrox"
                          ? "Describe the issue you're experiencing with Plyndrox AI. Include any steps to reproduce or example prompts if helpful…"
                          : "Describe your question or issue in as much detail as possible. The more context you provide, the faster we can help…"
                      }
                      value={form.message}
                      onChange={handleChange}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1d2226] outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                    <p className="mt-2 text-right text-xs text-gray-400">{form.message.length} / 2000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d2226] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d3238] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Opening email client…
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    Your message will open in your default email app pre-addressed to{" "}
                    <span className="text-gray-500">{SUPPORT_EMAIL}</span>
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Contact Details</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
                    <MailIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1d2226]">Support Email</p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-0.5 block text-sm text-violet-600 underline underline-offset-2 transition hover:text-violet-700 break-all">
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                    <ClockIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1d2226]">Response Time</p>
                    <p className="mt-0.5 text-sm text-gray-500">Within 24 hours on business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                    <ShieldIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1d2226]">Privacy Assured</p>
                    <p className="mt-0.5 text-sm text-gray-500">Your inquiry is handled confidentially</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Route Your Inquiry</p>
              <div className="space-y-3">
                {contactRoutes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { handleRouteChange(r.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition hover:border-gray-300 hover:bg-gray-50 ${
                      selectedRoute === r.id ? "border-violet-200 bg-violet-50" : "border-gray-200 bg-transparent"
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 ${r.color}`}>
                      {r.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1d2226]">{r.label}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{r.description}</p>
                    </div>
                    {selectedRoute === r.id && (
                      <CheckCircleIcon className="ml-auto h-4 w-4 shrink-0 text-violet-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Quick Links</p>
              <div className="space-y-1">
                {[
                  ["Privacy Policy", "/privacy-policy"],
                  ["Terms of Service", "/terms"],
                  ["Cookie Policy", "/cookies"],
                  ["Disclaimer", "/disclaimer"],
                  ["About Us", "/about"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-[#1d2226]"
                  >
                    {label}
                    <ArrowRightIcon className="h-3.5 w-3.5 opacity-40" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <div className="flex items-start gap-3">
                <MessageIcon className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1d2226]">Plyndrox WhatsApp AI Users</p>
                  <p className="mt-1.5 text-xs leading-5 text-gray-500">
                    When contacting us about Plyndrox WhatsApp AI, please include your WhatsApp Business Account ID and a brief description of your automation setup to help us assist you faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-8 sm:px-6 lg:px-8 mt-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Plyndrox AI. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="transition hover:text-[#1d2226]">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-[#1d2226]">Terms of Service</Link>
            <Link href="/cookies" className="transition hover:text-[#1d2226]">Cookie Policy</Link>
            <Link href="/disclaimer" className="transition hover:text-[#1d2226]">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
