"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, updateEmail, updatePassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";
const HELP_CENTER_URL =
  process.env.NEXT_PUBLIC_HELP_CENTER_URL ?? "https://help.evara.ai";
const FAQ_URL = process.env.NEXT_PUBLIC_FAQ_URL ?? "https://help.evara.ai/faq";
const BUG_REPORT_URL =
  process.env.NEXT_PUBLIC_BUG_REPORT_URL ?? "https://help.evara.ai/report-bug";
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@evara.ai";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [personality, setPersonality] = useState<"Simi" | "Loa">("Simi");
  const [preferencesText, setPreferencesText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [aboutYou, setAboutYou] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [bubbleStyle, setBubbleStyle] = useState<"rounded" | "sharp">("rounded");
  const [backgroundStyle, setBackgroundStyle] = useState<"gradient" | "image">("gradient");
  const [typingSpeed, setTypingSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [allowMemory, setAllowMemory] = useState(true);
  const [referenceHistory, setReferenceHistory] = useState(true);
  const [incognitoChatMode, setIncognitoChatMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<{
    currentDevice: string;
    lastSignIn: string;
    accountCreated: string;
  } | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const token = await user.getIdToken();
        const resp = await fetch(`${API_BASE_URL}/v1/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data: {
            name?: string | null;
            photoUrl?: string | null;
            bio?: string | null;
            selectedPersonality?: "Simi" | "Loa";
            preferences?: string[];
            about?: {
              nickname?: string | null;
              occupation?: string | null;
              moreAboutYou?: string | null;
            };
            personalization?: {
              theme?: "light" | "dark" | "auto";
              accentColor?: string | null;
              fontSize?: "small" | "medium" | "large";
              bubbleStyle?: "rounded" | "sharp";
              backgroundStyle?: "gradient" | "image";
              typingSpeed?: "slow" | "normal" | "fast";
            };
            memorySettings?: {
              allowMemory?: boolean;
              referenceChatHistory?: boolean;
            };
            privacy?: {
              incognitoChatMode?: boolean;
            };
            notifications?: {
              enabled?: boolean;
            };
          } = await resp.json();
          if (typeof data.name === "string") setDisplayName(data.name);
          if (typeof data.photoUrl === "string") setPhotoUrl(data.photoUrl);
          if (typeof data.bio === "string") setBio(data.bio);
          if (data.selectedPersonality === "Simi" || data.selectedPersonality === "Loa") {
            setPersonality(data.selectedPersonality);
          }
          if (Array.isArray(data.preferences)) {
            setPreferencesText(data.preferences.join(", "));
          }
          if (data.about) {
            setNickname(data.about.nickname ?? "");
            setOccupation(data.about.occupation ?? "");
            setAboutYou(data.about.moreAboutYou ?? "");
          }
          if (data.personalization) {
            if (data.personalization.theme) setTheme(data.personalization.theme);
            if (data.personalization.accentColor) setAccentColor(data.personalization.accentColor);
            if (data.personalization.fontSize) setFontSize(data.personalization.fontSize);
            if (data.personalization.bubbleStyle) setBubbleStyle(data.personalization.bubbleStyle);
            if (data.personalization.backgroundStyle) setBackgroundStyle(data.personalization.backgroundStyle);
            if (data.personalization.typingSpeed) setTypingSpeed(data.personalization.typingSpeed);
          }
          if (data.memorySettings) {
            if (typeof data.memorySettings.allowMemory === "boolean") {
              setAllowMemory(data.memorySettings.allowMemory);
            }
            if (typeof data.memorySettings.referenceChatHistory === "boolean") {
              setReferenceHistory(data.memorySettings.referenceChatHistory);
            }
          }
          if (data.privacy && typeof data.privacy.incognitoChatMode === "boolean") {
            setIncognitoChatMode(data.privacy.incognitoChatMode);
          }
          if (
            data.notifications &&
            typeof data.notifications.enabled === "boolean"
          ) {
            setNotificationsEnabled(data.notifications.enabled);
          }
        }
        setCurrentEmail(user.email ?? "");
        const formatDate = (iso?: string | null) =>
          iso ? new Date(iso).toLocaleString() : "Unknown";
        setSessionInfo({
          currentDevice: `${navigator.platform} • ${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}`,
          lastSignIn: formatDate(user.metadata.lastSignInTime),
          accountCreated: formatDate(user.metadata.creationTime),
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--evara-accent", accentColor);
  }, [accentColor]);

  const saveSettings = async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    setStatus("Saving...");
    try {
      const token = await user.getIdToken();
      const preferences = preferencesText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      const resp = await fetch(`${API_BASE_URL}/v1/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: displayName || null,
          photoUrl: photoUrl || null,
          bio: bio || null,
          selectedPersonality: personality,
          preferences,
          about: {
            nickname: nickname || null,
            occupation: occupation || null,
            moreAboutYou: aboutYou || null,
          },
          personalization: {
            theme,
            accentColor,
            fontSize,
            bubbleStyle,
            backgroundStyle,
            typingSpeed,
          },
          memorySettings: {
            allowMemory,
            referenceChatHistory: referenceHistory,
          },
          privacy: {
            incognitoChatMode,
          },
          notifications: {
            enabled: notificationsEnabled,
          },
        }),
      });
      if (!resp.ok) throw new Error("Failed to save settings.");
      setStatus("Saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save settings.");
    }
  };

  const changeEmail = async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    if (!newEmail.trim()) {
      setStatus("Please enter a new email.");
      return;
    }
    setStatus("Updating email...");
    try {
      await updateEmail(user, newEmail.trim());
      setCurrentEmail(newEmail.trim());
      setNewEmail("");
      setStatus("Email updated.");
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Could not update email. You may need to re-login."
      );
    }
  };

  const changePassword = async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    if (newPassword.trim().length < 6) {
      setStatus("Password must be at least 6 characters.");
      return;
    }
    setStatus("Updating password...");
    try {
      await updatePassword(user, newPassword.trim());
      setNewPassword("");
      setStatus("Password updated.");
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Could not update password. You may need to re-login."
      );
    }
  };

  const clearMemory = async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    setStatus("Clearing memory...");
    try {
      const token = await user.getIdToken();
      const resp = await fetch(`${API_BASE_URL}/v1/memory/clear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to clear memory.");
      setStatus("Memory cleared.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not clear memory.");
    }
  };

  const deleteAllChats = async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    const ok = window.confirm("Are you sure? This cannot be undone.");
    if (!ok) return;
    setStatus("Deleting all chats...");
    try {
      const token = await user.getIdToken();
      const resp = await fetch(`${API_BASE_URL}/v1/conversations`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to delete all chats.");
      setStatus("All chats deleted.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not delete chats.");
    }
  };

  const clearAllData = async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    const ok = window.confirm("Delete all account data? This cannot be undone.");
    if (!ok) return;
    setStatus("Clearing all data...");
    try {
      const token = await user.getIdToken();
      const resp = await fetch(`${API_BASE_URL}/v1/account/clear-all-data`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to clear all data.");
      setStatus("All account data cleared.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not clear data.");
    }
  };

  const logoutAllDevices = async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;
    setStatus("Logging out all devices...");
    try {
      const token = await user.getIdToken();
      const resp = await fetch(`${API_BASE_URL}/v1/auth/logout-all-devices`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to logout all devices.");
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not logout all devices.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Settings</h1>
          <a
            href="/chat"
            className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500"
          >
            Back to Chat
          </a>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Account</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-400">Name</p>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Photo URL</p>
              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-zinc-400">Bio</p>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="Tell something about you..."
            />
          </div>
        </div>

        <div id="personalization" className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Personalization</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-400">Theme</p>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "light" | "dark" | "auto")}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="auto">Auto</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Accent color</p>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-2"
              />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Font size</p>
              <select
                value={fontSize}
                onChange={(e) =>
                  setFontSize(e.target.value as "small" | "medium" | "large")
                }
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Bubble style</p>
              <select
                value={bubbleStyle}
                onChange={(e) =>
                  setBubbleStyle(e.target.value as "rounded" | "sharp")
                }
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="rounded">Rounded</option>
                <option value="sharp">Sharp</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Background style</p>
              <select
                value={backgroundStyle}
                onChange={(e) =>
                  setBackgroundStyle(e.target.value as "gradient" | "image")
                }
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-400">AI typing speed</p>
              <select
                value={typingSpeed}
                onChange={(e) =>
                  setTypingSpeed(e.target.value as "slow" | "normal" | "fast")
                }
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">About You</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-400">Nickname (what AI should call you)</p>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder="Kavi"
              />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Occupation</p>
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder="Engineering student at University of Waterloo"
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-zinc-400">More about you</p>
            <textarea
              rows={3}
              value={aboutYou}
              onChange={(e) => setAboutYou(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="Interests, values, preferences..."
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Yes — this is used in AI memory and prompt context to personalize responses.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Memory Settings</p>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>Allow AI memory</span>
              <input
                type="checkbox"
                checked={allowMemory}
                onChange={(e) => setAllowMemory(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>Reference chat history</span>
              <input
                type="checkbox"
                checked={referenceHistory}
                onChange={(e) => setReferenceHistory(e.target.checked)}
              />
            </label>
            <p className="text-xs text-zinc-500">
              You can clear saved memory anytime from Danger Zone.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Privacy & Security</p>
          <label className="mt-3 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm">
            <span>Incognito Chat Mode (chats won&apos;t be saved)</span>
            <input
              type="checkbox"
              checked={incognitoChatMode}
              onChange={(e) => setIncognitoChatMode(e.target.checked)}
            />
          </label>
          <button
            type="button"
            onClick={clearAllData}
            className="mt-3 rounded-xl border border-red-700 px-4 py-2 text-sm text-red-200 hover:border-red-500"
          >
            Clear All Data
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Notification Settings</p>
          <label className="mt-3 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm">
            <span>Enable notifications</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Help & Support</p>
          <div className="mt-3 grid gap-2 text-sm">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="rounded-xl border border-zinc-700 px-3 py-2 hover:border-zinc-500">
              Contact support
            </a>
            <a href={HELP_CENTER_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-700 px-3 py-2 hover:border-zinc-500">
              Help center
            </a>
            <a href={FAQ_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-700 px-3 py-2 hover:border-zinc-500">
              FAQ
            </a>
            <a href={BUG_REPORT_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-700 px-3 py-2 hover:border-zinc-500">
              Report bug
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Logout</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                const auth = getFirebaseAuth();
                await signOut(auth);
                router.replace("/login");
              }}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={logoutAllDevices}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
            >
              Logout from all devices
            </button>
          </div>
        </div>

        <div id="upgrade" className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Upgrade Plan</p>
          <p className="mt-2 text-xs text-zinc-400">
            Pro plan with richer memory intelligence, advanced tools, and priority responses is coming soon.
          </p>
          <button
            type="button"
            className="mt-3 rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
          >
            Join waitlist
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Security</p>
          <p className="mt-1 text-xs text-zinc-400">Current email: {currentEmail || "Unknown"}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-400">Change email</p>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder="new@email.com"
              />
              <button
                type="button"
                onClick={changeEmail}
                className="mt-2 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500"
              >
                Update Email
              </button>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Change password</p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder="New password"
              />
              <button
                type="button"
                onClick={changePassword}
                className="mt-2 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Active Sessions</p>
          {sessionInfo ? (
            <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300">
              <p>Device: {sessionInfo.currentDevice}</p>
              <p className="mt-1">Last sign-in: {sessionInfo.lastSignIn}</p>
              <p className="mt-1">Account created: {sessionInfo.accountCreated}</p>
              <button
                type="button"
                onClick={async () => {
                  const auth = getFirebaseAuth();
                  await signOut(auth);
                  router.replace("/login");
                }}
                className="mt-3 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500"
              >
                Sign out this device
              </button>
            </div>
          ) : (
            <p className="mt-2 text-xs text-zinc-400">No session info available.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Personality</p>
          <div className="mt-3 flex gap-2">
            {(["Simi", "Loa"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPersonality(p)}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  personality === p
                    ? "border-purple-500 bg-purple-500/15"
                    : "border-zinc-700 hover:border-zinc-500",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium">Preferences (comma separated)</p>
          <textarea
            rows={3}
            value={preferencesText}
            onChange={(e) => setPreferencesText(e.target.value)}
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            placeholder="fitness, business, exam prep"
          />
          <button
            type="button"
            onClick={saveSettings}
            className="mt-3 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-black"
          >
            Save Settings
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-red-900/60 bg-red-950/20 p-4">
          <p className="text-sm font-medium text-red-200">Danger Zone</p>
          <p className="mt-1 text-xs text-red-300/80">
            This removes chat history memory and summary.
          </p>
          <button
            type="button"
            onClick={clearMemory}
            className="mt-3 rounded-xl border border-red-700 px-4 py-2 text-sm text-red-200 hover:border-red-500"
          >
            Clear Memory
          </button>
          <button
            type="button"
            onClick={deleteAllChats}
            className="mt-3 ml-2 rounded-xl border border-red-700 px-4 py-2 text-sm text-red-200 hover:border-red-500"
          >
            Delete All Chats
          </button>
        </div>

        {status ? (
          <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">
            {status}
          </div>
        ) : null}
      </div>
    </div>
  );
}

