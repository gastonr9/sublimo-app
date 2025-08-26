// Pedidos.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase.from('pedidos').select('*').order('fecha', { ascending: false });
      if (error) {
        console.error('Error fetching pedidos:', error);
      } else {
        setPedidos(data);
      }
    };
    fetchPedidos();
  }, []);

  return (
    <div className="bg-white py-10 px-4 w-full max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Panel de Pedidos</h2>
      {pedidos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Apellido</th>
                <th className="py-2 px-4 border-b">Talle</th>
                <th className="py-2 px-4 border-b">Color</th>
                <th className="py-2 px-4 border-b">Diseño</th>
                <th className="py-2 px-4 border-b">Producto</th>
                <th className="py-2 px-4 border-b">Fecha</th>
                <th className="py-2 px-4 border-b">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{pedido.id.slice(0, 8)}</td>
                  <td className="py-2 px-4 border-b">{pedido.nombre}</td>
                  <td className="py-2 px-4 border-b">{pedido.apellido}</td>
                  <td className="py-2 px-4 border-b">{pedido.talle}</td>
                  <td className="py-2 px-4 border-b">{pedido.color}</td>
                  <td className="py-2 px-4 border-b">{pedido.diseno_id}</td>
                  <td className="py-2 px-4 border-b">{pedido.producto_id}</td>
                  <td className="py-2 px-4 border-b">{new Date(pedido.fecha).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{pedido.estado}</td>
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