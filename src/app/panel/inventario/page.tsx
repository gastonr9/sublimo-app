"use client";
//src/components/Inventario.tsx
import React, { useEffect, useState } from "react";
import {
  getProductos,
  addProducto,
  uploadStock,
  uploadProducto,
  deleteProducto,
  deleteCombinacion,
  getColoresFijos,
} from "../../services/inventario";
import { Producto, Color } from "../../types/types";
const Inventario: React.FC = () => {
  const [precio, setPrecio] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [coloresFijos, setColoresFijos] = useState<Color[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
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
      const productosData = await getProductos();
      setProductos(productosData);

      const coloresData = await getColoresFijos();
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
      await addProducto({
        ...nuevoProducto,
        precio: parseInt(nuevoProducto.precio, 10) || 0, // 🔥 siempre int
      });
      setProductos(await getProductos());
      setNuevoProducto({ nombre: "", precio: "", descripcion: "" }); // 🔥 reseteamos como string
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
      await uploadStock(idProducto, talla, color, cantidad);
      setProductos(await getProductos());
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAgregarCombinacion = async () => {
    try {
      if (!nuevaCombinacion.idProducto)
        throw new Error("Seleccione un producto");
      if (!nuevaCombinacion.color) throw new Error("Seleccione un color");
      await uploadStock(
        nuevaCombinacion.idProducto,
        nuevaCombinacion.talla,
        nuevaCombinacion.color,
        nuevaCombinacion.stock
      );
      setProductos(await getProductos());
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
        await uploadProducto(productoEditado.id, {
          nombre: productoEditado.nombre,
          precio: productoEditado.precio,
          descripcion: productoEditado.descripcion,
        });
        setProductos(await getProductos());
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
        await deleteProducto(id);
        setProductos(await getProductos());
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
      window.confirm(`¿Eliminar combinación Talla: ${talla}, Color: ${color}?`)
    ) {
      try {
        await deleteCombinacion(idProducto, talla, color);
        setProductos(await getProductos());
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
    !nuevoProducto.precio.trim() || // ahora sí funciona porque es string
    !nuevoProducto.descripcion.trim();

  const isAgregarCombinacionDisabled =
    nuevaCombinacion.stock <= 0 ||
    !nuevaCombinacion.talla ||
    !nuevaCombinacion.color ||
    !nuevaCombinacion.idProducto;

  return (
    <div className=" mx-auto p-4 ">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Inventario de Productos
      </h1>

      {/* Agregar producto */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Crear Producto
        </h2>
        <div className="gap-4 grid  ">
          <div className="gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={nuevoProducto.nombre}
              onChange={(e) =>
                setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
              }
              className="border rounded-lg p-2 slot"
            />
            <input
              type="number"
              placeholder="Precio"
              value={nuevoProducto.precio}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight" &&
                  e.key !== "Tab"
                ) {
                  e.preventDefault(); // ❌ ignora la tecla
                }
              }}
              onChange={(e) =>
                setNuevoProducto({ ...nuevoProducto, precio: e.target.value })
              }
              className="border p-2 rounded-lg slot"
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
              className="border rounded-lg p-2 sm:col-span-2 slot"
            />
          </div>
          <button
            onClick={handleAgregarProducto}
            className={`btn-green slot opacity-50 text-nowrap${
              isAgregarProductoDisabled ? " cursor-not-allowed" : ""
            }`}
            disabled={isAgregarProductoDisabled}
          >
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="space-y-6">
        {productos.map((producto) => (
          <div key={producto.id} className="bg-white shadow-md rounded-lg p-6">
            {editando[producto.id] ? (
              <div className=" ">
                <div className="contenedor">
                  <input
                    type="text"
                    value={productoEditado?.nombre || ""}
                    onChange={(e) =>
                      setProductoEditado({
                        ...productoEditado!,
                        nombre: e.target.value,
                      })
                    }
                    className="border rounded-lg p-2 slot"
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={nuevoProducto.precio}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight" &&
                        e.key !== "Tab"
                      ) {
                        e.preventDefault(); // ❌ ignora la tecla
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir enteros positivos
                      if (/^\d*$/.test(value)) {
                        setNuevoProducto({ ...nuevoProducto, precio: value });
                      }
                    }}
                    className="border rounded-lg p-2 slot"
                  />
                </div>

                <div className="contenedor my-4">
                  <input
                    type="text"
                    value={productoEditado?.descripcion || ""}
                    onChange={(e) =>
                      setProductoEditado({
                        ...productoEditado!,
                        descripcion: e.target.value,
                      })
                    }
                    className="border rounded-lg p-2 slot"
                  />
                  <button
                    onClick={handleGuardarEdicion}
                    className="btn-green slot"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => handleCancelarEdicion(producto.id)}
                    className="btn-red slot"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mt-6">
                  {producto.nombre}
                </h3>
                <div className="contenedor">
                  <div>
                    <p>Precio: ${producto.precio.toFixed(2)}</p>
                    <p>{producto.descripcion}</p>
                  </div>
                  <button
                    onClick={() => handleEditarProducto(producto)}
                    className="btn-blue slot"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarProducto(producto.id)}
                    className="btn-red slot"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}

            {/* Inventario */}
            <div>
              <h4 className="mt-6 mb-3 font-semibold">Inventario</h4>
              <div>
                <ul>
                  {[...producto.inventario]
                    .sort((a, b) => {
                      const ordenA =
                        tallaOrden[a.talla as keyof typeof tallaOrden];
                      const ordenB =
                        tallaOrden[b.talla as keyof typeof tallaOrden];
                      if (ordenA !== ordenB) return ordenA - ordenB;
                      return a.color.localeCompare(b.color);
                    })
                    .map((item, i) => (
                      <li
                        key={i}
                        className=" items-center gap-2 slot contenedor"
                      >
                        <span>
                          {item.talla} - {item.color}
                        </span>
                        <input
                          type="number"
                          value={item.stock}
                          onFocus={(e) =>
                            e.target.value === "0" && e.target.select()
                          }
                          onKeyDown={(e) => {
                            if (
                              !/[0-9]/.test(e.key) &&
                              e.key !== "Backspace" &&
                              e.key !== "Delete" &&
                              e.key !== "ArrowLeft" &&
                              e.key !== "ArrowRight" &&
                              e.key !== "Tab"
                            ) {
                              e.preventDefault(); // ❌ ignora la tecla
                            }
                          }}
                          onChange={(e) =>
                            handleActualizarStock(
                              producto.id,
                              item.talla,
                              item.color,
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          className="border rounded-lg   w-20 slot"
                        />
                        <button
                          onClick={() =>
                            handleEliminarCombinacion(
                              producto.id,
                              item.talla,
                              item.color
                            )
                          }
                          className="btn-red slot"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Agregar combinación */}
            <div>
              <h4 className="mt-6 mb-3 font-semibold">Agregar Combinación</h4>
              <div className="contenedor">
                <div>
                  <select
                    value={nuevaCombinacion.talla}
                    onChange={(e) =>
                      setNuevaCombinacion({
                        ...nuevaCombinacion,
                        talla: e.target.value,
                        idProducto: producto.id, // 🔥 aseguramos que siempre tenga producto
                      })
                    }
                    className="border rounded-lg p-2 slot"
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
                    className="border rounded-lg p-2 ml-2 slot"
                  >
                    {coloresFijos.map((c) => (
                      <option key={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={nuevaCombinacion.stock}
                    onFocus={(e) => e.target.value === "0" && e.target.select()}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight" &&
                        e.key !== "Tab"
                      ) {
                        e.preventDefault(); // ❌ ignora la tecla
                      }
                    }}
                    onChange={(e) => {
                      const newStock = Math.max(
                        0,
                        parseInt(e.target.value) || 0
                      );
                      console.log("Nuevo stock:", newStock);
                      setNuevaCombinacion({
                        ...nuevaCombinacion,
                        stock: newStock,
                        idProducto: producto.id, // 🔥
                      });
                    }}
                    min="0"
                    className="border rounded-lg  ml-2 w-20 slot"
                  />
                </div>

                <button
                  onClick={handleAgregarCombinacion}
                  className={`btn-green slot opacity-50 ${
                    isAgregarCombinacionDisabled ? " cursor-not-allowed" : ""
                  }`}
                  disabled={isAgregarCombinacionDisabled}
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventario;
