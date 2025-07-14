import { useState } from "react";
import { useOrder } from "../../context/OrderContext";
import remera from "../../assets/images/remera.png";
import remeracolor from "../../assets/images/remeracolor.png";
import remerahigh from "../../assets/images/remerahighlight.png";
import remerablack from "../../assets/images/remerablack.png";

const talles = ["S", "M", "L", "XL", " 2XL", "3XL"];
const colores = [
  { nombre: "Blanco", hex: "#ffffff" },
  { nombre: "Negro", hex: "#000000" },
  { nombre: "Rojo", hex: "#ff0000" },
  { nombre: "Azul", hex: "#0000ff" },
];

export default function SelectProductSection() {
  const { order, setOrder } = useOrder();
  const [selectedTalle, setSelectedTalle] = useState(order.talle || "");
  const [selectedColor, setSelectedColor] = useState(order.color || "#ffffff");

  const handleTalleSelect = (talle: string) => {
    setSelectedTalle(talle);
    setOrder({ talle });
  };

  const handleColorSelect = (colorHex: string) => {
    setSelectedColor(colorHex);
    setOrder({ color: colorHex });
  };

  return (
    <section className="bg-white py-10 px-4 w-full max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Elegí la prenda y el talle
      </h2>

      {/* Talles */}
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
      {/* Selector de color */}
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

      {/* Nombre del color */}
      <div className="text-center mb-4">
        <p className="text-gray-700">
          {colores.find((c) => c.hex === selectedColor)?.nombre}
        </p>
      </div>
      {/* Imagen con color aplicado */}
      <div className="relative w-full flex justify-center ">
        <div className="relative w-100   h-100">
          <div
            className={`w-full h-full   [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]`}
            style={{
              backgroundColor: selectedColor,
              maskImage: `url(${remeracolor})`,
            }}
          ></div>
          <img
            src={remera}
            alt="Remera"
            className="opacity-[0.3] mix-blend-color-burn absolute inset-0 z-20 w-full h-full object-contain pointer-events-none  "
          />
          <img
            src={remerahigh}
            alt="Remera"
            className="opacity-[0.1] mix-blend-soft-light absolute inset-0 z-20 w-full h-full object-contain pointer-events-none  "
          />
          <img
            src={remera}
            alt="Remera"
            className="mix-blend-multiply opacity-[1]
 absolute inset-0 z-20 w-full h-full object-contain pointer-events-none  "
          />
          <img
            src={remerablack}
            alt="Remera"
            className="opacity-[1] mix-blend-screen
 absolute inset-0 z-20 w-full h-full object-contain pointer-events-none  "
          />
        </div>
      </div>

      {/* Nombre y precio */}
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
