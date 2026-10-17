import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { families, productsFor, type Family } from "@/lib/catalog";
import { MeasureHero } from "./measure-roof";
const StudioCanvas = lazy(() => import("./studio-canvas"));

function vizHouse(home: "ranch" | "craftsman" | "flat", family: Family) {
  if (family === "tpo" || family === "torch") return "flat";
  return home === "flat" ? "ranch" : home;
}

const lowSlopePhoto: Record<string, string> = {
  "tpo-white": "/images/viz/tpo-roof-white.webp?v=4",
  "tpo-gray": "/images/viz/tpo-roof-gray.webp?v=4",
  "tpo-tan": "/images/viz/tpo-roof-tan.webp?v=4",
  "mineral-brown": "/images/viz/torch-roof-brown.webp?v=4",
  "white-granule": "/images/viz/torch-roof-white.webp?v=4",
  "black-granule": "/images/viz/torch-roof-black.webp?v=4",
};

function HouseRoofPhoto({
  texture,
  swatch,
  alt,
}: {
  texture: string;
  swatch?: string;
  alt: string;
}) {
  return (
    <div className="studio-viz">
      <img className="studio-photo" src={texture} alt={alt} width={1600} height={900} loading="lazy" decoding="async" />
      <img className="studio-chip" src={swatch || texture} alt="" width={400} height={300} loading="lazy" decoding="async" />
    </div>
  );
}

export function RoofStudio({ compact = false, variant = "studio" }: { compact?: boolean; variant?: "studio" | "hero" }) {
  const [family, setFamily] = useState<Family>("shingles");
  const list = productsFor(family);
  const [productId, setProductId] = useState("duration-cool");
  const product = list.find((p) => p.id === productId) ?? list[0];
  const [finishId, setFinishId] = useState("cool-sierra-gray");
  const finish = product.finishes.find((f) => f.id === finishId) ?? product.finishes[0];
  const root = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [home, setHome] = useState<"ranch" | "craftsman" | "flat">("ranch");
  const [view, setView] = useState<"home" | "surface">("home");
  const [theta, setTheta] = useState(0.55);
  const [phi, setPhi] = useState(1.05);
  const drag = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (view !== "surface") return;
    if (!inView) return;
    const id = window.setInterval(() => {
      if (!drag.current) setTheta((t) => t + 0.006);
    }, 50);
    return () => window.clearInterval(id);
  }, [view, inView]);

  function onOrbitDown(e: React.PointerEvent<HTMLDivElement>) {
    drag.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onOrbitMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setTheta((t) => t - (e.clientX - last.current.x) * 0.005);
    setPhi((p) => Math.min(1.22, Math.max(0.78, p + (e.clientY - last.current.y) * 0.004)));
    last.current = { x: e.clientX, y: e.clientY };
  }
  function onOrbitUp() {
    drag.current = false;
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("design") || "";
    if (!q) return;
    const match = productsFor(family)
      .concat(productsFor("shingles"), productsFor("tile"), productsFor("tpo"), productsFor("torch"))
      .find((p) => p.name === q.split(" / ")[0] || q.startsWith(p.name));
    if (!match) return;
    setFamily(match.family);
    setProductId(match.id);
    const finishName = q.split(" / ")[1]?.trim();
    const fin =
      match.finishes.find((f) => f.name === finishName) ||
      match.finishes.find((f) => q.toLowerCase().includes(f.name.toLowerCase()));
    if (fin) setFinishId(fin.id);
  }, []);

  function pickFamily(next: Family) {
    setFamily(next);
    const first = productsFor(next)[0];
    setProductId(first.id);
    setFinishId(next === "shingles" ? "cool-sierra-gray" : first.finishes[0].id);
    setView("home");
    setHome(next === "tpo" || next === "torch" ? "flat" : "ranch");
  }

  function pickProduct(id: string) {
    const p = productsFor(family).find((x) => x.id === id);
    if (!p) return;
    setProductId(p.id);
    setFinishId(p.finishes[0].id);
  }

  const design = `${product.name} / ${finish.name}`;
  const bounce =
    finish.reflectance != null
      ? `Reflects about ${Math.round(finish.reflectance * 100)}% of solar energy · SRI ${finish.sri}`
      : null;
  const viz = vizHouse(home, family);

  return (
    <section
      className={"roof-studio" + (compact ? " compact" : "") + (variant === "hero" ? " hero" : "")}
      id={variant === "hero" ? "home-hero" : "design-your-roof"}
      ref={root}
    >
      <div className="studio-stage">
        {view === "surface" ? (
          <>
            <div className="studio-canvas-wrap">
              {inView && (
                <Suspense fallback={<span className="physical-loading">Building the view…</span>}>
                  <StudioCanvas product={product} finish={finish} theta={theta} phi={phi} />
                </Suspense>
              )}
            </div>
            <div
              className="studio-orbit"
              onPointerDown={onOrbitDown}
              onPointerMove={onOrbitMove}
              onPointerUp={onOrbitUp}
              onPointerCancel={onOrbitUp}
            />
          </>
        ) : (
          <>
            {family === "tpo" || family === "torch" ? (
              <img
                key={finish.id}
                className="studio-photo"
                src={lowSlopePhoto[finish.id] || "/images/viz/flat.webp"}
                alt={`${finish.name} ${family === "tpo" ? "TPO" : "torch-down"} roof on a low-slope home`}
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <HouseRoofPhoto
                key={finish.id}
                texture={finish.texture}
                swatch={finish.swatch}
                alt={`${product.name} ${finish.name}`}
              />
            )}
          </>
        )}
        <div className="studio-chrome">
          {variant === "hero" ? (
            <>
              <div className="studio-overlay hero-editorial-copy">
                <span className="micro-label">OWENS CORNING PREFERRED · DURATION® COOL · GLENDALE</span>
                <h2>
                  Above
                  <br />
                  <span>all.</span>
                </h2>
              </div>
              <MeasureHero />
            </>
          ) : (
            <>
              {(family === "shingles" || family === "tile") && (
              <div className="studio-homes" role="group" aria-label="House style">
                {(["ranch", "craftsman"] as const).map((h) => (
                  <button key={h} type="button" className={home === h ? "on" : ""} onClick={() => setHome(h)}>
                    {h === "ranch" ? "Ranch" : "Craftsman"}
                  </button>
                ))}
              </div>
              )}
              <button type="button" className="studio-inspect" onClick={() => setView(view === "home" ? "surface" : "home")}>
                {view === "home" ? "Inspect surface" : "Back to the house"}
              </button>
              <span className="studio-caption">
                {product.name} · {finish.name}
                {bounce ? ` · SRI ${finish.sri}` : ""}
              </span>
            </>
          )}
        </div>
      </div>
      {variant !== "hero" && (
        <div className="studio-bench">
          <div className="studio-bench-head">
            <span className="micro-label">DESIGN YOUR ROOF</span>
            <p>Shingles, tile, TPO, or torch-down. The house on the left updates with the system you pick.</p>
          </div>
          <div className="studio-families" role="tablist" aria-label="Roof family">
            {families.map((f, i) => (
              <button
                key={f.id}
                className={family === f.id ? "selected" : ""}
                aria-pressed={family === f.id}
                onClick={() => pickFamily(f.id)}
              >
                <span>0{i + 1}</span>
                {f.label}
              </button>
            ))}
          </div>
          <div className="studio-products">
            {list.map((p) => (
              <button
                key={p.id}
                className={product.id === p.id ? "selected" : ""}
                aria-pressed={product.id === p.id}
                onClick={() => pickProduct(p.id)}
              >
                <span className="micro-label">{p.maker}</span>
                <strong>{p.name}</strong>
              </button>
            ))}
          </div>
          <div className="studio-finishes" role="listbox" aria-label="Colors">
            {product.finishes.map((c) => (
              <button
                key={c.id}
                className={finish.id === c.id ? "selected" : ""}
                aria-pressed={finish.id === c.id}
                onClick={() => setFinishId(c.id)}
                title={c.name}
              >
                <img src={c.swatch || c.texture} alt="" width="120" height="80" loading="lazy" decoding="async" />
                <span>{c.name}</span>
                {c.sri != null ? <em>SRI {c.sri}</em> : null}
              </button>
            ))}
          </div>
          <p className="studio-spec">
            {bounce ? `${finish.name} reflects about ${Math.round((finish.reflectance || 0) * 100)}% of solar energy. ` : ""}
            {product.warranty}
          </p>
          <div className="studio-actions">
            <Link className="button" href={"/estimate?design=" + encodeURIComponent(design)}>
              Make this roof yours <ArrowUpRight size={18} />
            </Link>
            <button className="plain-button" onClick={() => pickFamily("shingles")}>
              Reset <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default RoofStudio;
