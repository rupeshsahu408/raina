"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { getLastActivePlatform, getPlatformRedirectPath } from "@/lib/platformSession";

export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const platform = getLastActivePlatform();
      if (platform) {
        router.replace(getPlatformRedirectPath(platform));
      } else {
        router.replace("/chat");
      }
    });
    return () => unsub();
  }, [router]);

  return null;
}
