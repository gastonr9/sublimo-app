"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabase/client";
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

// Tipo intermedio para mapear la respuesta cruda de Supabase
type PedidoRaw = {
  id: string;
  nombre: string;
  apellido: string;
  estado: string;
  fecha: string;
  inventario_id: string;
  diseno_id: string;
  inventario?: {
    talla?: string;
    color?: string;
    producto?: {
      nombre?: string;
    };
  };
  diseno?: {
    nombre?: string;
    imagen_url?: string;
  };
};

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to map color names to hex codes
  const getDefaultHex = (nombre: string): string => {
    const coloresConocidos: Record<string, string> = {
      Blanco: "#ffffff",
      Negro: "#000000",
      Rojo: "#ff0000",
      Azul: "#0000ff",
      Verde: "#008000",
      Amarillo: "#ffff00",
      Gris: "#808080",
      Rosa: "#ff69b4",
      Naranja: "#ffa500",
      Morado: "#800080",
    };

    return coloresConocidos[nombre] || "#000000";
  };

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
      if (!data) return;

      const mapped: Pedido[] = (data as PedidoRaw[]).map((p) => ({
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

  const handleChangeEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const { data: pedido, error: fetchError } = await supabase
        .from("pedidos")
        .select(
          `
        id,
        estado,
        inventario:inventario_id ( id, stock ),
        diseno:diseno_id ( id, stock )
      `
        )
        .eq("id", pedidoId)
        .single();

      if (fetchError || !pedido) throw fetchError;

      const estadoValido =
        nuevoEstado === "confirmado" ? "realizado" : nuevoEstado;

      const { error: estadoError } = await supabase.rpc(
        "alterar_estado_pedido",
        {
          p_id: pedidoId,
          p_new_estado: estadoValido,
        }
      );

      if (estadoError) throw estadoError;

      if (estadoValido === "cancelado" && pedido.estado !== "cancelado") {
        if (
          pedido.inventario &&
          Array.isArray(pedido.inventario) &&
          pedido.inventario.length > 0
        ) {
          await supabase
            .from("inventario")
            .update({ stock: pedido.inventario[0].stock + 1 })
            .eq("id", pedido.inventario[0].id);
        }
        if (
          pedido.diseno &&
          Array.isArray(pedido.diseno) &&
          pedido.diseno.length > 0
        ) {
          await supabase
            .from("disenos")
            .update({ stock: pedido.diseno[0].stock + 1 })
            .eq("id", pedido.diseno[0].id);
        }
      }

      alert(`✅ Estado cambiado a ${estadoValido}`);
      fetchPedidos();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert("❌ No se pudo cambiar el estado del pedido");
    }
  };

  const handleDeletePedido = async (pedidoId: string) => {
    try {
      const { data: pedido, error: fetchError } = await supabase
        .from("pedidos")
        .select(
          `
        id,
        estado,
        inventario:inventario_id ( id, stock ),
        diseno:diseno_id ( id, stock )
      `
        )
        .eq("id", pedidoId)
        .single();

      if (fetchError || !pedido) throw fetchError;

      if (pedido.estado === "realizado") {
        if (
          pedido.inventario &&
          Array.isArray(pedido.inventario) &&
          pedido.inventario.length > 0
        ) {
          await supabase
            .from("inventario")
            .update({ stock: pedido.inventario[0].stock + 1 })
            .eq("id", pedido.inventario[0].id);
        }
        if (
          pedido.diseno &&
          Array.isArray(pedido.diseno) &&
          pedido.diseno.length > 0
        ) {
          await supabase
            .from("disenos")
            .update({ stock: pedido.diseno[0].stock + 1 })
            .eq("id", pedido.diseno[0].id);
        }
      }

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
                color={getDefaultHex(pedido.color || "")}
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
                <strong>Estado:</strong>{" "}
                <span
                  className={`status ${
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

              <div className="mt-4 flex gap-2">
                {pedido.estado === "pendiente" && (
                  <>
                    <button
                      onClick={() => handleChangeEstado(pedido.id, "realizado")}
                      className="btn-green"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleChangeEstado(pedido.id, "cancelado")}
                      className="btn-red"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {pedido.estado === "realizado" && (
                  <>
                    <button
                      onClick={() => handleChangeEstado(pedido.id, "cancelado")}
                      className="btn-red"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDeletePedido(pedido.id)}
                      className="btn-grey"
                    >
                      Eliminar
                    </button>
                  </>
                )}

                {pedido.estado === "cancelado" && (
                  <button
                    onClick={() => handleDeletePedido(pedido.id)}
                    className="btn-grey"
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
