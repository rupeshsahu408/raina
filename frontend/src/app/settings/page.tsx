"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, updateEmail, updatePassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { useTheme } from "@/components/ThemeProvider";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Section = "profile" | "personalization" | "about" | "memory" | "privacy" | "security";

type Profile = {
  name: string;
  photoUrl: string;
  bio: string;
  selectedPersonality: "Simi" | "Loa";
  languagePreference: "english" | "hindi" | "hinglish";
  about: { nickname: string; occupation: string; moreAboutYou: string };
  personalization: {
    theme: "auto" | "dark" | "light";
    accentColor: string;
    fontSize: "small" | "medium" | "large";
    bubbleStyle: "rounded" | "sharp";
    typingSpeed: "slow" | "normal" | "fast";
  };
  memorySettings: { allowMemory: boolean; referenceChatHistory: boolean };
  privacy: { incognitoChatMode: boolean };
};

const DEFAULT_PROFILE: Profile = {
  name: "",
  photoUrl: "",
  bio: "",
  selectedPersonality: "Simi",
  languagePreference: "english",
  about: { nickname: "", occupation: "", moreAboutYou: "" },
  personalization: {
    theme: "auto",
    accentColor: "#7c3aed",
    fontSize: "medium",
    bubbleStyle: "rounded",
    typingSpeed: "normal",
  },
  memorySettings: { allowMemory: true, referenceChatHistory: true },
  privacy: { incognitoChatMode: false },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        checked ? "bg-violet-600" : "bg-zinc-700",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-white/[0.05] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-zinc-200 font-medium">{label}</p>
        {description && <p className="text-[12px] text-zinc-500 mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[17px] font-semibold text-zinc-100">{title}</h2>
      {description && <p className="text-[13px] text-zinc-500 mt-1">{description}</p>}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={[
        "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] font-medium shadow-2xl shadow-black/40 transition-all",
        type === "success"
          ? "bg-emerald-600/90 text-white"
          : "bg-red-600/90 text-white",
      ].join(" ")}
    >
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
}

function InlineConfirm({
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  danger = true,
}: {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div className="mt-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] px-4 py-3 space-y-3">
      <p className="text-[13px] text-zinc-300 leading-snug">{message}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className={[
            "rounded-xl px-4 py-1.5 text-[12.5px] font-medium transition",
            danger
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-violet-600/20 text-violet-400 hover:bg-violet-600/30",
          ].join(" ")}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-white/[0.05] px-4 py-1.5 text-[12.5px] font-medium text-zinc-400 hover:bg-white/[0.09] transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "personalization", label: "Personalization", icon: "🎨" },
  { id: "about", label: "About You", icon: "📝" },
  { id: "memory", label: "Memory", icon: "🧠" },
  { id: "privacy", label: "Privacy & Data", icon: "🔒" },
  { id: "security", label: "Security", icon: "🛡️" },
];

const SELECTS = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[13.5px] text-zinc-200 outline-none focus:border-violet-500/60 transition cursor-pointer";
const INPUT = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[13.5px] text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-violet-500/60 transition";
const BTN_GHOST = "rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-zinc-100 transition";
const BTN_DANGER = "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/20 transition";
const BTN_PRIMARY = "rounded-xl bg-violet-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-violet-500 transition";

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [dirty, setDirty] = useState(false);

  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sessionInfo, setSessionInfo] = useState<{ device: string; lastSignIn: string; created: string } | null>(null);

  const [confirm, setConfirm] = useState<null | "deleteChats" | "clearMemory" | "clearAll" | "logoutAll">(null);
  const [exporting, setExporting] = useState(false);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function patchProfile(update: Partial<Profile>) {
    setProfile((prev) => ({ ...prev, ...update }));
    setDirty(true);
  }

  function patchPersonalization(update: Partial<Profile["personalization"]>) {
    setProfile((prev) => ({ ...prev, personalization: { ...prev.personalization, ...update } }));
    setDirty(true);
  }

  function patchAbout(update: Partial<Profile["about"]>) {
    setProfile((prev) => ({ ...prev, about: { ...prev.about, ...update } }));
    setDirty(true);
  }

  async function getToken(): Promise<string | null> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  async function saveProfile() {
    const token = await getToken();
    if (!token) return;
    try {
      const resp = await fetch(`${API}/v1/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: profile.name || null,
          photoUrl: profile.photoUrl || null,
          bio: profile.bio || null,
          selectedPersonality: profile.selectedPersonality,
          languagePreference: profile.languagePreference,
          about: {
            nickname: profile.about.nickname || null,
            occupation: profile.about.occupation || null,
            moreAboutYou: profile.about.moreAboutYou || null,
          },
          personalization: profile.personalization,
          memorySettings: profile.memorySettings,
          privacy: profile.privacy,
        }),
      });
      if (!resp.ok) throw new Error("Failed to save");
      setDirty(false);
      showToast("Settings saved");
    } catch {
      showToast("Could not save settings", "error");
    }
  }

  async function autoSaveToggle(update: Partial<Profile>) {
    patchProfile(update);
    const token = await getToken();
    if (!token) return;
    try {
      await fetch(`${API}/v1/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...profile, ...update }),
      });
      showToast("Saved");
    } catch {
      showToast("Could not save", "error");
    }
  }

  async function autoSaveMemory(update: Partial<Profile["memorySettings"]>) {
    const newMemory = { ...profile.memorySettings, ...update };
    setProfile((prev) => ({ ...prev, memorySettings: newMemory }));
    const token = await getToken();
    if (!token) return;
    try {
      await fetch(`${API}/v1/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...profile, memorySettings: newMemory }),
      });
      showToast("Saved");
    } catch {
      showToast("Could not save", "error");
    }
  }

  async function autoSavePrivacy(update: Partial<Profile["privacy"]>) {
    const newPrivacy = { ...profile.privacy, ...update };
    setProfile((prev) => ({ ...prev, privacy: newPrivacy }));
    const token = await getToken();
    if (!token) return;
    try {
      await fetch(`${API}/v1/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...profile, privacy: newPrivacy }),
      });
      showToast("Saved");
    } catch {
      showToast("Could not save", "error");
    }
  }

  async function handleDeleteAllChats() {
    const token = await getToken();
    if (!token) return;
    try {
      const resp = await fetch(`${API}/v1/conversations`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error();
      setConfirm(null);
      showToast("All chats deleted");
    } catch {
      showToast("Could not delete chats", "error");
      setConfirm(null);
    }
  }

  async function handleClearMemory() {
    const token = await getToken();
    if (!token) return;
    try {
      const resp = await fetch(`${API}/v1/memory/clear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error();
      setConfirm(null);
      showToast("Memory cleared");
    } catch {
      showToast("Could not clear memory", "error");
      setConfirm(null);
    }
  }

  async function handleClearAllData() {
    const token = await getToken();
    if (!token) return;
    try {
      const resp = await fetch(`${API}/v1/account/clear-all-data`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error();
      setConfirm(null);
      const auth = getFirebaseAuth();
      await signOut(auth);
      router.replace("/login");
    } catch {
      showToast("Could not clear data", "error");
      setConfirm(null);
    }
  }

  async function handleLogoutAll() {
    const token = await getToken();
    if (!token) return;
    try {
      const resp = await fetch(`${API}/v1/auth/logout-all-devices`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error();
      const auth = getFirebaseAuth();
      await signOut(auth);
      router.replace("/login");
    } catch {
      showToast("Could not logout all devices", "error");
      setConfirm(null);
    }
  }

  async function handleExport() {
    const token = await getToken();
    if (!token) return;
    setExporting(true);
    try {
      const resp = await fetch(`${API}/v1/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evara-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Export downloaded");
    } catch {
      showToast("Could not export data", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleChangeEmail() {
    if (!newEmail.trim()) { showToast("Enter a new email", "error"); return; }
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateEmail(user, newEmail.trim());
      setCurrentEmail(newEmail.trim());
      setNewEmail("");
      showToast("Email updated");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update email — try re-logging in", "error");
    }
  }

  async function handleChangePassword() {
    if (newPassword.trim().length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updatePassword(user, newPassword.trim());
      setNewPassword("");
      showToast("Password updated");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update password — try re-logging in", "error");
    }
  }

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace("/login"); return; }
      setCurrentEmail(user.email ?? "");
      setSessionInfo({
        device: `${navigator.platform} · ${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}`,
        lastSignIn: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : "Unknown",
        created: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown",
      });
      try {
        const token = await user.getIdToken();
        const resp = await fetch(`${API}/v1/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (resp.ok) {
          const d = await resp.json();
          const loadedTheme: "auto" | "dark" | "light" = d.personalization?.theme ?? "auto";
          setProfile({
            name: d.name ?? "",
            photoUrl: d.photoUrl ?? "",
            bio: d.bio ?? "",
            selectedPersonality: d.selectedPersonality ?? "Simi",
            languagePreference: d.languagePreference ?? "english",
            about: {
              nickname: d.about?.nickname ?? "",
              occupation: d.about?.occupation ?? "",
              moreAboutYou: d.about?.moreAboutYou ?? "",
            },
            personalization: {
              theme: loadedTheme,
              accentColor: d.personalization?.accentColor ?? "#7c3aed",
              fontSize: d.personalization?.fontSize ?? "medium",
              bubbleStyle: d.personalization?.bubbleStyle ?? "rounded",
              typingSpeed: d.personalization?.typingSpeed ?? "normal",
            },
            memorySettings: {
              allowMemory: d.memorySettings?.allowMemory ?? true,
              referenceChatHistory: d.memorySettings?.referenceChatHistory ?? true,
            },
            privacy: { incognitoChatMode: d.privacy?.incognitoChatMode ?? false },
          });
          setTheme(loadedTheme);
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111]">
        <div className="flex items-center gap-2 text-[13px] text-zinc-500">
          <span className="animate-spin h-4 w-4 border-2 border-zinc-600 border-t-violet-500 rounded-full" />
          Loading settings…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#111111] text-zinc-100">
      {/* ── Sidebar nav ── */}
      <aside className="w-56 shrink-0 border-r border-white/[0.06] bg-[#0f0f0f] flex flex-col py-6 px-3 gap-1 hidden md:flex">
        <div className="flex items-center gap-2.5 px-3 pb-4">
          <img src="/evara-logo.png" alt="Evara AI" className="h-10 w-10 shrink-0 object-contain" draggable={false} />
          <span className="text-[14px] font-semibold tracking-tight text-zinc-100">Settings</span>
        </div>
        <a href="/chat" className="flex items-center gap-2 px-3 pb-5 text-[13px] text-zinc-500 hover:text-zinc-300 transition">
          ← Back to chat
        </a>
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setActiveSection(n.id)}
            className={[
              "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13.5px] font-medium text-left transition",
              activeSection === n.id
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
            ].join(" ")}
          >
            <span className="text-[15px]">{n.icon}</span>
            {n.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={async () => { const auth = getFirebaseAuth(); await signOut(auth); router.replace("/login"); }}
          className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13.5px] font-medium text-zinc-500 hover:text-red-400 hover:bg-white/[0.04] transition"
        >
          <span className="text-[15px]">🚪</span>
          Sign out
        </button>
      </aside>

      {/* ── Mobile top nav ── */}
      <div className="fixed top-0 left-0 right-0 z-20 flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#0f0f0f] px-3 py-2 md:hidden">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setActiveSection(n.id)}
            className={[
              "shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-medium transition",
              activeSection === n.id ? "bg-white/[0.09] text-zinc-100" : "text-zinc-500",
            ].join(" ")}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 px-6 py-10 md:py-10 pt-16 md:pt-10 max-w-2xl">

        {/* PROFILE */}
        {activeSection === "profile" && (
          <div>
            <SectionHeader title="Profile" description="Your public name, photo, and AI personality." />

            {/* Avatar preview */}
            <div className="mb-6 flex items-center gap-4">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover border-2 border-white/[0.1]" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-800 text-2xl font-bold text-white">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <div>
                <p className="text-[14px] font-medium text-zinc-200">{profile.name || "No name set"}</p>
                <p className="text-[12px] text-zinc-500">{currentEmail}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.05]">
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Display name</label>
                  <input value={profile.name} onChange={(e) => patchProfile({ name: e.target.value })} className={INPUT} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Photo URL</label>
                  <input value={profile.photoUrl} onChange={(e) => patchProfile({ photoUrl: e.target.value })} className={INPUT} placeholder="https://…" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Bio</label>
                  <textarea rows={2} value={profile.bio} onChange={(e) => patchProfile({ bio: e.target.value })} className={INPUT} placeholder="A short bio…" />
                </div>
              </div>

              <div className="p-4">
                <SettingRow label="AI Personality" description="Choose between Simi (warm & empathetic) and Loa (calm & analytical)">
                  <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1">
                    {(["Simi", "Loa"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => patchProfile({ selectedPersonality: p })}
                        className={[
                          "rounded-lg px-4 py-1.5 text-[12.5px] font-medium transition",
                          profile.selectedPersonality === p ? "bg-violet-600 text-white shadow" : "text-zinc-500 hover:text-zinc-300",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </SettingRow>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button type="button" onClick={saveProfile} className={BTN_PRIMARY}>
                Save profile
              </button>
            </div>
          </div>
        )}

        {/* PERSONALIZATION */}
        {activeSection === "personalization" && (
          <div>
            <SectionHeader title="Personalization" description="Customize the look and feel of Evara AI." />
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.05] p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Theme</label>
                  <select
                    value={profile.personalization.theme}
                    onChange={(e) => {
                      const t = e.target.value as "auto" | "dark" | "light";
                      patchPersonalization({ theme: t });
                      setTheme(t);
                    }}
                    className={SELECTS}
                  >
                    <option value="auto">Auto</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Font size</label>
                  <select value={profile.personalization.fontSize} onChange={(e) => patchPersonalization({ fontSize: e.target.value as never })} className={SELECTS}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Bubble style</label>
                  <select value={profile.personalization.bubbleStyle} onChange={(e) => patchPersonalization({ bubbleStyle: e.target.value as never })} className={SELECTS}>
                    <option value="rounded">Rounded</option>
                    <option value="sharp">Sharp</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">AI typing speed</label>
                  <select value={profile.personalization.typingSpeed} onChange={(e) => patchPersonalization({ typingSpeed: e.target.value as never })} className={SELECTS}>
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>
              <div className="pt-3">
                <label className="text-[12px] text-zinc-500 mb-2 block">Accent color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={profile.personalization.accentColor} onChange={(e) => patchPersonalization({ accentColor: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent p-0.5" />
                  <span className="text-[13px] text-zinc-400 font-mono">{profile.personalization.accentColor}</span>
                  {(["#7c3aed", "#2563eb", "#059669", "#dc2626", "#d97706"] as const).map((c) => (
                    <button key={c} type="button" onClick={() => patchPersonalization({ accentColor: c })} style={{ background: c }} className="h-6 w-6 rounded-full border-2 border-transparent hover:border-white/40 transition" />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={saveProfile} className={BTN_PRIMARY}>Save</button>
            </div>
          </div>
        )}

        {/* ABOUT YOU */}
        {activeSection === "about" && (
          <div>
            <SectionHeader title="About You" description="Help Evara AI understand you better for personalized responses." />
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Nickname (what AI calls you)</label>
                  <input value={profile.about.nickname} onChange={(e) => patchAbout({ nickname: e.target.value })} className={INPUT} placeholder="e.g. Alex" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1.5 block">Occupation</label>
                  <input value={profile.about.occupation} onChange={(e) => patchAbout({ occupation: e.target.value })} className={INPUT} placeholder="e.g. Software engineer" />
                </div>
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-1.5 block">Language preference</label>
                <select value={profile.languagePreference} onChange={(e) => patchProfile({ languagePreference: e.target.value as never })} className={SELECTS}>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="hinglish">Hinglish (mix of Hindi & English)</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-1.5 block">More about you</label>
                <textarea rows={4} value={profile.about.moreAboutYou} onChange={(e) => patchAbout({ moreAboutYou: e.target.value })} className={INPUT} placeholder="Your interests, values, goals, personality traits…" />
                <p className="mt-1.5 text-[11.5px] text-zinc-600">This is used by the AI to personalize your conversations.</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={saveProfile} className={BTN_PRIMARY}>Save</button>
            </div>
          </div>
        )}

        {/* MEMORY */}
        {activeSection === "memory" && (
          <div>
            <SectionHeader title="Memory" description="Control how Evara AI remembers and uses information about you." />
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.05]">
              <SettingRow
                label="Allow AI memory"
                description="Evara AI will remember key things you share across conversations."
              >
                <Toggle
                  checked={profile.memorySettings.allowMemory}
                  onChange={(v) => autoSaveMemory({ allowMemory: v })}
                />
              </SettingRow>
              <SettingRow
                label="Reference chat history"
                description="AI can look at past conversations for context when responding."
              >
                <Toggle
                  checked={profile.memorySettings.referenceChatHistory}
                  onChange={(v) => autoSaveMemory({ referenceChatHistory: v })}
                />
              </SettingRow>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] text-zinc-200 font-medium">Clear memory</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">Deletes all learned signals and memory summaries.</p>
                  </div>
                  <button type="button" onClick={() => setConfirm("clearMemory")} className={BTN_GHOST}>
                    Clear memory
                  </button>
                </div>
                {confirm === "clearMemory" && (
                  <InlineConfirm
                    message="This will permanently delete all AI memory and learned patterns. This cannot be undone."
                    confirmLabel="Clear memory"
                    onConfirm={handleClearMemory}
                    onCancel={() => setConfirm(null)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY & DATA */}
        {activeSection === "privacy" && (
          <div>
            <SectionHeader title="Privacy & Data" description="Manage your data, incognito mode, and exports." />
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.05]">
              <SettingRow
                label="Incognito chat mode"
                description="Chats won't be saved to your history when this is on."
              >
                <Toggle
                  checked={profile.privacy.incognitoChatMode}
                  onChange={(v) => autoSavePrivacy({ incognitoChatMode: v })}
                />
              </SettingRow>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] text-zinc-200 font-medium">Export your data</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">Download all your conversations as a JSON file.</p>
                  </div>
                  <button type="button" onClick={handleExport} disabled={exporting} className={BTN_GHOST}>
                    {exporting ? "Exporting…" : "Export"}
                  </button>
                </div>

                <div className="border-t border-white/[0.05] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] text-zinc-200 font-medium">Delete all chats</p>
                      <p className="text-[12px] text-zinc-500 mt-0.5">Permanently removes all conversations and messages.</p>
                    </div>
                    <button type="button" onClick={() => setConfirm("deleteChats")} className={BTN_DANGER}>
                      Delete all
                    </button>
                  </div>
                  {confirm === "deleteChats" && (
                    <InlineConfirm
                      message="This will permanently delete all your chat history. This cannot be undone."
                      confirmLabel="Delete all chats"
                      onConfirm={handleDeleteAllChats}
                      onCancel={() => setConfirm(null)}
                    />
                  )}
                </div>

                <div className="border-t border-white/[0.05] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] text-zinc-200 font-medium">Clear all account data</p>
                      <p className="text-[12px] text-zinc-500 mt-0.5">Deletes all chats, memory, and your profile. You'll be signed out.</p>
                    </div>
                    <button type="button" onClick={() => setConfirm("clearAll")} className={BTN_DANGER}>
                      Clear all
                    </button>
                  </div>
                  {confirm === "clearAll" && (
                    <InlineConfirm
                      message="This permanently deletes everything — all chats, memory, and your profile. You will be signed out. This cannot be undone."
                      confirmLabel="Yes, delete everything"
                      onConfirm={handleClearAllData}
                      onCancel={() => setConfirm(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY */}
        {activeSection === "security" && (
          <div>
            <SectionHeader title="Security" description="Manage your email, password, and active sessions." />

            {/* Session info */}
            {sessionInfo && (
              <div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-[13px] space-y-1.5">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Current session</p>
                <p className="text-zinc-400">📧 {currentEmail}</p>
                <p className="text-zinc-400">💻 {sessionInfo.device}</p>
                <p className="text-zinc-400">🕐 Last sign-in: {sessionInfo.lastSignIn}</p>
                <p className="text-zinc-400">📅 Account created: {sessionInfo.created}</p>
              </div>
            )}

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.05]">
              <div className="p-4 space-y-3">
                <p className="text-[13px] font-semibold text-zinc-300">Change email</p>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={INPUT} placeholder="new@email.com" />
                <button type="button" onClick={handleChangeEmail} className={BTN_GHOST}>Update email</button>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-[13px] font-semibold text-zinc-300">Change password</p>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={INPUT} placeholder="New password (min. 6 characters)" />
                <button type="button" onClick={handleChangePassword} className={BTN_GHOST}>Update password</button>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] text-zinc-200 font-medium">Sign out this device</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">Signs you out from this browser only.</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => { const auth = getFirebaseAuth(); await signOut(auth); router.replace("/login"); }}
                    className={BTN_GHOST}
                  >
                    Sign out
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] text-zinc-200 font-medium">Sign out all devices</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">Revokes access on all devices. You'll be signed out here too.</p>
                  </div>
                  <button type="button" onClick={() => setConfirm("logoutAll")} className={BTN_DANGER}>
                    Sign out all
                  </button>
                </div>
                {confirm === "logoutAll" && (
                  <InlineConfirm
                    message="This will sign you out of Evara AI on all devices including this one."
                    confirmLabel="Sign out everywhere"
                    onConfirm={handleLogoutAll}
                    onCancel={() => setConfirm(null)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Floating save bar (when dirty) ── */}
      {dirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-[#1c1c1c]/95 px-5 py-3 shadow-2xl shadow-black/50 backdrop-blur-md">
          <p className="text-[13px] text-zinc-400">You have unsaved changes</p>
          <button type="button" onClick={() => { setDirty(false); }} className="text-[12.5px] text-zinc-500 hover:text-zinc-300 transition">Discard</button>
          <button type="button" onClick={saveProfile} className={BTN_PRIMARY}>Save</button>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
