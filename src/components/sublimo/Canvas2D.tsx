/**
 * @file Canvas2D.tsx
 * @description Este archivo define el componente de lienzo 2D para la edición de imágenes utilizando Fabric.js.
 * @module components/sublimo/Canvas2D
 */

import React, { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { fabric } from 'fabric';

/**
 * @function Canvas2D
 * @description Un componente de React que proporciona un lienzo 2D para cargar y manipular imágenes.
 * Permite a los usuarios subir una imagen, que se agrega al lienzo, y luego generar y descargar la imagen resultante.
 * @param {{ onImageChange?: (dataUrl: string) => void }} props - Prop para notificar cambios en la imagen.
 * @returns {JSX.Element} El componente del lienzo 2D.
 */
function Canvas2D({ onImageChange }: { onImageChange?: (dataUrl: string) => void }) {
  // Tamaño cuadrado fijo (puedes ajustar el valor si quieres otro tamaño)
  const CANVAS_SIZE = 350;
  /**
   * @ref
   * @description Referencia al input de tipo archivo para poder activarlo mediante un botón.
   */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * @hook
   * @description Hook de `fabricjs-react` que proporciona el editor y la función `onReady`.
   */
  const { editor, onReady } = useFabricJSEditor();
  const tshirtImgUrl = `${import.meta.env.BASE_URL}models/tshirt.png`;

  // Setear tamaño cuadrado del canvas cuando esté listo (sin fondo de guía en Fabric)
  useEffect(() => {
    if (!editor?.canvas) return;
    editor.canvas.setWidth(CANVAS_SIZE);
    editor.canvas.setHeight(CANVAS_SIZE);
  }, [editor]);

  // Notifica al padre cuando el canvas cambia
  useEffect(() => {
    if (!editor?.canvas || !onImageChange) return;
    const handler = () => {
      const dataUrl = editor.canvas.toDataURL({ format: 'png' });
      onImageChange(dataUrl);
    };
    editor.canvas.on('object:added', handler);
    editor.canvas.on('object:modified', handler);
    editor.canvas.on('object:removed', handler);
    return () => {
      editor.canvas.off('object:added', handler);
      editor.canvas.off('object:modified', handler);
      editor.canvas.off('object:removed', handler);
    };
  }, [editor, onImageChange]);

  /**
   * @function handlePic
   * @description Maneja el evento de selección de un archivo de imagen.
   * Crea una URL para el archivo seleccionado y lo carga en el lienzo de Fabric.js.
   * @param {ChangeEvent<HTMLInputElement>} event - El evento del input de archivo.
   */
  const handlePic = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (oImg: any) => {
      oImg.scale(0.1).set('flipY', false);
      editor?.canvas.add(oImg);
      // Notifica al padre inmediatamente después de agregar la imagen
      setTimeout(() => {
        if (editor?.canvas && onImageChange) {
          const dataUrl = editor.canvas.toDataURL({ format: 'png' });
          onImageChange(dataUrl);
        }
      }, 100);
    });
  };

  /**
   * @function generateImage
   * @description Genera una imagen a partir del contenido actual del lienzo y la descarga.
   * Convierte el lienzo a un Data URL y simula un clic en un enlace para descargar la imagen.
   */
  const generateImage = () => {
    const dataURL = editor?.canvas.toDataURL();
    if (dataURL) {
      const a = document.createElement('a');
      a.download = 'image.png';
      a.href = dataURL;
      a.click();
      // en lugar de descargar, podemos subirla al server (fetch)
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-2 bg-gray-800 items-center justify-center">
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
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        <div style={{position: 'absolute', inset: 0}}>
          <FabricJSCanvas onReady={onReady} className='w-full h-full bg-transparent' />
        </div>
      </div>
      <button
        onClick={generateImage}
        className="py-1 px-3 bg-indigo-500 text-white rounded-lg m-2 text-sm"
        children="Generar archivo"
      />
    </div>
  );
}

export default Canvas2D;
