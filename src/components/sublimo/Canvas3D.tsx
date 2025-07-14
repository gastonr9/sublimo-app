import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function Canvas3D() {
  return (
    <>
      <body>
        <Canvas style={{ height: "500px" }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh>
          <OrbitControls />
        </Canvas>
        <div className="border-amber-950 border-2 rounded-br-[20px] rounded-tr-[20px]  w-[250px] absolute">
          <div className="mt-[100px] grid">
            <div className=""></div>
          </div>
        </div>
      </body>
    </>
  );
}
