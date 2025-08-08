import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState, useRef } from "react";
import Canvas2D from "./Canvas2D";
import { extend, useLoader } from "@react-three/fiber";
import * as THREE from "three";
// Extender los elementos de Three.js para JSX
extend(THREE);



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


const Sidebar = ({
  selectedColor,
  setSelectedColor,
  backgroundColor,
  setBackgroundColor,
  onOpenCanvas2D,
  canvasDownloader // agregar aquí
}: SidebarProps & { canvasDownloader: () => void }) => (
  <aside className="fixed top-[120px] left-0 w-60 p-4 bg-white shadow-lg z-50 space-y-6 rounded-2xl">
    <h2 className="text-xl font-bold">Personalización</h2>
    <ColorPicker selectedColor={selectedColor} setSelectedColor={setSelectedColor} label="Color de la prenda" />
    <ColorPicker selectedColor={backgroundColor} setSelectedColor={setBackgroundColor} label="Color del fondo" />

    <button onClick={onOpenCanvas2D} className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors">
      Importar Diseño
    </button>
    <button onClick={canvasDownloader} className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors">
      Exportar
    </button>
  </aside>
);


const Model = ({
  modelPath = `${import.meta.env.BASE_URL}models/tshirt.glb`,
  color,
  textureUrl,
}: ModelProps & { textureUrl?: string }) => {
  const gltf = useGLTF(modelPath);
  // Textura base de tela
  const fabricTexture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}models/blanco.jpg`);
  // Textura overlay PNG del usuario
  const overlayTexture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;

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

  // Buscar el mesh principal
  let mainMesh: THREE.Mesh | null = null;
  gltf.scene.traverse((child: any) => {
    if (mainMesh) return;
    if (child.isMesh) mainMesh = child as THREE.Mesh;
  });

  // Crear materiales
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
        roughness: 100,
      })
    : null;

  return (
    <group scale={5} position={[0, 0, 0]}>
      {mainMesh && (
        <>
          <mesh geometry={mainMesh.geometry} material={baseMaterial} />
          {overlayMaterial && (
            <mesh geometry={mainMesh.geometry} material={overlayMaterial} />
          )}
        </>
      )}
      {/* Renderiza el resto de la escena (sin el mesh principal) */}
      {gltf.scene.children
        .filter((child: any) => child !== mainMesh)
        .map((child: any, i: number) => (
          <primitive key={i} object={child} />
        ))}
    </group>
  );
};

export default function Canvas3D({ modelPath }: { modelPath?: string }) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#0db4e7");
  const [showCanvas2D, setShowCanvas2D] = useState(false);
  const [canvas2DTexture, setCanvas2DTexture] = useState<string | undefined>(undefined);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const canvasDownloader = () => {
    if (!rendererRef.current) return;
    const dataURL = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "captura.png";
    link.href = dataURL;
    link.click();
  };

  // 🔹 Esto asegura que el color cambie en vivo
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(new THREE.Color(backgroundColor));
    }
  }, [backgroundColor]);

  return (
    <div className="relative">
      <Sidebar
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        onOpenCanvas2D={() => setShowCanvas2D(true)}
        canvasDownloader={canvasDownloader}
      />

      {showCanvas2D && (
        <div className="fixed bottom-4 right-4 w-120 h-120 bg-gray-800 shadow-2xl z-40 flex flex-col rounded-lg border">
          <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
            <h3 className="text-sm font-semibold">Canvas 2D</h3>
            <button
              onClick={() => setShowCanvas2D(false)}
              className="text-gray-500 hover:text-gray-700 text-lg font-bold"
            >
              ×
            </button>
          </div>
          <div className="relative rounded-b-lg">
            <Canvas2D onImageChange={setCanvas2DTexture} />
          </div>
        </div>
      )}

      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ fov: 50 }}
        gl={{
          preserveDrawingBuffer: true,
          alpha: false
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(backgroundColor));
          rendererRef.current = gl;
        }}
        style={{
          position: "fixed",
          inset: 0
        }}
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