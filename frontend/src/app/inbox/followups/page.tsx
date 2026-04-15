"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type TabId = "today" | "upcoming" | "overdue" | "completed";

interface FollowUpItem {
  _id: string;
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  scheduledAt: number;
  reason: string;
  status: "pending" | "completed" | "dismissed";
  createdAt: string;
}

function senderName(from: string): string {
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  const name = match ? match[1].trim().replace(/^["']|["']$/g, "") : from.trim();
  if (name.includes("@") && !match) return name.split("@")[0] || name;
  return name || from;
}

function avatarColor(name: string): string {
  const colors = ["#5c4ff6","#0b8a4d","#d44000","#1565c0","#6a1b9a","#00838f","#c62828","#2e7d32"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}

function formatScheduled(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.round(diff / 86400000);
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  if (days === 0) return `Today at ${timeStr}`;
  if (days === 1) return `Tomorrow at ${timeStr}`;
  if (days === -1) return `Yesterday at ${timeStr}`;
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 7) return `${d.toLocaleDateString([], { weekday: "long" })} at ${timeStr}`;
  return `${dateStr} at ${timeStr}`;
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isOverdue(ts: number): boolean {
  return ts < Date.now() && !isToday(ts);
}

function isUpcoming(ts: number): boolean {
  return ts > Date.now() && !isToday(ts);
}

const TABS: { id: TabId; label: string; color: string }[] = [
  { id: "today", label: "Today", color: "text-amber-700 border-amber-500 bg-amber-50" },
  { id: "upcoming", label: "Upcoming", color: "text-indigo-700 border-indigo-500 bg-indigo-50" },
  { id: "overdue", label: "Overdue", color: "text-red-700 border-red-500 bg-red-50" },
  { id: "completed", label: "Completed", color: "text-emerald-700 border-emerald-500 bg-emerald-50" },
];

function BackIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}
function BellIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function CheckIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ClockIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function TrashIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function RefreshIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
}
function SparkleIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
}

export default function FollowUpsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/login?next=/inbox/followups");
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthLoading(false);
      if (!u) { router.replace("/login?next=/inbox/followups"); return; }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  const getToken = useCallback(async () => {
    if (!user) return "";
    return user.getIdToken();
  }, [user]);

  const loadFollowUps = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/inbox/followups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load follow-ups");
      setFollowUps(data.followUps ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (user) loadFollowUps();
  }, [user, loadFollowUps]);

  async function updateStatus(id: string, status: "completed" | "dismissed") {
    setUpdatingId(id);
    const token = await getToken();
    try {
      const res = await fetch(`${API}/inbox/followups/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setFollowUps(prev => prev.map(f => f._id === id ? { ...f, status } : f));
        showToast(status === "completed" ? "Marked as done!" : "Dismissed.");
      }
    } catch {}
    finally { setUpdatingId(null); }
  }

  async function reschedule(id: string) {
    if (!rescheduleValue) return;
    const scheduledAt = new Date(rescheduleValue).getTime();
    if (isNaN(scheduledAt)) return;
    setUpdatingId(id);
    const token = await getToken();
    try {
      const res = await fetch(`${API}/inbox/followups/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt, status: "pending" }),
      });
      if (res.ok) {
        setFollowUps(prev => prev.map(f => f._id === id ? { ...f, scheduledAt, status: "pending" } : f));
        setRescheduleId(null);
        setRescheduleValue("");
        showToast("Follow-up rescheduled!");
      }
    } catch {}
    finally { setUpdatingId(null); }
  }

  async function deleteFollowUp(id: string) {
    setUpdatingId(id);
    const token = await getToken();
    try {
      const res = await fetch(`${API}/inbox/followups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFollowUps(prev => prev.filter(f => f._id !== id));
        showToast("Deleted.");
      }
    } catch {}
    finally { setUpdatingId(null); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const pending = followUps.filter(f => f.status === "pending");
  const todayItems = pending.filter(f => isToday(f.scheduledAt));
  const upcomingItems = pending.filter(f => isUpcoming(f.scheduledAt));
  const overdueItems = pending.filter(f => isOverdue(f.scheduledAt));
  const completedItems = followUps.filter(f => f.status === "completed");

  const tabCounts: Record<TabId, number> = {
    today: todayItems.length,
    upcoming: upcomingItems.length,
    overdue: overdueItems.length,
    completed: completedItems.length,
  };

  const tabItems: Record<TabId, FollowUpItem[]> = {
    today: todayItems,
    upcoming: upcomingItems,
    overdue: overdueItems,
    completed: completedItems,
  };

  const displayedItems = tabItems[activeTab];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const totalPending = overdueItems.length + todayItems.length;

  return (
    <div className="min-h-screen bg-[#f8f7ff] font-sans">
      {/* Header */}
      <header className="bg-[#14112a] text-white px-6 py-4 flex items-center gap-4">
        <Link href="/inbox/dashboard" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition">
          <BackIcon />
          Back to Inbox
        </Link>
        <div className="flex items-center gap-3 ml-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <BellIcon />
          </span>
          <div>
            <h1 className="text-lg font-black">Follow-Up Reminders</h1>
            <p className="text-[11px] text-zinc-400">AI-detected opportunities you shouldn&apos;t miss</p>
          </div>
        </div>
        <button
          onClick={loadFollowUps}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition"
        >
          <RefreshIcon />
          Refresh
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Stats banner */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                activeTab === tab.id ? tab.color + " border-current" : "bg-white border-transparent hover:border-gray-200"
              }`}
            >
              <p className={`text-2xl font-black ${activeTab === tab.id ? "" : "text-gray-800"}`}>
                {tabCounts[tab.id]}
              </p>
              <p className={`text-xs font-semibold mt-0.5 ${activeTab === tab.id ? "" : "text-gray-500"}`}>
                {tab.label}
              </p>
            </button>
          ))}
        </div>

        {/* Alert for overdue */}
        {totalPending > 0 && activeTab !== "completed" && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-amber-500 mt-0.5"><SparkleIcon /></span>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {overdueItems.length > 0
                  ? `${overdueItems.length} overdue follow-up${overdueItems.length > 1 ? "s" : ""} need attention now`
                  : `${todayItems.length} follow-up${todayItems.length > 1 ? "s" : ""} scheduled for today`}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Every ignored follow-up is a missed opportunity. Act now to stay ahead.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-bold border-b-2 transition -mb-px ${
                activeTab === tab.id
                  ? "border-[#5c4ff6] text-[#5c4ff6]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  activeTab === tab.id ? "bg-[#5c4ff6] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-50 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
            <button onClick={loadFollowUps} className="ml-3 underline">Retry</button>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-300">
              <BellIcon />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {activeTab === "today" && "No follow-ups due today"}
              {activeTab === "upcoming" && "No upcoming follow-ups"}
              {activeTab === "overdue" && "No overdue follow-ups — you're on top of it!"}
              {activeTab === "completed" && "No completed follow-ups yet"}
            </p>
            <p className="mt-1.5 text-xs text-gray-400 max-w-xs">
              {activeTab === "completed"
                ? "Mark follow-ups as done after you've acted on them."
                : "Open an email in your inbox — the AI will suggest follow-ups automatically."}
            </p>
            <Link
              href="/inbox/dashboard"
              className="mt-5 rounded-full bg-[#5c4ff6] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#4f43e0] transition"
            >
              Go to Inbox
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedItems.map(item => {
              const name = senderName(item.from);
              const isOverdueItem = isOverdue(item.scheduledAt) && item.status === "pending";
              const isTodayItem = isToday(item.scheduledAt) && item.status === "pending";
              const isWorking = updatingId === item._id;
              const isRescheduling = rescheduleId === item._id;

              return (
                <div
                  key={item._id}
                  className={`rounded-2xl border bg-white p-5 transition ${
                    isOverdueItem ? "border-red-200" : isTodayItem ? "border-amber-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-black mt-0.5"
                      style={{ background: avatarColor(name) }}
                    >
                      {name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Subject */}
                      <p className="text-sm font-bold text-gray-900 truncate">{item.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{name} &lt;{item.from.match(/<(.+?)>/)?.[1] ?? item.from}&gt;</p>

                      {/* Reason badge */}
                      <div className={`mt-2.5 rounded-xl px-3 py-2 text-xs leading-5 ${
                        isOverdueItem ? "bg-red-50 text-red-800" : isTodayItem ? "bg-amber-50 text-amber-800" : "bg-indigo-50 text-indigo-800"
                      }`}>
                        <span className="font-black">Reason: </span>{item.reason}
                      </div>

                      {/* Time row */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                          isOverdueItem ? "text-red-600" : isTodayItem ? "text-amber-700" : item.status === "completed" ? "text-emerald-600" : "text-indigo-600"
                        }`}>
                          <ClockIcon />
                          {formatScheduled(item.scheduledAt)}
                        </span>
                        {isOverdueItem && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">OVERDUE</span>
                        )}
                        {isTodayItem && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">TODAY</span>
                        )}
                        {item.status === "completed" && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700"><CheckIcon /> Done</span>
                        )}
                      </div>

                      {/* Reschedule picker */}
                      {isRescheduling && (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={rescheduleValue}
                            onChange={e => setRescheduleValue(e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400"
                          />
                          <button
                            onClick={() => reschedule(item._id)}
                            disabled={isWorking || !rescheduleValue}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
                          >
                            {isWorking ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => { setRescheduleId(null); setRescheduleValue(""); }}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Action row */}
                      {item.status === "pending" && !isRescheduling && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => updateStatus(item._id, "completed")}
                            disabled={isWorking}
                            className="flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition disabled:opacity-50"
                          >
                            {isWorking ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <CheckIcon />}
                            Mark Done
                          </button>
                          <button
                            onClick={() => {
                              setRescheduleId(item._id);
                              const d = new Date(item.scheduledAt);
                              const pad = (n: number) => String(n).padStart(2, "0");
                              setRescheduleValue(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 text-xs font-bold transition"
                          >
                            <ClockIcon />
                            Reschedule
                          </button>
                          <Link
                            href="/inbox/dashboard"
                            className="flex items-center gap-1.5 rounded-full border border-indigo-200 hover:bg-indigo-50 text-indigo-700 px-3 py-1.5 text-xs font-bold transition"
                          >
                            Open email
                          </Link>
                          <button
                            onClick={() => updateStatus(item._id, "dismissed")}
                            disabled={isWorking}
                            className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                      {item.status === "completed" && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => deleteFollowUp(item._id)}
                            disabled={isWorking}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition"
                          >
                            <TrashIcon />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-2xl flex items-center gap-2">
          <CheckIcon />
          {toast}
        </div>
      )}
    </div>
  );
}
