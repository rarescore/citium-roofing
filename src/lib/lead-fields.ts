/** Field rules for an estimate request. No database and no file bytes. */

export const URGENCY = [
  ["standard", "Standard request"],
  ["emergency", "Emergency leak"],
] as const;

export const CONTACT_METHODS = [
  ["phone", "Phone"],
  ["email", "Email"],
  ["text", "Text"],
] as const;

export const LEAD_STAGES = [
  ["new", "New inquiry"],
  ["contacted", "Contacted"],
  ["inspection", "Inspection booked"],
  ["estimate", "Estimate sent"],
  ["won", "Job won"],
  ["lost", "Job lost"],
] as const;

export type Urgency = (typeof URGENCY)[number][0];
export type ContactMethod = (typeof CONTACT_METHODS)[number][0];
export type LeadStage = (typeof LEAD_STAGES)[number][0];

export type LeadAttribution = {
  landing_page: string;
  traffic_source: string;
  campaign: string;
  utm_medium: string;
};

const STAGE_SET = new Set<string>(LEAD_STAGES.map(([id]) => id));

export function isLeadStage(value: unknown): value is LeadStage {
  return typeof value === "string" && STAGE_SET.has(value);
}

function choice<T extends string>(value: unknown, allowed: readonly T[], fallback: T, label: string): T {
  if (value == null || value === "") return fallback;
  const text = String(value).trim();
  if (allowed.includes(text as T)) return text as T;
  throw new Error(label);
}

export function readUrgency(value: unknown): Urgency {
  return choice(value, URGENCY.map(([id]) => id), "standard", "Choose a standard request or an emergency leak.");
}

export function readContactMethod(value: unknown): ContactMethod {
  return choice(value, CONTACT_METHODS.map(([id]) => id), "phone", "Choose phone, email, or text.");
}

function plain(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const text = value.trim().replace(/[\u0000-\u001f]/g, "");
  if (!text || text.length > max) return "";
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) return "";
  if (text.replace(/\D/g, "").length >= 10 && /\d/.test(text)) return "";
  return text;
}

/** Campaign and landing path only. Query strings, emails, and phone numbers are dropped. */
export function readAttribution(value: unknown): LeadAttribution {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  let landing = plain(raw.landing_page, 180);
  landing = landing.split("?")[0]?.split("#")[0] || "";
  if (!landing.startsWith("/")) landing = "";
  const source = plain(raw.traffic_source, 80) || "direct";
  return {
    landing_page: landing,
    traffic_source: source,
    campaign: plain(raw.campaign, 120),
    utm_medium: plain(raw.utm_medium, 80),
  };
}

export function sniffImage(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 4_000_000;

export function stageLabel(stage: string): string {
  return LEAD_STAGES.find(([id]) => id === stage)?.[1] || "New inquiry";
}
