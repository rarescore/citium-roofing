import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { initAnalytics, trackPageView } from "@/lib/analytics";

/** Mount once. Consent decides what loads. Route changes record one page view. */
export function AnalyticsBoot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  return null;
}
