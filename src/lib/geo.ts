/**
 * Approximate connection location for area totals.
 * Reads Vercel or Netlify city, region, and country headers.
 * Never reads an IP, latitude, longitude, or postal code.
 * Every value is an estimate: a VPN or mobile network can point at another city.
 */
import { SERVICE_AREAS } from "./site.ts";

export type GeoPrecision = "estimated" | "unknown";

export type GeoEstimate = {
  city: string | null;
  region: string | null;
  country: string | null;
  precision: GeoPrecision;
  /** Where the fields came from. "unavailable" is local dev or a network with no geo headers. */
  source: "vercel" | "netlify" | "unavailable";
};

export type AreaBucket = {
  key: string;
  label: string;
};

const CITY_HEADER = "x-vercel-ip-city";
const REGION_HEADER = "x-vercel-ip-country-region";
const COUNTRY_HEADER = "x-vercel-ip-country";

function cleanPlace(raw: string | null): string | null {
  if (!raw) return null;
  let text = raw.trim();
  if (!text || /^(unknown|undefined|null)$/i.test(text)) return null;
  try {
    text = decodeURIComponent(text);
  } catch {
    /* A host sometimes sends the city already decoded. */
  }
  text = text.replace(/[\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim();
  if (!text || text.length > 80) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(text) || text.includes(":")) return null;
  return text;
}

function regionCode(code: string | null, name: string | null): string | null {
  const fromCode = cleanPlace(code);
  if (fromCode) {
    const parts = fromCode.split("-");
    const last = parts[parts.length - 1] || fromCode;
    if (last.length <= 8) return last;
  }
  return cleanPlace(name);
}

/** Netlify sends x-nf-geo as base64 JSON. Latitude, longitude, and postal code are ignored. */
function fromNetlify(raw: string): GeoEstimate | null {
  let text = raw.trim();
  if (!text.startsWith("{")) {
    try {
      text = atob(text);
    } catch {
      return null;
    }
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const geo = data as {
    city?: unknown;
    country?: { code?: unknown; name?: unknown };
    subdivision?: { code?: unknown; name?: unknown };
  };
  const city = cleanPlace(typeof geo.city === "string" ? geo.city : null);
  const region = regionCode(
    typeof geo.subdivision?.code === "string" ? geo.subdivision.code : null,
    typeof geo.subdivision?.name === "string" ? geo.subdivision.name : null,
  );
  const country = cleanPlace(typeof geo.country?.code === "string" ? geo.country.code : null);
  if (!city && !region && !country) return null;
  return { city, region, country, precision: "estimated", source: "netlify" };
}

export function geoFromHeaders(headers: Headers): GeoEstimate {
  const netlify = headers.get("x-nf-geo");
  if (netlify) {
    const parsed = fromNetlify(netlify);
    if (parsed) return parsed;
  }
  const city = cleanPlace(headers.get(CITY_HEADER));
  const region = cleanPlace(headers.get(REGION_HEADER));
  const country = cleanPlace(headers.get(COUNTRY_HEADER));
  if (!city && !region && !country) {
    return { city: null, region: null, country: null, precision: "unknown", source: "unavailable" };
  }
  return { city, region, country, precision: "estimated", source: "vercel" };
}

/** Postal codes Citium already serves. Unlisted ZIPs stay outside the service area. Not a rooftop lookup. */
const ZIP_TO_CITY: Record<string, (typeof SERVICE_AREAS)[number]> = {
  "91201": "Glendale",
  "91202": "Glendale",
  "91203": "Glendale",
  "91204": "Glendale",
  "91205": "Glendale",
  "91206": "Glendale",
  "91207": "Glendale",
  "91208": "Glendale",
  "91210": "Glendale",
  "91214": "La Crescenta",
  "91224": "La Crescenta",
  "91501": "Burbank",
  "91502": "Burbank",
  "91504": "Burbank",
  "91505": "Burbank",
  "91506": "Burbank",
  "91101": "Pasadena",
  "91103": "Pasadena",
  "91104": "Pasadena",
  "91105": "Pasadena",
  "91106": "Pasadena",
  "91107": "Pasadena",
  "91108": "Pasadena",
  "91801": "Alhambra",
  "91803": "Alhambra",
  "91040": "Sunland",
  "91042": "Tujunga",
};

export function areaKeyForCity(city: string): string {
  return `service:${city.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function serviceCity(name: string | null): (typeof SERVICE_AREAS)[number] | null {
  if (!name) return null;
  const found = SERVICE_AREAS.find((city) => city.toLowerCase() === name.toLowerCase());
  return found ?? null;
}

/** Service-area row, or one shared outside/unknown bucket. Other cities are not stored one by one. */
export function bucketForEstimate(geo: GeoEstimate): AreaBucket {
  const city = serviceCity(geo.city);
  if (city) return { key: areaKeyForCity(city), label: city };
  if (geo.precision === "unknown") return { key: "unknown", label: "Unknown" };
  return { key: "outside", label: "Outside service area" };
}

export function normalizeZip(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  const match = text.match(/^(\d{5})(?:-\d{4})?$/);
  return match ? match[1] : null;
}

export function bucketForZip(value: unknown): AreaBucket | null {
  const zip = normalizeZip(value);
  if (!zip) return null;
  const city = ZIP_TO_CITY[zip];
  if (!city) return { key: "outside", label: "Outside service area" };
  return { key: areaKeyForCity(city), label: city };
}

export type AreaStat = AreaBucket & {
  visits: number;
  inquiries: number;
  zipInquiries: number;
};

export const AREA_ROWS: AreaBucket[] = [
  ...SERVICE_AREAS.map((city) => ({ key: areaKeyForCity(city), label: city })),
  { key: "outside", label: "Outside service area" },
  { key: "unknown", label: "Unknown" },
];

