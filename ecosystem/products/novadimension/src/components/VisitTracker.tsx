"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "nd_visit_tracked";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // continue; still count once this mount
    }

    void fetch("/api/analytics/visit", {
      method: "POST",
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
