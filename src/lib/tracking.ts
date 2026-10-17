/**
 * One tracker for Citium. A vendor script loads only when its ID is set
 * and the matching consent is on. No account ID is invented.
 *
 * If VITE_GTM_ID is set, GTM is the only Google and Meta loader. Direct
 * GA4, Google Ads, and Meta are skipped so the same hit is not sent twice.
 * In GTM, trigger tags on citium_page_view and generate_lead, not on All Pages.
 */
import { consentSignals, effectiveConsent, gpcActive, readConsent } from "@/lib/consent";
import {
  campaignFromSearch,
  classifyPath,
  deviceCategory,
  sanitizeParams,
  shouldTrackPage,
  trackingPlan,
  usable,
  type TrackingPlan,
} from "@/lib/tracking-plan";

const GA4_ID = usable("ga4", import.meta.env.VITE_GA4_ID);
const GTM_ID = usable("gtm", import.meta.env.VITE_GTM_ID);
const CLARITY_ID = usable("clarity", import.meta.env.VITE_CLARITY_ID);
const META_ID = usable("meta", import.meta.env.VITE_META_PIXEL_ID);
const ADS_ID = usable("ads", import.meta.env.VITE_GOOGLE_ADS_ID);
const ADS_LABEL = usable("label", import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL);

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };
type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __citiumConsentDefault?: boolean;
    __citiumConsent?: { analytics: boolean; marketing: boolean };
    __citiumTracking?: TrackingPlan;
    clarity?: ClarityFn;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let analyticsOn = false;
let marketingOn = false;
let listenersBound = false;
let lastPage: { path: string; at: number } | null = null;
let lastGeoPath = "";
let lastGeoAt = 0;
let lastLead = "";
let lastLeadAt = 0;
const startedForms = new WeakSet<HTMLFormElement>();
let landingPath = "";
let landingCampaign: Record<string, string> = {};

function ids() {
  return { ga4: GA4_ID, gtm: GTM_ID, clarity: CLARITY_ID, meta: META_ID, ads: ADS_ID, label: ADS_LABEL };
}

function installConsentStub() {
  if (typeof window === "undefined" || window.__citiumConsentDefault) return;
  window.__citiumConsentDefault = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  window.gtag("consent", "default", {
    ...consentSignals({ analytics: false, marketing: false }),
    wait_for_update: 500,
  });
}

function rememberLanding() {
  if (typeof window === "undefined" || landingPath) return;
  landingPath = classifyPath(window.location.pathname).page_path;
  landingCampaign = campaignFromSearch(window.location.search);
}

function context(): Record<string, string | number | boolean> {
  const page = classifyPath(window.location.pathname);
  return sanitizeParams({
    ...landingCampaign,
    ...page,
    landing_page: landingPath || page.page_path,
    device: deviceCategory(window.innerWidth || 0),
  });
}

function maskForms() {
  document.querySelectorAll("form, form input, form textarea, form select").forEach((node) => {
    node.setAttribute("data-clarity-mask", "true");
  });
}

function addScript(src: string, marker: string) {
  if (document.querySelector(`script[data-citium="${marker}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.dataset.citium = marker;
  script.src = src;
  document.head.appendChild(script);
}

function ensureGtag(loaderId: string) {
  installConsentStub();
  if (!document.querySelector('script[data-citium="gtag"]')) {
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(loaderId)}`, "gtag");
  }
  window.gtag?.("js", new Date());
}

function loadGtm() {
  if (document.querySelector('script[data-citium="gtm"]')) return;
  installConsentStub();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`, "gtm");
}

function loadGa() {
  ensureGtag(GA4_ID);
  window.gtag?.("config", GA4_ID, { anonymize_ip: true, send_page_view: false });
}

function loadAds() {
  ensureGtag(ADS_ID);
  window.gtag?.("config", ADS_ID, { send_page_view: false });
}

function loadClarity() {
  if (document.querySelector('script[data-citium="clarity"]')) return;
  if (!window.clarity) {
    const clarity: ClarityFn = (...args: unknown[]) => {
      clarity.q = clarity.q || [];
      clarity.q.push(args);
    };
    window.clarity = clarity;
  }
  addScript(`https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`, "clarity");
  maskForms();
}

function loadMeta() {
  if (!window.fbq) {
    const fbq = function fbqStub(...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js", "meta");
  }
  window.fbq?.("init", META_ID);
  window.fbq?.("consent", "grant");
}

function emit(name: string, params: Record<string, unknown>, plan: TrackingPlan) {
  const body = sanitizeParams({ ...context(), ...params });
  if (plan.gtm && (analyticsOn || marketingOn)) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...body });
    return;
  }
  if (plan.ga4 && analyticsOn && window.gtag) window.gtag("event", name, body);
}

function formName(form: HTMLFormElement): string {
  if (form.classList.contains("visit-form")) return "visit";
  const path = window.location.pathname;
  if (path.includes("financing")) return "financing";
  if (path.includes("customer-service")) return "customer_service";
  if (path.includes("contact")) return "contact";
  return "estimate";
}

function bindListeners() {
  if (listenersBound || typeof document === "undefined") return;
  listenersBound = true;
  document.addEventListener(
    "click",
    (event) => {
      const link = (event.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const tag = link.dataset.analytics;
      if (href.startsWith("tel:")) trackEvent("click_phone", { target: "phone" });
      else if (href.startsWith("mailto:")) trackEvent("click_email", { target: "email" });
      else if (tag === "inspection") trackEvent("click_inspection", { target: "inspection" });
      else if (tag === "financing" || /financ/i.test(href)) trackEvent("click_financing", { target: "financing" });
      else if (tag === "estimate" || /\/estimate/.test(href)) trackEvent("click_estimate", { target: "estimate" });
    },
    true,
  );
  document.addEventListener(
    "focusin",
    (event) => {
      const form = (event.target as HTMLElement | null)?.closest?.("form");
      if (!form || (!form.classList.contains("inquiry-form") && !form.classList.contains("visit-form"))) return;
      maskForms();
      if (startedForms.has(form)) return;
      startedForms.add(form);
      trackEvent("form_start", { form_name: formName(form) });
    },
    true,
  );
  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.classList.contains("inquiry-form") && !form.classList.contains("visit-form")) return;
      trackEvent("form_submit", { form_name: formName(form) });
    },
    true,
  );
}

function reportGeoVisit(path: string) {
  if (!analyticsOn) return;
  const now = Date.now();
  if (lastGeoPath === path && now - lastGeoAt < 800) return;
  lastGeoPath = path;
  lastGeoAt = now;
  fetch("/api/analytics/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    keepalive: true,
  }).catch(() => undefined);
}

export function trackPageView(pathname?: string) {
  if (typeof window === "undefined") return;
  rememberLanding();
  const path = classifyPath(pathname || window.location.pathname).page_path;
  const now = Date.now();
  if (!shouldTrackPage(lastPage, path, now)) return;
  lastPage = { path, at: now };
  if (analyticsOn) reportGeoVisit(path);
  const plan = window.__citiumTracking;
  if (!plan || (!plan.ga4 && !plan.gtm && !plan.meta)) return;
  maskForms();
  const page = classifyPath(path);
  if (plan.gtm) emit("citium_page_view", page, plan);
  else if (plan.ga4) emit("page_view", page, plan);
  if (plan.meta && window.fbq) window.fbq("track", "PageView");
}

export function syncAnalytics(choice: { analytics: boolean; marketing: boolean }) {
  if (typeof window === "undefined") return;
  rememberLanding();
  installConsentStub();
  analyticsOn = choice.analytics === true;
  marketingOn = choice.marketing === true;
  window.__citiumConsent = { analytics: analyticsOn, marketing: marketingOn };
  const plan = trackingPlan(ids(), { analytics: analyticsOn, marketing: marketingOn });
  window.__citiumTracking = plan;
  window.gtag?.("consent", "update", consentSignals({ analytics: analyticsOn, marketing: marketingOn }));
  if (plan.gtm) loadGtm();
  if (plan.ga4) loadGa();
  if (plan.ads) loadAds();
  if (plan.clarity) loadClarity();
  else if (window.clarity) window.clarity("consent", false);
  if (plan.meta) loadMeta();
  else if (window.fbq) window.fbq("consent", "revoke");
  if (plan.ga4 || plan.gtm || plan.meta) trackPageView(window.location.pathname);
  maskForms();
}

export function leadAttribution() {
  if (typeof window === "undefined") {
    return { landingPage: "/", trafficSource: "direct", campaign: "", utmMedium: "" };
  }
  rememberLanding();
  const landing = landingPath || classifyPath(window.location.pathname).page_path;
  let source = landingCampaign.utm_source || "";
  if (!source && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && !host.endsWith("citiumroofing.com") && !host.endsWith("grok-sandbox.com")) source = host;
    } catch {
      source = "";
    }
  }
  return {
    landingPage: landing.split("?")[0]?.slice(0, 180) || "/",
    trafficSource: (source || "direct").slice(0, 80),
    campaign: (landingCampaign.utm_campaign || "").slice(0, 120),
    utmMedium: (landingCampaign.utm_medium || "").slice(0, 80),
  };
}

export function initAnalytics() {
  rememberLanding();
  bindListeners();
  syncAnalytics(effectiveConsent(readConsent(), gpcActive()));
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || !analyticsOn) return;
  const plan = window.__citiumTracking;
  if (!plan || (!plan.ga4 && !plan.gtm)) return;
  emit(name, params || {}, plan);
}

export function trackLead(kind: string, service?: string) {
  if (typeof window === "undefined") return;
  const key = `${kind}:${service || ""}:${classifyPath(window.location.pathname).page_path}`;
  const now = Date.now();
  if (key === lastLead && now - lastLeadAt < 10000) return;
  lastLead = key;
  lastLeadAt = now;
  const params = sanitizeParams({ lead_type: kind, service: service || "" });
  const plan = window.__citiumTracking;
  if (!plan) return;
  if (plan.gtm && (analyticsOn || marketingOn)) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "generate_lead", ...context(), ...params });
  } else if (analyticsOn && plan.ga4) {
    emit("generate_lead", params, plan);
  }
  if (!marketingOn) return;
  if (plan.ads && window.gtag) window.gtag("event", "conversion", { send_to: `${ADS_ID}/${ADS_LABEL}` });
  if (plan.meta && window.fbq) window.fbq("track", "Lead");
}

export const analyticsEnabled = Boolean(GA4_ID || GTM_ID || CLARITY_ID);
