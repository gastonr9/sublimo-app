import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: "",
    nombre: "",
    rol: "empleado",
    password: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [editandoUsuario, setEditandoUsuario] = useState({
    nombre: "",
    rol: "empleado",
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("usuarios").select("*");
    if (error) console.error(error);
    else setUsuarios(data);
    setLoading(false);
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    try {
      // 🚀 Crear usuario en Auth (queda verificado automáticamente si desactivaste confirmaciones)
      const { data, error } = await supabase.auth.signUp({
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        options: {
          emailRedirectTo: window.location.origin, // opcional
        },
      });
      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("No se pudo crear el usuario en Auth");

      // 🚀 Insertar en tabla usuarios
      const { error: insertError } = await supabase.from("usuarios").insert([
        {
          id: user.id, // 🔑 id de auth.users
          email: nuevoUsuario.email,
          nombre: nuevoUsuario.nombre,
          rol: nuevoUsuario.rol,
        },
      ]);
      if (insertError) throw insertError;

      setNuevoUsuario({ email: "", nombre: "", rol: "empleado", password: "" });
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo agregar el usuario");
    }
  };

  const handleEditar = async (id) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update(editandoUsuario)
        .eq("id", id);
      if (error) throw error;
      setEditandoId(null);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("❌ Error editando usuario");
    }
  };
  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      // 🚀 Eliminar de la tabla usuarios
      const { error: deleteTableError } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);
      if (deleteTableError) throw deleteTableError;

      // 🚀 Eliminar usuario de auth.users (requiere permisos de admin en Supabase)
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
        id
      );
      if (deleteAuthError) throw deleteAuthError;

      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("❌ Error eliminando usuario: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Gestión de Usuarios
      </h1>

      {/* Formulario agregar */}
      <form
        onSubmit={handleAgregar}
        className="bg-white shadow-md p-6 rounded-lg mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoUsuario.nombre}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
          }
          required
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevoUsuario.email}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
          }
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={nuevoUsuario.password}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
          }
          required
          className="border p-2 rounded"
        />
        <div className="flex gap-2">
          <select
            value={nuevoUsuario.rol}
            onChange={(e) =>
              setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
            }
            className="border p-2 rounded flex-1"
          >
            <option value="empleado">Empleado</option>
            <option value="master">Master</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>
      </form>

      {/* Lista usuarios */}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className="space-y-4">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className="bg-white shadow-md p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              {editandoId === u.id ? (
                <>
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editandoUsuario.nombre}
                      onChange={(e) =>
                        setEditandoUsuario({
                          ...editandoUsuario,
                          nombre: e.target.value,
                        })
                      }
                      className="border p-2 rounded flex-1"
                    />
                    <select
                      value={editandoUsuario.rol}
                      onChange={(e) =>
                        setEditandoUsuario({
                          ...editandoUsuario,
                          rol: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                    >
                      <option value="empleado">Empleado</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEditar(u.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-semibold">
                      {u.nombre} ({u.email})
                    </p>
                    <p className="text-gray-600 text-sm">Rol: {u.rol}</p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        setEditandoId(u.id);
                        setEditandoUsuario({ nombre: u.nombre, rol: u.rol });
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(u.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
