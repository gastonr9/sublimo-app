// src/app/components/sublimo/Canvas2D.tsx
"use client";
import { type ChangeEvent, useEffect, useRef } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import * as fabric from "fabric"; // ✅ importar todo el namespace

interface Canvas2DProps {
  onImageChange?: (dataUrl: string) => void;
  visible: boolean;
  onClose: () => void;
}

function Canvas2D({ onImageChange, visible, onClose }: Canvas2DProps) {
  // Tamaño visual del canvas
  const CANVAS_SIZE = 350;
  // Tamaño de exportación de la textura
  const EXPORT_SIZE = 4096;

  const inputRef = useRef<HTMLInputElement>(null);

  const { editor, onReady } = useFabricJSEditor();
  const tshirtImgUrl = `models/tshirt.jpg`;
  if (!visible) return null;

  useEffect(() => {
    if (!editor?.canvas || !onImageChange) return;
    const handler = () => {
      const dataURL = editor.canvas.toDataURL({
        format: "png",
        multiplier: EXPORT_SIZE / CANVAS_SIZE,
      });
      onImageChange(dataURL);
    };
    editor.canvas.on("object:added", handler);
    editor.canvas.on("object:modified", handler);
    editor.canvas.on("object:removed", handler);
    return () => {
      editor.canvas.off("object:added", handler);
      editor.canvas.off("object:modified", handler);
      editor.canvas.off("object:removed", handler);
    };
  }, [editor, onImageChange]);

  const handlePic = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (oImg: any) => {
      oImg.scale(0.1).set("flipY", false);
      editor?.canvas.add(oImg);
      // Notifica al padre inmediatamente después de agregar la imagen
      setTimeout(() => {
        if (editor?.canvas && onImageChange) {
          const dataUrl = editor.canvas.toDataURL({ format: "png" });
          onImageChange(dataUrl);
        }
      }, 100);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 shadow-2xl z-40 flex flex-col rounded-lg border w-[380px]">
      <div className="flex items-center p-3 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold flex-1 text-center">GUÍA DE POSICIÓN</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-lg font-bold"
          aria-label="Cerrar guía de posición"
        >
          ×
        </button>
      </div>
      <div className="flex flex-col h-[400px] w-full p-2 items-center justify-center bg-gray-800 rounded-b-lg">
        <button
          onClick={() => inputRef.current?.click()}
          className="py-1 px-3 bg-yellow-500 text-white rounded-lg m-2 text-sm"
        >
          Subir archivo
        </button>
        <input
          ref={inputRef}
          onChange={handlePic}
          type="file"
          className="hidden"
          accept="image/*"
        />
        <div
          className="justify-items-center rounded-xl border-4 border-yellow-500"
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundImage: `url(${tshirtImgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <FabricJSCanvas
              onReady={onReady}
              className="w-full h-full bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Canvas2D;
