// import { Canvas } from "@react-three/fiber";
// import { Environment, OrbitControls, useFBX } from "@react-three/drei";
// import { Suspense } from "react";

// const Scene = () => {
//   const fbx = useFBX("models/tshirt.fbx");

//   return <primitive object={fbx} scale={0.005} />;
// };
// export default function Canvas3D() {
//   return (
//     <>
//       {/* <div className="">
//         <div className="border-amber-950 border-2 rounded-br-[20px] rounded-tr-[20px]  w-[250px] absolute">
//           <div className="mt-[100px] grid">
//             <div className=""></div>
//           </div>
//         </div> */}
//       <div className="canvas">
//         <Canvas>
//           <Suspense fallback={null}>
//             <Scene />
//             <OrbitControls />
//             <Environment preset="sunset" background />
//           </Suspense>
//         </Canvas>
//       </div>

//       {/* </div> */}
//     </>
//   );
// }
// src/components/sublimo/Canvas3D.tsx

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

type ModelProps = {
  modelPath?: string;
};

// ✅ Componente que carga el modelo .glb
const Model = ({ modelPath = "src/assets/models/tshirt.glb" }: ModelProps) => {
  const gltf = useGLTF(modelPath);
  return <primitive object={gltf.scene} scale={10} />;
};

// ✅ Componente principal con <Canvas>
export default function Canvas3D({ modelPath }: ModelProps) {
  return (
    <div className="canvas" style={{ width: "100%", height: "100%" }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <Model modelPath={modelPath} />
          <OrbitControls />
          <Environment preset="city" background />
        </Suspense>
      </Canvas>
    </div>
  );
}
