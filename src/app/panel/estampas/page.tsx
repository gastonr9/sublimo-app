// src/app/panel/estampas/page.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  listEstampasFromStorage,
  uploadEstampas,
  removeEstampasFromStorage,
} from "../../services/storage";
import {
  getEstampas,
  addEstampasMeta,
  updateEstampas,
  deleteEstampas,
} from "../../services/estampas";
import { supabase } from "../../../supabase/client";

interface StorageEstampas {
  name: string;
  url: string;
}

interface EstampasRow {
  id: string;
  nombre: string;
  imagen_url: string;
  stock: number;
  disponible: boolean;
}

type EditingState = {
  [id: string]: { nombre?: string; stock?: number };
};

// Implementación de la función `updateEstampas` para ser usada en el `onClick` del botón Quitar.
// Ya no es necesaria gracias a que se ha refactorizado a `updateEstampas(d.id, { disponible: false })`
// en el botón "Ocultar" de la sección Habilitadas, que es más limpio.

const Estampas: React.FC = () => {
  const [storageEstampas, setStorageEstampas] = useState<StorageEstampas[]>([]);
  const [estampasTable, setEstampasTable] = useState<EstampasRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<EditingState>({});

  const fetchAll = async () => {
    try {
      const [storage, table] = await Promise.all([
        listEstampasFromStorage(),
        getEstampas(),
      ]);
      setStorageEstampas(storage);
      setEstampasTable(table);
    } catch (err) {
      console.error("Error cargando estampas:", err);
      // Se eliminó la alerta aquí para no ser intrusivo en el fetch inicial
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // REALTIME
  useEffect(() => {
    const channel = supabase
      .channel("estampas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "estampas" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEstampasTable((prev) => [...prev, payload.new as EstampasRow]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as EstampasRow;
            setEstampasTable((prev) =>
              prev.map((e) => (e.id === updated.id ? updated : e))
            );
            setEditing((prev) => {
              const copy = { ...prev };
              delete copy[updated.id];
              return copy;
            });
          } else if (payload.eventType === "DELETE") {
            const oldId = payload.old?.id;
            if (oldId) {
              setEstampasTable((prev) => prev.filter((e) => e.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const estampasConMeta = storageEstampas
    .map((item) => {
      const meta = estampasTable.find((r) => r.imagen_url === item.url);
      return {
        ...item,
        id: meta?.id || null,
        stock: meta?.stock ?? 0,
        disponible: meta?.disponible ?? false,
        nombre: meta?.nombre || item.name.replace(/\.[^/.]+$/, ""),
      };
    })
    .sort((a, b) => Number(b.disponible) - Number(a.disponible));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const nueva = await uploadEstampas(file);
      // La tabla se actualizará automáticamente por el Realtime, pero el storage no,
      // así que actualizamos el storage localmente o volvemos a hacer fetch.
      // Aquí volvemos a hacer fetch para asegurar la consistencia.
      await addEstampasMeta(nueva.nombre, nueva.imagen_url);
      // Forzar un re-fetch para actualizar storageEstampas y estampasConMeta
      await fetchAll();
    } catch {
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleSelectEstampas = async (item: (typeof estampasConMeta)[0]) => {
    if (!item.id) {
      // Si no tiene meta, se añade la meta con 'disponible: true' por defecto.
      await addEstampasMeta(item.name, item.url);
    } else {
      // Si tiene meta, se invierte la disponibilidad.
      await updateEstampas(item.id, { disponible: !item.disponible });
    }
    // El realtime se encargará de actualizar el estado de estampasTable,
    // que a su vez refrescará estampasConMeta.
  };

  const handleUpdate = async (
    id: string,
    field: "nombre" | "stock",
    value: string | number
  ) => {
    const payload: Partial<EstampasRow> = {};
    if (field === "nombre")
      payload.nombre = value.toString().trim() || "Sin nombre";
    if (field === "stock")
      payload.stock = Math.max(0, parseInt(value.toString()) || 0);

    try {
      await updateEstampas(id, payload);
      // El realtime se encargará de actualizar estampasTable y borrar de editing
    } catch (err) {
      alert("Error al guardar");
      console.error(err);
      // Opcional: Revertir el estado de editing si la actualización falla.
      setEditing((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const handleDeleteEstampas = async (item: (typeof estampasConMeta)[0]) => {
    if (!confirm("¿Eliminar permanentemente esta imagen y todos sus datos?"))
      return;

    try {
      // Eliminar de Storage
      await removeEstampasFromStorage(item.name);
      // Eliminar de EstampasTable si existe
      if (item.id) {
        await deleteEstampas(item.id);
      }
      // Actualizar el estado de storageEstampas (para que el elemento desaparezca de la UI)
      setStorageEstampas((prev) => prev.filter((d) => d.name !== item.name));
      // El realtime se encargará de actualizar estampasTable si se eliminó el registro de la DB
    } catch (err) {
      alert("Error al eliminar estampa.");
      console.error("Error al eliminar estampa:", err);
    }
  };

  const estampasHabilitadas = estampasTable.filter((d) => d.disponible);

  return (
    <div className="p-6">
      {/* TÍTULO */}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Gestión de Estampas
      </h1>

      {/* TODAS LAS IMÁGENES */}
      <div className="bbg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Imágenes en Storage ({estampasConMeta.length})
          </h3>

          <div className="relative inline-block">
            <label
              htmlFor="upload-estampa"
              className={`
      btn-secondary px-6 py-3 rounded-lg font-medium transition
      ${
        uploading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
      }
    `}
            >
              {uploading ? "Subiendo..." : "Subir Nueva Imagen"}
            </label>

            <input
              id="upload-estampa"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {estampasConMeta.length > 0 ? (
            estampasConMeta.map((item) => (
              <div
                key={item.name}
                onClick={() => toggleSelectEstampas(item)}
                className="group relative cursor-pointer"
              >
                <div
                  className={`relative w-full h-32 border rounded-lg overflow-hidden cursor-pointer transition ${
                    item.disponible
                      ? "border-4 border-blue-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="w-full h-full object-contain p-1"
                    sizes=""
                  />

                  {/* Estado */}
                  <div className="absolute top-3 left-3 right-3">
                    <span
                      className={`text-xs px-2 py-1 slot btn-blue  ${
                        item.disponible ? "bg-indigo-600" : "bg-orange-600"
                      }`}
                    >
                      {item.disponible ? "ACTIVA" : "OCULTA"}
                    </span>
                  </div>

                  {/* Stock (Solo si tiene registro en la base de datos) */}
                  {item.id && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <span
                        className={` text-xs px-2 py-1 slot btn-blue ${
                          item.stock > 0
                            ? "bg-white text-indigo-700"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        Stock: {item.stock}
                      </span>
                    </div>
                  )}

                  {/* Botón Eliminar */}
                  <div className="absolute bottom-2  right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteEstampas(item); // Usar void para ignorar el Promise
                      }}
                      className="btn-red bg-red-600 text-xs px-2 py-1"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">
              No hay imágenes disponibles en storage
            </p>
          )}
        </div>
      </div>

      {/* ESTAMPAS HABILITADAS */}
      <div className=" bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Estampas Habilitadas ({estampasHabilitadas.length})
        </h3>

        {estampasHabilitadas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">
              No hay estampas habilitadas
            </p>
          </div>
        ) : (
          <div className="gap-6 flex flex-wrap">
            {estampasHabilitadas.map((d) => {
              const currentNombre = editing[d.id]?.nombre ?? d.nombre;
              const currentStock =
                editing[d.id]?.stock !== undefined
                  ? editing[d.id].stock
                  : d.stock;

              return (
                <div key={d.id} className="w-fit ">
                  <div
                    className={`flex gap-5 bg-white shadow-md rounded-lg p-4 relative${
                      d.stock > 0
                        ? "bg-gradient-to-br from-indigo-50 to-purple-50 ring-4 ring-indigo-400"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-gray-400 opacity-75"
                    }`}
                  >
                    <div>
                      <Image
                        src={d.imagen_url}
                        alt={d.nombre}
                        width={500}
                        height={500}
                        className="w-full h-40 object-contain"
                      />
                    </div>

                    <div className="grid">
                      {/* Nombre */}
                      <div className="celda">
                        <label className="label_name ">Nombre:</label>

                        <input
                          type="text"
                          value={currentNombre}
                          onChange={(e) => {
                            const nameWithoutExt = e.target.value.replace(
                              /\.[^/.]+$/,
                              ""
                            );
                            setEditing((prev) => ({
                              ...prev,
                              [d.id]: { ...prev[d.id], nombre: nameWithoutExt },
                            }));
                          }}
                          onBlur={() =>
                            handleUpdate(d.id, "nombre", currentNombre)
                          }
                          className=" border rounded-lg  slot"
                          placeholder="Nombre del diseño"
                        />
                      </div>

                      <div className=" ">
                        {/* Stock */}
                        <div className="celda">
                          <label className=" label_name ">Stock:</label>
                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => {
                              const val = Math.max(
                                0,
                                parseInt(e.target.value) || 0
                              );
                              setEditing((prev) => ({
                                ...prev,
                                [d.id]: { ...prev[d.id], stock: val },
                              }));
                            }}
                            onBlur={() =>
                              handleUpdate(
                                d.id,
                                "stock",
                                currentStock ?? d.stock
                              )
                            }
                            className={` slot border rounded-lg  ${
                              d.stock > 0
                                ? "text-indigo-700 border-indigo-400 focus:border-indigo-600"
                                : "text-red-700 border-red-400 focus:border-red-600 bg-red-50"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {d.stock === 0 && (
                          <div className="text-center">
                            <span className="text-gray-600 col-span-full text-center">
                              Sin stock — no visible
                            </span>
                          </div>
                        )}
                        <button
                          onClick={
                            () =>
                              void updateEstampas(d.id, { disponible: false }) // Usar void para ignorar el Promise
                          }
                          className="btn btn-orange  justify-self-end"
                        >
                          Ocultar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Estampas;
