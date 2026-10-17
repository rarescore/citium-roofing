function allowed(consentOn: boolean, configured: boolean): boolean {
  return configured && consentOn;
}

export type VendorKind = "ga4" | "gtm" | "clarity" | "meta" | "ads" | "label";

const ID_PATTERN: Record<VendorKind, RegExp> = {
  ga4: /^G-[A-Z0-9]+$/i,
  gtm: /^GTM-[A-Z0-9]+$/i,
  clarity: /^[a-z0-9]{6,20}$/i,
  meta: /^\d{8,20}$/,
  ads: /^AW-\d{6,20}$/,
  label: /^[A-Za-z0-9_-]{6,40}$/,
};

export function usable(kind: VendorKind, raw: unknown): string {
  if (typeof raw !== "string") return "";
  const id = raw.trim();
  if (!id || /X{4,}/i.test(id) || /your-|changeme|placeholder|example/i.test(id)) return "";
  return ID_PATTERN[kind].test(id) ? id : "";
}

export type TrackingPlan = {
  gtm: boolean;
  ga4: boolean;
  clarity: boolean;
  meta: boolean;
  ads: boolean;
};

/** What will actually load. Direct Google/Meta tags are off when GTM is on. */
export function trackingPlan(
  ids: { ga4: string; gtm: string; clarity: string; meta: string; ads: string; label: string },
  consent: { analytics: boolean; marketing: boolean },
): TrackingPlan {
  const gtm = allowed(consent.analytics, Boolean(ids.gtm)) || allowed(consent.marketing, Boolean(ids.gtm));
  return {
    gtm,
    ga4: !gtm && allowed(consent.analytics, Boolean(ids.ga4)),
    clarity: allowed(consent.analytics, Boolean(ids.clarity)),
    meta: !gtm && allowed(consent.marketing, Boolean(ids.meta)),
    ads: !gtm && allowed(consent.marketing, Boolean(ids.ads && ids.label)),
  };
}

const SENSITIVE_KEY = /name|phone|tel|email|mail|address|street|city|zip|postal|message|comment|ip|gclid|fbclid|msclkid/i;

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function sanitizeParams(input: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEY.test(key)) continue;
    if (typeof value === "number" || typeof value === "boolean") {
      if (Number.isFinite(value) || typeof value === "boolean") out[key] = value;
      continue;
    }
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (!text || text.length > 180) continue;
    if (looksLikeEmail(text) || looksLikePhone(text)) continue;
    out[key] = text;
  }
  return out;
}

export function classifyPath(pathname: string): { page_path: string; page_type: string } {
  const path = (pathname.split("?")[0]?.split("#")[0] || "/").slice(0, 180) || "/";
  let page_type = "page";
  if (path === "/") page_type = "home";
  else if (path.startsWith("/articles")) page_type = "article";
  else if (path.startsWith("/service-areas")) page_type = "service_area";
  else if (path === "/estimate") page_type = "estimate";
  else if (path === "/contact" || path === "/customer-service") page_type = "contact";
  else if (path === "/financing") page_type = "financing";
  else if (/roof|shingle|tile|tpo|bitumen|inspection/i.test(path)) page_type = "service";
  return { page_path: path, page_type };
}

export function deviceCategory(width: number): "mobile" | "tablet" | "desktop" {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function campaignFromSearch(search: string): Record<string, string> {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (!value) continue;
    const clean = sanitizeParams({ [key]: value });
    if (typeof clean[key] === "string") out[key] = clean[key];
  }
  return out;
}

export function shouldTrackPage(previous: { path: string; at: number } | null, path: string, now: number, windowMs = 800): boolean {
  if (previous && previous.path === path && now - previous.at < windowMs) return false;
  return true;
}
