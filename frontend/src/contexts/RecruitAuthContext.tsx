"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://raina-1.onrender.com";

export type RecruitRole = "creator" | "seeker";

interface RecruitProfile {
  uid: string;
  role: RecruitRole;
  name?: string;
  email?: string;
}

interface RecruitAuthState {
  firebaseUser: User | null;
  recruitProfile: RecruitProfile | null;
  loading: boolean;
  signOutFromRecruit: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const RecruitAuthContext = createContext<RecruitAuthState>({
  firebaseUser: null,
  recruitProfile: null,
  loading: true,
  signOutFromRecruit: async () => {},
  refreshProfile: async () => {},
});

export function useRecruitAuth() {
  return useContext(RecruitAuthContext);
}

async function fetchRecruitProfile(user: User): Promise<RecruitProfile | null> {
  try {
    const token = await user.getIdToken();
    const res = await fetch(`${BACKEND}/recruit/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function RecruitAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [recruitProfile, setRecruitProfile] = useState<RecruitProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setFirebaseUser(null);
      setRecruitProfile(null);
      setLoading(false);
      return;
    }
    setFirebaseUser(user);
    const profile = await fetchRecruitProfile(user);
    setRecruitProfile(profile);
    setLoading(false);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      loadProfile(user);
    });
    return unsub;
  }, [loadProfile]);

  const signOutFromRecruit = useCallback(async () => {
    setRecruitProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      const profile = await fetchRecruitProfile(firebaseUser);
      setRecruitProfile(profile);
    }
  }, [firebaseUser]);

  return (
    <RecruitAuthContext.Provider
      value={{ firebaseUser, recruitProfile, loading, signOutFromRecruit, refreshProfile }}
    >
      {children}
    </RecruitAuthContext.Provider>
  );
}
