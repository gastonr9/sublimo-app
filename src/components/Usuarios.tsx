import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: "master" | "empleado";
}

const Usuarios: React.FC = () => {
  const { user, rol } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: "",
    nombre: "",
    rol: "empleado" as "master" | "empleado",
  });

  const [editando, setEditando] = useState<{ [key: string]: boolean }>({});
  const [usuarioEditado, setUsuarioEditado] = useState<Usuario | null>(null);

  // 🚫 Solo master puede entrar
  if (!user || user.rol !== "master") {
    return (
      <p className="text-red-600">❌ Solo master puede administrar usuarios</p>
    );
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("usuarios").select("*");
      if (error) throw error;
      setUsuarios(data as Usuario[]);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarUsuario = async () => {
    try {
      const { error } = await supabase.from("usuarios").insert([nuevoUsuario]);
      if (error) throw error;
      setNuevoUsuario({ email: "", nombre: "", rol: "empleado" });
      fetchUsuarios();
    } catch (err) {
      console.error("Error agregando usuario:", err);
      alert("❌ No se pudo agregar el usuario");
    }
  };

  const handleGuardarEdicion = async () => {
    if (!usuarioEditado) return;
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({
          nombre: usuarioEditado.nombre,
          rol: usuarioEditado.rol,
        })
        .eq("id", usuarioEditado.id);
      if (error) throw error;
      setEditando({ ...editando, [usuarioEditado.id]: false });
      setUsuarioEditado(null);
      fetchUsuarios();
    } catch (err) {
      console.error("Error editando usuario:", err);
      alert("❌ No se pudo editar el usuario");
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      const { error } = await supabase.from("usuarios").delete().eq("id", id);
      if (error) throw error;
      fetchUsuarios();
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      alert("❌ No se pudo eliminar el usuario");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>

      {/* Agregar usuario */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold mb-4">Agregar Usuario</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={nuevoUsuario.email}
            onChange={(e) =>
              setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
            }
            className="border rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="Nombre"
            value={nuevoUsuario.nombre}
            onChange={(e) =>
              setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
            }
            className="border rounded-lg p-2"
          />
          <select
            value={nuevoUsuario.rol}
            onChange={(e) =>
              setNuevoUsuario({
                ...nuevoUsuario,
                rol: e.target.value as "master" | "empleado",
              })
            }
            className="border rounded-lg p-2"
          >
            <option value="master">Master</option>
            <option value="empleado">Empleado</option>
          </select>
        </div>
        <button
          onClick={handleAgregarUsuario}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Agregar Usuario
        </button>
      </div>

      {/* Lista de usuarios */}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="space-y-4">
          {usuarios.map((u) => (
            <div key={u.id} className="bg-white shadow-md rounded-lg p-4">
              {editando[u.id] ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={usuarioEditado?.nombre || ""}
                    onChange={(e) =>
                      setUsuarioEditado({
                        ...usuarioEditado!,
                        nombre: e.target.value,
                      })
                    }
                    className="border rounded-lg p-2"
                  />
                  <select
                    value={usuarioEditado?.rol}
                    onChange={(e) =>
                      setUsuarioEditado({
                        ...usuarioEditado!,
                        rol: e.target.value as "master" | "empleado",
                      })
                    }
                    className="border rounded-lg p-2"
                  >
                    <option value="master">Master</option>
                    <option value="empleado">Empleado</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGuardarEdicion}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() =>
                        setEditando({ ...editando, [u.id]: false })
                      }
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p>
                      <strong>{u.nombre}</strong> ({u.email})
                    </p>
                    <p className="text-sm text-gray-600">Rol: {u.rol}</p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        setEditando({ ...editando, [u.id]: true });
                        setUsuarioEditado(u);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarUsuario(u.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Usuarios;
