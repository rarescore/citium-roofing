import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  campaignFromSearch,
  classifyPath,
  deviceCategory,
  looksLikeEmail,
  looksLikePhone,
  sanitizeParams,
  shouldTrackPage,
  trackingPlan,
  usable,
} from "./tracking-plan.ts";

describe("vendor ids", () => {
  it("rejects blanks, placeholders, and the wrong product shape", () => {
    assert.equal(usable("ga4", ""), "");
    assert.equal(usable("ga4", "G-XXXXXXXX"), "");
    assert.equal(usable("ga4", "GTM-ABC123"), "");
    assert.equal(usable("gtm", "GTM-ABC123"), "GTM-ABC123");
    assert.equal(usable("meta", "not-a-pixel"), "");
    assert.equal(usable("ads", "AW-123456789"), "AW-123456789");
    assert.equal(usable("label", "AbCdEf"), "AbCdEf");
    assert.equal(usable("clarity", "abcd12"), "abcd12");
  });
});

describe("tracking plan", () => {
  const ids = { ga4: "G-TEST1234", gtm: "", clarity: "abcd12", meta: "1234567890", ads: "AW-123456789", label: "AbCdEf12" };
  const on = { analytics: true, marketing: true };
  const off = { analytics: false, marketing: false };

  it("loads nothing without consent", () => {
    assert.deepEqual(trackingPlan(ids, off), { gtm: false, ga4: false, clarity: false, meta: false, ads: false });
  });

  it("loads direct tags only when their ids are set and GTM is not", () => {
    assert.deepEqual(trackingPlan(ids, on), { gtm: false, ga4: true, clarity: true, meta: true, ads: true });
    assert.equal(trackingPlan({ ...ids, ads: "", label: "" }, on).ads, false);
  });

  it("lets GTM own Google and Meta so those hits are not sent twice", () => {
    const plan = trackingPlan({ ...ids, gtm: "GTM-ABC123" }, on);
    assert.equal(plan.gtm, true);
    assert.equal(plan.ga4, false);
    assert.equal(plan.meta, false);
    assert.equal(plan.ads, false);
    assert.equal(plan.clarity, true);
  });
});

describe("privacy of event payloads", () => {
  it("drops names, phones, emails, addresses, and click ids", () => {
    const clean = sanitizeParams({
      lead_type: "estimate",
      service: "inspection",
      name: "Ada Lovelace",
      phone: "8185550100",
      email: "ada@example.com",
      address: "401 N Brand Blvd",
      message: "Please call me",
      gclid: "abc",
      note: "ada@example.com",
      page_path: "/estimate",
    });
    assert.deepEqual(clean, { lead_type: "estimate", service: "inspection", page_path: "/estimate" });
    assert.equal(looksLikeEmail("ada@example.com"), true);
    assert.equal(looksLikePhone("818-555-0100"), true);
  });

  it("keeps campaign parameters and ignores the query string on the path", () => {
    assert.deepEqual(campaignFromSearch("?utm_source=instagram&utm_medium=paid&gclid=secret&address=401+Brand"), {
      utm_source: "instagram",
      utm_medium: "paid",
    });
    assert.deepEqual(classifyPath("/roof-repair-glendale-ca?address=401+N+Brand"), {
      page_path: "/roof-repair-glendale-ca",
      page_type: "service",
    });
    assert.equal(classifyPath("/").page_type, "home");
    assert.equal(deviceCategory(390), "mobile");
    assert.equal(deviceCategory(800), "tablet");
    assert.equal(deviceCategory(1440), "desktop");
  });

  it("counts one page view when the same route is reported twice in a moment", () => {
    assert.equal(shouldTrackPage(null, "/", 1000), true);
    assert.equal(shouldTrackPage({ path: "/", at: 1000 }, "/", 1200), false);
    assert.equal(shouldTrackPage({ path: "/", at: 1000 }, "/estimate", 1100), true);
    assert.equal(shouldTrackPage({ path: "/", at: 1000 }, "/", 2000), true);
  });
});
