// components/Canvas3D.tsx
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState } from "react";
import Canvas2D from "./Canvas2D";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

// Extender los elementos de Three.js para JSX
extend(THREE);



// 🎨 Selector de color reutilizable
type ColorPickerProps = {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  label: string;
};

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
      className="w-10 h-10 border-none outline-none cursor-pointer"
    />
  </div>
);

// 🧾 Sidebar de controles
type SidebarProps = {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
};

const Sidebar = ({
  selectedColor,
  setSelectedColor,
  backgroundColor,
  setBackgroundColor,
}: SidebarProps) => (
  <aside className="fixed top-[120px] left-0 w-60 p-4 bg-white shadow-lg z-50 space-y-6 rounded-2xl">
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
  </aside>
);

// 👕 Modelo 3D de la prenda
type ModelProps = {
  modelPath?: string;
  color: string;
};

const Model = ({
  modelPath = "src/assets/models/tshirt.glb",
  color,
}: ModelProps) => {
  const gltf = useGLTF(modelPath);
  gltf.scene.traverse((child: any) => {
    if (child.isMesh) {
      child.material.color.set(color);
    }
  });
  return <primitive object={gltf.scene} scale={5} position={[0, 0, 0]} />;
};

// 🧠 Componente principal Canvas3D
export default function Canvas3D({ modelPath }: { modelPath?: string }) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#0db4e7");
  const [showCanvas2D, setShowCanvas2D] = useState(false);

  return (
    <div className="relative">
      <Sidebar
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />

      {/* Botón para abrir Canvas2D */}
      <button
        onClick={() => setShowCanvas2D(true)}
        className="fixed top-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        Abrir Canvas 2D
      </button>

      {/* Panel lateral con Canvas2D */}
      {showCanvas2D && (
        <div className="fixed top-0 right-0 w-1/2 h-full bg-white shadow-2xl z-40 flex flex-col">
          {/* Header del panel */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Canvas 2D - Editor de Diseños</h3>
            <button
              onClick={() => setShowCanvas2D(false)}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Contenido del Canvas2D */}
          <div className="flex-1 overflow-hidden">
            <Canvas2D />
          </div>
        </div>
      )}

      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ fov: 50 }}
        style={{ position: "fixed", inset: 0, background: backgroundColor }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Model modelPath={modelPath} color={selectedColor} />
          <OrbitControls />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
