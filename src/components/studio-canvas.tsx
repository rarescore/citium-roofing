import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { Finish, Product } from "@/lib/catalog";
import { StudioScene } from "./roof-specimens";

/**
 * The three.js surface inspector. Split into its own chunk so three /
 * @react-three/fiber / drei load only when the visitor clicks "Inspect surface"
 * (not on every homepage view). frameloop="demand" renders only when the orbit
 * changes, so the GPU idles when nothing moves.
 */
export default function StudioCanvas({
  product,
  finish,
  theta,
  phi,
}: {
  product: Product;
  finish: Finish;
  theta: number;
  phi: number;
}) {
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      style={{ pointerEvents: "none" }}
      resize={{ scroll: false, debounce: { resize: 250, scroll: 250 } }}
      camera={{ position: [4.2, 2.4, 4.8], fov: 32, near: 0.3, far: 40 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.domElement.style.pointerEvents = "none";
        gl.toneMappingExposure = 1.05;
      }}
    >
      <StudioScene product={product} finish={finish} theta={theta} phi={phi} />
    </Canvas>
  );
}
