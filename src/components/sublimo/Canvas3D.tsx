// components/Canvas3D.tsx
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState } from "react";
const Boton = () => {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded">Botón</button>
  );
};
// 🎨 Componente para seleccionar color del modelo
const ColorPicker = ({
  selectedColor,
  setSelectedColor,
  label,
}: {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  label: string;
}) => {
  return (
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
};

// 🧾 Sidebar con controles
const Sidebar = ({
  selectedColor,
  setSelectedColor,
  backgroundColor,
  setBackgroundColor,
}: {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}) => {
  return (
    <aside className="fixed top-30 left-0 w-60 p-4 bg-white shadow-lg z-50 space-y-6 rounded-4xl">
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
      <Boton />
    </aside>
  );
};

// 👕 Modelo 3D
const Model = ({
  modelPath = "src/assets/models/tshirt.glb",
  color,
}: {
  modelPath?: string;
  color: string;
}) => {
  const gltf = useGLTF(modelPath);
  gltf.scene.traverse((child: any) => {
    if (child.isMesh) {
      child.material.color.set(color);
    }
  });

  return <primitive object={gltf.scene} scale={5} position={[0, 0.4, 0]} />;
};

// 🧠 Componente principal
export default function Canvas3D({ modelPath }: { modelPath?: string }) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#e5e5e5");

  return (
    <div className="">
      <Sidebar
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />

      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ fov: 50 }}
        style={{ position: "fixed" }}
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
