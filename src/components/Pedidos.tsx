import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Pedido {
  id: string;
  nombre: string;
  apellido: string;
  estado: string;
  fecha: string;
  inventario_id: string;
  diseno_id: string;
  producto_nombre?: string;
  talla?: string;
  color?: string;
  diseno_nombre?: string;
  diseno_url?: string;
}

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("pedidos")
        .select(
          `
          id,
          nombre,
          apellido,
          estado,
          fecha,
          inventario_id,
          diseno_id,
          inventario:inventario_id (
            talla,
            color,
            producto:producto_id ( nombre )
          ),
          diseno:diseno_id (
            nombre,
            imagen_url
          )
        `
        )
        .order("fecha", { ascending: false });

      if (error) throw error;

      const mapped = data.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        estado: p.estado,
        fecha: p.fecha,
        inventario_id: p.inventario_id,
        diseno_id: p.diseno_id,
        producto_nombre: p.inventario?.producto?.nombre || "",
        talla: p.inventario?.talla || "",
        color: p.inventario?.color || "",
        diseno_nombre: p.diseno?.nombre || "",
        diseno_url: p.diseno?.imagen_url || "",
      }));

      setPedidos(mapped);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEstado = async (id: string, newEstado: string) => {
    try {
      const { error } = await supabase.rpc("alterar_estado_pedido", {
        p_id: id,
        p_new_estado: newEstado,
      });

      if (error) throw error;

      await fetchPedidos();
      alert(`Pedido actualizado a ${newEstado}`);
    } catch (err) {
      console.error("Error:", err);
      alert("❌ No se pudo actualizar el pedido.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Pedidos</h2>

      {loading ? (
        <p>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p>No hay pedidos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white border rounded-lg shadow-md p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">
                  {pedido.nombre} {pedido.apellido}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    pedido.estado === "pendiente"
                      ? "bg-yellow-200 text-yellow-800"
                      : pedido.estado === "realizado"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {pedido.estado}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-1">
                Producto: {pedido.producto_nombre}
              </p>
              <p className="text-sm text-gray-600 mb-1">Talle: {pedido.talla}</p>
              <p className="text-sm text-gray-600 mb-1">Color: {pedido.color}</p>
              <p className="text-sm text-gray-600 mb-1">
                Diseño: {pedido.diseno_nombre}
              </p>

              {pedido.diseno_url && (
                <img
                  src={pedido.diseno_url}
                  alt={pedido.diseno_nombre}
                  className="w-24 h-24 object-contain mx-auto my-2"
                />
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {pedido.estado !== "realizado" && (
                  <button
                    onClick={() => handleChangeEstado(pedido.id, "realizado")}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                  >
                    Realizado
                  </button>
                )}
                {pedido.estado !== "pendiente" && (
                  <button
                    onClick={() => handleChangeEstado(pedido.id, "pendiente")}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                  >
                    Pendiente
                  </button>
                )}
                {pedido.estado !== "cancelado" && (
                  <button
                    onClick={() => handleChangeEstado(pedido.id, "cancelado")}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={() => handleChangeEstado(pedido.id, "eliminar")}
                  className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pedidos;
