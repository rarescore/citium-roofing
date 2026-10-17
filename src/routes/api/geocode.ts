import { createFileRoute } from "@tanstack/react-router";

let last = 0;

export type GeoHit = { lat: number; lng: number; label: string };

async function esriFind(q: string, magicKey?: string): Promise<GeoHit | null> {
  const url = new URL("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates");
  url.searchParams.set("f", "json");
  url.searchParams.set("maxLocations", "1");
  url.searchParams.set("countryCode", "USA");
  url.searchParams.set("outFields", "Match_addr,LongLabel");
  url.searchParams.set("locationType", "rooftop");
  url.searchParams.set("location", "-118.3,34.18");
  if (magicKey) url.searchParams.set("magicKey", magicKey);
  else url.searchParams.set("SingleLine", q);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: { address?: string; location?: { x: number; y: number }; attributes?: Record<string, string> }[];
  };
  const c = data.candidates?.[0];
  if (!c?.location) return null;
  return {
    lat: c.location.y,
    lng: c.location.x,
    label: c.attributes?.LongLabel || c.attributes?.Match_addr || c.address || q,
  };
}

async function census(q: string): Promise<GeoHit | null> {
  const url =
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&vintage=Current_Current&format=json&address=" +
    encodeURIComponent(q);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    result?: { addressMatches?: { matchedAddress?: string; coordinates?: { x: number; y: number } }[] };
  };
  const m = data.result?.addressMatches?.[0];
  if (!m?.coordinates) return null;
  return { lat: m.coordinates.y, lng: m.coordinates.x, label: m.matchedAddress || q };
}

export const Route = createFileRoute("/api/geocode")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const params = new URL(request.url).searchParams;
        const q = params.get("q")?.trim() ?? "";
        const magicKey = params.get("magicKey")?.trim() || undefined;
        if (q.length < 3 || q.length > 200) {
          return Response.json({ error: "Enter a street address." }, { status: 400, headers });
        }
        const now = Date.now();
        if (now - last < 250) {
          return Response.json({ error: "Please wait a moment and try again." }, { status: 429, headers });
        }
        last = now;
        try {
          const hit = (await esriFind(q, magicKey)) || (await census(q));
          if (!hit) {
            return Response.json(
              { error: "We could not locate that address. Check the street, city, and ZIP." },
              { status: 404, headers },
            );
          }
          return Response.json(hit, { headers });
        } catch {
          return Response.json(
            { error: "The map service is unavailable. You can still request a report." },
            { status: 502, headers },
          );
        }
      },
    },
  },
});
