"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/SiteChrome";

const AUTH_PATHS = new Set(["/login", "/register", "/signup", "/forgot-password"]);

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = AUTH_PATHS.has(pathname) || pathname.startsWith("/dashboard");

  return (
    <>
      {hideChrome ? null : <Header />}
      <main className="flex-1">{children}</main>
      {hideChrome ? null : <Footer />}
    </>
  );
}
