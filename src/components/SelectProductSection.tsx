import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { obtenerTallesDisponibles, obtenerColoresDisponibles, obtenerColoresPorTalle } from '../services/inventario';
import { Color } from '../types';
import remera from '/public/images/remera.png';
import remeracolor from '/public/images/remeracolor.png';
import remerahigh from '/public/images/remerahighlight.png';
import remerablack from '/public/images/remerablack.png';

const SelectProductSection: React.FC = () => {
  const { order, setOrder } = useOrder();
  const [talles, setTalles] = useState<string[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [selectedTalle, setSelectedTalle] = useState(order.talle || '');
  const [selectedColor, setSelectedColor] = useState(order.color || '');
  const [coloresDisponibles, setColoresDisponibles] = useState<Color[]>([]); // Colores filtrados por talle

  useEffect(() => {
    const cargarDatos = async () => {
      const [tallesData, coloresData] = await Promise.all([
        obtenerTallesDisponibles(),
        obtenerColoresDisponibles(),
      ]);
      // Ordenar talles manualmente: S > M > L > XL > XXL
      const ordenTalles = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };
      const tallesOrdenados = tallesData.sort((a, b) => ordenTalles[a as keyof typeof ordenTalles] - ordenTalles[b as keyof typeof ordenTalles]);
      setTalles(tallesOrdenados);
      setColores(coloresData.sort((a, b) => a.nombre.localeCompare(b.nombre))); // Orden alfabético por nombre
      if (tallesOrdenados.length > 0 && !selectedTalle) setSelectedTalle(tallesOrdenados[0]);
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const actualizarColoresPorTalle = async () => {
      if (selectedTalle) {
        const coloresPorTalle = await obtenerColoresPorTalle(selectedTalle);
        setColoresDisponibles(coloresPorTalle.sort((a, b) => a.nombre.localeCompare(b.nombre))); // Orden alfabético
      } else {
        setColoresDisponibles([]);
      }
    };
    actualizarColoresPorTalle();
  }, [selectedTalle]);

  const handleTalleSelect = (talle: string) => {
    setSelectedTalle(talle);
    setSelectedColor(''); // Resetea el color al cambiar talle
    setOrder({ talle, color: '' });
  };

  const handleColorSelect = (colorHex: string) => {
    if (coloresDisponibles.some((c) => c.hex === colorHex)) {
      setSelectedColor(colorHex);
      setOrder({ ...order, color: colorHex });
    }
  };

  return (
    <section className="bg-white py-10 px-4 w-full max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Elegí la prenda y el talle
      </h2>

      {/* Talles */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {talles.length > 0 ? (
          talles.map((talle) => (
            <button
              key={talle}
              className={`px-4 py-2 rounded-lg border transition ${
                selectedTalle === talle
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => handleTalleSelect(talle)}
            >
              {talle}
            </button>
          ))
        ) : (
          <p className="text-gray-600">No hay talles disponibles</p>
        )}
      </div>

      {/* Selector de color */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        {colores.length > 0 ? (
          colores.map((color) => {
            const estaDisponible = coloresDisponibles.some((c) => c.hex === color.hex);
            return (
              <button
                key={color.hex}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  selectedColor === color.hex
                    ? 'bg-blue-100 border-blue-600'
                    : estaDisponible
                    ? 'bg-white border-gray-300 hover:bg-gray-100'
                    : 'bg-gray-200 border-gray-400 cursor-not-allowed opacity-50'
                }`}
                onClick={() => (estaDisponible ? handleColorSelect(color.hex) : null)}
                disabled={!estaDisponible}
              >
                <span className="text-gray-800">{color.nombre}</span>
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            );
          })
        ) : (
          <p className="text-gray-600">No hay colores disponibles</p>
        )}
      </div>

      {/* Imagen con color aplicado */}
      <div className="relative w-full flex justify-center">
        <div className="relative w-64 h-64">
          <div
            className="w-full h-full [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
            style={{
              backgroundColor: selectedColor || '#ffffff',
              maskImage: `url(${remeracolor})`,
            }}
          ></div>
          <img
            src={remera}
            alt="Remera"
            className="opacity-30 mix-blend-color-burn absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
          />
          <img
            src={remerahigh}
            alt="Remera"
            className="opacity-10 mix-blend-soft-light absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
          />
          <img
            src={remera}
            alt="Remera"
            className="mix-blend-multiply opacity-100 absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
          />
          <img
            src={remerablack}
            alt="Remera"
            className="opacity-100 mix-blend-screen absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Nombre y precio */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Remera Hombre</h3>
        <p className="text-xl font-bold text-gray-800">$650</p>
      </div>

      {/* Botón siguiente */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => {
            console.log('Siguiente');
          }}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
};

export default SelectProductSection;