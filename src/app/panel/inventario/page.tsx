// src/components/Inventario.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getProductos,
  addProducto,
  uploadStock,
  uploadProducto,
  deleteProducto,
  deleteCombinacion,
  getColoresFijos,
} from "../../services/inventario";
import { Producto, Color } from "../../types";
import { supabase } from "../../../supabase/client";

const Inventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [coloresFijos, setColoresFijos] = useState<Color[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
  });
  const [nuevaCombinacion, setNuevaCombinacion] = useState<{
    idProducto: string;
    talla: "S" | "M" | "L" | "XL" | "XXL";
    color: string;
    stock: number;
  }>({
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

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    try {
      const [prods, colores] = await Promise.all([
        getProductos(),
        getColoresFijos(),
      ]);
      setProductos(prods);
      setColoresFijos(colores);

      if (colores.length > 0 && !nuevaCombinacion.color) {
        setNuevaCombinacion((prev) => ({ ...prev, color: colores[0].nombre }));
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  }, [nuevaCombinacion.color]);

  // Carga inicial
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // REALTIME: escuchar cambios en productos e inventario
  useEffect(() => {
    const channel = supabase
      .channel("inventario-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        () => cargarDatos()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventario" },
        () => cargarDatos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cargarDatos]);

  const handleAgregarProducto = async () => {
    if (!nuevoProducto.nombre.trim() || !nuevoProducto.precio.trim()) return;
    try {
      await addProducto({
        nombre: nuevoProducto.nombre.trim(),
        precio: parseInt(nuevoProducto.precio) || 0,
        descripcion: nuevoProducto.descripcion.trim(),
      });
      setNuevoProducto({ nombre: "", precio: "", descripcion: "" });
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Error al crear producto");
      }
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

      const diferencia = nuevoStock - item.stock;
      if (diferencia === 0) return;

      await uploadStock(idProducto, talla, color, diferencia);
      // Realtime se encarga de actualizar
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Error actualizando stock");
      }
    }
  };

  const handleAgregarCombinacion = async () => {
    if (
      !nuevaCombinacion.idProducto ||
      nuevaCombinacion.stock <= 0 ||
      !nuevaCombinacion.color
    )
      return;

    try {
      await uploadStock(
        nuevaCombinacion.idProducto,
        nuevaCombinacion.talla,
        nuevaCombinacion.color,
        nuevaCombinacion.stock
      );
      setNuevaCombinacion((prev) => ({
        ...prev,
        stock: 0,
        talla: "S",
        color: coloresFijos[0]?.nombre || "",
      }));
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Error agregando combinación");
      }
    }
  };

  const handleGuardarEdicion = async () => {
    if (!productoEditado) return;
    try {
      await uploadProducto(productoEditado.id, {
        nombre: productoEditado.nombre.trim(),
        precio: productoEditado.precio,
        descripcion: productoEditado.descripcion.trim(),
      });
      setEditando((prev) => ({ ...prev, [productoEditado.id]: false }));
      setProductoEditado(null);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Error guardando cambios");
      }
    }
  };

  const handleEliminarProducto = async (id: string) => {
    if (
      !confirm(
        "¿Seguro que querés eliminar este producto y todo su inventario?"
      )
    )
      return;
    try {
      await deleteProducto(id);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Error eliminando producto");
      }
    }
  };

  const handleEliminarCombinacion = async (
    idProducto: string,
    talla: string,
    color: string
  ) => {
    if (!confirm(`¿Eliminar combinación ${talla} - ${color}?`)) return;
    try {
      await deleteCombinacion(idProducto, talla, color);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Error eliminando combinación");
      }
    }
  };

  const tallaOrden = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Gestión de Inventario
      </h1>

      {/* Crear Producto */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Crear Nuevo Producto
        </h2>
        <div className="gap-4 grid ">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nuevoProducto.nombre}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, nombre: e.target.value }))
            }
            className="border rounded-lg  slot"
          />
          <input
            type="number"
            placeholder="Precio"
            value={nuevoProducto.precio}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, precio: e.target.value }))
            }
            className="border rounded-lg  slot"
          />
          <input
            type="text"
            placeholder="Descripción"
            value={nuevoProducto.descripcion}
            onChange={(e) =>
              setNuevoProducto((prev) => ({
                ...prev,
                descripcion: e.target.value,
              }))
            }
            className="border rounded-lg slot"
          />
          <button
            onClick={handleAgregarProducto}
            disabled={!nuevoProducto.nombre || !nuevoProducto.precio}
            className="btn-secondary slottransition transform  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear Producto
          </button>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="space-y-6">
        {productos.map((producto) => (
          <div key={producto.id} className="bg-white shadow-md rounded-lg p-6">
            {/* Header del producto */}
            <div className="flex justify-between">
              {editando[producto.id] ? (
                <div className="contenedor">
                  <input
                    type="text"
                    value={productoEditado?.nombre || ""}
                    onChange={(e) =>
                      setProductoEditado((prev) =>
                        prev ? { ...prev, nombre: e.target.value } : null
                      )
                    }
                    className="border rounded-lg p-2 slot"
                  />
                  <input
                    type="number"
                    value={productoEditado?.precio || 0}
                    onChange={(e) =>
                      setProductoEditado((prev) =>
                        prev
                          ? {
                              ...prev,
                              precio: parseInt(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                    className="border rounded-lg p-2 slot"
                  />
                  <input
                    type="text"
                    value={productoEditado?.descripcion || ""}
                    onChange={(e) =>
                      setProductoEditado((prev) =>
                        prev ? { ...prev, descripcion: e.target.value } : null
                      )
                    }
                    className="border rounded-lg p-2 slot"
                  />
                  <div className="contenedor">
                    <button
                      onClick={handleGuardarEdicion}
                      className="btn-green slot"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditando((prev) => ({
                          ...prev,
                          [producto.id]: false,
                        }));
                        setProductoEditado(null);
                      }}
                      className="btn-red slot"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="">
                    <h3 className="text-lg font-semibold mt-6">
                      Articulo: {producto.nombre}
                    </h3>{" "}
                    {producto.descripcion && (
                      <p className="text-lg text-gray-600 mt-2">
                        Descripción: {producto.descripcion}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-gray-700 mt-2">
                      ${producto.precio.toFixed(2)}
                    </p>
                  </div>
                  <div className="contenedor flex-col gap-6">
                    <button
                      onClick={() => {
                        setEditando((prev) => ({
                          ...prev,
                          [producto.id]: true,
                        }));
                        setProductoEditado({
                          id: producto.id,
                          nombre: producto.nombre,
                          descripcion: producto.descripcion || "",
                          precio: producto.precio,
                        });
                      }}
                      className="btn-yellow slot "
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarProducto(producto.id)}
                      className="btn-red slot"
                    >
                      Eliminar Producto
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-around m-10">
              {/* Agregar combinación */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl ">
                <h4 className="tmt-6 mb-3 font-semibold">
                  Agregar Nueva Combinación
                </h4>
                <div className="contenedor">
                  <select
                    value={nuevaCombinacion.talla}
                    onChange={(e) =>
                      setNuevaCombinacion((prev) => ({
                        ...prev,
                        talla: e.target.value as "S" | "M" | "L" | "XL" | "XXL",
                        idProducto: producto.id,
                      }))
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
                      setNuevaCombinacion((prev) => ({
                        ...prev,
                        color: e.target.value,
                        idProducto: producto.id,
                      }))
                    }
                    className="pborder rounded-lg p-2 ml-2 slot"
                  >
                    {coloresFijos.map((c) => (
                      <option key={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={nuevaCombinacion.stock}
                    onChange={(e) =>
                      setNuevaCombinacion((prev) => ({
                        ...prev,
                        stock: parseInt(e.target.value) || 0,
                        idProducto: producto.id,
                      }))
                    }
                    placeholder="Stock"
                    className="border rounded-lg  ml-2 w-20 slot"
                    min="1"
                  />

                  <button
                    onClick={handleAgregarCombinacion}
                    disabled={
                      nuevaCombinacion.stock < 1 || !nuevaCombinacion.color
                    }
                    className="btn-green slot"
                  >
                    Agregar Stock
                  </button>
                </div>
              </div>
              {/* Inventario actual */}
              <div className="mb-10">
                <h4 className="mb-3 font-semibold">Stock Actual</h4>
                <div className="">
                  {[...producto.inventario]
                    .sort((a, b) => {
                      const oa =
                        tallaOrden[a.talla as keyof typeof tallaOrden] ?? 99;
                      const ob =
                        tallaOrden[b.talla as keyof typeof tallaOrden] ?? 99;
                      return oa - ob || a.color.localeCompare(b.color);
                    })
                    .map((item) => (
                      <div
                        key={`${item.talla}-${item.color}`}
                        className="items-center gap-2  contenedor"
                      >
                        <div className="">
                          <span className="text-xl font-bold">
                            {item.talla}
                          </span>
                          <span className="text-lg font-bold"> - </span>
                          <span className="text-lg font-bold">
                            {item.color}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) =>
                            handleActualizarStock(
                              producto.id,
                              item.talla,
                              item.color,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="border rounded-lg  ml-2 w-20 slot"
                          min="0"
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
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventario;
