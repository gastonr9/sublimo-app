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
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/getUsers");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || "Error al cargar usuarios");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return;
    }

    try {
      const response = await fetch(`/api/deleteUser/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the list
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar usuario");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setEditingUser(user);
      setIsModalOpen(true);
    }
  };

  const handleSaveUser = async (
    userId: string,
    email: string,
    password: string,
    role: string
  ) => {
    try {
      const updateData: { role: string; email?: string; password?: string } = {
        role,
      };
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const response = await fetch(`/api/updateUser/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Refresh the list
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Error al actualizar usuario");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  if (loading) {
    return <div className="text-center py-4">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Lista de Usuarios
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {users.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500">
            No hay usuarios registrados
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email || "Sin email"}
                  </p>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "master"
                        ? "bg-purple-100 text-purple-800"
                        : user.role === "employee"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                  <button
                    onClick={() => handleEditUser(user.id)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EditUserModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </div>
  );
}
