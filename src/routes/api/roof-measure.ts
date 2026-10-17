import { createFileRoute } from "@tanstack/react-router";
import {
  containsPoint,
  metersBetween,
  pitchFromOccupancy,
  ringGapMeters,
  ringPerimeterFt,
  ringsAreaSqft,
  roofFromFootprint,
  type Ring,
} from "@/lib/roof-geometry";

let last = 0;

type EsriFeature = {
  attributes: Record<string, string | number | null>;
  geometry?: { rings?: number[][][] };
};

function asRings(rings?: number[][][]): Ring[] {
  return (rings ?? [])
    .map((raw) => {
      const pts = raw.map(([lng, lat]) => ({ lat, lng }));
      if (pts.length > 1) {
        const a = pts[0];
        const b = pts[pts.length - 1];
        if (a.lat === b.lat && a.lng === b.lng) pts.pop();
      }
      return pts;
    })
    .filter((pts) => pts.length >= 3);
}

type Candidate = {
  rings: Ring[];
  area: number;
  source: "structures" | "osm";
  dist: number;
  inside: boolean;
  heightM: number | null;
  occ: string;
  prim: string;
};

function candidateFrom(rings: Ring[], lat: number, lng: number, extra: Omit<Candidate, "rings" | "area" | "dist" | "inside">) {
  if (!rings.length) return null;
  const area = ringsAreaSqft(rings);
  if (area < 120 || area > 100000) return null;
  const outer = rings.slice().sort((a, b) => ringsAreaSqft([b]) - ringsAreaSqft([a]))[0];
  const cDist = metersBetween(
    { lat, lng },
    {
      lat: outer.reduce((s, p) => s + p.lat, 0) / outer.length,
      lng: outer.reduce((s, p) => s + p.lng, 0) / outer.length,
    },
  );
  return {
    rings,
    area,
    dist: cDist,
    inside: rings.some((ring) => containsPoint(ring, lat, lng)),
    ...extra,
  } satisfies Candidate;
}

async function structuresNear(lat: number, lng: number): Promise<Candidate[]> {
  const esri = new URL(
    "https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/USA_Structures_View/FeatureServer/0/query",
  );
  esri.searchParams.set("f", "json");
  esri.searchParams.set("geometry", `${lng},${lat}`);
  esri.searchParams.set("geometryType", "esriGeometryPoint");
  esri.searchParams.set("inSR", "4326");
  esri.searchParams.set("spatialRel", "esriSpatialRelIntersects");
  esri.searchParams.set("distance", "60");
  esri.searchParams.set("units", "esriSRUnit_Meter");
  esri.searchParams.set("outFields", "OCC_CLS,PRIM_OCC,HEIGHT,SQMETERS,OUTBLDG");
  esri.searchParams.set("returnGeometry", "true");
  esri.searchParams.set("outSR", "4326");
  esri.searchParams.set("resultRecordCount", "25");
  const res = await fetch(esri, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: EsriFeature[] };
  return (data.features ?? [])
    .map((f) => {
      if (f.attributes.OUTBLDG) return null;
      const heightM = Number(f.attributes.HEIGHT);
      return candidateFrom(asRings(f.geometry?.rings), lat, lng, {
        source: "structures",
        heightM: Number.isFinite(heightM) ? heightM : null,
        occ: String(f.attributes.OCC_CLS ?? ""),
        prim: String(f.attributes.PRIM_OCC ?? ""),
      });
    })
    .filter((c): c is Candidate => !!c);
}

async function osmNear(lat: number, lng: number): Promise<Candidate[]> {
  const query = `[out:json][timeout:8];way(around:40,${lat},${lng})["building"];out geom;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    elements?: { geometry?: { lat: number; lon: number }[]; tags?: Record<string, string> }[];
  };
  return (data.elements ?? [])
    .map((el) => {
      const kind = (el.tags?.building || "").toLowerCase();
      if (/shed|garage|roof|carport|greenhouse/.test(kind)) return null;
      const ring = (el.geometry ?? []).map((p) => ({ lat: p.lat, lng: p.lon }));
      return candidateFrom([ring], lat, lng, {
        source: "osm",
        heightM: null,
        occ: el.tags?.building || "",
        prim: el.tags?.building || "",
      });
    })
    .filter((c): c is Candidate => !!c);
}

function primaryOf(list: Candidate[]) {
  if (!list.length) return null;
  const inside = list.filter((c) => c.inside && c.area >= 400).sort((a, b) => a.area - b.area);
  if (inside[0]) return inside[0];
  return list
    .filter((c) => c.area >= 400)
    .slice()
    .sort((a, b) => a.dist - b.dist || a.area - b.area)[0] ?? null;
}

function withAttached(primary: Candidate, list: Candidate[]) {
  const extras = list.filter(
    (c) =>
      c !== primary &&
      c.source === primary.source &&
      c.area >= 180 &&
      c.area < primary.area * 0.6 &&
      ringGapMeters(primary.rings[0], c.rings[0]) < 1.4,
  );
  const area = primary.area + extras.reduce((s, c) => s + c.area, 0);
  const perimeter = ringPerimeterFt(primary.rings[0]) + extras.reduce((s, c) => s + ringPerimeterFt(c.rings[0]), 0);
  return { area, perimeter, parts: 1 + extras.length };
}

function choosePlan(structures: Candidate[], osm: Candidate[]) {
  const a = primaryOf(structures);
  const b = primaryOf(osm);
  if (a && b) {
    if (a.inside && !b.inside) return a;
    if (b.inside && !a.inside) return b;
    const bigger = a.area >= b.area ? a : b;
    const smaller = bigger === a ? b : a;
    const ratio = bigger.area / Math.max(smaller.area, 1);
    if (a.inside && b.inside) {
      if (ratio > 1.4 && smaller.area > 700) return smaller;
      return bigger;
    }
    if (ratio <= 1.2) return a.dist <= b.dist ? a : b;
    return smaller.dist + 8 < bigger.dist ? smaller : a.dist <= b.dist ? a : b;
  }
  return a || b;
}

export const Route = createFileRoute("/api/roof-measure")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const url = new URL(request.url);
        const lat = Number(url.searchParams.get("lat"));
        const lng = Number(url.searchParams.get("lng"));
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          return Response.json({ error: "Invalid coordinates." }, { status: 400, headers });
        }
        const now = Date.now();
        if (now - last < 700) {
          return Response.json({ error: "Please wait a moment and try again." }, { status: 429, headers });
        }
        last = now;
        try {
          const [structures, osm] = await Promise.all([
            structuresNear(lat, lng).catch(() => [] as Candidate[]),
            osmNear(lat, lng).catch(() => [] as Candidate[]),
          ]);
          const hit = choosePlan(structures, osm);
          if (!hit) return Response.json({ found: false, lat, lng }, { headers });
          const same = (hit.source === "structures" ? structures : osm);
          const plan = withAttached(hit, same);
          let planSqft = plan.area;
          if (hit.source === "osm") {
            const overhangFt = 1.5;
            planSqft = plan.area + plan.perimeter * overhangFt + Math.PI * overhangFt * overhangFt;
          }
          const pitch = pitchFromOccupancy(hit.occ, hit.prim, hit.heightM);
          const areas = roofFromFootprint(planSqft, pitch.rise, pitch.run);
          return Response.json(
            {
              found: true,
              lat,
              lng,
              ...areas,
              perimeterFt: Math.round(plan.perimeter),
              parts: plan.parts,
              pitchRise: pitch.rise,
              pitchRun: pitch.run,
              pitchLabel: pitch.label,
              heightFt: hit.heightM != null ? Math.round(hit.heightM * 3.28084) : null,
              occupancy: hit.prim || hit.occ || "Structure",
              source: hit.source,
            },
            { headers },
          );
        } catch {
          return Response.json(
            { error: "Satellite tracing is unavailable. You can still request a report." },
            { status: 502, headers },
          );
        }
      },
    },
  },
});
