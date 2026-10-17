import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isLeadStage, readAttribution, readContactMethod, readUrgency, sniffImage } from "./lead-fields.ts";

describe("estimate fields", () => {
  it("defaults a blank request to standard and phone", () => {
    assert.equal(readUrgency(""), "standard");
    assert.equal(readUrgency("emergency"), "emergency");
    assert.equal(readContactMethod(undefined), "phone");
    assert.throws(() => readUrgency("tonight"), /standard request/);
  });

  it("keeps campaign data and drops personal details", () => {
    const attr = readAttribution({
      landing_page: "/estimate?address=401+Brand",
      traffic_source: "instagram",
      campaign: "spring-roofs",
      utm_medium: "paid",
    });
    assert.equal(attr.landing_page, "/estimate");
    assert.equal(attr.traffic_source, "instagram");
    assert.equal(attr.campaign, "spring-roofs");
    const blocked = readAttribution({
      landing_page: "https://evil.example/phish",
      traffic_source: "ada@example.com",
      campaign: "call 8185550100",
    });
    assert.equal(blocked.landing_page, "");
    assert.equal(blocked.traffic_source, "direct");
    assert.equal(blocked.campaign, "");
  });

  it("accepts real images and rejects a renamed text file", () => {
    assert.equal(sniffImage(Uint8Array.from([0xff, 0xd8, 0xff, 0x00, 0, 0, 0, 0, 0, 0, 0, 0])), "image/jpeg");
    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    assert.equal(sniffImage(webp), "image/webp");
    const html = new TextEncoder().encode("<html>not a photo</html>");
    assert.equal(sniffImage(html), null);
    assert.equal(isLeadStage("won"), true);
    assert.equal(isLeadStage("paid"), false);
  });
});
