// src/app/panel/estampas/page.tsx
"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  listEstampasFromStorage,
  uploadEstampas, // 👈 corregido
  removeEstampasFromStorage,
} from "../../services/storage";
import {
  getEstampas,
  addEstampasMeta,
  updateEstampas,
  deleteEstampas,
} from "../../services/estampas";

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

const Estampas: React.FC = () => {
  const [storageEstampas, setStorageEstampas] = useState<StorageEstampas[]>([]);
  const [estampasTable, setEstampasTable] = useState<EstampasRow[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [storage, table] = await Promise.all([
        listEstampasFromStorage(),
        getEstampas(),
      ]);
      setStorageEstampas(storage);
      setEstampasTable(table);
    } catch (err) {
      console.error("Error al traer estampas:", err);
      alert("❌ Error al cargar estampas.");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      try {
        const file = files[0];
        const newestampas = await uploadEstampas(file);
        setEstampasTable((prev) => [...prev, newestampas]);
        setStorageEstampas((prev) => [
          ...prev,
          { name: newestampas.nombre, url: newestampas.imagen_url },
        ]);
      } catch (err) {
        console.error("Error al subir estampa:", err);
        alert("❌ Error al subir estampa.");
      } finally {
        setUploading(false);
        event.target.value = ""; // reset input
      }
    }
  };

  const toggleSelectEstampas = async (storageEstampas: StorageEstampas) => {
    const designRow = estampasTable.find(
      (d) => d.imagen_url === storageEstampas.url
    );
    if (!designRow) {
      try {
        const newestampas = await addEstampasMeta(
          storageEstampas.name,
          storageEstampas.url
        );
        setEstampasTable((prev) => [...prev, newestampas]);
      } catch (err) {
        console.error("Error al añadir estampa:", err);
        alert("❌ Error al seleccionar estampa.");
      }
      return;
    }

    try {
      const newDisponible = !designRow.disponible;
      const updatedEstampas = await updateEstampas(designRow.id, {
        disponible: newDisponible,
      });
      setEstampasTable((prev) =>
        prev.map((d) => (d.id === designRow.id ? updatedEstampas : d))
      );
    } catch (err) {
      console.error("Error al actualizar selección:", err);
      alert("❌ Error al cambiar estado de selección.");
    }
  };

  const handleUpdate = async (
    id: string,
    field: "nombre" | "stock",
    value: string | number
  ) => {
    try {
      let updatedValue = value;
      if (field === "nombre") {
        const nameWithoutExt = value.toString().replace(/\.[^/.]+$/, "");
        updatedValue = nameWithoutExt || "Sin nombre";
      } else if (field === "stock") {
        updatedValue = Math.max(0, parseInt(value.toString()) || 0);
      }
      await updateEstampas(id, { [field]: updatedValue });
      setEstampasTable(await getEstampas());
    } catch (err) {
      console.error(`Error actualizando ${field}:`, err);

      let mensaje = "Error desconocido";
      if (err instanceof Error) {
        mensaje = err.message;
      }

      alert(
        `❌ Error al actualizar ${
          field === "nombre" ? "nombre" : "stock"
        }: ${mensaje}`
      );
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const updatedEstampas = await updateEstampas(id, { disponible: false });
      setEstampasTable((prev) =>
        prev.map((d) => (d.id === id ? updatedEstampas : d))
      );
    } catch (err) {
      console.error("Error al quitar estampa:", err);
      alert("❌ Error al quitar estampa.");
    }
  };

  const handleDeleteEstampas = async (storageEstampas: StorageEstampas) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta imagen y su registro? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const designRow = estampasTable.find(
        (d) => d.imagen_url === storageEstampas.url
      );
      if (designRow) {
        await removeEstampasFromStorage(storageEstampas.name);
        await deleteEstampas(designRow.id);
        setStorageEstampas((prev) =>
          prev.filter((d) => d.name !== storageEstampas.name)
        );
        setEstampasTable((prev) => prev.filter((d) => d.id !== designRow.id));
      }
    } catch (err) {
      console.error("Error al eliminar estampa:", err);
      alert("❌ Error al eliminar estampa.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Estampas</h2>

      {/* Contenedor superior → Imágenes de Storage */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Imágenes Disponibles en Storage
          </h3>
          <label className="btn-yellow slot">
            {uploading ? "Subiendo..." : "Cargar Imagen"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {storageEstampas.length > 0 ? (
            storageEstampas
              .map((design) => {
                const designRow = estampasTable.find(
                  (d) => d.imagen_url === design.url
                );
                return { ...design, ...(designRow || {}) }; // 👈 seguro
              })
              .sort((a, b) => {
                if (a.disponible !== b.disponible) return a.disponible ? -1 : 1;
                return (b.stock || 0) - (a.stock || 0);
              })
              .map((design) => {
                const isDisponible = design.disponible || false;
                return (
                  <div
                    key={design.name}
                    className={`relative w-full h-32 border rounded-lg overflow-hidden cursor-pointer transition ${
                      isDisponible
                        ? "border-4 border-blue-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => toggleSelectEstampas(design)}
                  >
                    <Image
                      src={design.url}
                      alt={design.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain p-1"
                    />
                    {isDisponible && (
                      <button
                        onClick={(e) => e.stopPropagation()} // 👈 evita doble toggle
                        className="absolute top-1 right-1 text-xs px-2 py-1 slot btn-blue"
                      >
                        Seleccionado
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEstampas(design);
                      }}
                      className="btn-red slot absolute bottom-1 left-1 text-xs px-2 py-1"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })
          ) : (
            <p className="text-gray-600 col-span-full text-center">
              No hay estampas disponibles en storage
            </p>
          )}
        </div>
      </div>

      {/* Contenedor inferior → estampas seleccionados */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Estampas Seleccionados
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {estampasTable.filter((d) => d.disponible).length > 0 ? (
            estampasTable
              .filter((d) => d.disponible)
              .map((design) => (
                <div
                  key={design.id}
                  className="bg-white shadow-md rounded-lg p-4 relative"
                >
                  <Image
                    src={design.imagen_url}
                    alt={design.nombre}
                    width={160}
                    height={160}
                    className="w-full h-40 object-contain"
                  />
                  <input
                    type="text"
                    value={design.nombre}
                    onChange={(e) => {
                      const nameWithoutExt = e.target.value.replace(
                        /\.[^/.]+$/,
                        ""
                      );
                      setEstampasTable((prev) =>
                        prev.map((d) =>
                          d.id === design.id
                            ? { ...d, nombre: nameWithoutExt }
                            : d
                        )
                      );
                    }}
                    onBlur={(e) =>
                      handleUpdate(design.id, "nombre", e.target.value)
                    }
                    className="my-2 border rounded-lg w-full slot"
                    placeholder="Nombre (sin extensión)"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={design.stock}
                      onChange={(e) => {
                        const newValue = Math.max(
                          0,
                          parseInt(e.target.value) || 0
                        );
                        setEstampasTable((prev) =>
                          prev.map((d) =>
                            d.id === design.id ? { ...d, stock: newValue } : d
                          )
                        );
                      }}
                      onBlur={(e) =>
                        handleUpdate(
                          design.id,
                          "stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="border rounded-lg w-24 slot"
                    />
                    <button
                      onClick={() => handleRemove(design.id)}
                      className="btn-red slot"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">
              No hay estampas seleccionados
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Estampas;
