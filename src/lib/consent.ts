/**
 * First-party cookie choices for Citium. Optional categories stay off until
 * the visitor chooses. This file does not load analytics or advertising.
 *
 * Legal review: this is a technical control, not a determination that CCPA,
 * CPRA, GDPR, or ePrivacy duties are met.
 */
export const CONSENT_VERSION = "2026-10-17c";
export const CONSENT_COOKIE = "citium_consent";
export const CONSENT_STORAGE_KEY = "citium.consent";
/** Six months. Counsel should confirm the retention period. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
export const OPEN_CONSENT_EVENT = "citium:open-consent";

export type ConsentSource = "accept" | "reject" | "custom";

export type ConsentRecord = {
  v: string;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  at: string;
  source: ConsentSource;
  /** True only when the visitor turned marketing on while GPC was active. */
  gpcOverride: boolean;
};

export type EffectiveConsent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  gpc: boolean;
};

export type ConsentState = "granted" | "denied";

/** Google Consent Mode v2 signals. Essential storage stays granted. */
export type ConsentModeSignals = {
  analytics_storage: ConsentState;
  ad_storage: ConsentState;
  ad_user_data: ConsentState;
  ad_personalization: ConsentState;
  functionality_storage: "granted";
  security_storage: "granted";
};

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

export function consentSignals(choice: { analytics: boolean; marketing: boolean }): ConsentModeSignals {
  const ad: ConsentState = choice.marketing ? "granted" : "denied";
  return {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: ad,
    ad_user_data: ad,
    ad_personalization: ad,
    functionality_storage: "granted",
    security_storage: "granted",
  };
}

export function allowsScript(
  kind: "analytics" | "marketing",
  consent: { analytics: boolean; marketing: boolean },
  configured: boolean,
): boolean {
  if (!configured) return false;
  return kind === "analytics" ? consent.analytics === true : consent.marketing === true;
}

export function gpcActive(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.globalPrivacyControl === true;
}

export function isCurrentConsent(record: ConsentRecord | null): record is ConsentRecord {
  return !!record && record.v === CONSENT_VERSION && record.essential === true;
}

/**
 * Optional tracking is off with no current choice.
 * GPC denies marketing unless the visitor explicitly enabled it while GPC was on.
 * Analytics follows the stored choice. GPC is a sale/share signal, not an analytics switch.
 */
export function effectiveConsent(record: ConsentRecord | null, gpc: boolean): EffectiveConsent {
  if (!isCurrentConsent(record)) {
    return { essential: true, analytics: false, marketing: false, gpc };
  }
  return {
    essential: true,
    analytics: record.analytics,
    marketing: gpc && !record.gpcOverride ? false : record.marketing,
    gpc,
  };
}

export function makeConsent(
  choice: { analytics: boolean; marketing: boolean; source: ConsentSource },
  gpc: boolean,
  now = new Date().toISOString(),
): ConsentRecord {
  return {
    v: CONSENT_VERSION,
    essential: true,
    analytics: choice.analytics === true,
    marketing: choice.marketing === true,
    at: now,
    source: choice.source,
    gpcOverride: Boolean(gpc && choice.marketing === true),
  };
}

export function parseConsent(raw: string | null | undefined): ConsentRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentRecord>;
    if (value.v !== CONSENT_VERSION || value.essential !== true) return null;
    if (typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean") return null;
    if (value.source !== "accept" && value.source !== "reject" && value.source !== "custom") return null;
    return {
      v: CONSENT_VERSION,
      essential: true,
      analytics: value.analytics,
      marketing: value.marketing,
      at: typeof value.at === "string" ? value.at : "",
      source: value.source,
      gpcOverride: value.gpcOverride === true,
    };
  } catch {
    return null;
  }
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie ? document.cookie.split("; ") : [];
  const found = parts.find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  if (!found) return null;
  try {
    return decodeURIComponent(found.slice(CONSENT_COOKIE.length + 1));
  } catch {
    return null;
  }
}

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    /* Storage can throw in private mode. The cookie is the fallback. */
  }
  return parseConsent(readCookie());
}

export function writeConsent(record: ConsentRecord): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(record);
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, raw);
  } catch {
    /* Cookie still records the choice. */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(raw)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function openConsentSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

/** Runs before any tag. Sets Consent Mode defaults to denied and does not contact Google. */
export const CONSENT_DEFAULT_SCRIPT = `(function(){
  if (window.__citiumConsentDefault) return;
  window.__citiumConsentDefault = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{
    analytics_storage:'denied',
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied',
    functionality_storage:'granted',
    security_storage:'granted',
    wait_for_update:500
  });
})();`;
