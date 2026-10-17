import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bucketForEstimate, bucketForZip, geoFromHeaders, normalizeZip } from "./geo.ts";

function headers(input: Record<string, string>) {
  return new Headers(input);
}

describe("connection estimate", () => {
  it("reads city, region, and country and ignores precise fields", () => {
    const geo = geoFromHeaders(
      headers({
        "x-vercel-ip-city": "Glendale",
        "x-vercel-ip-country-region": "CA",
        "x-vercel-ip-country": "US",
        "x-vercel-ip-latitude": "34.14",
        "x-forwarded-for": "203.0.113.10",
      }),
    );
    assert.deepEqual(geo, {
      city: "Glendale",
      region: "CA",
      country: "US",
      precision: "estimated",
      source: "vercel",
    });
    assert.equal(JSON.stringify(geo).includes("203.0.113.10"), false);
    assert.equal(JSON.stringify(geo).includes("34.14"), false);
    assert.equal(bucketForEstimate(geo).label, "Glendale");
  });

  it("decodes a city and still treats it as an estimate", () => {
    const geo = geoFromHeaders(headers({ "x-vercel-ip-city": "La%20Crescenta", "x-vercel-ip-country": "US" }));
    assert.equal(geo.city, "La Crescenta");
    assert.equal(geo.precision, "estimated");
    assert.equal(bucketForEstimate(geo).key, "service:la-crescenta");
  });

  it("collapses a VPN-style city outside the service area without keeping that city", () => {
    const geo = geoFromHeaders(headers({ "x-vercel-ip-city": "Frankfurt", "x-vercel-ip-country": "DE" }));
    assert.equal(geo.precision, "estimated");
    assert.deepEqual(bucketForEstimate(geo), { key: "outside", label: "Outside service area" });
  });

  it("reads a Netlify geo header and drops coordinates and postal code", () => {
    const encoded = btoa(
      JSON.stringify({
        city: "Pasadena",
        country: { code: "US", name: "United States" },
        subdivision: { code: "US-CA", name: "California" },
        latitude: 34.14,
        longitude: -118.14,
        postalCode: "91101",
      }),
    );
    const geo = geoFromHeaders(headers({ "x-nf-geo": encoded, "x-nf-client-connection-ip": "203.0.113.10" }));
    assert.deepEqual(geo, {
      city: "Pasadena",
      region: "CA",
      country: "US",
      precision: "estimated",
      source: "netlify",
    });
    assert.equal(JSON.stringify(geo).includes("34.14"), false);
    assert.equal(JSON.stringify(geo).includes("91101"), false);
    assert.equal(JSON.stringify(geo).includes("203.0.113.10"), false);
  });

  it("is unknown in local development when the headers are missing", () => {
    const geo = geoFromHeaders(headers({}));
    assert.equal(geo.precision, "unknown");
    assert.equal(geo.source, "unavailable");
    assert.equal(bucketForEstimate(geo).key, "unknown");
  });

  it("rejects an IP stuffed into the city header", () => {
    const geo = geoFromHeaders(headers({ "x-vercel-ip-city": "198.51.100.20" }));
    assert.equal(geo.city, null);
    assert.equal(geo.precision, "unknown");
  });
});

describe("customer ZIP", () => {
  it("keeps a ZIP the customer typed and maps only listed service areas", () => {
    assert.equal(normalizeZip("91203"), "91203");
    assert.equal(normalizeZip("91203-1234"), "91203");
    assert.equal(normalizeZip("9120"), null);
    assert.equal(bucketForZip("91203")?.label, "Glendale");
    assert.equal(bucketForZip("90012")?.key, "outside");
    assert.equal(bucketForZip(""), null);
  });
});
