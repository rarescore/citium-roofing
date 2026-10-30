/**
 * Single-hop SEO redirects (GSC fix 2026-10-29). Runs before every other
 * middleware. Resolves apex -> www, trailing slash and moved paths into ONE
 * 301 to the final canonical URL, so no request ever chains.
 */
import { REDIRECTS, PREFIX_REDIRECTS } from "../../src/lib/redirects";

const CANONICAL_HOST = "www.citiumroofing.com";

interface Ev {
  url: URL;
  req: { method: string; headers: Headers };
}

function decode(p: string): string {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
}

export default async function seoRedirects(event: Ev, next: () => Promise<unknown>) {
  const method = event.req.method;
  if (method !== "GET" && method !== "HEAD") return next();
  const host = (event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? event.url.host)
    .toLowerCase()
    .split(":")[0];
  const rawPath = event.url.pathname;
  if (rawPath.startsWith("/api/") || rawPath.startsWith("/__")) return next();

  let path = decode(rawPath);
  if (path.length > 1 && path.endsWith("/")) path = path.replace(/\/+$/, "") || "/";
  let target = REDIRECTS[path];
  if (!target) {
    for (const [prefix, dest] of PREFIX_REDIRECTS) if (path.startsWith(prefix)) target = dest;
  }
  const wrongHost = host === "citiumroofing.com";
  const changed = target !== undefined || path !== decode(rawPath);
  if (!changed && !wrongHost) return next();

  const finalPath = target ?? (path === decode(rawPath) ? rawPath : encodeURI(path));
  const location = `https://${CANONICAL_HOST}${finalPath}${target ? "" : event.url.search}`;
  return new Response(null, { status: 301, headers: { location, "cache-control": "public, max-age=3600" } });
}
