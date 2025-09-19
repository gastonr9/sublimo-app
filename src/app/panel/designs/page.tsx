"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  listDesignsFromStorage,
  uploadDesign,
  removeDesignFromStorage,
} from "../../services/storage";
import {
  getDesigns,
  addDesignMeta,
  updateDesign,
  deleteDesign,
} from "../../services/designs";

interface StorageDesign {
  name: string;
  url: string;
}

interface DesignRow {
  id: string;
  nombre: string;
  imagen_url: string;
  stock: number;
  selected: boolean;
}

const Designs: React.FC = () => {
  const [storageDesigns, setStorageDesigns] = useState<StorageDesign[]>([]);
  const [designsTable, setDesignsTable] = useState<DesignRow[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [storage, table] = await Promise.all([
        listDesignsFromStorage(),
        getDesigns(),
      ]);
      setStorageDesigns(storage);
      setDesignsTable(table);
    } catch (err) {
      console.error("Error al traer diseños:", err);
      alert("❌ Error al cargar diseños.");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      try {
        const file = files[0];
        const newDesign = await uploadDesign(file);
        setDesignsTable((prev) => [...prev, newDesign]);
        setStorageDesigns((prev) => [
          ...prev,
          { name: newDesign.nombre, url: newDesign.imagen_url },
        ]);
      } catch (err) {
        console.error("Error al subir diseño:", err);
        alert("❌ Error al subir diseño.");
      } finally {
        setUploading(false);
        event.target.value = ""; // reset input
      }
    }
  };

  const toggleSelectDesign = async (storageDesign: StorageDesign) => {
    const designRow = designsTable.find(
      (d) => d.imagen_url === storageDesign.url
    );
    if (!designRow) {
      try {
        const newDesign = await addDesignMeta(
          storageDesign.name,
          storageDesign.url
        );
        setDesignsTable((prev) => [...prev, newDesign]);
      } catch (err) {
        console.error("Error al añadir diseño:", err);
        alert("❌ Error al seleccionar diseño.");
      }
      return;
    }

    try {
      const newSelected = !designRow.selected;
      const updatedDesign = await updateDesign(designRow.id, {
        selected: newSelected,
      });
      setDesignsTable((prev) =>
        prev.map((d) => (d.id === designRow.id ? updatedDesign : d))
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
        updatedValue = Math.max(0, parseInt(value.toString()) || 0); // Ensure non-negative
      }
      await updateDesign(id, { [field]: updatedValue });
      setDesignsTable(await getDesigns()); // Refresh from DB
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
      const updatedDesign = await updateDesign(id, { selected: false });
      setDesignsTable((prev) =>
        prev.map((d) => (d.id === id ? updatedDesign : d))
      );
    } catch (err) {
      console.error("Error al quitar diseño:", err);
      alert("❌ Error al quitar diseño.");
    }
  };

  const handleDeleteDesign = async (storageDesign: StorageDesign) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta imagen y su registro? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const designRow = designsTable.find(
        (d) => d.imagen_url === storageDesign.url
      );
      if (designRow) {
        await removeDesignFromStorage(storageDesign.name);
        await deleteDesign(designRow.id);
        setStorageDesigns((prev) =>
          prev.filter((d) => d.name !== storageDesign.name)
        );
        setDesignsTable((prev) => prev.filter((d) => d.id !== designRow.id));
      }
    } catch (err) {
      console.error("Error al eliminar diseño:", err);
      alert("❌ Error al eliminar diseño.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Diseños</h2>

      {/* Contenedor superior → Imágenes de Storage */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Imágenes Disponibles en Storage
          </h3>
          <label className="btn-blue">
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
          {storageDesigns.length > 0 ? (
            storageDesigns
              .map((design) => {
                const designRow = designsTable.find(
                  (d) => d.imagen_url === design.url
                );
                return { ...design, ...designRow };
              })
              .sort((a, b) => {
                if (a.selected !== b.selected) return a.selected ? -1 : 1;
                return (b.stock || 0) - (a.stock || 0);
              })
              .map((design) => {
                const isSelected = design.selected || false;
                return (
                  <div
                    key={design.name}
                    className={`relative w-full h-32 border rounded-lg overflow-hidden cursor-pointer transition ${
                      isSelected
                        ? "border-4 border-blue-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => toggleSelectDesign(design)}
                  >
                    <Image
                      src={design.url}
                      alt={design.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain p-1"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Seleccionado
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDesign(design);
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
              No hay diseños disponibles en storage
            </p>
          )}
        </div>
      </div>

      {/* Contenedor inferior → Diseños seleccionados */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Diseños Seleccionados
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {designsTable.filter((d) => d.selected).length > 0 ? (
            designsTable
              .filter((d) => d.selected)
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
                      setDesignsTable((prev) =>
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
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const newValue = Math.max(
                          0,
                          parseInt(e.target.value) || 0
                        );
                        handleUpdate(design.id, "stock", newValue);
                      }}
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
              No hay diseños seleccionados
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Designs;
