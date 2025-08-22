import React, { useEffect, useState } from "react";
import { getDesigns, addDesign } from "../services/designs";

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
      await fetchDesigns(); // refrescar después de subir
    } catch (err) {
      console.error("Error subiendo diseño:", err);
    } finally {
      setUploading(false);
      event.target.value = ""; // reset input
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
            className="relative w-24 h-24 border rounded-lg overflow-hidden"
          >
            <img
              src={design.imagen_url}
              alt={design.nombre}
              className="w-full h-full object-contain p-1"
            />
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
    </div>
  );
};

export default Designs;
