"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders, setPayablesWorkspaceUid, ROLE_DESCRIPTIONS } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

type InviteInfo = {
  email: string;
  name?: string;
  role: string;
  status: string;
  invitedBy?: string;
  workspaceName: string;
};

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  approver: "Approver",
  member: "Member",
  viewer: "Viewer",
};

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [authUser, setAuthUser] = useState<{ uid: string; token: string; email: string | null } | null | "loading">("loading");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, async (u) => {
        if (u) {
          const t = await u.getIdToken();
          setAuthUser({ uid: u.uid, token: t, email: u.email });
        } else {
          setAuthUser(null);
        }
      });
    } catch {
      setAuthUser(null);
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setInviteError("No invite token found in the link. Please check your invitation email.");
      setInviteLoading(false);
      return;
    }
    setInviteLoading(true);
    fetch(`${BACKEND}/payables/team/invite-info?token=${encodeURIComponent(token)}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setInvite(d);
        else setInviteError(d.error ?? "Invite not found or already used.");
      })
      .catch(() => setInviteError("Could not load invite. Please try again."))
      .finally(() => setInviteLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!authUser || authUser === "loading") return;
    setAccepting(true);
    setAcceptError(null);
    try {
      const res = await fetch(`${BACKEND}/payables/team/accept`, {
        method: "POST",
        headers: payablesHeaders(authUser, true),
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAcceptError(data.error ?? "Could not accept invite. Please try again.");
        return;
      }
      if (data.workspaceUid) setPayablesWorkspaceUid(data.workspaceUid);
      setAccepted(true);
      setTimeout(() => router.push("/payables/dashboard"), 2000);
    } catch {
      setAcceptError("Something went wrong. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  const signInUrl = `/login?next=${encodeURIComponent(`/payables/invite?token=${token}`)}`;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/payables" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#1d2226]">
            Plyndrox Payable AI
          </Link>
        </div>

        {inviteLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-sm text-gray-500">Loading your invitation…</p>
          </div>
        ) : inviteError ? (
          <div className="rounded-2xl border border-rose-100 bg-white p-10 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                <svg className="h-5 w-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-black text-[#1d2226] mb-2">Invitation not found</h1>
            <p className="text-sm text-gray-500 mb-6">{inviteError}</p>
            <Link href="/payables/dashboard" className="rounded-full bg-[#1d2226] px-6 py-3 text-sm font-bold text-white">
              Go to Dashboard
            </Link>
          </div>
        ) : accepted ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-10 shadow-sm text-center">
            <div className="mb-4 flex justify-center"><CheckIcon /></div>
            <h1 className="text-xl font-black text-[#1d2226] mb-2">You&rsquo;re in!</h1>
            <p className="text-sm text-gray-500">Successfully joined <strong>{invite?.workspaceName}</strong>. Taking you to the dashboard…</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-8 py-8">
              <p className="text-sm font-semibold text-violet-200 mb-1">
                {invite?.invitedBy ? `Invited by ${invite.invitedBy}` : "You have been invited"}
              </p>
              <h1 className="text-2xl font-black text-white leading-tight">
                Join <span className="underline decoration-violet-300">{invite?.workspaceName}</span>
              </h1>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-300" />
                <span className="text-sm font-bold text-white capitalize">
                  {ROLE_LABELS[invite?.role ?? ""] ?? invite?.role}
                </span>
              </div>
            </div>

            <div className="px-8 py-6">
              <p className="text-sm text-gray-600 mb-1">
                {ROLE_DESCRIPTIONS[invite?.role as keyof typeof ROLE_DESCRIPTIONS] ?? "Collaborate on this workspace."}
              </p>
              <p className="text-xs text-gray-400 mb-6">
                This invitation is for <strong>{invite?.email}</strong>.
              </p>

              {invite?.status === "active" ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                  You have already accepted this invitation. <Link href="/payables/dashboard" className="underline">Go to Dashboard</Link>
                </div>
              ) : authUser === "loading" ? (
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Spinner /> <span>Checking your account…</span>
                </div>
              ) : authUser === null ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                    You need to sign in with <strong>{invite?.email}</strong> to accept this invitation.
                  </div>
                  <Link
                    href={signInUrl}
                    className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white"
                  >
                    Sign in to accept
                  </Link>
                </div>
              ) : authUser.email && invite?.email && authUser.email.toLowerCase() !== invite.email.toLowerCase() ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                    You are signed in as <strong>{authUser.email}</strong>, but this invite is for <strong>{invite.email}</strong>.
                    Please sign in with the correct account to accept.
                  </div>
                  <Link href={signInUrl} className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white">
                    Sign in with {invite.email}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptError && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">{acceptError}</div>
                  )}
                  <p className="text-sm text-gray-500">
                    Signed in as <strong>{authUser.email}</strong>
                  </p>
                  <button
                    onClick={handleAccept}
                    disabled={accepting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {accepting ? <><Spinner /> Accepting…</> : "Accept Invitation"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PayablesInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-violet-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
