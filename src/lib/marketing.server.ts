import { getSql } from "@/lib/db";
import { bucketForZip } from "@/lib/geo";
import { channelOf, type AdChannel } from "@/lib/admin-session";
import { dashboardAllowed } from "@/lib/admin-session.server";
import { readGa4 } from "@/lib/ga4-report.server";
import type { CountRow, MarketingReport, WonJob } from "@/lib/marketing-types";

export type { CountRow, MarketingReport } from "@/lib/marketing-types";

const GA_MISSING =
  "Google Analytics reporting is not connected. Set GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON on the server. No number is shown in its place.";

function num(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function buildMarketingReport(): Promise<MarketingReport | null> {
  if (!(await dashboardAllowed())) return null;
  const sql = await getSql();
  const leads = await sql<{
    id: string;
    name: string;
    kind: string;
    stage: string;
    zip: string;
    landing_page: string;
    traffic_source: string;
    campaign: string;
    utm_medium: string;
    revenue_cents: number | string | null;
    inspection_booked_at: unknown;
    won_at: unknown;
  }>`
    select id, name, kind, stage, zip, landing_page, traffic_source, campaign, utm_medium, revenue_cents,
      inspection_booked_at, won_at
    from leads
    order by submitted_at desc
    limit 500
  `;
  const areas = await sql<{ label: string; visits: number | string }>`
    select label, visits from geo_area_stats where visits > 0 order by visits desc
  `;

  const channels = { google: 0, facebook: 0, instagram: 0, organic: 0 };
  const sourceCounts = new Map<string, number>();
  const campaignCounts = new Map<string, number>();
  const cityCounts = new Map<string, number>();
  const landingCounts = new Map<string, number>();
  let estimateRequests = 0;
  let inspections = 0;
  let won = 0;
  const revenueByCampaign = new Map<string, number>();
  const wonJobs: WonJob[] = [];

  for (const lead of leads) {
    const source = lead.traffic_source || "direct";
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    const channel = channelOf(source, lead.utm_medium || "") as AdChannel;
    if (channel !== "other") channels[channel] += 1;
    const campaign = lead.campaign?.trim() || "No campaign";
    campaignCounts.set(campaign, (campaignCounts.get(campaign) || 0) + 1);
    const city = lead.zip ? bucketForZip(lead.zip)?.label || "Outside service area" : "ZIP not entered";
    cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    const landing = lead.landing_page?.trim() || "Not recorded";
    landingCounts.set(landing, (landingCounts.get(landing) || 0) + 1);
    if (lead.kind === "estimate") estimateRequests += 1;
    if (lead.stage === "inspection" || lead.stage === "estimate" || lead.stage === "won" || lead.inspection_booked_at) inspections += 1;
    if (lead.stage === "won") {
      won += 1;
      const cents = lead.revenue_cents == null ? null : num(lead.revenue_cents);
      wonJobs.push({ id: lead.id, name: lead.name, campaign, cents });
      if (cents != null) revenueByCampaign.set(campaign, (revenueByCampaign.get(campaign) || 0) + cents);
    }
  }

  const toRows = (map: Map<string, number>): CountRow[] =>
    [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

  const gaResult = await readGa4();
  const ga = gaResult && !("error" in gaResult) ? gaResult : null;
  const gaReason = gaResult && "error" in gaResult ? gaResult.error : GA_MISSING;
  const cities = ga?.cities.length ? ga.cities : areas.map((row) => ({ label: row.label, count: num(row.visits) }));

  return {
    visitors: ga
      ? { state: "value", value: ga.users, note: "Google Analytics total users, last 30 days." }
      : { state: "unavailable", reason: gaReason },
    trafficSources: ga?.sources.length ? ga.sources : toRows(sourceCounts),
    trafficNote: ga?.sources.length
      ? "Google Analytics session source, last 30 days."
      : leads.length
        ? "These are sources stored on delivered requests, not every site visitor."
        : "No delivered requests yet, so there is no traffic source to show.",
    cities,
    citiesNote: ga?.cities.length
      ? "Google Analytics city, last 30 days. This is still an estimate, not a street address."
      : cities.length
        ? "Estimated from the connection after analytics consent. Not unique people and not a street address."
        : "No estimated visits have been recorded.",
    pages: ga
      ? ga.pages.length
        ? { state: "value", rows: ga.pages }
        : { state: "unavailable", reason: "Google Analytics returned no views for the roofing service pages in the last 30 days." }
      : { state: "unavailable", reason: GA_MISSING },
    phoneClicks: ga
      ? { state: "value", value: ga.phoneClicks, note: "Google Analytics click_phone events, last 30 days." }
      : { state: "unavailable", reason: GA_MISSING + " Phone clicks are the click_phone event." },
    estimateRequests,
    landing: toRows(landingCounts).map((row) => ({ label: row.label, leads: row.count, rate: null })),
    landingNote: "A conversion rate needs visits for each landing page. Those visits are not stored here, so no rate is calculated.",
    channels,
    abandonment: ga && (ga.formStarts > 0 || ga.generatedLeads > 0)
      ? {
          state: "value",
          started: ga.formStarts,
          submitted: ga.generatedLeads,
          abandoned: Math.max(0, ga.formStarts - ga.generatedLeads),
          note: "Google Analytics form_start minus generate_lead, last 30 days.",
        }
      : {
          state: "unavailable",
          reason: ga
            ? "Google Analytics returned no form_start or generate_lead events."
            : "Form starts are not stored. Abandonment needs those events from Google Analytics.",
        },
    campaigns: toRows(campaignCounts),
    leadCities: toRows(cityCounts),
    inspections,
    won,
    revenue: [...revenueByCampaign.entries()].map(([label, cents]) => ({ label, cents })),
    revenueNote: revenueByCampaign.size ? "Only amounts a staff member entered on a won job." : "No job revenue has been entered.",
    wonJobs,
  };
}
