// src/app/panel/pedidos/page.tsx
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
  producto_nombre: string;
  talla: string;
  color: string;
  estampa_nombre: string;
  estampa_url: string;
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
    return colores[nombre] || "#94a3b8"; // gris azulado por defecto
  };

  // Cargar pedidos iniciales
  const fetchPedidos = async () => {
    try {
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
        `
        )
        .order("fecha", { ascending: false });

      if (error) throw error;

      const mapped: Pedido[] = (data || []).map((p: any) => ({
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

  // REALTIME: escuchar cambios en la tabla pedidos
  useEffect(() => {
    fetchPedidos(); // carga inicial

    const channel = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
        },
        (payload) => {
          console.log("Cambio detectado en pedidos:", payload);

          if (payload.eventType === "INSERT") {
            // Nuevo pedido → recargamos todo (más simple y seguro)
            fetchPedidos();
          } else if (payload.eventType === "UPDATE") {
            // Actualizamos solo ese pedido en el estado
            setPedidos((prev) =>
              prev.map((p) =>
                p.id === payload.new.id
                  ? {
                      ...p,
                      estado: payload.new.estado,
                    }
                  : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            // Eliminamos del estado
            setPedidos((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup al desmontar
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
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };
  const handleDeletePedido = async (pedidoId: string) => {
    if (!confirm("¿Seguro que querés eliminar este pedido permanentemente?"))
      return;

    try {
      // Primero reponemos stock si estaba realizado
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("estado, inventario_id, estampa_id")
        .eq("id", pedidoId)
        .single();

      if (pedido?.estado === "realizado") {
        await supabase.rpc("reponer_stock_pedido", { p_pedido_id: pedidoId });
      }

      // Luego eliminamos
      const { error } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", pedidoId);

      if (error) throw error;

      // El realtime se encarga de quitarlo del listado
      alert("Pedido eliminado");
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
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
    <div className=" max-w-7xl mx-auto">
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
        <div>
          <div className="gap-8 grid">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="gap-8 py-3 px-10 flex bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300  justify-between "
              >
                <div className="flex items-center gap-6">
                  {/* Vista previa */}
                  <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                    <RemeraPreview
                      color={getDefaultHex(pedido.color)}
                      estampaUrl={pedido.estampa_url}
                    />
                  </div>
                  {/* Info */}
                  <div className="">
                    <p className="font-bold text-lg text-indigo-700">
                      {pedido.producto_nombre}
                    </p>
                    <p>
                      <strong>Talle:</strong> {pedido.talla}
                    </p>
                    <p>
                      <strong>Color:</strong> {pedido.color}
                    </p>
                    <p>
                      <strong>Diseño:</strong> {pedido.estampa_nombre}
                    </p>
                    <p>
                      <strong>Cliente:</strong> {pedido.nombre}{" "}
                      {pedido.apellido}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.fecha).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8  ">
                  {/* Estado */}
                  <div className=" flex flex-col items-start">
                    <p
                      className={`inline-block w-full text-center px-4 py-2 rounded-full text-white font-bold text-sm ${
                        pedido.estado === "pendiente"
                          ? "bg-yellow-500"
                          : pedido.estado === "realizado"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {pedido.estado.toUpperCase()}
                    </p>
                    {/* Botones */}
                    <p className=" gap-2 py-2 rounded-full text-white font-bold text-sm flex">
                      {pedido.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() =>
                              handleChangeEstado(pedido.id, "realizado")
                            }
                            className=" bg-green-600 text-white  hover:bg-green-700 transition"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() =>
                              handleChangeEstado(pedido.id, "cancelado")
                            }
                            className=" bg-red-600 text-white  hover:bg-red-700 transition"
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      {pedido.estado === "realizado" && (
                        <>
                          <button
                            onClick={() =>
                              handleChangeEstado(pedido.id, "cancelado")
                            }
                            className=" bg-red-600 text-white  hover:bg-red-700 transition"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDeletePedido(pedido.id)}
                            className=" bg-gray-600 text-white  hover:bg-gray-700 transition"
                          >
                            Eliminar
                          </button>
                        </>
                      )}

                      {pedido.estado === "cancelado" && (
                        <button
                          onClick={() => handleDeletePedido(pedido.id)}
                          className=" bg-gray-600 text-white  hover:bg-gray-700 transition"
                        >
                          Eliminar
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
