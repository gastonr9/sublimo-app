import React, { useEffect, useState } from "react";
import {
  getStorageDesigns,
  getDesigns,
  uploadToStorage,
  addToStock,
  updateDesign,
  removeFromStock,
} from "../services/designs";
import { supabase } from "../lib/supabaseClient";

interface Design {
  id: string;
  nombre: string;
  imagen_url: string;
  stock: number;
}
const { data, error } = await supabase.storage.from("designs").list();
console.log("Storage files:", data);
const Designs: React.FC = () => {
  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStorage();
    fetchDesigns();
  }, []);

  const fetchStorage = async () => {
    try {
      const data = await getStorageDesigns();
      setStorageFiles(data);
    } catch (err) {
      console.error("Error trayendo storage:", err);
    }
  };

  const fetchDesigns = async () => {
    try {
      const data = await getDesigns();
      setDesigns(data);
    } catch (err) {
      console.error("Error trayendo diseños:", err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploading(true);
      const file = event.target.files[0];
      await uploadToStorage(file);
      await fetchStorage();
    } catch (err) {
      console.error("Error subiendo archivo:", err);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Al clickear un archivo del storage
  const handleToggleStock = async (file: any) => {
    try {
      const { data: publicUrlData } = supabase.storage
        .from("designs")
        .getPublicUrl(file.name);

      // Ver si ya está en stock
      const enStock = designs.find((d) => d.nombre === file.name);

      if (enStock) {
        // Si está en stock -> quitarlo
        await removeFromStock(enStock.id);
      } else {
        // Si no está -> agregarlo
        await addToStock(file.name, publicUrlData.publicUrl);
      }

      await fetchDesigns();
    } catch (err) {
      console.error("Error alternando stock:", err);
    }
  };

  const handleUpdateStock = async (id: string, stock: number) => {
    try {
      await updateDesign(id, { stock });
      await fetchDesigns();
    } catch (err) {
      console.error("Error actualizando stock:", err);
    }
  };

  const handleUpdateName = async (id: string, nombre: string) => {
    try {
      await updateDesign(id, { nombre });
      await fetchDesigns();
    } catch (err) {
      console.error("Error actualizando nombre:", err);
    }
  };


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Diseños</h2>

      {/* Contenedor superior (storage) */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg mb-6">
        {storageFiles.map((file) => {
          const enStock = designs.some((d) => d.nombre === file.name);
          return (
            <div
              key={file.id || file.name}
              onClick={() => handleToggleStock(file)}
              className={`relative w-24 h-24 border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 ${
                enStock ? "border-2 border-blue-500" : ""
              }`}
            >
           <img
  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/designs/${file.name}`}
  alt={file.name}
  className="w-full h-full object-contain p-1"
/>

            </div>
          );
        })}

        {/* Botón de subir imagen */}
        <label className="w-24 h-24 border-2 border-dashed flex items-center justify-center text-xl text-gray-500 rounded-lg cursor-pointer">
          {uploading ? "..." : "+"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Lista de diseños (stock en tabla) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {designs.map((design) => (
          <div key={design.id} className="bg-white shadow-md rounded-lg p-4">
            <img
              src={design.imagen_url}
              alt={design.nombre}
              className="w-full h-40 object-contain"
            />
            <input
              type="text"
              value={design.nombre}
              onChange={(e) => handleUpdateName(design.id, e.target.value)}
              className="border rounded-lg p-1 w-full mt-2"
            />
            <input
              type="number"
              value={design.stock}
              onChange={(e) =>
                handleUpdateStock(design.id, parseInt(e.target.value) || 0)
              }
              className="border rounded-lg p-1 w-20 mt-2"
            />
            <button
              onClick={() => handleToggleStock({ name: design.nombre })}
              className="mt-2 bg-red-600 text-white px-4 py-1 rounded-lg"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Designs;
