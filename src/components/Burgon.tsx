import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { getProductos, getProductoPorId } from '../services/inventario';
import { Producto, Color } from '../types/types';
import remera from '/public/images/remera.png';
import remeracolor from '/public/images/remeracolor.png';
import remerahigh from '/public/images/remerahighlight.png';
import remerablack from '/public/images/remerablack.png';
import { getDesigns } from "../services/designs";

const Burgon: React.FC = () => {
  const { order, setOrder, selectedProduct, setSelectedProduct } = useOrder();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState(order.productoId || '');
  const [talles, setTalles] = useState<string[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<Color[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [designStyle, setDesignStyle] = useState({ maxWidth: '70%', maxHeight: '80%', top: '20%' }); // Estado inicial con top

  useEffect(() => {
    const cargarProductos = async () => {
      const productosData = await getProductos();
      setProductos(productosData);
      if (productosData.length > 0 && !selectedProductoId) {
        const firstProductId = productosData[0].id;
        setSelectedProductoId(firstProductId);
        const producto = await getProductoPorId(firstProductId);
        if (producto) setSelectedProduct(producto);
      }
    };
    cargarProductos();
  }, []);

  useEffect(() => {
    const cargarProductoSeleccionado = async () => {
      if (selectedProductoId) {
        const producto = await getProductoPorId(selectedProductoId);
        if (producto) {
          setSelectedProduct(producto);
          setOrder({ ...order, productoId: selectedProductoId });

          const tallesUnicos = [...new Set(producto.inventario.map((i) => i.talla))].sort((a, b) => {
            const ordenTalles = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };
            return ordenTalles[a as keyof typeof ordenTalles] - ordenTalles[b as keyof typeof ordenTalles];
          });
          setTalles(tallesUnicos);

          if (producto.inventario) {
            const todosLosColores = [...new Set(producto.inventario.filter((i) => i.stock > 0).map((i) => i.color))]
              .map((nombre) => ({ nombre, hex: getDefaultHex(nombre) }))
              .sort((a, b) => a.nombre.localeCompare(b.nombre));
            setColoresDisponibles(todosLosColores);
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
  }, [selectedProductoId]);

  useEffect(() => {
    if (selectedProduct && order.talle && selectedProduct.inventario) {
      const coloresPorTalle = selectedProduct.inventario
        .filter((i) => i.talla === order.talle && i.stock > 0)
        .map((i) => ({ nombre: i.color, hex: getDefaultHex(i.color) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setColoresDisponibles(coloresPorTalle);
    } else if (selectedProduct && selectedProduct.inventario) {
      const todosLosColores = [...new Set(selectedProduct.inventario.filter((i) => i.stock > 0).map((i) => i.color))]
        .map((nombre) => ({ nombre, hex: getDefaultHex(nombre) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setColoresDisponibles(todosLosColores);
    }
  }, [order.talle, selectedProduct]);

  useEffect(() => {
    const cargarDesigns = async () => {
      try {
        const data = await getDesigns();
        const filteredDesigns = data.filter((design) => design.stock > 0 && design.selected);
        setDesigns(filteredDesigns);
      } catch (err) {
        console.error("Error trayendo diseños:", err);
      }
    };
    cargarDesigns();
  }, []);

  useEffect(() => {
    if (order.disenoUrl) {
      const img = new Image();
      img.src = order.disenoUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let maxWidth = '70%';
        let maxHeight = '80%';
        let top = '20%'; // Valor por defecto para top
        if (aspectRatio > 1) { // Diseño horizontal (e.g., ancho mayor que alto)
          maxWidth = '40%';
          maxHeight = '80%';
          top = '25%'; // Ajuste hacia arriba para diseños horizontales
        } else if (aspectRatio < 0.67) { // Diseño vertical (e.g., 2:3 o menos)
          maxWidth = '80%';
          maxHeight = '50%';
          top = '25%';
        } else { // Diseño cuadrado o casi cuadrado (0.67 a 1.5)
          maxWidth = '70%';
          maxHeight = '50%';
          top = '25%';
        }

        setDesignStyle({ maxWidth, maxHeight, top });
      };
    }
  }, [order.disenoUrl]);

  const handleProductoSelect = (id: string) => {
    setSelectedProductoId(id);
    setOrder({ ...order, talle: '', color: '', productoId: id });
  };

  const handleTalleSelect = (talle: string) => {
    setOrder({ ...order, talle });
  };

  const handleColorSelect = (colorHex: string) => {
    const colorNombre = coloresDisponibles.find((c) => c.hex === colorHex)?.nombre;
    if (colorNombre) setOrder({ ...order, color: colorHex });
  };

  const handleDesignSelect = (disenoId: string, disenoUrl: string) => {
    if (order.talle && order.color) {
      setOrder({ ...order, disenoId, disenoUrl });
    }
  };

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

      <div className="flex justify-center mb-6">
        <select
          value={selectedProductoId}
          onChange={(e) => handleProductoSelect(e.target.value)}
          className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} - ${producto.precio.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

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

      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        {coloresDisponibles.length > 0 ? (
          coloresDisponibles.map((color) => (
            <button
              key={color.hex}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                order.color === color.hex
                  ? 'bg-blue-100 border-blue-600'
                  : 'bg-white border-gray-300 hover:bg-gray-100'
              } ${!order.talle ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => (order.talle ? handleColorSelect(color.hex) : null)}
              disabled={!order.talle || !selectedProduct}
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
          <p className="text-gray-600">Selecciona un talle para habilitar colores</p>
        )}
      </div>

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

          {order.disenoUrl && (
            <img
              src={order.disenoUrl}
              alt="diseño"
              className="absolute z-30 w-full object-contain pointer-events-none"
              style={{
                ...designStyle,
                left: '51%',
                transform: 'translateX(-50%)',
                top: designStyle.top, // Aplicar el top dinámico
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Elegí un diseño</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {designs.length > 0 ? (
            designs.map((design) => (
              <div key={design.id} className="flex flex-col items-center">
                <button
                  className={`relative w-24 h-24 border rounded-lg overflow-hidden ${
                    order.disenoId === design.id ? "ring-2 ring-blue-500" : ""
                  } ${!order.talle || !order.color ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleDesignSelect(design.id, design.imagen_url)}
                  disabled={!order.talle || !order.color}
                >
                  <img
                    src={design.imagen_url}
                    alt={design.nombre}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
                <p className="text-center text-xs font-medium text-gray-700 mt-1 uppercase">
                  {design.nombre}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No hay diseños disponibles</p>
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {selectedProduct?.nombre || ''}
        </h3>
        {selectedProduct?.precio ? (
          <p className="text-xl font-bold text-gray-800">
            ${selectedProduct.precio.toFixed(2)}
          </p>
        ) : null}
      </div>

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

export default Burgon;