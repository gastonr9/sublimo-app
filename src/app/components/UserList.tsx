"use client";

import React, { useEffect, useState } from "react";
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

const UserList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario creación
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("empleado");
  const [formLoading, setFormLoading] = useState(false);

  // Modal edición
  const [editUser, setEditUser] = useState<Usuario | null>(null);
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

  // ✅ Validar si el botón debe estar deshabilitado
  const isCrearUsuarioDisabled =
    !email.trim() || !password.trim() || !rol.trim();

  return (
    <div className="mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Gestión de Usuarios
      </h1>

      {/* Crear Usuario */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Crear Usuario
        </h2>
        <form onSubmit={handleCreate} className="gap-4 grid">
          <div className="contenedor flex-wrap">
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg p-2 slot"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg p-2 slot"
            />
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="border rounded-lg p-2 slot ml-2 contenedor"
            >
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={formLoading || isCrearUsuarioDisabled}
            className={`btn-green slot ${
              formLoading || isCrearUsuarioDisabled
                ? "cursor-not-allowed opacity-70"
                : ""
            }`}
          >
            {formLoading ? "Creando..." : "Crear Usuario"}
          </button>
        </form>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Lista de Usuarios
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay usuarios registrados
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Rol</th>
                  <th className="border px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{u.email}</td>
                    <td className="border px-4 py-2 capitalize">{u.rol}</td>
                    <td className="border px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setEditRol(u.rol);
                        }}
                        className="btn-yellow slot"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        className="btn-red slot"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Editar Usuario */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-gray-700">
              Editar Usuario
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="contenedor">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="text"
                  value={editUser.email}
                  disabled
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>
              <div className="contenedor">
                <label className="block text-sm font-medium">Rol</label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  className="border rounded-lg p-2  ml-6 "
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="contenedor justify-end">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="btn-grey slot"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-green slot"
                >
                  {editLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar Eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-700">
              Confirmar eliminación
            </h2>
            <p className="mb-6">
              ¿Eliminar el usuario <b>{confirmDelete.email}</b>?
            </p>
            <div className="contenedor justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-grey slot"
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className="btn-red slot">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
