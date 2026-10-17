import { createSign } from "node:crypto";
export type Ga4Report = {
  users: number;
  sources: { label: string; count: number }[];
  cities: { label: string; count: number }[];
  pages: { label: string; count: number }[];
  phoneClicks: number;
  formStarts: number;
  generatedLeads: number;
};

type ReportRow = { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] };

function configured(): { property: string; json: string } | null {
  const property = process.env.GA4_PROPERTY_ID?.trim() || "";
  const json = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim() || "";
  if (!property || !json) return null;
  return { property, json };
}

async function accessToken(json: string): Promise<string> {
  const key = JSON.parse(json) as { client_email?: string; private_key?: string };
  if (!key.client_email || !key.private_key) throw new Error("Service account JSON is incomplete.");
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(key.private_key).toString("base64url")}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Google did not issue a reporting token.");
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Google did not issue a reporting token.");
  return data.access_token;
}

async function runReport(property: string, token: string, body: Record<string, unknown>): Promise<ReportRow[]> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(property)}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Google Analytics did not return a report.");
  const data = (await res.json()) as { rows?: ReportRow[] };
  return data.rows || [];
}

function rows(report: ReportRow[]): { label: string; count: number }[] {
  return report
    .map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(not set)",
      count: Number(row.metricValues?.[0]?.value || 0),
    }))
    .filter((row) => Number.isFinite(row.count) && row.count > 0);
}

/** Real GA4 numbers, or null when the server has no reporting credentials. */
export async function readGa4(): Promise<Ga4Report | { error: string } | null> {
  const config = configured();
  if (!config) return null;
  try {
    const token = await accessToken(config.json);
    const range = [{ startDate: "30daysAgo", endDate: "today" }];
    const [users, sources, cities, pages, events] = await Promise.all([
      runReport(config.property, token, { dateRanges: range, metrics: [{ name: "totalUsers" }] }),
      runReport(config.property, token, { dateRanges: range, dimensions: [{ name: "sessionSource" }], metrics: [{ name: "totalUsers" }], limit: 8 }),
      runReport(config.property, token, { dateRanges: range, dimensions: [{ name: "city" }], metrics: [{ name: "totalUsers" }], limit: 12 }),
      runReport(config.property, token, { dateRanges: range, dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], limit: 12 }),
      runReport(config.property, token, { dateRanges: range, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], limit: 25 }),
    ]);
    const eventCount = (name: string) => events.find((row) => row.dimensionValues?.[0]?.value === name);
    return {
      users: Number(users[0]?.metricValues?.[0]?.value || 0),
      sources: rows(sources),
      cities: rows(cities),
      pages: rows(pages).filter((row) => /roof|service-areas|estimate/i.test(row.label)),
      phoneClicks: Number(eventCount("click_phone")?.metricValues?.[0]?.value || 0),
      formStarts: Number(eventCount("form_start")?.metricValues?.[0]?.value || 0),
      generatedLeads: Number(eventCount("generate_lead")?.metricValues?.[0]?.value || 0),
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Google Analytics did not return a report." };
  }
}
