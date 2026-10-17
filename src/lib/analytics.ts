/**
 * GA4-ready analytics. Loads gtag only when VITE_GA4_ID is set (e.g. G-XXXXXXXX).
 * No ID is hardcoded; the owner supplies it later via the Vercel env var.
 */
// Must be written literally so Vite inlines it at build time.
const GA_ID: string = import.meta.env.VITE_GA4_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let booted = false;

export function initAnalytics() {
  if (typeof window === "undefined" || booted || !GA_ID) return;
  booted = true;
  window.dataLayer = window.dataLayer || [];
  // gtag.js only executes dataLayer entries that are real `arguments` objects;
  // pushing a rest-parameter array is silently ignored (no hits are sent).
  window.gtag = function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true, send_page_view: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const tag = a.dataset.analytics;
      if (href.startsWith("tel:")) trackEvent("click_phone", { link_url: href });
      else if (href.startsWith("mailto:")) trackEvent("click_email", { link_url: href });
      else if (tag === "inspection") trackEvent("click_inspection", { link_url: href });
      else if (tag === "financing" || /financ/i.test(href))
        trackEvent("click_financing", { link_url: href });
      else if (tag === "estimate" || /\/estimate/.test(href))
        trackEvent("click_estimate", { link_url: href });
    },
    true,
  );
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", name, params);
}

export function trackLead(kind: string, service?: string) {
  const params: Record<string, string> = { lead_type: kind };
  if (service) params.service = service;
  trackEvent("generate_lead", params);
  // Inspection requests (service=inspection, or the service/contact forms) are counted separately.
  if (service === "inspection" || kind === "service" || kind === "contact") trackEvent("request_inspection", params);
  else if (kind === "estimate") trackEvent("request_estimate", params);
  else if (kind === "financing") trackEvent("request_financing", params);
}

export const analyticsEnabled = Boolean(GA_ID);
