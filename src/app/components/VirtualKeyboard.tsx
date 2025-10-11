import React, { useState } from "react";

/* ===== COMPONENTE DE TECLADO VIRTUAL ===== */
interface VirtualKeyboardProps {
  target: "nombre" | "apellido";
  nombre: string;
  apellido: string;
  setNombre: React.Dispatch<React.SetStateAction<string>>;
  setApellido: React.Dispatch<React.SetStateAction<string>>;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  target,
  nombre,
  apellido,
  setNombre,
  setApellido,
}) => {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const [isUppercase, setIsUppercase] = useState(true);

  const handleKeyPress = (key: string) => {
    const currentValue = target === "nombre" ? nombre : apellido;
    const setter = target === "nombre" ? setNombre : setApellido;

    if (key === "←") {
      setter((prev) => prev.slice(0, -1));
      return;
    }

    if (key === "ESP") {
      setter((prev) => prev + " ");
      setIsUppercase(true); // activar mayúscula después de un espacio
      return;
    }

    const isFirst =
      currentValue.length === 0 ||
      currentValue[currentValue.length - 1] === " ";

    const newChar = isFirst
      ? key.toUpperCase()
      : isUppercase
      ? key.toUpperCase()
      : key.toLowerCase();

    setter((prev) => prev + newChar);

    // después de escribir primera o mayúscula, volver a minúscula
    if (isFirst || isUppercase) setIsUppercase(false);
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none mt-2">
      <div className="grid grid-cols-9 gap-1">
        {letters.map((char) => (
          <button
            key={char}
            onClick={() => handleKeyPress(char)}
            className="border rounded-md px-2 py-1 text-sm hover:bg-gray-100"
          >
            {isUppercase ? char.toUpperCase() : char}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mt-2">
        <button
          onClick={() => setIsUppercase((p) => !p)}
          className="border rounded-md px-3 py-1 text-sm hover:bg-gray-100"
        >
          ⇧
        </button>
        <button
          onClick={() => handleKeyPress("ESP")}
          className="border rounded-md px-8 py-1 text-sm hover:bg-gray-100"
        >
          espacio
        </button>
        <button
          onClick={() => handleKeyPress("←")}
          className="border rounded-md px-3 py-1 text-sm hover:bg-gray-100"
        >
          ←
        </button>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
