export type Platform = "evara" | "whatsapp-ai" | "ibara" | "inbox";

const LAST_PLATFORM_KEY = "evara_last_active_platform";

export function setLastActivePlatform(platform: Platform): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_PLATFORM_KEY, platform);
}

export function getLastActivePlatform(): Platform | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(LAST_PLATFORM_KEY);
  if (val === "evara" || val === "whatsapp-ai" || val === "ibara") return val;
  return null;
}

export function getPlatformRedirectPath(platform: Platform): string {
  switch (platform) {
    case "evara":
      return "/chat";
    case "whatsapp-ai":
      return "/whatsapp-ai/dashboard";
    case "ibara":
      return "/ibara/dashboard";
    case "inbox":
      return "/inbox/dashboard";
  }
}

export const PLATFORM_META: Record<Platform, { label: string; description: string; color: string; bg: string; border: string }> = {
  evara: {
    label: "Evara AI",
    description: "Personal AI companion",
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  "whatsapp-ai": {
    label: "WhatsApp AI",
    description: "Business automation",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  ibara: {
    label: "Website AI",
    description: "AI chatbot for your site",
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  inbox: {
    label: "Inbox AI",
    description: "Smart email assistant",
    color: "text-fuchsia-300",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
  },
};
