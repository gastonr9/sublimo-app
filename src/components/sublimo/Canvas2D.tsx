import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { fabric } from 'fabric';
import { type ChangeEvent, useRef } from 'react';

function Canvas2D() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor, onReady } = useFabricJSEditor();

  const handlePic = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    console.log(url);
    fabric.Image.fromURL(url, (oImg: any) => {
      oImg.scale(0.1).set('flipX', true);
      editor?.canvas.add(oImg);
    });
  };

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
    <article className="flex-col min-h-full min-w-full border bg-gray-800 h-full flex justify-center items-center">
      <button
        onClick={() => inputRef.current?.click()}
        className="py-2 px-6 bg-yellow-500 text-white rounded-xl m-4"
        children="subir archivo"
      />
      <input
        ref={inputRef}
        onChange={handlePic}
        type="file"
        className="hidden"
      />
      <div className="rounded-xl border border-4 border-yellow-500 ">
        <FabricJSCanvas onReady={onReady} />
      </div>
      <button
        onClick={generateImage}
        className="py-2 px-6 bg-indigo-500 text-white rounded-xl m-4"
        children="Generar archivo"
      />
    </article>
  );
}

export default Canvas2D;
