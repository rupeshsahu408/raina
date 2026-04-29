"use client";

import dynamic from "next/dynamic";

export const InstallBannerLazy = dynamic(
  () => import("@/components/InstallBanner").then((m) => ({ default: m.InstallBanner })),
  { ssr: false, loading: () => null }
);
