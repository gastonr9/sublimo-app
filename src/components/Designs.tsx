import React, { useEffect, useState } from "react";
import {
  getDesigns,
  addDesign,
  updateDesign,
  deleteDesign,
  uploadDesignImage,
  Design,
} from "../services/designs";

const Designs: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [newDesign, setNewDesign] = useState({ nombre: "", imagen_url: "", stock: 0 });
  const [file, setFile] = useState<File | null>(null);

  // Cargar diseños
  useEffect(() => {
    const fetchDesigns = async () => {
      const data = await getDesigns();
      setDesigns(data);
    };
    fetchDesigns();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Selecciona una imagen primero");
    try {
      const imageUrl = await uploadDesignImage(file);
      await addDesign({ ...newDesign, imagen_url: imageUrl });
      setDesigns(await getDesigns());
      setNewDesign({ nombre: "", imagen_url: "", stock: 0 });
      setFile(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar este diseño?")) {
      await deleteDesign(id);
      setDesigns(await getDesigns());
    }
  };

  const handleUpdateStock = async (id: string, stock: number) => {
    await updateDesign(id, { stock });
    setDesigns(await getDesigns());
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Diseños</h1>

      {/* Subir diseño */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Agregar nuevo diseño</h2>
        <input
          type="text"
          placeholder="Nombre del diseño"
          value={newDesign.nombre}
          onChange={(e) => setNewDesign({ ...newDesign, nombre: e.target.value })}
          className="border rounded-lg p-2 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Stock inicial"
          value={newDesign.stock}
          onChange={(e) => setNewDesign({ ...newDesign, stock: parseInt(e.target.value) || 0 })}
          className="border rounded-lg p-2 mb-2 w-full"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Subir Diseño
        </button>
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
