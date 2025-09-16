// src/app/components/sublimo/Canvas3D.tsx
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic"; // <-- Importa 'dynamic' de Next.js

// Definir interfaces para las props
interface ColorPickerProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  label: string;
}

interface SidebarProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  onOpenCanvas2D: () => void;
  canvasDownloader: () => void;
}

interface ModelProps {
  modelPath?: string;
  color: string;
  textureUrl?: string;
}

// Cargar Canvas2D dinámicamente con SSR deshabilitado
const Canvas2D = dynamic(() => import("./Canvas2D"), {
  ssr: false, // ¡Esto es crucial!
});

// Componente ColorPicker
const ColorPicker = ({
  selectedColor,
  setSelectedColor,
  label,
}: ColorPickerProps) => (
  <div className="flex flex-col items-start gap-2">
    <label htmlFor={label} className="font-medium">
      {label}
    </label>
    <input
      id={label}
      type="color"
      value={selectedColor}
      onChange={(e) => setSelectedColor(e.target.value)}
      className="w-10 h-10 border-none outline-none cursor-pointer colores"
    />
  </div>
);

// Componente Sidebar
const Sidebar = ({
  selectedColor,
  setSelectedColor,
  backgroundColor,
  setBackgroundColor,
  onOpenCanvas2D,
  canvasDownloader,
}: SidebarProps) => (
  <aside className=" top-[120px] left-0 w-60 p-4 bg-white shadow-lg z-50 space-y-6 rounded-2xl absolute">
    <h2 className="text-xl font-bold">Personalización</h2>
    <ColorPicker
      selectedColor={selectedColor}
      setSelectedColor={setSelectedColor}
      label="Color de la prenda"
    />
    <ColorPicker
      selectedColor={backgroundColor}
      setSelectedColor={setBackgroundColor}
      label="Color del fondo"
    />
    <button onClick={onOpenCanvas2D} className="slot w-full btn-secondary">
      Importar Diseño
    </button>
    <button onClick={canvasDownloader} className="slot w-full btn-secondary">
      Exportar
    </button>
  </aside>
);

// Componente Model
const Model = ({
  modelPath = "/models/tshirt.glb",
  color,
  textureUrl,
}: ModelProps) => {
  const { scene } = useGLTF(modelPath);
  const fabricTexture = useLoader(THREE.TextureLoader, `/models/blanco.jpg`);
  const overlayTexture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  if (fabricTexture) {
    fabricTexture.needsUpdate = true;
    fabricTexture.format = THREE.RGBAFormat;
  }
  if (overlayTexture) {
    overlayTexture.needsUpdate = true;
    overlayTexture.format = THREE.RGBAFormat;
    overlayTexture.repeat.y = -1;
    overlayTexture.offset.y = 1;
  }
  let mainMesh: THREE.Mesh | null = null;
  scene.traverse((child) => {
    if (mainMesh) return;
    if (child instanceof THREE.Mesh) {
      mainMesh = child;
    }
  });

  const baseMaterial = new THREE.MeshStandardMaterial({
    color,
    map: fabricTexture,
    side: THREE.DoubleSide,
  });
  const overlayMaterial = overlayTexture
    ? new THREE.MeshStandardMaterial({
        map: overlayTexture,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        color: 0xffffff,
        metalness: 0,
        roughness: 1,
      })
    : null;

  return (
    <group scale={5} position={[0, 0.2, 0]}>
      {mainMesh && (
        <>
          <mesh
            geometry={(mainMesh as THREE.Mesh).geometry}
            material={baseMaterial}
          />
          {overlayMaterial && (
            <mesh
              geometry={(mainMesh as THREE.Mesh).geometry}
              material={overlayMaterial}
            />
          )}
        </>
      )}

      {scene.children
        .filter((child) => child !== mainMesh && child instanceof THREE.Mesh)
        .map((child, i) => (
          <mesh
            key={i}
            geometry={(child as THREE.Mesh).geometry}
            material={(child as THREE.Mesh).material}
          />
        ))}
      {scene.children
        .filter((child) => child !== mainMesh && !(child instanceof THREE.Mesh))
        .map((child, i) => (
          <primitive key={i} object={child} />
        ))}
    </group>
  );
};

// Componente principal
export default function Canvas3D({ modelPath }: { modelPath?: string }) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#0db4e7");
  const [showCanvas2D, setShowCanvas2D] = useState(false);
  const [canvas2DTexture, setCanvas2DTexture] = useState<string | undefined>(
    undefined
  );
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const canvasDownloader = () => {
    if (!rendererRef.current) return;
    const dataURL = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "captura.png";
    link.href = dataURL;
    link.click();
  };

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [backgroundColor]);

  return (
    <div className="relative w-full h-full">
      <Sidebar
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        onOpenCanvas2D={() => setShowCanvas2D((prev) => !prev)} // toggle aquí
        canvasDownloader={canvasDownloader}
      />
      {showCanvas2D && (
        <Canvas2D
          visible={showCanvas2D}
          onClose={() => setShowCanvas2D(false)}
          onImageChange={setCanvas2DTexture}
        />
      )}
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ fov: 50 }}
        gl={{
          preserveDrawingBuffer: true,
          alpha: false,
        }}
        onCreated={({ gl }) => {
          rendererRef.current = gl;
          gl.setClearColor(new THREE.Color(backgroundColor));
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Model
            modelPath={modelPath}
            color={selectedColor}
            textureUrl={canvas2DTexture}
          />
          <OrbitControls />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
