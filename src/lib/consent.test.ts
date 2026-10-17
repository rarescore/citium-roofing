import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CONSENT_DEFAULT_SCRIPT,
  CONSENT_VERSION,
  allowsScript,
  consentSignals,
  effectiveConsent,
  makeConsent,
  parseConsent,
} from "./consent.ts";

describe("consent signals", () => {
  it("denies analytics and advertising by default", () => {
    const signals = consentSignals({ analytics: false, marketing: false });
    assert.equal(signals.analytics_storage, "denied");
    assert.equal(signals.ad_storage, "denied");
    assert.equal(signals.ad_user_data, "denied");
    assert.equal(signals.ad_personalization, "denied");
    assert.equal(signals.functionality_storage, "granted");
    assert.equal(signals.security_storage, "granted");
  });

  it("grants only the category the visitor allowed", () => {
    const analytics = consentSignals({ analytics: true, marketing: false });
    assert.equal(analytics.analytics_storage, "granted");
    assert.equal(analytics.ad_storage, "denied");
    const marketing = consentSignals({ analytics: false, marketing: true });
    assert.equal(marketing.analytics_storage, "denied");
    assert.equal(marketing.ad_storage, "granted");
    assert.equal(marketing.ad_user_data, "granted");
    assert.equal(marketing.ad_personalization, "granted");
  });
});

describe("stored choice", () => {
  it("ignores a missing, corrupt, or outdated record", () => {
    assert.equal(parseConsent(null), null);
    assert.equal(parseConsent("not-json"), null);
    assert.equal(parseConsent(JSON.stringify({ v: "1999-01-01", essential: true, analytics: true, marketing: true, source: "accept" })), null);
    const none = effectiveConsent(null, false);
    assert.equal(none.analytics, false);
    assert.equal(none.marketing, false);
  });

  it("keeps a current choice and drops marketing when GPC is on without an override", () => {
    const saved = makeConsent({ analytics: true, marketing: true, source: "accept" }, false, "2026-10-17T00:00:00.000Z");
    assert.equal(saved.v, CONSENT_VERSION);
    assert.equal(saved.gpcOverride, false);
    const honored = effectiveConsent(saved, true);
    assert.equal(honored.analytics, true);
    assert.equal(honored.marketing, false);
  });

  it("keeps marketing only when the visitor enabled it while GPC was on", () => {
    const saved = makeConsent({ analytics: true, marketing: true, source: "accept" }, true, "2026-10-17T00:00:00.000Z");
    assert.equal(saved.gpcOverride, true);
    assert.equal(effectiveConsent(saved, true).marketing, true);
    const analyticsOnly = makeConsent({ analytics: true, marketing: false, source: "custom" }, true);
    assert.equal(analyticsOnly.gpcOverride, false);
    assert.equal(effectiveConsent(analyticsOnly, true).marketing, false);
  });
});

describe("script loading", () => {
  it("does not load analytics or ads without both consent and configuration", () => {
    const denied = { analytics: false, marketing: false };
    const allowed = { analytics: true, marketing: true };
    assert.equal(allowsScript("analytics", denied, true), false);
    assert.equal(allowsScript("analytics", allowed, false), false);
    assert.equal(allowsScript("analytics", allowed, true), true);
    assert.equal(allowsScript("marketing", allowed, false), false);
    assert.equal(allowsScript("marketing", denied, true), false);
  });

  it("sets Consent Mode defaults without loading Google", () => {
    assert.match(CONSENT_DEFAULT_SCRIPT, /analytics_storage:'denied'/);
    assert.match(CONSENT_DEFAULT_SCRIPT, /ad_storage:'denied'/);
    assert.match(CONSENT_DEFAULT_SCRIPT, /ad_user_data:'denied'/);
    assert.match(CONSENT_DEFAULT_SCRIPT, /ad_personalization:'denied'/);
    assert.doesNotMatch(CONSENT_DEFAULT_SCRIPT, /googletagmanager|facebook|fbq|hotjar|clarity/i);
  });
});
