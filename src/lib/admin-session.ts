import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Server-side office session. The password is never compared in the browser. */

export function passwordsMatch(given: string, expected: string): boolean {
  if (!expected) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function issueAdminToken(secret: string, nowSeconds: number, ttlSeconds = 60 * 60 * 12): string {
  const payload = `v1.${nowSeconds + ttlSeconds}`;
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function adminTokenValid(token: string, secret: string, nowSeconds: number): boolean {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts[2]);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const exp = Number(parts[1]);
  return Number.isFinite(exp) && exp > nowSeconds;
}

export function dollarsToCents(input: string): number | null {
  const text = input.trim().replace(/[$,]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const cents = Math.round(Number(text) * 100);
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > 1_000_000_000) return null;
  return cents;
}

export type AdChannel = "google" | "facebook" | "instagram" | "organic" | "other";

/** Classify a stored lead source. Direct traffic is not treated as organic. */
export function channelOf(source: string, medium: string): AdChannel {
  const s = source.trim().toLowerCase();
  const m = medium.trim().toLowerCase();
  if (s.includes("instagram") || s === "ig") return "instagram";
  if (s.includes("facebook") || s === "fb" || s === "meta") return "facebook";
  const organic = m === "organic" || s === "organic" || s.includes("bing") || s.includes("duckduckgo") || s.includes("yahoo");
  if (s.includes("google")) return organic ? "organic" : "google";
  if (organic) return "organic";
  return "other";
}
