// src/pages/Pedidos.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedPedidos, setConfirmedPedidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id,
          nombre,
          apellido,
          fecha,
          estado,
          disenos (id, nombre, imagen_url),
          inventario (
            id,
            talla,
            color,
            productos (id, nombre, precio)
          )
        `)
        .order("fecha", { ascending: false });

      if (error) throw error;

      setPedidos(data || []);
      const confirmedIds = new Set(
        (data || [])
          .filter((p) => p.estado === "confirmado")
          .map((p) => p.id)
      );
      setConfirmedPedidos(confirmedIds);
    } catch (err: any) {
      console.error("Error fetching pedidos:", err.message);
      alert("Error al cargar pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfirm = async (pedido: any) => {
    const isConfirming = pedido.estado === "pendiente";
    const newEstado = isConfirming ? "confirmado" : "pendiente";

    setLoading(true);
    try {
      // update estado pedido
      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ estado: newEstado })
        .eq("id", pedido.id);

      if (updateError) throw updateError;

      // update stock en inventario
      const stockUpdate = isConfirming
        ? { stock: supabase.sql`stock - 1` }
        : { stock: supabase.sql`stock + 1` };

      const { error: stockError } = await supabase
        .from("inventario")
        .update(stockUpdate)
        .eq("id", pedido.inventario.id)
        .gte("stock", isConfirming ? 1 : 0);

      if (stockError) {
        // revertir estado si falla
        await supabase
          .from("pedidos")
          .update({ estado: pedido.estado })
          .eq("id", pedido.id);

        throw stockError;
      }

      const newConfirmed = new Set(confirmedPedidos);
      if (isConfirming) newConfirmed.add(pedido.id);
      else newConfirmed.delete(pedido.id);

      setConfirmedPedidos(newConfirmed);
      await fetchPedidos();
      alert(`Pedido ${isConfirming ? "confirmado" : "desconfirmado"} con éxito.`);
    } catch (err: any) {
      console.error("Error en handleToggleConfirm:", err.message);
      alert("Error al actualizar estado del pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePedido = async (pedido: any) => {
    const confirmDelete = window.confirm(
      `¿Eliminar el pedido de ${pedido.nombre} ${pedido.apellido}?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      // Si estaba confirmado, restaurar stock
      if (pedido.estado === "confirmado") {
        const { error: stockError } = await supabase
          .from("inventario")
          .update({ stock: supabase.sql`stock + 1` })
          .eq("id", pedido.inventario.id);

        if (stockError) throw stockError;
      }

      // eliminar pedido
      const { error: deleteError } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", pedido.id);

      if (deleteError) throw deleteError;

      const newConfirmed = new Set(confirmedPedidos);
      newConfirmed.delete(pedido.id);
      setConfirmedPedidos(newConfirmed);
      await fetchPedidos();

      alert("Pedido eliminado con éxito.");
    } catch (err: any) {
      console.error("Error en handleDeletePedido:", err.message);
      alert("Error al eliminar pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Cargando pedidos...</div>;
  }

  return (
    <div className="bg-gray-50 py-10 px-4 w-full max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Panel de Pedidos
      </h2>

      {pedidos.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 border-b text-left">ID</th>
                <th className="py-3 px-4 border-b text-left">Nombre</th>
                <th className="py-3 px-4 border-b text-left">Apellido</th>
                <th className="py-3 px-4 border-b text-left">Talle</th>
                <th className="py-3 px-4 border-b text-left">Color</th>
                <th className="py-3 px-4 border-b text-left">Diseño</th>
                <th className="py-3 px-4 border-b text-left">Producto</th>
                <th className="py-3 px-4 border-b text-left">Fecha</th>
                <th className="py-3 px-4 border-b text-left">Estado</th>
                <th className="py-3 px-4 border-b text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <td className="py-3 px-4 border-b text-gray-700">
                    {pedido.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    {pedido.nombre}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    {pedido.apellido}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    {pedido.inventario?.talla || "—"}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    {pedido.inventario?.color || "—"}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    {pedido.disenos?.nombre || "Sin diseño"}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    {pedido.inventario?.productos?.nombre || "Sin producto"}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    {new Date(pedido.fecha).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        pedido.estado === "pendiente"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <button
                      className={`px-3 py-1 rounded ${
                        pedido.estado === "confirmado"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                      onClick={() => handleToggleConfirm(pedido)}
                      disabled={loading}
                    >
                      {pedido.estado === "confirmado"
                        ? "Desconfirmar"
                        : "Confirmar"}
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => handleDeletePedido(pedido)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600">No hay pedidos registrados.</p>
      )}
    </div>
  );
};

export default Pedidos;
