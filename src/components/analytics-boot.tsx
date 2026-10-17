import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/** Mount once in the root layout. Noops when VITE_GA4_ID is unset. */
export function AnalyticsBoot() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
