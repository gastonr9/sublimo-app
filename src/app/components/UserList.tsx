"use client";

import { useEffect, useState } from "react";
import EditUserModal from "./EditUserModal";

interface User {
  id: string;
  role: string;
  email: string | null;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/getUsers", {
        method: "GET",
        cache: "no-store", // 🔹 fuerza a no usar cache en producción
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(`/api/deleteUser/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar usuario");
      }
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar el usuario.");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Rol</th>
              <th className="border px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2 capitalize">{u.role}</td>
                <td className="border px-4 py-2 flex gap-2 justify-center">
                  <button onClick={() => handleEdit(u)} className=" btn-yellow">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="btn-red"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
}
