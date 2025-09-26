"use client";

import { useEffect, useState } from "react";
import {
  getUsuarios,
  crearUsuario,
  actualizarRol,
  eliminarUsuario,
} from "../services/usuarios";

interface Usuario {
  id: string;
  email: string;
  rol: string;
  creado_en: string;
}

export default function UserList() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario de creación
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("empleado");
  const [formLoading, setFormLoading] = useState(false);

  // Modal edición
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRol, setEditRol] = useState("empleado");
  const [editLoading, setEditLoading] = useState(false);

  // Confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState<Usuario | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await crearUsuario(email, password, rol);
      setEmail("");
      setPassword("");
      setRol("empleado");
      fetchUsuarios();
    } catch (err) {
      console.error("Error creando usuario:", err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setEditLoading(true);
    try {
      await actualizarRol(editUser.id, editRol);
      fetchUsuarios();
      setEditUser(null);
    } catch (err) {
      console.error("Error actualizando usuario:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await eliminarUsuario(confirmDelete.id);
      fetchUsuarios();
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

      {/* Formulario de creación */}
      <form onSubmit={handleCreate} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Rol</label>
          <select
            className="w-full border px-3 py-2 rounded-md"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="empleado">Empleado</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" disabled={formLoading} className="btn-green">
          {formLoading ? "Creando..." : "Crear Usuario"}
        </button>
      </form>

      {/* Lista de usuarios */}
      {loading ? (
        <p>Cargando usuarios...</p>
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
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2 capitalize">{u.rol}</td>
                <td className="border px-4 py-2 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setEditUser(u);
                      setEditEmail(u.email);
                      setEditRol(u.rol);
                    }}
                    className="btn-yellow"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(u)}
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

      {/* Modal editar */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Editar Usuario</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm">Email (no editable)</label>
                <input
                  type="text"
                  value={editEmail}
                  disabled
                  className="w-full border px-3 py-2 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm">Rol</label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  className="w-full border px-3 py-2 rounded-md"
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-3 py-1 border rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {editLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Eliminar Usuario</h2>
            <p className="mb-4">
              ¿Seguro que deseas eliminar al usuario{" "}
              <span className="font-semibold">{confirmDelete.email}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
