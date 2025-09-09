"use client";

import { type ChangeEvent, useEffect, useRef } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";

function Canvas2D({
  onImageChange,
}: {
  onImageChange?: (dataUrl: string) => void;
}) {
  // Tamaño visual del canvas
  const CANVAS_SIZE = 350;
  // Tamaño de exportación de la textura
  const EXPORT_SIZE = 4096;

  const inputRef = useRef<HTMLInputElement>(null);

  const { editor, onReady } = useFabricJSEditor();
  const tshirtImgUrl = "/models/tshirt.jpg";

  // Notifica al padre cuando el canvas cambia
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
    <div className="flex flex-col h-full w-full p-2  items-center justify-center">
      <button
        onClick={() => inputRef.current?.click()}
        className="py-1 px-3 bg-yellow-500 text-white rounded-lg m-2 text-sm"
        children="Subir archivo"
      />
      <input
        ref={inputRef}
        onChange={handlePic}
        type="file"
        className="hidden"
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
  );
}

export default Canvas2D;
