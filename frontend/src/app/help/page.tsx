"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
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

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function ThumbUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" />
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

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
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

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

const helpCategories = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: <RocketIcon className="h-6 w-6" />,
    color: "text-violet-600",
    bg: "bg-purple-500/10",
    border: "border-purple-500/25",
    dot: "bg-purple-400",
    count: 8,
    description: "New to Evara AI? Start here for a smooth onboarding experience.",
    articles: ["Creating your Evara AI account", "Navigating the dashboard", "Setting up your first AI product", "Understanding your plan limits", "Connecting your business profile"],
  },
  {
    id: "account-setup",
    label: "Account & Setup",
    icon: <UserIcon className="h-6 w-6" />,
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    dot: "bg-sky-400",
    count: 6,
    description: "Manage your profile, security, notifications and team members.",
    articles: ["Updating your profile information", "Changing your password", "Two-factor authentication setup", "Managing team members", "Email notification preferences"],
  },
  {
    id: "ivana-ai",
    label: "Evara AI",
    icon: <BrainIcon className="h-6 w-6" />,
    color: "text-fuchsia-600",
    bg: "bg-pink-500/10",
    border: "border-pink-500/25",
    dot: "bg-pink-400",
    count: 12,
    description: "Help with your Evara AI web and app chat assistant.",
    articles: ["Starting your first conversation", "How to write effective prompts", "Managing conversation history", "Evara AI response quality", "Using Evara AI for documents"],
  },
  {
    id: "whatsapp-ai",
    label: "WhatsApp AI",
    icon: <MessageIcon className="h-6 w-6" />,
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    dot: "bg-emerald-400",
    count: 14,
    description: "WhatsApp Business API setup, automation, and troubleshooting.",
    articles: ["Connecting WhatsApp Business API", "Building your knowledge base", "Setting up automated replies", "Escalation rules and routing", "Managing message templates"],
  },
  {
    id: "billing",
    label: "Billing & Subscriptions",
    icon: <CreditCardIcon className="h-6 w-6" />,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    dot: "bg-amber-400",
    count: 5,
    description: "Plans, payments, invoices and subscription management.",
    articles: ["Understanding Evara AI plans", "Upgrading or downgrading your plan", "Viewing and downloading invoices", "Cancelling your subscription", "Payment method management"],
  },
  {
    id: "technical",
    label: "Technical Issues",
    icon: <AlertIcon className="h-6 w-6" />,
    color: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    dot: "bg-red-400",
    count: 9,
    description: "Troubleshoot errors, performance issues, and platform problems.",
    articles: ["WhatsApp webhook not receiving messages", "Evara AI not responding correctly", "Account login problems", "Slow response times", "Data not syncing in dashboard"],
  },
  {
    id: "api",
    label: "API & Integrations",
    icon: <CodeIcon className="h-6 w-6" />,
    color: "text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/25",
    dot: "bg-indigo-400",
    count: 7,
    description: "Connect external tools, manage API keys and webhooks.",
    articles: ["Generating your API key", "Webhook configuration guide", "API rate limits and quotas", "Connecting third-party tools", "Testing your integration"],
  },
];

const faqs = [
  {
    id: "faq-1",
    category: "Getting Started",
    question: "How do I create an Evara AI account?",
    answer: "Creating an Evara AI account is simple. Visit rainajet.com and click 'Sign Up'. Enter your email address, create a secure password, and follow the verification steps. Once verified, you will be taken to your dashboard where you can set up Evara AI or WhatsApp AI based on your plan.",
    tags: ["account", "signup", "getting started"],
  },
  {
    id: "faq-2",
    category: "WhatsApp AI",
    question: "How do I connect my WhatsApp Business number to Evara AI?",
    answer: "To connect WhatsApp, you need a verified Meta Business account and WhatsApp Business Platform access. In your Evara AI dashboard, navigate to WhatsApp AI → Connect Integration. Enter your Phone Number ID and access token from the Meta Developer Portal. Evara AI will generate a webhook URL — paste this into your Meta app's webhook configuration and verify it. The connection is live within minutes.",
    tags: ["whatsapp", "setup", "meta", "api"],
  },
  {
    id: "faq-3",
    category: "Evara AI",
    question: "Why is Evara AI giving me inaccurate or unexpected responses?",
    answer: "Evara AI's response quality depends heavily on how your questions are framed. For best results: (1) Provide clear context about your situation, (2) Specify the format you want the response in, (3) Be precise about what you need. If a response is off, ask Ivana to try again with more specific instructions. For persistent issues, contact support@evara.ai.",
    tags: ["ivana", "accuracy", "quality", "troubleshoot"],
  },
  {
    id: "faq-4",
    category: "WhatsApp AI",
    question: "My WhatsApp AI is not responding to customer messages — what should I check?",
    answer: "First, verify that your webhook is correctly configured in the Meta Developer Portal and is pointing to the Evara AI webhook URL. Second, confirm that your access token has not expired — Meta access tokens can expire if not refreshed. Third, check that the WhatsApp number is verified and active. Fourth, review the conversation logs in your Evara AI dashboard to see if messages are being received but not matched to your knowledge base.",
    tags: ["whatsapp", "not working", "webhook", "troubleshoot"],
  },
  {
    id: "faq-5",
    category: "Billing",
    question: "Can I switch plans or cancel at any time?",
    answer: "Yes, you can upgrade, downgrade, or cancel your Evara AI subscription at any time from your account settings. Upgrades take effect immediately. Downgrades and cancellations take effect at the end of your current billing period — you retain full access until then. We do not charge cancellation fees.",
    tags: ["billing", "cancel", "plan", "subscription"],
  },
  {
    id: "faq-6",
    category: "Evara AI",
    question: "How do I save and revisit my Evara AI conversations?",
    answer: "Evara AI automatically saves your conversation history when you are logged in. Access past conversations from the 'History' panel on the left side of the Evara AI interface. You can also search through conversation history, rename chats for easy reference, and delete conversations you no longer need from the same panel.",
    tags: ["ivana", "history", "conversations", "save"],
  },
  {
    id: "faq-7",
    category: "WhatsApp AI",
    question: "How do I add business information to my WhatsApp AI knowledge base?",
    answer: "In your Evara AI dashboard, navigate to WhatsApp AI → Knowledge Base. Here you can add your business information in sections: Business Details (name, hours, location), Products & Services, FAQs, and custom topics. The more detailed and accurate your knowledge base, the better your AI will respond to customers. You can update it at any time and changes take effect immediately.",
    tags: ["whatsapp", "knowledge base", "setup", "configuration"],
  },
  {
    id: "faq-8",
    category: "Account",
    question: "How do I add team members to my Evara AI account?",
    answer: "Team member access is available on Business plans. Navigate to Settings → Team Members and click 'Invite Member'. Enter the team member's email address and assign a role (Admin, Manager, or Viewer). They will receive an invitation email with setup instructions. You can adjust permissions or remove team members at any time.",
    tags: ["account", "team", "invite", "members"],
  },
  {
    id: "faq-9",
    category: "API",
    question: "Where do I find my Evara AI API key?",
    answer: "API keys are available to users on Pro and Business plans. Navigate to Settings → API Keys and click 'Generate New Key'. Copy the key immediately — for security, it will only be shown once in full. If you lose a key, you can revoke it and generate a new one. Keep your API keys secure and never share them publicly or commit them to version control.",
    tags: ["api", "key", "integration", "developer"],
  },
  {
    id: "faq-10",
    category: "Technical",
    question: "What should I do if my Evara AI dashboard is not loading?",
    answer: "Try these steps in order: (1) Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R), (2) Clear your browser cache and cookies, (3) Try a different browser, (4) Check your internet connection, (5) Disable browser extensions that might interfere with the page. If the issue persists, contact support at support.evara.ai@sendora.me with a description of the problem and your browser/device information.",
    tags: ["technical", "dashboard", "loading", "browser"],
  },
];

const ivanaTips = [
  {
    title: "Starting a conversation",
    desc: "Type your question or request in the chat input and press Enter or click Send. Evara AI will respond within seconds.",
  },
  {
    title: "Getting better responses",
    desc: "Include context about who you are, what you are trying to achieve, and any specific constraints. The more specific your input, the more useful the output.",
  },
  {
    title: "Iterating on responses",
    desc: "If the first response is close but not perfect, refine it: 'Make this shorter', 'Use a more formal tone', 'Add more detail about X'. Iteration is expected and encouraged.",
  },
  {
    title: "Using Ivana for documents",
    desc: "Paste document content directly into the chat and ask Ivana to summarize, rewrite, analyze, or improve it. Works for emails, reports, product descriptions, and more.",
  },
  {
    title: "Conversation history",
    desc: "All your conversations are automatically saved and accessible from the history panel on the left. Rename conversations for easy retrieval later.",
  },
  {
    title: "Common issues",
    desc: "If Ivana is generating off-topic responses, try starting a new conversation. If responses are consistently poor, check that you are providing sufficient context in your prompts.",
  },
];

const whatsappTips = [
  {
    title: "Connecting the WhatsApp Business API",
    desc: "You need a Meta Business account and WhatsApp Platform access. Enter your Phone Number ID and access token in the Evara AI dashboard to connect.",
  },
  {
    title: "Building your knowledge base",
    desc: "Add business info, FAQs, product details, and policies. The more complete your knowledge base, the better your AI handles real customer queries.",
  },
  {
    title: "Configuring escalation rules",
    desc: "Set keywords or intent patterns that trigger human escalation — for example, 'refund', 'complaint', or queries that fall outside your knowledge base.",
  },
  {
    title: "Setting message templates",
    desc: "Message templates require Meta approval. Submit them from the Evara AI dashboard. Use templates for proactive messages sent outside the 24-hour customer-initiated window.",
  },
  {
    title: "Common error: webhook not verifying",
    desc: "Ensure the webhook URL from Evara AI is pasted exactly into Meta, and that your verification token matches what you entered in both places.",
  },
  {
    title: "Common error: access token expired",
    desc: "Meta access tokens can expire. Generate a new permanent token from your Meta developer app settings and update it in your Evara AI dashboard.",
  },
];

const popularArticles = [
  { title: "Complete WhatsApp AI setup guide", category: "WhatsApp AI", time: "9 min" },
  { title: "How to write effective prompts for Evara AI", category: "Evara AI", time: "5 min" },
  { title: "Connecting your WhatsApp Business API", category: "WhatsApp AI", time: "6 min" },
  { title: "Understanding your Evara AI plan limits", category: "Billing", time: "3 min" },
  { title: "Troubleshooting WhatsApp webhook errors", category: "Technical", time: "4 min" },
  { title: "Getting started with your Evara AI dashboard", category: "Getting Started", time: "4 min" },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down" | null>>({});

  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q && !activeCategory) return faqs;
    return faqs.filter((faq) => {
      const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.tags.some((t) => t.includes(q));
      const matchesCategory = !activeCategory || faq.category.toLowerCase().replace(/\s/g, "-") === activeCategory || faq.category.toLowerCase().includes(activeCategory.replace("-", " "));
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return helpCategories;
    return helpCategories.filter((c) => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.articles.some((a) => a.toLowerCase().includes(q)));
  }, [search]);

  const hasResults = filteredFaqs.length > 0 || filteredCategories.length > 0;

  return (
    <div className="min-h-screen bg-white text-[#1d2226] ">
      
        {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara AI" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Evara AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hidden text-sm text-gray-400 transition hover:text-gray-600 sm:block">Blog</Link>
            <Link href="/contact" className="hidden text-sm text-gray-400 transition hover:text-gray-600 sm:block">Contact</Link>
            <Link href="/" className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238]">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── Hero with Search ── */}
        <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 pt-24 pb-14 text-center sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.13),transparent_65%)]" />
          <div className="relative w-full max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 mb-6">
              <BookIcon className="h-3.5 w-3.5" />
              Help Center
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              How can we{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                help you?
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
              Search our knowledge base or browse categories to find answers fast.
            </p>

            {/* Search Bar */}
            <div className="relative mt-8">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help topics, questions, or keywords..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-100 py-4 pl-12 pr-12 text-base text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:bg-white/[0.09] focus:ring-2 focus:ring-indigo-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search info */}
            {search && (
              <div className="mt-3 text-xs text-gray-400">
                {hasResults ? (
                  <span>{filteredFaqs.length} answer{filteredFaqs.length !== 1 ? "s" : ""} and {filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"} found for "<span className="text-gray-600">{search}</span>"</span>
                ) : (
                  <span>No results for "<span className="text-gray-600">{search}</span>" — try different keywords or <Link href="/contact" className="text-indigo-400 hover:underline">contact support</Link>.</span>
                )}
              </div>
            )}

            {/* Quick links */}
            {!search && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["Setting up WhatsApp AI", "Evara AI prompts", "Cancel subscription", "API key", "Webhook error"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSearch(q)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs text-gray-500 transition hover:border-gray-300 hover:text-[#1d2226]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Popular Articles ── */}
        {!search && (
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1d2226]">Popular Articles</h2>
              <span className="text-xs text-gray-400">{popularArticles.length} articles</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popularArticles.map((a, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                    <BookIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1d2226] group-hover:text-white transition-colors truncate">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.category} · {a.time} read</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500 transition shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Help Categories ── */}
        <section className="relative border-y border-gray-100 bg-white/[0.015] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#1d2226]">Browse by Category</h2>
                <p className="mt-1 text-sm text-gray-400">Select a topic to explore articles in that area</p>
              </div>
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 transition hover:text-white"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Clear filter
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`group text-left rounded-[1.5rem] border p-5 transition-all duration-200 hover:scale-[1.02] ${cat.bg} ${cat.border} ${activeCategory === cat.id ? "ring-2 ring-white/20 scale-[1.02]" : ""}`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 mb-4 ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${cat.color}`}>{cat.label}</p>
                    <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400">{cat.count}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-gray-400">{cat.description}</p>
                  <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5">
                    {cat.articles.slice(0, 3).map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-500 transition">
                        <span className={`h-1 w-1 rounded-full shrink-0 ${cat.dot}`} />
                        <span className="truncate">{a}</span>
                      </div>
                    ))}
                    {cat.articles.length > 3 && (
                      <p className="text-xs text-gray-400 pl-3">+{cat.articles.length - 3} more</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {filteredCategories.length === 0 && search && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center mt-4">
                <p className="text-sm text-gray-500">No categories matched your search.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── FAQ Accordion ── */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#1d2226]">
              {search ? `Results for "${search}"` : "Frequently Asked Questions"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {filteredFaqs.length > 0 ? `${filteredFaqs.length} answer${filteredFaqs.length !== 1 ? "s" : ""} found` : "Try a different search term"}
            </p>
          </div>
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 ${openFaq === faq.id ? "border-gray-300 bg-gray-100" : "border-gray-200 bg-white hover:border-white/15 hover:bg-gray-50"}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="flex w-full items-start justify-between gap-4 p-5 text-left"
                >
                  <div className="flex-1">
                    <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold text-gray-400 mb-2">{faq.category}</span>
                    <p className="text-sm font-semibold text-white leading-snug">{faq.question}</p>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 shrink-0 text-gray-400 mt-1 transition-transform duration-200 ${openFaq === faq.id ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === faq.id && (
                  <div className="px-5 pb-5">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm leading-7 text-gray-500">{faq.answer}</p>
                      <div className="mt-5 flex items-center gap-3">
                        <span className="text-xs text-gray-400">Was this helpful?</span>
                        <button
                          onClick={() => setFeedback((p) => ({ ...p, [faq.id]: p[faq.id] === "up" ? null : "up" }))}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition ${feedback[faq.id] === "up" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-600"}`}
                        >
                          <ThumbUpIcon className="h-3.5 w-3.5" /> Yes
                        </button>
                        <button
                          onClick={() => setFeedback((p) => ({ ...p, [faq.id]: p[faq.id] === "down" ? null : "down" }))}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition ${feedback[faq.id] === "down" ? "border-red-400/30 bg-red-400/10 text-red-300" : "border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-600"}`}
                        >
                          <ThumbDownIcon className="h-3.5 w-3.5" /> No
                        </button>
                        {feedback[faq.id] && (
                          <span className="text-xs text-gray-400">Thanks for your feedback!</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {faq.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearch(tag)}
                            className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] text-gray-400 hover:text-gray-500 transition"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <SearchIcon className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No results found. Try different keywords.</p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition">
                  Contact support <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── AI-Specific Help ── */}
        {!search && (
          <section className="relative border-y border-gray-100 bg-white/[0.015] py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-600">
                  Product-Specific Help
                </p>
                <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">
                  Get help for your specific product
                </h2>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">

                {/* Evara AI Help */}
                <div className="rounded-[2rem] border border-pink-500/20 bg-pink-500/[0.05] p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-fuchsia-600">
                      <BrainIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1d2226]">Evara AI</p>
                      <p className="text-xs text-fuchsia-600">Web & App AI Assistant</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {ivanaTips.map((tip, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-white mb-1">{tip.title}</p>
                        <p className="text-xs leading-5 text-gray-400">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <Link href="/chat" className="group inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pink-400">
                      Try Evara AI
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

                {/* WhatsApp AI Help */}
                <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/[0.05] p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                      <MessageIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1d2226]">WhatsApp AI</p>
                      <p className="text-xs text-emerald-300">Business Automation</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {whatsappTips.map((tip, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-white mb-1">{tip.title}</p>
                        <p className="text-xs leading-5 text-gray-400">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <Link href="/whatsapp-ai" className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500">
                      Explore WhatsApp AI
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Still Need Help? ── */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="sm:col-span-2 rounded-[2rem] border border-gray-200 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 mb-5">
                <MailIcon className="h-6 w-6 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-[#1d2226]">Still need help?</h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                Our support team is here to help you. If you cannot find the answer you need in our Help Center, reach out directly. We typically respond within a few hours during business hours.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  support.evara.ai@sendora.me
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Response within 4–8 hours
                </span>
              </div>
              <div className="mt-6">
                <Link href="/contact" className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Open a Support Ticket
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <SettingsIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-[#1d2226]">Technical Issues</p>
                </div>
                <p className="text-xs leading-5 text-gray-400">For bugs or platform errors, include your browser, device, and a description of what happened.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ZapIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-[#1d2226]">WhatsApp Issues</p>
                </div>
                <p className="text-xs leading-5 text-gray-400">Share your Phone Number ID and a description of the issue for fastest resolution.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCardIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-[#1d2226]">Billing Questions</p>
                </div>
                <p className="text-xs leading-5 text-gray-400">Include your account email and the nature of your billing question for quick lookup.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.16),transparent_65%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 mb-6">
              <RocketIcon className="h-3.5 w-3.5" />
              Start Building with AI
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-gray-500">
              You now have everything you need. Launch Evara AI for intelligent conversation, or connect WhatsApp AI to automate your business communication today.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/chat" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100 shadow-xl">
                Try Evara AI Now
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="/whatsapp-ai" className="group inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-7 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-400/20">
                Set Up WhatsApp AI
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gray-100 bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© 2026 Evara AI. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/blog" className="transition hover:text-gray-500">Blog</Link>
            <Link href="/about" className="transition hover:text-gray-500">About</Link>
            <Link href="/contact" className="transition hover:text-gray-500">Contact Support</Link>
            <Link href="/privacy-policy" className="transition hover:text-gray-500">Privacy</Link>
            <Link href="/terms" className="transition hover:text-gray-500">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
