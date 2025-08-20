import React, { useEffect, useState } from 'react';
import { obtenerProductos, agregarProducto, actualizarStock, coloresFijos, actualizarProducto, eliminarProducto, eliminarCombinacion } from '../services/inventario';
import { Producto, Inventario } from '../types';

const Inventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: 0,
    descripcion: '',
    inventario: [], // Inventario vacío al crear un producto
  });
  const [nuevaCombinacion, setNuevaCombinacion] = useState({
    idProducto: '',
    talla: 'S',
    color: coloresFijos[0].nombre,
    stock: 0,
  });
  const [editando, setEditando] = useState<{ [key: string]: boolean }>({}); // Estado para modo edición por producto
  const [productoEditado, setProductoEditado] = useState<{ id: string; nombre: string; precio: number; descripcion: string } | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      const productosData = await obtenerProductos();
      setProductos(productosData);
    };
    cargarProductos();
  }, []);

  const handleAgregarProducto = async () => {
    try {
      await agregarProducto(nuevoProducto); // No se valida color, ya que no hay inventario inicial
      setProductos(await obtenerProductos());
      setNuevoProducto({
        nombre: '',
        precio: 0,
        descripcion: '',
        inventario: [], // Reinicia con inventario vacío
      });
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
      const cantidad = nuevoStock - item.stock;
      await actualizarStock(idProducto, talla, color, cantidad);
      setProductos(await obtenerProductos());
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAgregarCombinacion = async () => {
    try {
      if (!nuevaCombinacion.color) throw new Error('Seleccione un color');
      await actualizarStock(nuevaCombinacion.idProducto, nuevaCombinacion.talla, nuevaCombinacion.color, nuevaCombinacion.stock);
      setProductos(await obtenerProductos());
      setNuevaCombinacion({ idProducto: '', talla: 'S', color: coloresFijos[0].nombre, stock: 0 });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditarProducto = (producto: Producto) => {
    setEditando({ ...editando, [producto.id]: true });
    setProductoEditado({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion || '',
    });
  };

  const handleGuardarEdicion = async () => {
    if (productoEditado) {
      try {
        await actualizarProducto(productoEditado.id, {
          nombre: productoEditado.nombre,
          precio: productoEditado.precio,
          descripcion: productoEditado.descripcion,
          inventario: productos.find((p) => p.id === productoEditado.id)?.inventario || [],
          fechaActualizacion: new Date(),
        });
        setProductos(await obtenerProductos());
        setEditando({ ...editando, [productoEditado.id]: false });
        setProductoEditado(null);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleCancelarEdicion = (id: string) => {
    setEditando({ ...editando, [id]: false });
    setProductoEditado(null);
  };

  const handleEliminarProducto = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        await eliminarProducto(id);
        setProductos(await obtenerProductos());
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleEliminarCombinacion = async (idProducto: string, talla: string, color: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la combinación Talla: ${talla}, Color: ${color}? Esta acción no se puede deshacer.`)) {
      try {
        await eliminarCombinacion(idProducto, talla, color);
        setProductos(await obtenerProductos());
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  // Mapeo de tallas a un orden numérico
  const tallaOrden = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Inventario de Camisetas</h1>

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
            onFocus={(e) => e.target.value === '0' && e.target.select()} // Selecciona todo al hacer clic
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

      {/* Lista de productos */}
      <div className="space-y-6">
        {productos.map((producto) => (
          <div key={producto.id} className="bg-white shadow-md rounded-lg p-6">
            {editando[producto.id] ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Editando: {producto.nombre}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={productoEditado?.nombre || ''}
                    onChange={(e) =>
                      setProductoEditado({ ...productoEditado!, nombre: e.target.value })
                    }
                    className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={productoEditado?.precio || 0}
                    onFocus={(e) => e.target.value === '0' && e.target.select()} // Selecciona todo al hacer clic
                    onChange={(e) =>
                      setProductoEditado({ ...productoEditado!, precio: parseFloat(e.target.value) || 0 })
                    }
                    className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={productoEditado?.descripcion || ''}
                    onChange={(e) =>
                      setProductoEditado({ ...productoEditado!, descripcion: e.target.value })
                    }
                    className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGuardarEdicion}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => handleCancelarEdicion(producto.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditarProducto(producto)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarProducto(producto.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Eliminar Producto
                  </button>
                </div>
              </>
            )}

            {/* Inventario ordenado por talla y color con círculo de color */}
            <h4 className="text-md font-medium mt-4 mb-2 text-gray-700">Inventario</h4>
            <ul className="space-y-2">
              {[...producto.inventario].sort((a, b) => {
                const ordenA = tallaOrden[a.talla as keyof typeof tallaOrden];
                const ordenB = tallaOrden[b.talla as keyof typeof tallaOrden];
                if (ordenA !== ordenB) return ordenA - ordenB;
                return a.color.localeCompare(b.color);
              }).map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-gray-600">
                    Talla: {item.talla}, Color: {item.color}
                  </span>
                  <input
                    type="number"
                    value={item.stock}
                    onFocus={(e) => e.target.value === '0' && e.target.select()} // Selecciona todo al hacer clic
                    onChange={(e) =>
                      handleActualizarStock(producto.id, item.talla, item.color, parseInt(e.target.value) || 0)
                    }
                    className="w-20 border rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <button
                    onClick={() => handleEliminarCombinacion(producto.id, item.talla, item.color)}
                    className="bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Eliminar
                  </button>
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
                <div className="relative">
                  <select
                    value={nuevaCombinacion.color}
                    onChange={(e) => setNuevaCombinacion({ ...nuevaCombinacion, color: e.target.value })}
                    className="border rounded-lg p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none"
                  >
                    {coloresFijos.map((color) => (
                      <option key={color.nombre} value={color.nombre}>
                        {color.nombre}
                      </option>
                    ))}
                  </select>
                  <div
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border"
                    style={{ backgroundColor: coloresFijos.find((c) => c.nombre === nuevaCombinacion.color)?.hex || '#000000' }}
                  />
                </div>
                <input
                  type="number"
                  placeholder="Stock"
                  value={nuevaCombinacion.stock}
                  onFocus={(e) => e.target.value === '0' && e.target.select()} // Selecciona todo al hacer clic
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
    </div>
  );
};

export default Inventario;