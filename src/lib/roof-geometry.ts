export type Ring = { lat: number; lng: number }[];

function localMeters(ring: Ring) {
  const lat0 = (ring.reduce((s, p) => s + p.lat, 0) / ring.length) * (Math.PI / 180);
  return { mLat: 110540, mLng: 111320 * Math.cos(lat0) };
}

function toXY(p: { lat: number; lng: number }, mLat: number, mLng: number) {
  return { x: p.lng * mLng, y: p.lat * mLat };
}

export function ringSignedSqft(ring: Ring) {
  if (ring.length < 3) return 0;
  const { mLat, mLng } = localMeters(ring);
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = toXY(ring[i], mLat, mLng);
    const b = toXY(ring[(i + 1) % ring.length], mLat, mLng);
    sum += a.x * b.y - b.x * a.y;
  }
  return (sum / 2) * 10.76391041671;
}

export function ringAreaSqft(ring: Ring) {
  return Math.abs(ringSignedSqft(ring));
}

/** Exterior rings add, holes subtract. Same-direction parts add. */
export function ringsAreaSqft(rings: Ring[]) {
  const signed = rings.reduce((s, r) => s + ringSignedSqft(r), 0);
  return Math.abs(signed);
}

export function ringGapMeters(a: Ring, b: Ring) {
  let best = Infinity;
  const check = (from: Ring, to: Ring) => {
    for (const p of from) {
      for (let i = 0; i < to.length; i++) {
        best = Math.min(best, pointSegMeters(p, to[i], to[(i + 1) % to.length]));
        if (best === 0) return;
      }
    }
  };
  check(a, b);
  check(b, a);
  return best;
}

function pointSegMeters(
  p: { lat: number; lng: number },
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const { mLat, mLng } = localMeters([p, a, b]);
  const P = toXY(p, mLat, mLng);
  const A = toXY(a, mLat, mLng);
  const B = toXY(b, mLat, mLng);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len2 = dx * dx + dy * dy || 1e-9;
  const t = Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / len2));
  const x = A.x + t * dx;
  const y = A.y + t * dy;
  return Math.hypot(P.x - x, P.y - y);
}

export function ringPerimeterFt(ring: Ring) {
  if (ring.length < 2) return 0;
  let p = 0;
  for (let i = 0; i < ring.length; i++) {
    p += metersBetween(ring[i], ring[(i + 1) % ring.length]);
  }
  return p * 3.28084;
}

export function ringCentroid(ring: Ring) {
  const n = ring.length || 1;
  return {
    lat: ring.reduce((s, p) => s + p.lat, 0) / n,
    lng: ring.reduce((s, p) => s + p.lng, 0) / n,
  };
}

export function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function containsPoint(ring: Ring, lat: number, lng: number) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i].lat;
    const xi = ring[i].lng;
    const yj = ring[j].lat;
    const xj = ring[j].lng;
    const hit = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

export function pitchFromOccupancy(occ: string, prim: string, heightM: number | null) {
  const blob = `${occ} ${prim}`.toLowerCase();
  if (/industrial|warehouse|commercial|assembly|government|utility|retail|office/.test(blob)) {
    return { rise: 0.5, run: 12, label: "low-slope" };
  }
  if (/multi|apartment/.test(blob) && (heightM ?? 0) > 9) {
    return { rise: 0.5, run: 12, label: "low-slope" };
  }
  if ((heightM ?? 0) >= 6.5) return { rise: 5, run: 12, label: "steep-slope" };
  return { rise: 4, run: 12, label: "steep-slope" };
}

export function roofFromFootprint(footprintSqft: number, rise: number, run: number) {
  const rad = Math.atan(rise / run);
  const material = footprintSqft / Math.cos(rad);
  return {
    roofSqft: Math.round(footprintSqft / 10) * 10,
    materialSqft: Math.round(material / 10) * 10,
    footprintSqft: Math.round(footprintSqft / 10) * 10,
    degrees: Math.round((rad * 180) / Math.PI),
  };
}

export function mercatorTile(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}
