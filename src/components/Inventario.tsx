//src/components/Inventario.tsx
import React, { useEffect, useState } from "react";
import {
  obtenerProductos,
  agregarProducto,
  actualizarStock,
  actualizarProducto,
  eliminarProducto,
  eliminarCombinacion,
  obtenerColoresFijos,
} from "../services/inventario";
import { Producto, Color } from "../types/types";

const Inventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [coloresFijos, setColoresFijos] = useState<Color[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: 0,
    descripcion: "",
  });
  const [nuevaCombinacion, setNuevaCombinacion] = useState({
    idProducto: "",
    talla: "S",
    color: "",
    stock: 0,
  });
  const [editando, setEditando] = useState<{ [key: string]: boolean }>({});
  const [productoEditado, setProductoEditado] = useState<{
    id: string;
    nombre: string;
    precio: number;
    descripcion: string;
  } | null>(null);

  // === Cargar productos y colores ===
  useEffect(() => {
    const cargarDatos = async () => {
      const productosData = await obtenerProductos();
      setProductos(productosData);

      const coloresData = await obtenerColoresFijos();
      setColoresFijos(coloresData);

      if (coloresData.length > 0) {
        setNuevaCombinacion((prev) => ({
          ...prev,
          color: coloresData[0].nombre,
        }));
      }
    };
    cargarDatos();
  }, []);

  const handleAgregarProducto = async () => {
    try {
      await agregarProducto(nuevoProducto);
      setProductos(await obtenerProductos());
      setNuevoProducto({ nombre: "", precio: 0, descripcion: "" });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleActualizarStock = async (
    idProducto: string,
    talla: string,
    color: string,
    nuevoStock: number
  ) => {
    try {
      const producto = productos.find((p) => p.id === idProducto);
      const item = producto?.inventario.find(
        (i) => i.talla === talla && i.color === color
      );
      if (!item) throw new Error("Combinación no encontrada");
      const cantidad = nuevoStock - item.stock;
      await actualizarStock(idProducto, talla, color, cantidad);
      setProductos(await obtenerProductos());
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAgregarCombinacion = async () => {
    try {
      if (!nuevaCombinacion.idProducto) throw new Error("Seleccione un producto");
      if (!nuevaCombinacion.color) throw new Error("Seleccione un color");
      await actualizarStock(
        nuevaCombinacion.idProducto,
        nuevaCombinacion.talla,
        nuevaCombinacion.color,
        nuevaCombinacion.stock
      );
      setProductos(await obtenerProductos());
      setNuevaCombinacion({
        idProducto: "",
        talla: "S",
        color: coloresFijos.length > 0 ? coloresFijos[0].nombre : "",
        stock: 0,
      });
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
      descripcion: producto.descripcion || "",
    });
  };

  const handleGuardarEdicion = async () => {
    if (productoEditado) {
      try {
        await actualizarProducto(productoEditado.id, {
          nombre: productoEditado.nombre,
          precio: productoEditado.precio,
          descripcion: productoEditado.descripcion,
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
    if (window.confirm("¿Eliminar este producto?")) {
      try {
        await eliminarProducto(id);
        setProductos(await obtenerProductos());
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleEliminarCombinacion = async (
    idProducto: string,
    talla: string,
    color: string
  ) => {
    if (
      window.confirm(
        `¿Eliminar combinación Talla: ${talla}, Color: ${color}?`
      )
    ) {
      try {
        await eliminarCombinacion(idProducto, talla, color);
        setProductos(await obtenerProductos());
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  // Orden de tallas
  const tallaOrden = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };

  // Validaciones
  const isAgregarProductoDisabled =
    !nuevoProducto.nombre.trim() ||
    nuevoProducto.precio === 0 ||
    !nuevoProducto.descripcion.trim();

  const isAgregarCombinacionDisabled =
    nuevaCombinacion.stock <= 0 ||
    !nuevaCombinacion.talla ||
    !nuevaCombinacion.color ||
    !nuevaCombinacion.idProducto;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Inventario de Productos
      </h1>

      {/* Agregar producto */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Agregar Producto
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre"
            value={nuevoProducto.nombre}
            onChange={(e) =>
              setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
            }
            className="border rounded-lg p-2"
          />
          <input
            type="number"
            placeholder="Precio"
            value={nuevoProducto.precio}
            onFocus={(e) => e.target.value === "0" && e.target.select()}
            onChange={(e) =>
              setNuevoProducto({
                ...nuevoProducto,
                precio: parseFloat(e.target.value) || 0,
              })
            }
            min="0"
            className="border rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="Descripción"
            value={nuevoProducto.descripcion}
            onChange={(e) =>
              setNuevoProducto({
                ...nuevoProducto,
                descripcion: e.target.value,
              })
            }
            className="border rounded-lg p-2 sm:col-span-2"
          />
        </div>
        <button
          onClick={handleAgregarProducto}
          className={`mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg ${
            isAgregarProductoDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          disabled={isAgregarProductoDisabled}
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
                <input
                  type="text"
                  value={productoEditado?.nombre || ""}
                  onChange={(e) =>
                    setProductoEditado({
                      ...productoEditado!,
                      nombre: e.target.value,
                    })
                  }
                  className="border rounded-lg p-2"
                />
                <input
                  type="number"
                  value={productoEditado?.precio || 0}
                  onFocus={(e) => e.target.value === "0" && e.target.select()}
                  onChange={(e) =>
                    setProductoEditado({
                      ...productoEditado!,
                      precio: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="border rounded-lg p-2"
                />
                <input
                  type="text"
                  value={productoEditado?.descripcion || ""}
                  onChange={(e) =>
                    setProductoEditado({
                      ...productoEditado!,
                      descripcion: e.target.value,
                    })
                  }
                  className="border rounded-lg p-2"
                />
                <button
                  onClick={handleGuardarEdicion}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
                <button
                  onClick={() => handleCancelarEdicion(producto.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                <p>Precio: ${producto.precio.toFixed(2)}</p>
                <p>{producto.descripcion}</p>
                <button
                  onClick={() => handleEditarProducto(producto)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarProducto(producto.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Eliminar
                </button>
              </>
            )}

            {/* Inventario */}
            <h4 className="mt-4 font-semibold">Inventario</h4>
            <ul>
              {[...producto.inventario]
                .sort((a, b) => {
                  const ordenA = tallaOrden[a.talla as keyof typeof tallaOrden];
                  const ordenB = tallaOrden[b.talla as keyof typeof tallaOrden];
                  if (ordenA !== ordenB) return ordenA - ordenB;
                  return a.color.localeCompare(b.color);
                })
                .map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span>
                      {item.talla} - {item.color}
                    </span>
                    <input
                      type="number"
                      value={item.stock}
                      onFocus={(e) => e.target.value === "0" && e.target.select()}
                      onChange={(e) =>
                        handleActualizarStock(
                          producto.id,
                          item.talla,
                          item.color,
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="border rounded-lg p-1 w-20"
                    />
                    <button
                      onClick={() =>
                        handleEliminarCombinacion(
                          producto.id,
                          item.talla,
                          item.color
                        )
                      }
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
            </ul>

           {/* Agregar combinación */}
<div className="mt-4">
  <h4 className="font-semibold">Agregar Combinación</h4>
  <select
    value={nuevaCombinacion.talla}
    onChange={(e) =>
      setNuevaCombinacion({
        ...nuevaCombinacion,
        talla: e.target.value,
        idProducto: producto.id, // 🔥 aseguramos que siempre tenga producto
      })
    }
    className="border rounded-lg p-2"
  >
    {["S", "M", "L", "XL", "XXL"].map((t) => (
      <option key={t}>{t}</option>
    ))}
  </select>
  <select
    value={nuevaCombinacion.color}
    onChange={(e) =>
      setNuevaCombinacion({
        ...nuevaCombinacion,
        color: e.target.value,
        idProducto: producto.id, // 🔥
      })
    }
    className="border rounded-lg p-2 ml-2"
  >
    {coloresFijos.map((c) => (
      <option key={c.nombre}>{c.nombre}</option>
    ))}
  </select>
  <input
    type="number"
    value={nuevaCombinacion.stock}
    onFocus={(e) => e.target.value === "0" && e.target.select()}
    onChange={(e) => {
      const newStock = Math.max(0, parseInt(e.target.value) || 0);
      console.log("Nuevo stock:", newStock);
      setNuevaCombinacion({
        ...nuevaCombinacion,
        stock: newStock,
        idProducto: producto.id, // 🔥
      });
    }}
    min="0"
    className="border rounded-lg p-2 ml-2 w-20"
  />
  <button
    onClick={handleAgregarCombinacion}
    className={`ml-2 bg-green-600 text-white px-4 py-2 rounded-lg ${
      isAgregarCombinacionDisabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-green-700"
    }`}
    disabled={isAgregarCombinacionDisabled}
  >
    Añadir
  </button>
</div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventario;