// Pedidos.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          nombre,
          apellido,
          talle,
          color,
          diseno_id,
          producto_id,
          fecha,
          estado,
          disenos (nombre),
          productos (nombre)
        `)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error fetching pedidos:', error);
      } else {
        setPedidos(data);
      }
      setLoading(false);
    };
    fetchPedidos();
  }, []);

  const handleCancelPedido = async (id: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'cancelado' })
      .eq('id', id);
    if (error) {
      console.error('Error cancelling pedido:', error);
    } else {
      setPedidos(pedidos.map(pedido => pedido.id === id ? { ...pedido, estado: 'cancelado' } : pedido));
    }
  };

  const handleConfirmPedido = async (id: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'confirmado' })
      .eq('id', id);
    if (error) {
      console.error('Error confirming pedido:', error);
    } else {
      setPedidos(pedidos.map(pedido => pedido.id === id ? { ...pedido, estado: 'confirmado' } : pedido));
    }
  };

  // Función para mapear hexadecimal a nombre del color
  const getColorName = (hex: string): string => {
    const colorMap = {
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
    return colorMap[hex] || hex; // Retorna el nombre o el hex si no está mapeado
  };

  if (loading) {
    return <div className="text-center text-gray-600">Cargando pedidos...</div>;
  }

  return (
    <div className="bg-gray-50 py-10 px-4 w-full max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Panel de Pedidos</h2>
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
                <tr key={pedido.id} className="hover:bg-gray-100 transition-colors">
                  <td className="py-3 px-4 border-b text-gray-700">{pedido.id.slice(0, 8)}</td>
                  <td className="py-3 px-4 border-b text-gray-700">{pedido.nombre}</td>
                  <td className="py-3 px-4 border-b text-gray-700">{pedido.apellido}</td>
                  <td className="py-3 px-4 border-b text-gray-700">{pedido.talle}</td>
                  <td className="py-3 px-4 border-b text-gray-700">{getColorName(pedido.color)}</td>
                  <td className="py-3 px-4 border-b text-gray-700">{pedido.disenos?.nombre || 'Sin diseño'}</td>
                  <td className="py-3 px-4 border-b text-gray-700">{pedido.productos?.nombre || 'Sin producto'}</td>
                  <td className="py-3 px-4 border-b text-gray-700">{new Date(pedido.fecha).toLocaleString()}</td>
                  <td className="py-3 px-4 border-b text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      pedido.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800'
                      : pedido.estado === 'cancelado' ? 'bg-red-200 text-red-800'
                      : 'bg-green-200 text-green-800'
                    }`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => handleCancelPedido(pedido.id)}
                      disabled={pedido.estado === 'cancelado'}
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => handleConfirmPedido(pedido.id)}
                      disabled={pedido.estado === 'confirmado'}
                    >
                      Confirmar
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