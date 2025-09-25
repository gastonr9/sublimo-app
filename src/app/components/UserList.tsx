"use client";

import { useEffect, useState } from "react";
import { getPerfiles, updatePerfil, deletePerfil } from "../services/usuarios";
import { UserProfile } from "../types";

interface User extends UserProfile {
  email: string | null;
}

export default function UsesrList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ConfirmationDialog = () => {
    if (!isConfirmOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
          <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
          <p className="mb-4">
            ¿Estás seguro de que deseas eliminar este usuario?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (userToDelete) handleDelete(userToDelete, true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ToastMessage = () => {
    if (!toast) return null;

    const color = toast.type === "success" ? "bg-green-500" : "bg-red-500";
    return (
      <div
        className={`fixed bottom-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg ${color}`}
      >
        {toast.message}
      </div>
    );
  };

  const EditUserModal = () => {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;

      setModalLoading(true);
      setError(null);

      try {
        await updatePerfil(selectedUser.id, {
          email,
          role: role as "admin" | "empleado",
        });

        showToast("Usuario actualizado con éxito.", "success");
        fetchUsers();
        setIsModalOpen(false);
      } catch (err) {
        console.error("Error updating user:", err);
        setError(
          "Error al actualizar el usuario. " +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setModalLoading(false);
      }
    };

    if (!isModalOpen || !selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">admin</option>
                <option value="empleado">Empleado</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={modalLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={modalLoading}
              >
                {modalLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const profiles = await getPerfiles();
      setUsers(profiles);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Error al cargar la lista de usuarios.", "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, confirmed: boolean = false) => {
    if (!confirmed) {
      setUserToDelete(id);
      setIsConfirmOpen(true);
      return;
    }

    setIsConfirmOpen(false);
    try {
      await deletePerfil(id);
      showToast("Usuario eliminado con éxito.", "success");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Error al eliminar el usuario.", "error");
    } finally {
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email || "");
    setRole(user.role);
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
                  <button onClick={() => handleEdit(u)} className="btn-yellow">
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

      <EditUserModal />
      <ConfirmationDialog />
      <ToastMessage />
    </div>
  );
}
