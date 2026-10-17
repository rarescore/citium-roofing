import { createServerFn } from "@tanstack/react-start";
import { AREA_ROWS, type AreaStat } from "@/lib/geo";

export type AreaPerformance = { available: boolean; rows: AreaStat[] };

export const loadAreaStats = createServerFn({ method: "GET" }).handler(async (): Promise<AreaPerformance> => {
  try {
    const { readAreaStats } = await import("@/lib/geo-stats.server");
    return { available: true, rows: await readAreaStats() };
  } catch {
    return {
      available: false,
      rows: AREA_ROWS.map((area) => ({ ...area, visits: 0, inquiries: 0, zipInquiries: 0 })),
    };
  }
});
