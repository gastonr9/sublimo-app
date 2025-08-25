import React, { useEffect, useState } from "react";
import { getDesigns, addDesign, deleteDesign } from "../services/designs";

interface Design {
  id: string;
  nombre: string;
  imagen_url: string;
  stock: number;
}

const Designs: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const data = await getDesigns();
      setDesigns(data);
    } catch (err) {
      console.error("Error al traer diseños:", err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploading(true);
      const file = event.target.files[0];
      await addDesign(file);
      await fetchDesigns();
    } catch (err) {
      console.error("Error subiendo diseño:", err);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id: string, imagenUrl: string) => {
    try {
      // sacar el nombre del archivo desde la url
      const filePath = imagenUrl.split("/").pop();
      if (!filePath) return;

      await deleteDesign(id, `designs/${filePath}`);
      await fetchDesigns();
    } catch (err) {
      console.error("Error eliminando diseño:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Diseños</h2>

      {/* Contenedor superior */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg mb-6">
        {designs.map((design) => (
          <div
            key={design.id}
            className="relative w-24 h-24 border rounded-lg overflow-hidden group"
          >
            {/* Imagen */}
            <img
              src={design.imagen_url}
              alt={design.nombre}
              className="w-full h-full object-contain p-1"
            />

            {/* Botón eliminar */}
            <button
              onClick={() => handleDelete(design.id, design.imagen_url)}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs p-1 rounded opacity-80 hover:opacity-100 hidden group-hover:block"
              title="Eliminar diseño"
            >
              ✕
            </button>
          </div>
        ))}

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

      {/* Lista de diseños */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {designs.map((design) => (
          <div key={design.id} className="bg-white shadow-md rounded-lg p-4">
            <img src={design.imagen_url} alt={design.nombre} className="w-full h-40 object-contain" />
            <h3 className="text-lg font-semibold mt-2">{design.nombre}</h3>
            <p>Stock: {design.stock}</p>
            <input
              type="number"
              value={design.stock}
              onChange={(e) => handleUpdateStock(design.id, parseInt(e.target.value) || 0)}
              className="border rounded-lg p-1 w-20"
            />
            <button
              onClick={() => handleDelete(design.id)}
              className="mt-2 bg-red-600 text-white px-4 py-1 rounded-lg"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Designs;
