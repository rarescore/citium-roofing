import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, MapPin, X } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { Inquiry } from "@/components/site-experiences";
import { roofFromFootprint } from "@/lib/roof-geometry";

type Place = { lat: number; lng: number; label: string };
type Suggest = { text: string; magicKey: string };
type Measure = {
  found: boolean;
  footprintSqft?: number;
  roofSqft?: number;
  materialSqft?: number;
  pitchRise?: number;
  occupancy?: string;
  parts?: number;
};

const PITCHES = [
  { rise: 0.5, run: 12, name: "Flat / low" },
  { rise: 3, run: 12, name: "3/12" },
  { rise: 4, run: 12, name: "4/12" },
  { rise: 5, run: 12, name: "5/12" },
  { rise: 6, run: 12, name: "6/12" },
];

const STEPS = [
  "Locating the property…",
  "Opening satellite view…",
  "Tracing the roof outline…",
  "Reading pitch…",
  "Calculating squares…",
];

export function MeasureHero() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "looking" | "found" | "report" | "error">("idle");
  const [error, setError] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [measure, setMeasure] = useState<Measure | null>(null);
  const [rise, setRise] = useState(4);
  const [hints, setHints] = useState<Suggest[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const magic = useRef<string | undefined>(undefined);

  function close() {
    setStatus("idle");
    setError("");
    setOpen(false);
    setHints([]);
    setStep(0);
  }

  useEffect(() => {
    const q = address.trim();
    if (q.length < 3 || status !== "idle" || (place && q === place.label)) {
      setHints([]);
      setOpen(false);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/address-suggest?q=" + encodeURIComponent(q));
        const data = (await res.json()) as { suggestions?: Suggest[] };
        setHints(data.suggestions ?? []);
        setOpen(true);
      } catch {
        setHints([]);
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [address, status, place]);

  useEffect(() => {
    if (status !== "looking") return;
    setStep(0);
    const t = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1000);
    return () => window.clearInterval(t);
  }, [status]);

  async function runMeasure(q: string, magicKey?: string) {
    setError("");
    setStatus("looking");
    setMeasure(null);
    setOpen(false);
    setHints([]);
    const started = Date.now();
    try {
      const geoRes = await fetch(
        "/api/geocode?q=" + encodeURIComponent(q) + (magicKey ? "&magicKey=" + encodeURIComponent(magicKey) : ""),
      );
      const geo = (await geoRes.json()) as { lat?: number; lng?: number; label?: string; error?: string };
      if (!geoRes.ok || geo.lat == null || geo.lng == null) {
        setError(geo.error || "We could not locate that address.");
        setStatus("error");
        return;
      }
      const next = { lat: geo.lat, lng: geo.lng, label: geo.label || q };
      setPlace(next);
      setAddress(next.label);
      const mRes = await fetch(`/api/roof-measure?lat=${next.lat}&lng=${next.lng}`);
      const m = (await mRes.json()) as Measure & { error?: string };
      if (!mRes.ok) setMeasure({ found: false });
      else {
        setMeasure(m);
        if (m.pitchRise) setRise(m.pitchRise);
      }
      const wait = 5200 - (Date.now() - started);
      if (wait > 0) await new Promise((r) => window.setTimeout(r, wait));
      setStatus("found");
    } catch {
      setError("The map service is unavailable. Request a report and Citium will locate the property.");
      setStatus("error");
    }
  }

  function locate(e: React.FormEvent) {
    e.preventDefault();
    void runMeasure(address, magic.current);
    magic.current = undefined;
  }

  function pickHint(s: Suggest) {
    magic.current = s.magicKey;
    setAddress(s.text);
    void runMeasure(s.text, s.magicKey);
  }

  const areas = useMemo(() => {
    const foot = measure?.footprintSqft;
    if (!foot) return null;
    return roofFromFootprint(foot, rise, 12);
  }, [measure, rise]);

  const designNote = areas
    ? `Roof measurement · ~${areas.roofSqft.toLocaleString()} sq ft plan · ${rise}/12 · ~${Math.round(areas.materialSqft / 100)} squares of material`
    : "Roof measurement requested";

  if (status === "looking") {
    return (
      <div className="hero-inquiry measure-looking" aria-live="polite">
        <span className="micro-label">MEASURING YOUR ROOF</span>
        <p className="measure-addr">{place?.label || address}</p>
        <div className="measure-spinner" />
        <p className="measure-step">{STEPS[step]}</p>
        <div className="measure-bar">
          <i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>
    );
  }

  if (status === "report") {
    return (
      <div className="hero-inquiry measure-report">
        <button className="measure-close" type="button" aria-label="Close" onClick={close}>
          <X size={18} />
        </button>
        <span className="micro-label">SEND THIS MEASUREMENT</span>
        {areas && <p className="measure-kicker">{designNote}</p>}
        <Inquiry kind="estimate" presetAddress={place?.label || address} presetDesign={designNote} />
      </div>
    );
  }

  if (status === "found" && place) {
    return (
      <div className="hero-inquiry measure-found">
        <button className="measure-close" type="button" aria-label="Close" onClick={close}>
          <X size={18} />
        </button>
        <span className="micro-label">YOUR ROOF MEASUREMENT</span>
        <img
          className="measure-photo"
          src="/images/job/measuring.webp"
          alt="A Citium roofer measuring shingle courses on a steep-slope roof"
          width="1200"
          height="800"
        />
        <p className="measure-addr">{place.label}</p>
        {areas ? (
          <div className="measure-stats">
            <strong>{areas.roofSqft.toLocaleString()} sq ft</strong>
            <span>
              Roof outline from above
              {measure?.parts && measure.parts > 1 ? " · includes the attached roof" : ""}
              {" · "}
              {rise}/12 pitch · about {Math.round(areas.materialSqft / 100)} squares of material
            </span>
          </div>
        ) : (
          <p>We found the home. We’ll confirm squares and pitch on the roof.</p>
        )}
        {measure?.found && (
          <div className="pitch-picks" role="group" aria-label="Approximate roof pitch">
            {PITCHES.map((p) => (
              <button key={p.rise} type="button" className={rise === p.rise ? "on" : ""} onClick={() => setRise(p.rise)}>
                {p.name}
              </button>
            ))}
          </div>
        )}
        <p>This is the roof outline from above, in square feet. Pitch changes the material squares, not that outline. We confirm it on the roof.</p>
        <button className="button" type="button" onClick={() => setStatus("report")}>
          Send this to us <ArrowUpRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <form className="hero-inquiry" onSubmit={locate} autoComplete="off">
      <span className="micro-label">GET MY ROOF MEASUREMENT</span>
      <label htmlFor="cinematic-address" className="sr-only">
        Property address
      </label>
      <div className="address-field">
        <MapPin size={17} />
        <input
          id="cinematic-address"
          name="address"
          required
          autoComplete="off"
          placeholder="Start typing your address"
          value={address}
          onChange={(e) => {
            magic.current = undefined;
            setPlace(null);
            setAddress(e.target.value);
          }}
          onFocus={() => hints.length && setOpen(true)}
          suppressHydrationWarning
        />
        <button aria-label="Get my roof measurement">
          <ArrowUpRight size={26} />
        </button>
        {open && hints.length > 0 && (
          <ul className="address-suggest" role="listbox">
            {hints.map((s) => (
              <li key={s.magicKey}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pickHint(s)}>
                  {s.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p>Free estimate of size and pitch. Then send it to Citium.</p>
      {error && (
        <p className="form-error" role="alert">
          {error} <Link href={"/estimate?address=" + encodeURIComponent(address)}>Continue without the map ↗</Link>
        </p>
      )}
    </form>
  );
}
