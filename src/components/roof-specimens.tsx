import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, useTexture, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { families, productsFor, type Family, type Product, type Finish } from "@/lib/catalog";
import { MeasureHero } from "./measure-roof";

function useRoofTex(src: string, rx: number, ry: number) {
  const map = useTexture(src);
  useLayoutEffect(() => {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(rx, ry);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 16;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;
  }, [map, rx, ry]);
  return map;
}

function useMat(src: string, rx: number, ry: number, bump: number, extra?: ConstructorParameters<typeof THREE.MeshStandardMaterial>[0]) {
  const map = useRoofTex(src, rx, ry);
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map,
        bumpMap: map,
        bumpScale: bump,
        roughness: 0.72,
        metalness: 0.03,
        envMapIntensity: 0.7,
        ...extra,
      }),
    [map, bump],
  );
}

function DeckAndEave() {
  const ply = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c4a574", roughness: 0.85, envMapIntensity: 0.2 }),
    [],
  );
  const fascia = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#efe8dc", roughness: 0.48, envMapIntensity: 0.35 }),
    [],
  );
  const gutter = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#9a9590", metalness: 0.78, roughness: 0.28, envMapIntensity: 0.9 }),
    [],
  );
  const stucco = useMat("/images/textures/house/stucco.webp", 1.6, 1.2, 0.03);
  return (
    <group>
      <mesh position={[0, -0.22, 0.12]} rotation={[-0.4, 0, 0]} material={ply} receiveShadow>
        <boxGeometry args={[3.55, 0.05, 2.55]} />
      </mesh>
      <mesh position={[0, -0.42, 1.18]} material={fascia} castShadow>
        <boxGeometry args={[3.62, 0.16, 0.045]} />
      </mesh>
      <mesh position={[0, -0.55, 1.24]} rotation={[0.15, 0, 0]} material={gutter} castShadow>
        <boxGeometry args={[3.58, 0.06, 0.08]} />
      </mesh>
      <mesh position={[0, -1.05, 0.35]} material={stucco} castShadow receiveShadow>
        <boxGeometry args={[3.5, 1.05, 0.22]} />
      </mesh>
    </group>
  );
}

function ShingleSpecimen({ finish }: { finish: Finish }) {
  const mat = useMat(finish.texture, 2.4, 1.7, 0.13, { roughness: 0.74, envMapIntensity: 0.62 });
  const ridge = useMat(finish.texture, 1.2, 0.4, 0.08, { roughness: 0.76 });
  return (
    <group>
      <mesh rotation={[-0.4, 0, 0]} position={[0, 0.02, 0]} material={mat} castShadow receiveShadow>
        <boxGeometry args={[3.45, 0.08, 2.45]} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh
          key={i}
          rotation={[-0.4, 0, 0]}
          position={[0, 0.055 - i * 0.004, -1.05 + i * 0.168]}
          material={mat}
          castShadow
        >
          <boxGeometry args={[3.42, 0.016, 0.175]} />
        </mesh>
      ))}
      <mesh rotation={[-0.05, 0, 0]} position={[0, 0.52, -1.12]} material={ridge} castShadow>
        <boxGeometry args={[3.5, 0.09, 0.22]} />
      </mesh>
      <DeckAndEave />
    </group>
  );
}

function TileSpecimen({ finish }: { finish: Finish }) {
  const mat = useMat(finish.texture, 1.4, 1.1, 0.16, { roughness: 0.48, envMapIntensity: 0.85 });
  const rows = 8;
  const cols = 14;
  return (
    <group>
      <mesh rotation={[-0.4, 0, 0]} position={[0, -0.02, 0]} material={mat} receiveShadow>
        <boxGeometry args={[3.4, 0.06, 2.4]} />
      </mesh>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <mesh
            key={`${r}-${c}`}
            castShadow
            rotation={[-0.4, 0, Math.PI / 2]}
            position={[(c - (cols - 1) / 2) * 0.23, 0.08 - r * 0.018, -0.95 + r * 0.26]}
            material={mat}
          >
            <cylinderGeometry args={[0.09, 0.09, 0.42, 14, 1, false, 0, Math.PI]} />
          </mesh>
        )),
      )}
      <mesh rotation={[-0.08, 0, 0]} position={[0, 0.5, -1.12]} material={mat} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3.45, 14]} />
      </mesh>
      <DeckAndEave />
    </group>
  );
}

function MembraneSpecimen({ finish, family }: { finish: Finish; family: Family }) {
  const mat = useMat(finish.texture, 1.6, 1.4, family === "tpo" ? 0.012 : 0.055, {
    roughness: family === "tpo" ? 0.36 : 0.82,
    metalness: family === "tpo" ? 0.08 : 0.02,
    envMapIntensity: 0.75,
  });
  const cap = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d8d2c8", roughness: 0.55, metalness: 0.15, envMapIntensity: 0.4 }),
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.02, 0]} material={mat} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.07, 3.4]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={"x" + s} position={[s * 1.72, 0.28, 0]} material={cap} castShadow>
          <boxGeometry args={[0.18, 0.52, 3.55]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={"z" + s} position={[0, 0.28, s * 1.72]} material={cap} castShadow>
          <boxGeometry args={[3.55, 0.52, 0.18]} />
        </mesh>
      ))}
      {family === "torch" &&
        [ -0.7, 0, 0.7].map((z) => (
          <mesh key={z} position={[0, 0.06, z]} material={mat}>
            <boxGeometry args={[3.1, 0.012, 0.05]} />
          </mesh>
        ))}
      <mesh position={[0.9, 0.22, -0.8]} material={cap} castShadow>
        <boxGeometry args={[0.7, 0.28, 0.85]} />
      </mesh>
    </group>
  );
}

function Specimen({ product, finish }: { product: Product; finish: Finish }) {
  if (product.family === "tile") return <TileSpecimen finish={finish} />;
  if (product.family === "tpo" || product.family === "torch") {
    return <MembraneSpecimen finish={finish} family={product.family} />;
  }
  return <ShingleSpecimen finish={finish} />;
}

function LockedOrbit({ radius, theta, phi }: { radius: number; theta: number; phi: number }) {
  const { camera, invalidate, size } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 32;
    cam.near = 0.3;
    cam.far = 40;
    cam.aspect = size.width / Math.max(size.height, 1);
    const target = new THREE.Vector3(0, 0.05, 0.15);
    const polar = THREE.MathUtils.clamp(phi, 0.78, 1.22);
    cam.position.setFromSpherical(new THREE.Spherical(radius, polar, theta)).add(target);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, radius, theta, phi, size.width, size.height]);
  return null;
}

export function StudioScene({
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
  const low = product.family === "tpo" || product.family === "torch";
  return (
    <>
      <color attach="background" args={["#161310"]} />
      <fog attach="fog" args={["#161310", 8, 22]} />
      <ambientLight intensity={0.28} />
      <hemisphereLight args={["#f0e6d6", "#3a342c", 0.35]} />
      <spotLight
        position={[4, 7, 3]}
        intensity={48}
        angle={0.55}
        penumbra={0.7}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        distance={24}
      />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} color="#8ea4b8" />
      <Suspense fallback={null}>
        {/* Same "warehouse" HDR the original design used (drei preset), self-hosted so
            no third-party fetch happens. Loaded only inside the lazy 3D chunk. */}
        <Environment files="/hdri/empty_warehouse_01_1k.hdr" />
        <Specimen product={product} finish={finish} />
      </Suspense>
      <ContactShadows position={[0, -1.55, 0]} opacity={0.55} scale={12} blur={2.4} far={6} frames={1} />
      <LockedOrbit radius={low ? 7.4 : 6.2} theta={theta} phi={phi} />
    </>
  );
}
