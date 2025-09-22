// src/app/components/sublimo/Canvas2D.tsx
"use client";
import { type ChangeEvent, useEffect, useRef, useCallback } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";

interface Canvas2DProps {
  onImageChange?: (dataUrl: string | null) => void;
  visible: boolean;
  onClose: () => void;
}

function Canvas2D({ onImageChange, visible, onClose }: Canvas2DProps) {
  // Tamaño visual del canvas
  const CANVAS_SIZE = 350;
  // Tamaño de exportación de la textura
  const EXPORT_SIZE = 3072;

  const inputRef = useRef<HTMLInputElement>(null);
  const { editor, onReady } = useFabricJSEditor();
  const tshirtImgUrl = `models/tshirt.jpg`;

  // 🔧 Función para exportar SIEMPRE en alta resolución
  const exportHighRes = useCallback(() => {
    if (!editor?.canvas) return;
    return editor.canvas.toDataURL({
      format: "png",
      multiplier: EXPORT_SIZE / CANVAS_SIZE,
    });
  }, [editor, EXPORT_SIZE, CANVAS_SIZE]);

  // 🎯 Control de eliminar (❌)
  const deleteControl = new fabric.Control({
    x: 0.5, // esquina derecha
    y: -0.5, // esquina superior
    offsetY: -16,
    offsetX: 16,
    cursorStyle: "pointer",
    mouseUpHandler: (eventData, transform) => {
      const target = transform.target;
      const canvas = target?.canvas;
      if (canvas && target) {
        // 🔧 Eliminar inmediatamente y forzar renderizado
        canvas.remove(target);
        canvas.requestRenderAll();

        // 🔧 Pequeño delay para asegurar la eliminación visual
        setTimeout(() => {
          canvas.requestRenderAll();

          // 🔧 Disparar evento personalizado para que el useEffect lo capture
          canvas.fire("object:removed");

          // 🔧 Notificar al padre después de eliminar
          if (typeof onImageChange === "function") {
            const dataUrl = canvas.toDataURL({
              format: "png",
              multiplier: EXPORT_SIZE / CANVAS_SIZE,
            });
            onImageChange(dataUrl);
          }
        }, 50);
      }
      return true;
    },
    render: (ctx, left, top) => {
      ctx.save();
      ctx.translate(left, top);

      // círculo rojo
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, 2 * Math.PI, false);
      ctx.fillStyle = "red";
      ctx.fill();

      // ❌ blanca
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.moveTo(-4, -4);
      ctx.lineTo(4, 4);
      ctx.moveTo(4, -4);
      ctx.lineTo(-4, 4);
      ctx.stroke();

      ctx.restore();
    },
  });

  // 📡 Hook para avisar al padre cuando cambian objetos
  useEffect(() => {
    if (!editor?.canvas || !onImageChange) return;
    const handler = () => {
      // Verificamos si hay objetos además del fondo
      const hasObjects = editor.canvas.getObjects().length > 0;

      if (hasObjects) {
        const dataURL = exportHighRes();
        if (dataURL) onImageChange(dataURL);
      } else {
        // 🔴 No quedan imágenes → limpiar textura en el padre
        onImageChange(null);
      }
    };
    editor.canvas.on("object:added", handler);
    editor.canvas.on("object:modified", handler);
    editor.canvas.on("object:removed", handler);
    return () => {
      editor.canvas.off("object:added", handler);
      editor.canvas.off("object:modified", handler);
      editor.canvas.off("object:removed", handler);
    };
  }, [editor, onImageChange, exportHighRes]);

  if (!visible) return null;

  // 📂 Manejo de carga de imagen
  const handlePic = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (oImg: fabric.Image) => {
      oImg.scale(0.1).set("flipY", false);

      // 👉 Agregar control de eliminar siempre visible
      oImg.controls.deleteControl = deleteControl;
      oImg.set({
        selectable: true,
        hasControls: true,
        hasBorders: true,
        objectCaching: false,
      });
      (oImg as any).objectControlsAlwaysVisible = true;

      editor?.canvas.add(oImg);
      editor?.canvas.requestRenderAll();

      // 🔧 Notifica al padre inmediatamente en alta resolución
      setTimeout(() => {
        if (onImageChange) {
          const dataUrl = exportHighRes();
          if (dataUrl) onImageChange(dataUrl);
        }
      }, 100);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 shadow-2xl z-40 flex flex-col rounded-lg  w-[380px]">
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
          className="py-1 px-3 bg-yellow-500 text-black rounded-lg m-2 text-sm"
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
