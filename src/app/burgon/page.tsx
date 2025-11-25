// src/app/burgon/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useOrder } from "../context/OrderContext";
import { getProductos, getProductoPorId } from "../services/inventario";
import { Producto, Color } from "../types";
import { getEstampas } from "../services/estampas";
import { supabase } from "../../supabase/client";
import RemeraPreview from "../components/RemeraPreview";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import VirtualKeyboard from "../components/VirtualKeyboard";

const getDefaultHex = (nombre: string): string => {
  const coloresConocidos = {
    Blanco: "#ffffff",
    Negro: "#000000",
    Rojo: "#ff0000",
    Azul: "#0000ff",
    Verde: "#008000",
    Amarillo: "#ffff00",
    Gris: "#808080",
    Rosa: "#ff69b4",
    Naranja: "#ffa500",
    Morado: "#4e4ebd",
  };
  return coloresConocidos[nombre as keyof typeof coloresConocidos] || "#000000";
};

// Interfaz correcta del nuevo sistema de estampas
interface Estampa {
  id: string;
  nombre: string;
  imagen_url: string;
  stock: number;
  disponible: boolean;
}

const Burgon: React.FC = () => {
  const { order, setOrder, selectedProduct, setSelectedProduct } = useOrder();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState(
    order.productoId || ""
  );
  const [talles, setTalles] = useState<string[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<Color[]>([]);
  const [estampas, setEstampas] = useState<Estampa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [activeInput, setActiveInput] = useState<"nombre" | "apellido">(
    "nombre"
  );
  const [isPortrait, setIsPortrait] = useState(false);

  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  // Detectar orientación
  useEffect(() => {
    const handleResize = () =>
      setIsPortrait(window.innerHeight > window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth
  useEffect(() => {
    if (isAuthReady && !user) router.push("/login");
  }, [isAuthReady, user, router]);

  // Cargar producto seleccionado
  const cargarProductoSeleccionado = useCallback(
    async (id: string) => {
      const producto = await getProductoPorId(id);
      if (producto) {
        setSelectedProduct(producto);
        setOrder((prev) => ({ ...prev, productoId: id }));

        const tallesConStock = Array.from(
          new Set(
            producto.inventario
              ?.filter((i) => i.stock > 0)
              .map((i) => i.talla) || []
          )
        ).sort((a, b) => {
          const orden = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };
          return (
            (orden[a as keyof typeof orden] ?? 5) -
            (orden[b as keyof typeof orden] ?? 5)
          );
        });
        setTalles(tallesConStock);

        const colores = Array.from(
          new Set(
            producto.inventario
              ?.filter((i) => i.stock > 0)
              .map((i) => i.color) || []
          )
        )
          .map((nombre) => ({ nombre, hex: getDefaultHex(nombre) }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        setColoresDisponibles(colores);
      } else {
        setSelectedProduct(null);
        setTalles([]);
        setColoresDisponibles([]);
      }
    },
    [setSelectedProduct, setOrder]
  );

  // CARGA INICIAL + REALTIME
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const prods = await getProductos();
      if (!mounted) return;
      setProductos(prods);

      let id = selectedProductoId;
      if (!id && prods.length > 0) {
        id = prods[0].id;
        setSelectedProductoId(id);
      }
      if (id) await cargarProductoSeleccionado(id);

      // Cargar estampas: solo con stock y disponibles
      const data = await getEstampas();
      if (mounted) {
        setEstampas(data.filter((e) => e.stock > 0 && e.disponible === true));
      }
    };

    init();

    // Realtime para todo
    const channel = supabase
      .channel("burgon-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        () => {
          getProductos().then(setProductos);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventario" },
        () => {
          if (selectedProductoId)
            cargarProductoSeleccionado(selectedProductoId);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "estampas" },
        () => {
          getEstampas().then((data) => {
            setEstampas(
              data.filter((e) => e.stock > 0 && e.disponible === true)
            );
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [selectedProductoId, cargarProductoSeleccionado]);

  // Actualizar colores según talle
  useEffect(() => {
    if (!selectedProduct?.inventario) {
      setColoresDisponibles([]);
      return;
    }

    if (order.talle) {
      const cols = selectedProduct.inventario
        .filter((i) => i.talla === order.talle && i.stock > 0)
        .map((i) => ({ nombre: i.color, hex: getDefaultHex(i.color) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setColoresDisponibles(cols);

      if (
        cols.length > 0 &&
        (!order.color || !cols.some((c) => c.hex === order.color))
      ) {
        setOrder((p) => ({ ...p, color: cols[0].hex }));
      }
    } else {
      const todos = Array.from(
        new Set(
          selectedProduct.inventario
            .filter((i) => i.stock > 0)
            .map((i) => i.color)
        )
      )
        .map((n) => ({ nombre: n, hex: getDefaultHex(n) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setColoresDisponibles(todos);
      setOrder((p) => ({ ...p, color: "" }));
    }
  }, [order.talle, selectedProduct, order.color, setOrder]);

  const handleProductoSelect = (id: string) => {
    setSelectedProductoId(id);
    setOrder({
      ...order,
      productoId: id,
      talle: "",
      color: "",
      estampaId: "",
      estampaUrl: "",
    });
  };

  const handleTalleSelect = (talle: string) => {
    setOrder({ ...order, talle, color: "" });
  };

  const handleColorSelect = (hex: string) => {
    setOrder({ ...order, color: hex });
  };

  const handleEstampasSelect = (id: string, url: string) => {
    if (order.talle && order.color) {
      setOrder({ ...order, estampaId: id, estampaUrl: url });
    }
  };

  const handleNext = () => {
    if (order.talle && order.color && order.estampaId) {
      setShowModal(true);
    } else {
      alert("Por favor, selecciona talle, color y estampa.");
    }
  };

  const handleCreatePedido = async () => {
    if (!selectedProduct || !order.talle || !order.color || !order.estampaId) {
      alert("Faltan datos para crear el pedido");
      return;
    }

    const colorNombre = coloresDisponibles.find(
      (c) => c.hex === order.color
    )?.nombre;
    if (!colorNombre) {
      alert("Color no válido");
      return;
    }

    try {
      const { data: inv } = await supabase
        .from("inventario")
        .select("id, stock")
        .eq("producto_id", selectedProduct.id)
        .eq("talla", order.talle)
        .eq("color", colorNombre)
        .single();

      if (!inv || inv.stock <= 0) {
        alert("No hay stock de la remera seleccionada");
        return;
      }

      const { data: estampa } = await supabase
        .from("estampas")
        .select("id, stock")
        .eq("id", order.estampaId)
        .single();

      if (!estampa || estampa.stock <= 0) {
        alert("El diseño seleccionado no tiene stock");
        return;
      }

      const { error } = await supabase.rpc("crear_pedido_y_actualizar_stock", {
        p_nombre: nombre.trim(),
        p_apellido: apellido.trim(),
        p_inventario_id: inv.id,
        p_estampa_id: estampa.id,
      });

      if (error) throw error;

      alert("Pedido creado con éxito!");
      setShowModal(false);
      setShowSummary(false);
      setNombre("");
      setApellido("");
      setOrder({
        ...order,
        talle: "",
        color: "",
        estampaId: "",
        estampaUrl: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        alert("Error al crear el pedido: " + err.message);
      } else {
        alert("Ocurrió un error desconocido al crear el pedido.");
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="bg-white py-10 px-4 w-full max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Elegí la prenda y el talle
        </h2>

        <div className="flex justify-center mb-6">
          <select
            value={selectedProductoId}
            onChange={(e) => handleProductoSelect(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 bg-indigo-100 border-indigo-600 focus:ring-indigo-500"
          >
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - ${producto.precio.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {talles.length > 0 ? (
            talles.map((talle) => (
              <button
                key={talle}
                className={`px-4 py-2 rounded-lg border transition ${
                  order.talle === talle
                    ? "bg-indigo-100 border-indigo-600 "
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100 "
                }`}
                onClick={() => handleTalleSelect(talle)}
              >
                {talle}
              </button>
            ))
          ) : (
            <p className="text-gray-600">
              Selecciona un producto para ver talles
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4 mb-4 flex-wrap">
          {coloresDisponibles.length > 0 ? (
            coloresDisponibles.map((color) => (
              <button
                key={color.hex}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  order.color === color.hex
                    ? "bg-indigo-100 border-indigo-600"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                } ${!order.talle ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => order.talle && handleColorSelect(color.hex)}
                disabled={!order.talle}
              >
                <span className="text-gray-800">{color.nombre}</span>
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            ))
          ) : (
            <p className="text-gray-600">
              Selecciona un talle para ver colores
            </p>
          )}
        </div>

        <div className="relative w-full flex justify-center">
          <RemeraPreview
            color={order.color || "#ffffff"}
            estampaUrl={order.estampaUrl}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
            Elegí un estampa
          </h3>
          <div className="flex flex-wrap gap-6 justify-center px-4">
            {estampas.length > 0 ? (
              estampas.map((design) => {
                const seleccionado = order.estampaId === design.id;
                const deshabilitado = !order.talle || !order.color;

                return (
                  <div
                    key={design.id}
                    className="flex flex-col items-center max-w-32 group"
                  >
                    {/* Botón de la imagen */}
                    <button
                      onClick={() =>
                        handleEstampasSelect(design.id, design.imagen_url)
                      }
                      disabled={deshabilitado}
                      className={`relative w-28 h-28 rounded-2xl border-4 overflow-hidden shadow-lg transition-all duration-300 ${
                        seleccionado
                          ? "border-indigo-600 ring-4 ring-indigo-400 ring-offset-2 bg-indigo-50 scale-105"
                          : "border-gray-300 hover:border-indigo-400"
                      } ${
                        deshabilitado
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-105"
                      }`}
                    >
                      <Image
                        src={design.imagen_url}
                        alt={design.nombre}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 768px) 100px, 112px"
                      />
                      {/* Indicador visual de seleccionado */}
                      {seleccionado && (
                        <div className="absolute inset-0 bg-indigo-600/20 rounded-2xl" />
                      )}
                    </button>

                    {/* Nombre del diseño - responsive y bonito */}
                    <div className="mt-3 w-full px-2">
                      <p
                        className={`text-center text-xs font-bold text-gray-800 leading-tight tracking-tight transition-all ${
                          seleccionado ? "text-indigo-700" : ""
                        }`}
                        title={design.nombre} // tooltip por si es muy largo
                      >
                        {/* Truncar con puntos suspensivos si es muy largo */}
                        {design.nombre.length > 20
                          ? design.nombre.substring(0, 18) + "..."
                          : design.nombre.toUpperCase()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12">
                <p className="text-center text-gray-600 text-lg">
                  No hay estampas disponibles en este momento
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedProduct?.nombre || ""}
          </h3>
          {selectedProduct?.precio ? (
            <p className="text-xl font-bold text-gray-800">
              ${selectedProduct.precio.toFixed(2)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="slot btn-secondary"
            onClick={handleNext}
            disabled={!order.talle || !order.color || !order.estampaId}
          >
            Siguiente
          </button>
        </div>

        {/* Modales (sin cambios) */}
        {showModal && !showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Ingresa tus datos
              </h3>
              <div className="grid">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onFocus={() => setActiveInput("nombre")}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border rounded-lg p-2 mb-3 w-full text-center"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={apellido}
                  onFocus={() => setActiveInput("apellido")}
                  onChange={(e) => setApellido(e.target.value)}
                  className="border rounded-lg p-2 mb-4 w-full text-center"
                />
                {isPortrait && (
                  <VirtualKeyboard
                    target={activeInput}
                    nombre={nombre}
                    apellido={apellido}
                    setNombre={setNombre}
                    setApellido={setApellido}
                  />
                )}
              </div>

              <div className="gap-4 flex ">
                <button
                  className="w-full slot"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="slot w-full btn-secondary"
                  onClick={() => nombre && apellido && setShowSummary(true)}
                  disabled={!nombre || !apellido}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Resumen del pedido</h3>
              <p>Producto: {selectedProduct?.nombre}</p>
              <p>Talle: {order.talle}</p>
              <p>
                Color:{" "}
                {coloresDisponibles.find((c) => c.hex === order.color)?.nombre}
              </p>
              <p>
                Estampa:{" "}
                {estampas.find((d) => d.id === order.estampaId)?.nombre ||
                  "Sin estampa"}
              </p>
              <p>
                Nombre: {nombre} {apellido}
              </p>
              <p>Precio: ${selectedProduct?.precio.toFixed(2)}</p>
              <div className="flex justify-center mt-6 gap-4">
                <button className="slot" onClick={() => setShowSummary(false)}>
                  Volver
                </button>
                <button
                  onClick={handleCreatePedido}
                  className="slot btn-secondary"
                >
                  Confirmar Pedido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Burgon;
