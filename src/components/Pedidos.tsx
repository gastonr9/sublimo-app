// src/pages/Pedidos.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedPedidos, setConfirmedPedidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPedidos();

    // Set up real-time subscription
    const subscription = supabase
      .channel('pedidos-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => fetchPedidos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
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
            stock,
            productos (id, nombre, precio)
          )
        `)
        .order("fecha", { ascending: false });

      if (error) throw error;

      setPedidos(data || []);
      const confirmedIds = new Set(
        (data || []).filter((p) => p.estado === "realizado").map((p) => p.id)
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
    const newEstado = isConfirming ? "realizado" : "pendiente";

    // Optimistic update
    const originalPedidos = pedidos;
    const updatedPedidos = pedidos.map((p) =>
      p.id === pedido.id ? { ...p, estado: newEstado } : p
    );
    setPedidos(updatedPedidos);
    const newConfirmed = new Set(confirmedPedidos);
    if (isConfirming) newConfirmed.add(pedido.id);
    else newConfirmed.delete(pedido.id);
    setConfirmedPedidos(newConfirmed);

    setLoading(true);
    try {
      // Update pedido estado
      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ estado: newEstado })
        .eq("id", pedido.id);

      if (updateError) throw updateError;

      // Fetch current stock
      const { data: inventario, error: fetchStockError } = await supabase
        .from("inventario")
        .select("id, stock")
        .eq("id", pedido.inventario.id)
        .single();

      if (fetchStockError || !inventario) {
        throw new Error(fetchStockError?.message || "Inventario no encontrado");
      }

      // Validate stock for confirming
      if (isConfirming && inventario.stock < 1) {
        throw new Error("Stock insuficiente para confirmar el pedido");
      }

      // Update stock
      const newStock = isConfirming ? inventario.stock - 1 : inventario.stock + 1;
      const { error: stockError } = await supabase
        .from("inventario")
        .update({ stock: newStock })
        .eq("id", inventario.id);

      if (stockError) {
        // Revert pedido estado
        await supabase
          .from("pedidos")
          .update({ estado: pedido.estado })
          .eq("id", pedido.id);
        throw stockError;
      }

      await fetchPedidos();
      alert(`Pedido ${isConfirming ? "realizado" : "desconfirmado"} con éxito.`);
    } catch (err: any) {
      console.error("Error en handleToggleConfirm:", err.message);
      // Revert optimistic update
      setPedidos(originalPedidos);
      setConfirmedPedidos(confirmedPedidos);
      alert(`Error al actualizar estado del pedido: ${err.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePedido = async (pedido: any) => {
    const confirmDelete = window.confirm(
      `¿Eliminar el pedido de ${pedido.nombre} ${pedido.apellido}?`
    );
    if (!confirmDelete) return;

    // Optimistic update
    const originalPedidos = pedidos;
    const updatedPedidos = pedidos.filter((p) => p.id !== pedido.id);
    setPedidos(updatedPedidos);
    const newConfirmed = new Set(confirmedPedidos);
    newConfirmed.delete(pedido.id);
    setConfirmedPedidos(newConfirmed);

    setLoading(true);
    try {
      // Restore stock if confirmed
      if (pedido.estado === "realizado") {
        const { data: inventario, error: fetchStockError } = await supabase
          .from("inventario")
          .select("id, stock")
          .eq("id", pedido.inventario.id)
          .single();

        if (fetchStockError || !inventario) {
          throw new Error(fetchStockError?.message || "Inventario no encontrado");
        }

        const { error: stockError } = await supabase
          .from("inventario")
          .update({ stock: inventario.stock + 1 })
          .eq("id", inventario.id);

        if (stockError) throw stockError;
      }

      // Delete pedido
      const { error: deleteError } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", pedido.id);

      if (deleteError) throw deleteError;

      await fetchPedidos();
      alert("Pedido eliminado con éxito.");
    } catch (err: any) {
      console.error("Error en handleDeletePedido:", err.message);
      // Revert optimistic update
      setPedidos(originalPedidos);
      setConfirmedPedidos(confirmedPedidos);
      alert(`Error al eliminar pedido: ${err.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const getColorName = (hex: string): string => {
    const colorMap: { [key: string]: string } = {
      '#ffffff': 'Blanco',
      '#000000': 'Negro',
      '#ff0000': 'Rojo',
      '#0000ff': 'Azul',
      '#008000': 'Verde',
      '#ffff00': 'Amarillo',
      '#808080': 'Gris',
      '#ff69b4': 'Rosa',
      '#ffa500': 'Naranja',
      '#800080': 'Morado',
    };
    return colorMap[hex] || hex;
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
                    {getColorName(pedido.inventario?.color || "—")}
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
                        pedido.estado === "realizado"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                      onClick={() => handleToggleConfirm(pedido)}
                      disabled={loading}
                    >
                      {pedido.estado === "realizdo"
                        ? "Desconfirmar"
                        : "Realizdo"}
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