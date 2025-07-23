// components/Canvas3D.tsx
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState } from "react";
import Sidebar from "./Sidebar";

type ModelProps = {
  modelPath?: string;
  color: string;
};

// ✅ Modelo 3D con color aplicado
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

  return <primitive object={gltf.scene} scale={7} />;
};

export default function Canvas3D({ modelPath }: { modelPath?: string }) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  return (
    <>
      <Sidebar
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />

      <div className="w-full h-screen">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={null}>
            <Model modelPath={modelPath} color={selectedColor} />
            <OrbitControls />
            <Environment preset="city" background />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
