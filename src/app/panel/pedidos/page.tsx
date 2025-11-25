// src/app/panel/pedidos/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabase/client";
import RemeraPreview from "../../components/RemeraPreview";
import type { PostgrestError } from "@supabase/supabase-js";

// Tipos precisos según la estructura real de Supabase
interface InventarioRelation {
  talla: string;
  color: string;
  producto: {
    nombre: string;
  };
}

interface EstampaRelation {
  nombre: string;
  imagen_url: string;
}

interface PedidoRaw {
  id: string;
  nombre: string;
  apellido: string;
  estado: "pendiente" | "realizado" | "cancelado";
  fecha: string;
  inventario_id: string;
  estampa_id: string;
  inventario: InventarioRelation | null;
  estampa: EstampaRelation | null;
}

interface Pedido {
  id: string;
  nombre: string;
  apellido: string;
  estado: "pendiente" | "realizado" | "cancelado";
  fecha: string;
  producto_nombre: string;
  talla: string;
  color: string;
  estampa_nombre: string;
  estampa_url: string;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error && typeof err.message === "string") {
    return err.message;
  }
  if (err && typeof err === "object" && "message" in err) {
    const maybeMessage = (err as Record<string, unknown>).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const getDefaultHex = (nombre: string): string => {
    const colores: Record<string, string> = {
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
      Celeste: "#87CEEB",
      Bordó: "#800000",
      Violeta: "#EE82EE",
    };
    return colores[nombre] || "#94a3b8";
  };

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id,
          nombre,
          apellido,
          estado,
          fecha,
          inventario_id,
          estampa_id,
          inventario:inventario_id (
            talla,
            color,
            producto:producto_id ( nombre )
          ),
          estampa:estampa_id (
            nombre,
            imagen_url
          )
        `)
        .order("fecha", { ascending: false }) as unknown as {
          data: PedidoRaw[] | null;
          error: PostgrestError | null;
        };

      if (error) throw error;

      const mapped: Pedido[] = (data || []).map((p: PedidoRaw) => ({
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        estado: p.estado,
        fecha: p.fecha,
        producto_nombre: p.inventario?.producto?.nombre || "Sin producto",
        talla: p.inventario?.talla || "-",
        color: p.inventario?.color || "Sin color",
        estampa_nombre: p.estampa?.nombre || "Sin diseño",
        estampa_url: p.estampa?.imagen_url || "",
      }));

      setPedidos(mapped);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      alert("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchPedidos(); // carga inicial

  const channel = supabase
    .channel('pedidos-changes')
    .on(
      'postgres_changes', // ← sigue siendo el primer argumento
      {
        event: '*',           // o puedes usar 'INSERT' | 'UPDATE' | 'DELETE'
        schema: 'public',
        table: 'pedidos',
      },
      (payload) => {
        console.log('Cambio en pedidos:', payload);

        // Tipado seguro del payload
        const event = payload.eventType;
        const newRecord = payload.new as PedidoRaw | undefined;
        const oldRecord = payload.old as { id: string } | undefined;

        if (event === 'INSERT' && newRecord) {
          fetchPedidos(); // más seguro recargar todo en INSERT
        } 
        else if (event === 'UPDATE' && newRecord) {
          setPedidos(prev =>
            prev.map(p =>
              p.id === newRecord.id
                ? { ...p, estado: newRecord.estado }
                : p
            )
          );
        } 
        else if (event === 'DELETE' && oldRecord) {
          setPedidos(prev => prev.filter(p => p.id !== oldRecord.id));
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Suscripción a pedidos activa');
      }
      if (err) console.error('Error en suscripción:', err);
    });

  // Cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  const handleChangeEstado = async (
    pedidoId: string,
    nuevoEstado: "realizado" | "cancelado"
  ) => {
    try {
      const { error } = await supabase.rpc("alterar_estado_pedido", {
        p_id: pedidoId,
        p_new_estado: nuevoEstado,
      });

      if (error) throw error;

      alert(
        nuevoEstado === "realizado"
          ? "Pedido confirmado"
          : "Pedido cancelado → stock de talle y estampa repuesto"
      );
    } catch (err: unknown) {
      console.error(err);
      alert("Error: " + extractErrorMessage(err));
    }
  };

  const handleDeletePedido = async (pedidoId: string) => {
    if (!confirm("¿Seguro que querés eliminar este pedido permanentemente?"))
      return;

    try {
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("estado, inventario_id, estampa_id")
        .eq("id", pedidoId)
        .single();

      if (pedido?.estado === "realizado") {
        await supabase.rpc("reponer_stock_pedido", { p_pedido_id: pedidoId });
      }

      const { error } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", pedidoId);

      if (error) throw error;

      alert("Pedido eliminado");
    } catch (err: unknown) {
      alert("Error al eliminar: " + extractErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-gray-600">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Gestión de Pedidos
      </h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500">
            No hay pedidos registrados aún
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="flex justify-between items-center bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-8">
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl">
                  <RemeraPreview
                    color={getDefaultHex(pedido.color)}
                    estampaUrl={pedido.estampa_url}
                  />
                </div>

                <div>
                  <p className="font-bold text-lg text-indigo-700">
                    {pedido.producto_nombre}
                  </p>
                  <p><strong>Talle:</strong> {pedido.talla}</p>
                  <p><strong>Color:</strong> {pedido.color}</p>
                  <p><strong>Diseño:</strong> {pedido.estampa_nombre}</p>
                  <p><strong>Cliente:</strong> {pedido.nombre} {pedido.apellido}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(pedido.fecha).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <span
                  className={`px-6 py-2 rounded-full text-white font-bold text-sm ${
                    pedido.estado === "pendiente"
                      ? "bg-yellow-500"
                      : pedido.estado === "realizado"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {pedido.estado.toUpperCase()}
                </span>

                <div className="flex gap-3">
                  {pedido.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => handleChangeEstado(pedido.id, "realizado")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleChangeEstado(pedido.id, "cancelado")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {pedido.estado === "realizado" && (
                    <>
                      <button
                        onClick={() => handleChangeEstado(pedido.id, "cancelado")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDeletePedido(pedido.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                      >
                        Eliminar
                      </button>
                    </>
                  )}

                  {pedido.estado === "cancelado" && (
                    <button
                      onClick={() => handleDeletePedido(pedido.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pedidos;