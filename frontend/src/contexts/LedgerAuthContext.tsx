"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

interface LedgerAuthState {
  user: User | null;
  loading: boolean;
  signOutFromLedger: () => Promise<void>;
}

const LedgerAuthContext = createContext<LedgerAuthState>({
  user: null,
  loading: true,
  signOutFromLedger: async () => {},
});

export function useLedgerAuth() {
  return useContext(LedgerAuthContext);
}

export function LedgerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let auth: ReturnType<typeof getFirebaseAuth> | null = null;
    try {
      auth = getFirebaseAuth();
    } catch {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signOutFromLedger = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch {
    }
  };

  return (
    <LedgerAuthContext.Provider value={{ user, loading, signOutFromLedger }}>
      {children}
    </LedgerAuthContext.Provider>
  );
}
