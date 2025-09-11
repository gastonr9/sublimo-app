"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/Client";
import RemeraPreview from "../../components/RemeraPreview";
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

  // Cambiar estado del pedido usando RPC
  const handleChangeEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      // mapear "confirmado" → "realizado"
      const estadoValido =
        nuevoEstado === "confirmado" ? "realizado" : nuevoEstado;

      const { error } = await supabase.rpc("alterar_estado_pedido", {
        p_id: pedidoId,
        p_new_estado: estadoValido,
      });

      if (error) throw error;

      alert(`✅ Estado cambiado a ${estadoValido}`);
      fetchPedidos(); // refresca la lista
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert("❌ No se pudo cambiar el estado del pedido");
    }
  };

  const handleDeletePedido = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", pedidoId);

      if (error) throw error;

      alert("🗑️ Pedido eliminado correctamente");
      fetchPedidos();
    } catch (err) {
      console.error("Error eliminando pedido:", err);
      alert("❌ No se pudo eliminar el pedido");
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
              className="bg-white shadow-md rounded-lg p-4 min-w-fit"
            >
              <RemeraPreview
                color={pedido.color || ""}
                disenoUrl={pedido.diseno_url || ""}
              />
              <p>
                <strong>Producto:</strong> {pedido.producto_nombre}
              </p>
              <p>
                <strong>Talle:</strong> {pedido.talla}
              </p>
              <p>
                <strong>Color:</strong> {pedido.color}
              </p>
              <p>
                <strong>Diseño:</strong> {pedido.diseno_nombre}
              </p>
              <p>
                <strong>Cliente:</strong> {pedido.nombre} {pedido.apellido}
              </p>
              <p>
                <strong>Estado:</strong>
                {""}
                <span
                  className={`status  ${
                    pedido.estado === "pendiente"
                      ? "text-yellow-500 capitalize"
                      : pedido.estado === "realizado"
                      ? "text-green-500 capitalize"
                      : "text-red-500 capitalize"
                  }`}
                >
                  {pedido.estado}
                </span>
              </p>

              {/* BOTONES SEGÚN ESTADO */}
              <div className="mt-4 flex gap-2">
                {pedido.estado === "pendiente" && (
                  <>
                    <button
                      onClick={() => handleChangeEstado(pedido.id, "realizado")}
                      className="btn-green  "
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleChangeEstado(pedido.id, "cancelado")}
                      className="btn-red  "
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {pedido.estado === "realizado" && (
                  <>
                    <button
                      onClick={() => handleChangeEstado(pedido.id, "cancelado")}
                      className="btn-red "
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDeletePedido(pedido.id)}
                      className="btn-grey  "
                    >
                      Eliminar
                    </button>
                  </>
                )}

                {pedido.estado === "cancelado" && (
                  <button
                    onClick={() => handleDeletePedido(pedido.id)}
                    className="btn-grey  "
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pedidos;
