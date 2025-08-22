import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Diseno {
  id: string;
  nombre: string;
  imagen_url: string;
}

interface StockDiseno {
  id: string;
  diseno_id: string;
  stock: number;
  talla?: string;
  color?: string;
}

const Designs: React.FC = () => {
  const [disenos, setDesigns] = useState<Diseno[]>([]);
  const [stocks, setStocks] = useState<StockDiseno[]>([]);
  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [nuevoStock, setNuevoStock] = useState({ disenoId: "", stock: 0 });

  // === Cargar diseños y stocks ===
  useEffect(() => {
    obtenerDesigns();
    obtenerStock();
  }, []);

  const obtenerDesigns = async () => {
    const { data, error } = await supabase.from("disenos").select("*");
    if (error) console.error(error);
    else setDesigns(data);
  };

  const obtenerStock = async () => {
    const { data, error } = await supabase.from("stock_disenos").select("*");
    if (error) console.error(error);
    else setStocks(data);
  };

  // === Subir diseño ===
  const handleSubirDiseno = async () => {
    if (!archivo) return alert("Selecciona un archivo");
    const nombreArchivo = `${Date.now()}-${archivo.name}`;

    // Subir al bucket
    const { error: uploadError } = await supabase.storage
      .from("disenos")
      .upload(nombreArchivo, archivo);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("disenos")
      .getPublicUrl(nombreArchivo);

    // Guardar en tabla disenos
    const { error: insertError } = await supabase.from("disenos").insert([
      { nombre, imagen_url: urlData.publicUrl },
    ]);

    if (insertError) console.error(insertError);
    else {
      setNombre("");
      setArchivo(null);
      obtenerDesigns();
    }
  };

  // === Eliminar diseño ===
  const handleEliminarDiseno = async (id: string, url: string) => {
    if (!window.confirm("¿Eliminar este diseño?")) return;

    // Extraer nombre del archivo desde la URL
    const fileName = url.split("/").pop();
    if (fileName) {
      await supabase.storage.from("disenos").remove([fileName]);
    }

    await supabase.from("disenos").delete().eq("id", id);
    obtenerDesigns();
  };

  // === Añadir stock ===
  const handleAgregarStock = async () => {
    if (!nuevoStock.disenoId || nuevoStock.stock <= 0) return;

    const { error } = await supabase.from("stock_disenos").insert([
      {
        diseno_id: nuevoStock.disenoId,
        stock: nuevoStock.stock,
      },
    ]);

    if (error) console.error(error);
    else {
      setNuevoStock({ disenoId: "", stock: 0 });
      obtenerStock();
    }
  };

  // === Eliminar stock ===
  const handleEliminarStock = async (id: string) => {
    if (!window.confirm("¿Eliminar este stock?")) return;
    await supabase.from("stock_disenos").delete().eq("id", id);
    obtenerStock();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Diseños</h1>

      {/* Subir diseño */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Subir nuevo diseño</h2>
        <input
          type="text"
          placeholder="Nombre del diseño"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border rounded p-2 mr-2"
        />
        <input
          type="file"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          className="border p-2 mr-2"
        />
        <button
          onClick={handleSubirDiseno}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Subir
        </button>
      </div>

      {/* Listado de diseños */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {disenos.map((d) => (
          <div key={d.id} className="bg-white p-2 shadow rounded">
            <img
              src={d.imagen_url}
              alt={d.nombre}
              className="w-full h-32 object-contain"
            />
            <p className="mt-2 text-center">{d.nombre}</p>
            <button
              onClick={() => handleEliminarDiseno(d.id, d.imagen_url)}
              className="bg-red-600 text-white px-2 py-1 rounded mt-2 w-full"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Gestionar stock */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Asignar stock a un diseño</h2>
        <select
          value={nuevoStock.disenoId}
          onChange={(e) =>
            setNuevoStock({ ...nuevoStock, disenoId: e.target.value })
          }
          className="border rounded p-2 mr-2"
        >
          <option value="">Selecciona un diseño</option>
          {disenos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Stock"
          value={nuevoStock.stock}
          onChange={(e) =>
            setNuevoStock({ ...nuevoStock, stock: parseInt(e.target.value) || 0 })
          }
          className="border rounded p-2 mr-2 w-24"
        />
        <button
          onClick={handleAgregarStock}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Añadir Stock
        </button>

        {/* Listado de stock */}
        <ul className="mt-4">
          {stocks.map((s) => {
            const diseno = disenos.find((d) => d.id === s.diseno_id);
            return (
              <li
                key={s.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>
                  {diseno?.nombre} → Stock: {s.stock}
                </span>
                <button
                  onClick={() => handleEliminarStock(s.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Designs;
