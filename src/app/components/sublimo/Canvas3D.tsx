// src/app/components/sublimo/Canvas3D.tsx
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";
import { HexColorPicker } from "react-colorful"; // <--- 1. Importar HexColorPicker

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
  ssr: false,
});

// --- 2. Componente ColorPicker Mejorado ---
const ColorPicker = ({
  selectedColor,
  setSelectedColor,
  label,
}: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

  // Cerrar el picker si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col items-start gap-2">
      <label className="font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-3 w-full">
        {/* Botón de muestra de color (Swatch) */}
        <div
          className="w-10 h-10 rounded-lg cursor-pointer shadow-sm border border-gray-200 transition-transform hover:scale-105"
          style={{ backgroundColor: selectedColor }}
          onClick={() => setIsOpen(!isOpen)}
        />

        {/* Input de texto para Hex manual */}
        <input
          type="text"
          value={selectedColor.toUpperCase()}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Popover del Picker */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[60]" ref={popover}>
          <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
        </div>
      )}
    </div>
  );
};

// Componente Sidebar
const Sidebar = ({
  selectedColor,
  setSelectedColor,
  backgroundColor,
  setBackgroundColor,
  onOpenCanvas2D,
  canvasDownloader,
}: SidebarProps) => (
  <aside className="absolute top-[120px] left-4 w-72 p-6 bg-white/95 backdrop-blur shadow-xl z-50 space-y-6 rounded-2xl border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800">Personalización</h2>

    <ColorPicker
      selectedColor={selectedColor}
      setSelectedColor={setSelectedColor}
      label="Color de la prenda"
    />

    <hr className="border-gray-200" />

    <ColorPicker
      selectedColor={backgroundColor}
      setSelectedColor={setBackgroundColor}
      label="Color del fondo"
    />

    <div className="space-y-3 pt-2">
      <button
        onClick={onOpenCanvas2D}
        className="w-full py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg font-medium transition-colors"
      >
        Importar Estampa
      </button>
      <button
        onClick={canvasDownloader}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md shadow-blue-500/30"
      >
        Exportar Diseño
      </button>
    </div>
  </aside>
);

// Componente Model (Sin cambios mayores, solo limpieza)
const Model = ({
  modelPath = "/models/tshirt.glb",
  color,
  textureUrl,
}: ModelProps) => {
  const { scene } = useGLTF(modelPath);
  // Nota: Asegúrate de que esta ruta sea correcta en tu carpeta public
  const fabricTexture = useLoader(THREE.TextureLoader, `/models/blanco.jpg`);
  const [overlayTexture] = useLoader(
    THREE.TextureLoader,
    textureUrl ? [textureUrl] : []
  );

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
    roughness: 0.7, // Añadido para mejor realismo
  });

  const overlayMaterial = overlayTexture
    ? new THREE.MeshStandardMaterial({
        map: overlayTexture,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        color: 0xffffff,
        metalness: 0,
        roughness: 0.8,
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

  const handleImageChange = (dataUrl: string | null) => {
    setCanvas2DTexture(dataUrl || undefined);
  };

  const canvasDownloader = () => {
    if (!rendererRef.current) return;
    // Forzar un renderizado fresco antes de capturar si es necesario
    const dataURL = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "captura-sublimo.png";
    link.href = dataURL;
    link.click();
  };

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [backgroundColor]);

  return (
    <div className="relative w-full h-full bg-gray-50">
      <Sidebar
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        onOpenCanvas2D={() => setShowCanvas2D((prev) => !prev)}
        canvasDownloader={canvasDownloader}
      />

      {showCanvas2D && (
        <Canvas2D
          visible={showCanvas2D}
          onClose={() => setShowCanvas2D(false)}
          onImageChange={handleImageChange}
        />
      )}

      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ fov: 50, position: [0, 0, 10] }} // Posición inicial de cámara
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
        <ambientLight intensity={0.7} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={null}>
          <Model
            modelPath={modelPath}
            color={selectedColor}
            textureUrl={canvas2DTexture}
          />
          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.75}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
