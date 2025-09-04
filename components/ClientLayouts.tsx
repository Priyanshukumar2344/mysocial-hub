"use client";

import dynamic from "next/dynamic";
import type React from "react";

const AndroidNavigationWithNoSSR = dynamic(
  () =>
    import("@/components/AndroidNavigation").then((mod) => ({
      default: mod.AndroidNavigation,
    })),
  { ssr: false }
);

const MobileLayoutWithNoSSR = dynamic(
  () =>
    import("@/components/MobileLayout").then((mod) => ({
      default: mod.MobileLayout,
    })),
  { ssr: false }
);

export function ClientLayouts({ children }: { children: React.ReactNode }) {
  return (
    <MobileLayoutWithNoSSR>
      {children}
      <AndroidNavigationWithNoSSR />
    </MobileLayoutWithNoSSR>
  );
}
