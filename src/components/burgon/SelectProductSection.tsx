/**
 * @file SelectProductSection.tsx
 * @description Este archivo define el componente para seleccionar un producto, incluyendo talle y color.
 * @module components/burgon/SelectProductSection
 */

import { useMemo } from "react";
import { useOrder } from "../../context/OrderContext";
import remera from "../../../public/images/remera.png";
import remeracolor from "../../../public/images/remeracolor.png";
import remerahigh from "../../../public/images/remerahighlight.png";
import remerablack from "../../../public/images/remerablack.png";

const talles = ["S", "M", "L", "XL", "2XL", "3XL"];
const colores = [
  { nombre: "Blanco", hex: "#ffffff" },
  { nombre: "Negro", hex: "#000000" },
  { nombre: "Rojo", hex: "#ff0000" },
  { nombre: "Azul", hex: "#0000ff" },
];

type ImageLayerProps = {
  src: string;
  alt: string;
  blend: string;
  opacity: string;
};

const ImageLayer = ({ src, alt, blend, opacity }: ImageLayerProps) => (
  <img
    src={src}
    alt={alt}
    className={`absolute inset-0 z-20 w-full h-full object-contain pointer-events-none mix-blend-${blend} opacity-${opacity}`}
  />
);

export default function SelectProductSection() {
  const { order, setOrder } = useOrder();
  const { talle: selectedTalle, color: selectedColor } = order;

  const handleTalleSelect = (talle: string) => setOrder({ talle });
  const handleColorSelect = (colorHex: string) => setOrder({ color: colorHex });

  const selectedColorName = useMemo(
    () => colores.find((c) => c.hex === selectedColor)?.nombre,
    [selectedColor]
  );

  return (
    <section className="bg-white py-10 px-4 w-full max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Elegí la prenda y el talle
      </h2>

      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {talles.map((talle) => (
          <button
            key={talle}
            className={`px-2 py-1 rounded border ${
              selectedTalle === talle
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
            onClick={() => handleTalleSelect(talle)}
          >
            {talle}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        {colores.map((color) => (
          <button
            key={color.hex}
            className={`w-8 h-8 rounded-full border-2 ${
              selectedColor === color.hex ? "border-black" : "border-gray-300"
            }`}
            style={{ backgroundColor: color.hex }}
            onClick={() => handleColorSelect(color.hex)}
          />
        ))}
      </div>

      <div className="text-center mb-4">
        <p className="text-gray-700">{selectedColorName}</p>
      </div>

      <div className="relative w-full flex justify-center">
        <div className="relative w-100 h-100">
          <div
            className="w-full h-full [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
            style={{
              backgroundColor: selectedColor,
              maskImage: `url(${remeracolor})`,
            }}
          />
          <ImageLayer src={remera} alt="Remera" blend="color-burn" opacity="30" />
          <ImageLayer src={remerahigh} alt="Remera" blend="soft-light" opacity="10" />
          <ImageLayer src={remera} alt="Remera" blend="multiply" opacity="100" />
          <ImageLayer src={remerablack} alt="Remera" blend="screen" opacity="100" />
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Remera Hombre</h3>
        <p className="text-xl font-bold">$650</p>
      </div>

      {/* Botón siguiente */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          onClick={() => {
            // lógica para avanzar a la siguiente sección (puede ser con react-router o setStep)
            console.log("Siguiente");
          }}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
