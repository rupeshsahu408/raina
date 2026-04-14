"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DashboardRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") || "";

  useEffect(() => {
    router.replace(`/ibara/dashboard/overview${siteId ? `?siteId=${siteId}` : ""}`);
  }, [router, siteId]);

  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>}>
      <DashboardRedirect />
    </Suspense>
  );
}
