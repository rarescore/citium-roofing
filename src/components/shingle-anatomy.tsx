import { lazy, Suspense, useState } from "react";
import { Move } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { layers } from "@/lib/roof-layers";

const PhysicalRoof = lazy(() => import("./physical-roof"));
const states = ["Surface", "Accessories", "Underlayment", "Flashing", "Decking", "Structure"];

export function ShingleAnatomy() {
  const [active, setActive] = useState(0);
  const [separation, setSeparation] = useState(0.55);
  const layer = layers[active];

  return (
    <div className="shingle-anatomy">
      <div className="shingle-anatomy-stage">
        <Suspense fallback={<span className="physical-loading">Building the roof…</span>}>
          <PhysicalRoof
            separation={separation}
            active={active}
            onSelect={setActive}
            progress={1}
            embed
          />
        </Suspense>
        <span className="orbit-hint">
          <Move size={15} /> Select a layer below.
        </span>
      </div>
      <div className="shingle-anatomy-bench">
        <span className="micro-label">OWENS CORNING · DURATION® COOL</span>
        <div className="assembly-slider">
          <span id="shingle-separation" className="separation-label">
            {separation < 0.25 ? "ASSEMBLED" : "SEPARATED"} <span>{Math.round(separation * 100)}%</span>
          </span>
          <Slider
            value={[separation * 100]}
            min={0}
            max={100}
            aria-labelledby="shingle-separation"
            onValueChange={(v) => setSeparation((Array.isArray(v) ? v[0] : v) / 100)}
          />
        </div>
        <span className="micro-label">
          0{active + 1} / {layer.material}
        </span>
        <h3>{layer.what}</h3>
        <p>{layer.why}</p>
        <div className="physical-layer-nav" aria-label="Inspect roof layers">
          {states.map((name, i) => (
            <button
              key={name}
              className={active === i ? "selected" : ""}
              aria-pressed={active === i}
              onClick={() => {
                setActive(i);
                if (separation < 0.4) setSeparation(0.75);
              }}
            >
              <span>0{i + 1}</span>
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
