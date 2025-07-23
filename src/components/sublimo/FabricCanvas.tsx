// components/FabricCanvas.tsx
import React, { useEffect, useRef } from "react";
import { Canvas, Rect } from "fabric"; // browser
import { StaticCanvas, Rect } from "fabric/node"; // node

interface FabricCanvasProps {
  onTextureChange: (dataUrl: string) => void;
}
const FabricCanvas: React.FC<FabricCanvasProps> = ({ onTextureChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
      });

      // Actualiza la textura cuando se dibuja en el canvas
      fabricCanvasRef.current.on("object:modified", () => {
        onTextureChange(fabricCanvasRef.current?.toDataURL());
      });
    }

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, [onTextureChange]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="border border-gray-300"
    />
  );
};

export default FabricCanvas;
