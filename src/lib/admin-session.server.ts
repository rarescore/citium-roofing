import { createHash } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";
import { adminTokenValid, issueAdminToken, passwordsMatch } from "@/lib/admin-session";
import { getSessionUser } from "@/lib/auth/verify.server";

const COOKIE = "citium_office";

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

export function adminPasswordConfigured(): boolean {
  return env("CITIUM_ADMIN_PASSWORD").length > 0;
}

function secret(): string {
  return env("CITIUM_ADMIN_SECRET") || createHash("sha256").update(`citium-office:${env("CITIUM_ADMIN_PASSWORD")}`).digest("hex");
}

function readCookie(header: string | null): string {
  if (!header) return "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return decodeURIComponent(rest.join("="));
  }
  return "";
}

export function adminCookieValid(): boolean {
  const request = getRequest();
  const token = readCookie(request?.headers.get("cookie") ?? null);
  if (!token || !adminPasswordConfigured()) return false;
  return adminTokenValid(token, secret(), Math.floor(Date.now() / 1000));
}

export async function dashboardAllowed(): Promise<boolean> {
  if (adminCookieValid()) return true;
  const user = await getSessionUser();
  if (!user?.email) return false;
  const allow = (env("STAFF_EMAILS") || "citiuminc@gmail.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(user.email.toLowerCase());
}

export function loginResult(password: string, requestUrl: string): { ok: true; cookie: string } | { ok: false; status: number; error: string } {
  if (!adminPasswordConfigured()) {
    return { ok: false, status: 503, error: "The office password is not configured on the server." };
  }
  if (!passwordsMatch(password, env("CITIUM_ADMIN_PASSWORD"))) {
    return { ok: false, status: 401, error: "That password is not right." };
  }
  const token = issueAdminToken(secret(), Math.floor(Date.now() / 1000));
  const secure = requestUrl.startsWith("https:");
  const cookie = `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=43200${secure ? "; Secure" : ""}`;
  return { ok: true, cookie };
}

export function logoutCookie(requestUrl: string): string {
  const secure = requestUrl.startsWith("https:");
  return `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}
