import React, { useEffect, useState } from 'react';
import { obtenerProductos, agregarProducto, actualizarStock } from '../services/inventario';
import { Producto, Inventario } from '../types';

const Inventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: 0,
    descripcion: '',
    inventario: [{ talla: 'S', color: 'Rojo', stock: 0 }],
  });
  const [nuevaCombinacion, setNuevaCombinacion] = useState({
    idProducto: '',
    talla: 'S',
    color: '',
    stock: 0,
  });

  useEffect(() => {
    const cargarProductos = async () => {
      const productosData = await obtenerProductos();
      setProductos(productosData);
    };
    cargarProductos();
  }, []);

  const handleAgregarProducto = async () => {
    try {
      await agregarProducto(nuevoProducto);
      setProductos(await obtenerProductos());
      setNuevoProducto({ nombre: '', precio: 0, descripcion: '', inventario: [{ talla: 'S', color: 'Rojo', stock: 0 }] });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleActualizarStock = async (idProducto: string, talla: string, color: string, nuevoStock: number) => {
    try {
      const item = productos
        .find((p) => p.id === idProducto)
        ?.inventario.find((i) => i.talla === talla && i.color === color);
      if (!item) throw new Error('Combinación no encontrada');
      const cantidad = nuevoStock - item.stock; // Calcular diferencia
      await actualizarStock(idProducto, talla, color, cantidad);
      setProductos(await obtenerProductos());
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAgregarCombinacion = async () => {
    try {
      await actualizarStock(
        nuevaCombinacion.idProducto,
        nuevaCombinacion.talla,
        nuevaCombinacion.color,
        nuevaCombinacion.stock
      );
      setProductos(await obtenerProductos());
      setNuevaCombinacion({ idProducto: '', talla: 'S', color: '', stock: 0 });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Inventario de Camisetas</h1>


      {/* Lista de productos */}
      <div className="space-y-6">
        {productos.map((producto) => (
          <div key={producto.id} className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800">{producto.nombre}</h3>
            <p className="text-gray-600">Precio: ${producto.precio.toFixed(2)}</p>
            <p className="text-gray-600">Descripción: {producto.descripcion || 'Sin descripción'}</p>
            <p className="text-gray-600">
              Última Actualización: {producto.fechaActualizacion.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            {/* Inventario */}
            <h4 className="text-md font-medium mt-4 mb-2 text-gray-700">Inventario</h4>
            <ul className="space-y-2">
              {producto.inventario.map((item, index) => (
                <li key={index} className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Talla: {item.talla}, Color: {item.color}
                  </span>
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) =>
                      handleActualizarStock(producto.id, item.talla, item.color, parseInt(e.target.value) || 0)
                    }
                    className="w-20 border rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </li>
              ))}
            </ul>

            {/* Formulario para agregar combinación */}
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2 text-gray-700">Agregar Combinación</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <select
                  value={nuevaCombinacion.talla}
                  onChange={(e) => setNuevaCombinacion({ ...nuevaCombinacion, talla: e.target.value })}
                  className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['S', 'M', 'L', 'XL', 'XXL'].map((talla) => (
                    <option key={talla} value={talla}>
                      {talla}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Color"
                  value={nuevaCombinacion.color}
                  onChange={(e) => setNuevaCombinacion({ ...nuevaCombinacion, color: e.target.value })}
                  className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={nuevaCombinacion.stock}
                  onChange={(e) => setNuevaCombinacion({ ...nuevaCombinacion, stock: parseInt(e.target.value) || 0 })}
                  className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <button
                onClick={() => {
                  setNuevaCombinacion({ ...nuevaCombinacion, idProducto: producto.id });
                  handleAgregarCombinacion();
                }}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Añadir Combinación
              </button>
            </div>
          </div>
        ))}
      </div>

      
      {/* Formulario para agregar producto */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Agregar Producto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Precio"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) || 0 })}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Descripción"
            value={nuevoProducto.descripcion}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
          />
        </div>
        <button
          onClick={handleAgregarProducto}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Agregar Producto
        </button>
      </div>
    </div>
  );
};

export default Inventario;