import { createServerFn } from "@tanstack/react-start";
import type { MarketingReport } from "@/lib/marketing-types";

export const loadMarketing = createServerFn({ method: "GET" }).handler(async (): Promise<MarketingReport | null> => {
  const { buildMarketingReport } = await import("@/lib/marketing.server");
  return buildMarketingReport();
});

export const saveJobRevenue = createServerFn({ method: "POST" })
  .validator((data: { id: string; amount: string }) => data)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { dollarsToCents } = await import("@/lib/admin-session");
    const cents = dollarsToCents(data.amount);
    if (cents == null || !/^[0-9a-f-]{36}$/i.test(data.id)) return { ok: false };
    const { dashboardAllowed } = await import("@/lib/admin-session.server");
    if (!(await dashboardAllowed())) return { ok: false };
    const { setLeadRevenue } = await import("@/lib/lead-store.server");
    return { ok: await setLeadRevenue(data.id, cents, "office") };
  });
