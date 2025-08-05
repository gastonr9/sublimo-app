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
  onOpenCanvas2D: () => void;
};

const Sidebar = ({
  selectedColor,
  setSelectedColor,
  backgroundColor,
  setBackgroundColor,
  onOpenCanvas2D,
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
    
    {/* Botón para abrir Canvas2D */}
    <button
      onClick={onOpenCanvas2D}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
    >
      Abrir Canvas 2D
    </button>
  </aside>
);

// 👕 Modelo 3D de la prenda
type ModelProps = {
  modelPath?: string;
  color: string;
};

const Model = ({
  modelPath = "/sublimo-app/public/tshirt.glb",
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
        onOpenCanvas2D={() => setShowCanvas2D(true)}
      />

      {/* Panel Canvas2D en esquina inferior derecha */}
      {showCanvas2D && (
        <div className="fixed bottom-4 right-4 w-96 h-96 bg-white shadow-2xl z-40 flex flex-col rounded-lg border">
          {/* Header del panel */}
          <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
            <h3 className="text-sm font-semibold">Canvas 2D</h3>
            <button
              onClick={() => setShowCanvas2D(false)}
              className="text-gray-500 hover:text-gray-700 text-lg font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Contenido del Canvas2D */}
          <div className="flex-1 overflow-hidden rounded-b-lg">
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
