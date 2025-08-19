import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { obtenerProductos, obtenerProductoPorId } from '../services/inventario';
import { Producto, Color } from '../types';
import remera from '/public/images/remera.png';
import remeracolor from '/public/images/remeracolor.png';
import remerahigh from '/public/images/remerahighlight.png';
import remerablack from '/public/images/remerablack.png';

const SelectProductSection: React.FC = () => {
  const { order, setOrder, selectedProduct, setSelectedProduct } = useOrder();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState(order.productoId || '');
  const [talles, setTalles] = useState<string[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<Color[]>([]);

  useEffect(() => {
    const cargarProductos = async () => {
      const productosData = await obtenerProductos();
      setProductos(productosData);
      if (productosData.length > 0 && !selectedProductoId) {
        const firstProductId = productosData[0].id;
        setSelectedProductoId(firstProductId);
        const producto = await obtenerProductoPorId(firstProductId);
        if (producto) setSelectedProduct(producto);
      }
    };
    cargarProductos();
  }, []);

  useEffect(() => {
    const cargarProductoSeleccionado = async () => {
      if (selectedProductoId) {
        const producto = await obtenerProductoPorId(selectedProductoId);
        if (producto) {
          setSelectedProduct(producto);
          setOrder({ ...order, productoId: selectedProductoId });

          // Extraer talles únicos del inventario
          const tallesUnicos = [...new Set(producto.inventario.map((i) => i.talla))].sort((a, b) => {
            const ordenTalles = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };
            return ordenTalles[a as keyof typeof ordenTalles] - ordenTalles[b as keyof typeof ordenTalles];
          });
          setTalles(tallesUnicos);

          // Filtrar colores disponibles para el talle seleccionado (o el primero si no hay talle)
          const talleSeleccionado = order.talle || tallesUnicos[0];
          if (talleSeleccionado && producto.inventario) {
            const coloresPorTalle = producto.inventario
              .filter((i) => i.talla === talleSeleccionado && i.stock > 0)
              .map((i) => ({ nombre: i.color, hex: getDefaultHex(i.color) }))
              .sort((a, b) => a.nombre.localeCompare(b.nombre));
            setColoresDisponibles(coloresPorTalle);
          } else {
            setColoresDisponibles([]);
          }
        } else {
          setSelectedProduct(null);
          setTalles([]);
          setColoresDisponibles([]);
        }
      } else {
        setSelectedProduct(null);
        setTalles([]);
        setColoresDisponibles([]);
      }
    };
    cargarProductoSeleccionado();
  }, [selectedProductoId, order.talle]);

  const handleProductoSelect = (id: string) => {
    setSelectedProductoId(id);
    setOrder({ ...order, talle: '', color: '', productoId: id }); // Resetea talle y color al cambiar producto
  };

  const handleTalleSelect = (talle: string) => {
    setOrder({ ...order, talle });
    if (selectedProduct?.inventario) {
      const coloresPorTalle = selectedProduct.inventario
        .filter((i) => i.talla === talle && i.stock > 0)
        .map((i) => ({ nombre: i.color, hex: getDefaultHex(i.color) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setColoresDisponibles(coloresPorTalle);
    }
  };

  const handleColorSelect = (colorHex: string) => {
    const colorNombre = coloresDisponibles.find((c) => c.hex === colorHex)?.nombre;
    if (colorNombre) setOrder({ ...order, color: colorHex });
  };

  // Función auxiliar para asignar hex por defecto
  const getDefaultHex = (nombre: string): string => {
    const coloresConocidos = {
      Blanco: '#ffffff',
      Negro: '#000000',
      Rojo: '#ff0000',
      Azul: '#0000ff',
      Verde: '#008000',
      Amarillo: '#ffff00',
      Gris: '#808080',
      Rosa: '#ff69b4',
      Naranja: '#ffa500',
      Morado: '#800080',
    };
    return coloresConocidos[nombre] || '#000000';
  };

  return (
    <section className="bg-white py-10 px-4 w-full max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Elegí la prenda y el talle
      </h2>

      {/* Selector de Productos */}
      <div className="flex justify-center mb-6">
        <select
          value={selectedProductoId}
          onChange={(e) => handleProductoSelect(e.target.value)}
          className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un producto</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} - ${producto.precio.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {/* Talles */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {talles.length > 0 ? (
          talles.map((talle) => (
            <button
              key={talle}
              className={`px-4 py-2 rounded-lg border transition ${
                order.talle === talle
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => handleTalleSelect(talle)}
              disabled={!selectedProduct}
            >
              {talle}
            </button>
          ))
        ) : selectedProduct ? (
          <p className="text-gray-600">No hay talles disponibles para este producto</p>
        ) : (
          <p className="text-gray-600">Selecciona un producto para ver talles</p>
        )}
      </div>

      {/* Selector de color */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        {coloresDisponibles.length > 0 ? (
          coloresDisponibles.map((color) => (
            <button
              key={color.hex}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                order.color === color.hex
                  ? 'bg-blue-100 border-blue-600'
                  : 'bg-white border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => handleColorSelect(color.hex)}
              disabled={!selectedProduct}
            >
              <span className="text-gray-800">{color.nombre}</span>
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: color.hex }}
              />
            </button>
          ))
        ) : selectedProduct && order.talle ? (
          <p className="text-gray-600">No hay colores disponibles para este talle</p>
        ) : (
          <p className="text-gray-600">Selecciona un talle para ver colores</p>
        )}
      </div>

      {/* Imagen con color aplicado */}
      <div className="relative w-full flex justify-center">
        <div className="relative w-64 h-64">
          <div
            className="w-full h-full [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
            style={{
              backgroundColor: order.color || '#ffffff',
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

      {/* Nombre y precio sincronizados */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {selectedProduct?.nombre || 'Remera Hombre'}
        </h3>
        <p className="text-xl font-bold text-gray-800">
          ${selectedProduct?.precio.toFixed(2) || '650'}
        </p>
      </div>

      {/* Botón siguiente */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => {
            console.log('Siguiente');
          }}
          disabled={!selectedProduct || !order.talle || !order.color}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
};

export default SelectProductSection;