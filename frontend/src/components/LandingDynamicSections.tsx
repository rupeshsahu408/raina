"use client";

import dynamic from "next/dynamic";

export const AuthRedirectLazy = dynamic(
  () => import("@/components/AuthRedirect").then((m) => ({ default: m.AuthRedirect })),
  { ssr: false, loading: () => null }
);

export const ThemeToggleButtonLazy = dynamic(
  () => import("@/components/ThemeToggleButton").then((m) => ({ default: m.ThemeToggleButton })),
  {
    ssr: false,
    loading: () => <div className="h-9 w-9" aria-hidden="true" />,
  }
);

export const DemoChatWidgetLazy = dynamic(
  () => import("@/components/DemoChatWidget").then((m) => ({ default: m.DemoChatWidget })),
  {
    ssr: false,
    loading: () => <div className="h-80 rounded-2xl bg-zinc-800/50 animate-pulse" />,
  }
);

export const IntroVideoSectionLazy = dynamic(
  () => import("@/components/IntroVideoSection").then((m) => ({ default: m.IntroVideoSection })),
  { ssr: false, loading: () => null }
);

export const FeedbackReportSectionLazy = dynamic(
  () => import("@/components/FeedbackReportSection").then((m) => ({ default: m.FeedbackReportSection })),
  { ssr: false, loading: () => null }
);

export const PlyndroxAssistantLazy = dynamic(
  () => import("@/components/PlyndroxAssistant").then((m) => ({ default: m.PlyndroxAssistant })),
  { ssr: false, loading: () => null }
);
