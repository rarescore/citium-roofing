export type CountRow = { label: string; count: number };
export type LandingRow = { label: string; leads: number; rate: null };
export type RevenueRow = { label: string; cents: number };
export type WonJob = { id: string; name: string; campaign: string; cents: number | null };

export type MarketingReport = {
  visitors: { state: "value"; value: number; note: string } | { state: "unavailable"; reason: string };
  trafficSources: CountRow[];
  trafficNote: string;
  cities: CountRow[];
  citiesNote: string;
  pages: { state: "value"; rows: CountRow[] } | { state: "unavailable"; reason: string };
  phoneClicks: { state: "value"; value: number; note: string } | { state: "unavailable"; reason: string };
  estimateRequests: number;
  landing: LandingRow[];
  landingNote: string;
  channels: Record<"google" | "facebook" | "instagram" | "organic", number>;
  abandonment:
    | { state: "value"; started: number; submitted: number; abandoned: number; note: string }
    | { state: "unavailable"; reason: string };
  campaigns: CountRow[];
  leadCities: CountRow[];
  inspections: number;
  won: number;
  revenue: RevenueRow[];
  revenueNote: string;
  wonJobs: WonJob[];
};
