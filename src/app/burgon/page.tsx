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

// Define the estampas interface
interface estampas {
  id: string;
  stock: number;
  selected: boolean;
  imagen_url: string;
  nombre: string;
}

const Burgon: React.FC = () => {
  const { order, setOrder, selectedProduct, setSelectedProduct } = useOrder();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState(
    order.productoId || ""
  );
  const [talles, setTalles] = useState<string[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<Color[]>([]);
  const [estampas, setEstampas] = useState<estampas[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  // Verificar autenticación
  useEffect(() => {
    if (isAuthReady && !user) {
      router.push("/login");
    }
  }, [isAuthReady, user, router]);

  // ============================
  // Cargar productos al inicio
  // ============================
  useEffect(() => {
    const cargarProductos = async () => {
      const productosData = await getProductos();
      setProductos(productosData);

      if (productosData.length > 0 && !selectedProductoId) {
      }
    };
    cargarProductos();
  }, [selectedProductoId]); // Added selectedProductoId

  // ============================
  // Función para cargar producto seleccionado
  // ============================
  const cargarProductoSeleccionado = useCallback(
    async (id: string) => {
      const producto = await getProductoPorId(id);

      if (producto) {
        setSelectedProduct(producto);
        setOrder((prev) => ({ ...prev, productoId: id }));

        // Talles con stock (ordenados)
        const tallesConStock = Array.from(
          new Set(
            producto.inventario
              ?.filter((i) => i.stock > 0)
              .map((i) => i.talla) || []
          )
        ).sort((a, b) => {
          const ordenTalles = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };
          return (
            ordenTalles[a as keyof typeof ordenTalles] -
            ordenTalles[b as keyof typeof ordenTalles]
          );
        });
        setTalles(tallesConStock);

        // Colores con stock
        const todosLosColores = Array.from(
          new Set(
            producto.inventario
              ?.filter((i) => i.stock > 0)
              .map((i) => i.color) || []
          )
        )
          .map((nombre) => ({ nombre, hex: getDefaultHex(nombre) }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        setColoresDisponibles(todosLosColores);
      } else {
        setSelectedProduct(null);
        setTalles([]);
        setColoresDisponibles([]);
      }
    },
    [setSelectedProduct, setOrder, setTalles, setColoresDisponibles]
  );

  // ============================
  // Cargar productos al inicio
  // ============================
  useEffect(() => {
    const cargarProductos = async () => {
      const productosData = await getProductos();
      setProductos(productosData);

      if (productosData.length > 0 && !selectedProductoId) {
        const firstProductId = productosData[0].id;
        setSelectedProductoId(firstProductId);
        cargarProductoSeleccionado(firstProductId);
      }
    };
    cargarProductos();
  }, [selectedProductoId, setSelectedProductoId, cargarProductoSeleccionado]);

  // ============================
  // Cargar producto seleccionado al cambiar ID
  // ============================
  useEffect(() => {
    if (selectedProductoId) {
      cargarProductoSeleccionado(selectedProductoId);
    } else {
      setSelectedProduct(null);
      setTalles([]);
      setColoresDisponibles([]);
    }
  }, [
    selectedProductoId,
    cargarProductoSeleccionado,
    setSelectedProduct,
    setTalles,
    setColoresDisponibles,
  ]);

  // actualizar colores según talle y autoseleccionar el primero
  useEffect(() => {
    if (selectedProduct && order.talle && selectedProduct.inventario) {
      const coloresPorTalle = selectedProduct.inventario
        .filter((i) => i.talla === order.talle && i.stock > 0)
        .map((i) => ({ nombre: i.color, hex: getDefaultHex(i.color) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      setColoresDisponibles(coloresPorTalle);

      if (!order.color || !coloresPorTalle.some((c) => c.hex === order.color)) {
        if (coloresPorTalle.length > 0) {
          setOrder((prevOrder) => ({
            ...prevOrder,
            color: coloresPorTalle[0].hex,
          }));
        } else {
          setOrder((prevOrder) => ({ ...prevOrder, color: "" }));
        }
      }
    } else if (selectedProduct && selectedProduct.inventario) {
      // --- START OF FIX ---
      const uniqueColorNames = [
        ...new Set(
          selectedProduct.inventario
            .filter((i) => i.stock > 0)
            .map((i) => i.color)
        ),
      ];
      const todosLosColores = uniqueColorNames
        .map((nombre) => ({ nombre, hex: getDefaultHex(nombre) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      // --- END OF FIX ---

      setColoresDisponibles(todosLosColores);

      setOrder((prevOrder) => ({ ...prevOrder, color: "" }));
    } else {
      setColoresDisponibles([]);
      setOrder((prevOrder) => ({ ...prevOrder, color: "" }));
    }
  }, [order.talle, selectedProduct, order.color, setOrder]);

  // cargar estampas
  useEffect(() => {
    const cargarEstampas = async () => {
      try {
        const data = await getEstampas();
        // REMOVED `design.selected` filter
        const filteredEstampas = data.filter((design) => design.stock > 0);
        setEstampas(filteredEstampas);
      } catch (err) {
        console.error("Error trayendo estampas:", err);
      }
    };
    cargarEstampas();
  }, []);

  // ajustar preview del estampa
  // This useEffect is no longer needed as designStyle state has been removed.
  // If styling for RemeraPreview is required, it should be handled differently.

  const handleProductoSelect = (id: string) => {
    setSelectedProductoId(id);
    setOrder({ ...order, talle: "", color: "", productoId: id });
  };

  const handleTalleSelect = (talle: string) => {
    setOrder({ ...order, talle });
  };

  const handleColorSelect = (colorHex: string) => {
    const colorNombre = coloresDisponibles.find(
      (c) => c.hex === colorHex
    )?.nombre;
    if (colorNombre) setOrder({ ...order, color: colorHex });
  };

  const handleEstampasSelect = (estampaId: string, estampaUrl: string) => {
    if (order.talle && order.color) {
      setOrder({ ...order, estampaId, estampaUrl });
    }
  };

  const handleNext = () => {
    if (order.talle && order.color && order.estampaId) {
      setShowModal(true);
    } else {
      alert("Por favor, selecciona talle, color y estampa.");
    }
  };

  const handleSaveDetails = () => {
    if (nombre && apellido) {
      setShowSummary(true);
    }
  };

  const handleCreatePedido = async () => {
    // Add an early return check to ensure all necessary data is present
    if (!selectedProduct || !order.talle || !order.color || !order.estampaId) {
      alert(
        "Por favor, completa todas las selecciones antes de crear el pedido."
      );
      return;
    }

    const colorNombre = coloresDisponibles.find(
      (c) => c.hex === order.color
    )?.nombre;

    // Check if a valid color name was found
    if (!colorNombre) {
      alert("Color seleccionado no válido.");
      return;
    }

    try {
      // 1. Buscar inventario (producto + talle + color)
      const { data: inv, error: invError } = await supabase
        .from("inventario")
        .select("id, stock")
        .eq("producto_id", selectedProduct.id)
        .eq("talla", order.talle)
        .eq("color", colorNombre)
        .single();

      if (invError || !inv || inv.stock <= 0) {
        alert("No hay stock disponible para este producto/talle/color.");
        console.error("Error fetching inventory:", invError);
        return;
      }

      // 2. Buscar estampa
      const { data: estampa, error: estampaError } = await supabase
        .from("estampas")
        .select("id, stock")
        .eq("id", order.estampaId)
        .single();

      if (estampaError || !estampa || estampa.stock <= 0) {
        alert("No hay stock disponible para este estampa.");
        console.error("Error fetching design:", estampaError);
        return;
      }

      // 3. Crear pedido y actualizar stock en una sola llamada RPC (recomendado)
      const { error: rpcError } = await supabase.rpc(
        "crear_pedido_y_actualizar_stock",
        {
          p_nombre: nombre,
          p_apellido: apellido,
          p_inventario_id: inv.id,
          p_estampa_id: estampa.id,
        }
      );

      if (rpcError) {
        console.error("Error al crear el pedido (RPC):", rpcError);
        alert("❌ Error al crear pedido: " + rpcError.message);
        return;
      }

      // Close modal and reset state on success
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

      alert("✅ Pedido creado con éxito.");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error general al crear pedido:", error.message);
        alert("❌ Error general al crear pedido.");
      } else {
        console.error("Error general al crear pedido:", error);
        alert("❌ Error general al crear pedido.");
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
                disabled={!selectedProduct}
              >
                {talle}
              </button>
            ))
          ) : selectedProduct ? (
            <p className="text-gray-600">
              No hay talles disponibles para este producto
            </p>
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
                onClick={() =>
                  order.talle ? handleColorSelect(color.hex) : null
                }
                disabled={!order.talle || !selectedProduct}
              >
                <span className="text-gray-800">{color.nombre}</span>
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            ))
          ) : selectedProduct && order.talle ? (
            <p className="text-gray-600">
              No hay colores disponibles para este talle
            </p>
          ) : (
            <p className="text-gray-600">
              Selecciona un talle para habilitar colores
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
          <div className="flex flex-wrap gap-4 justify-center">
            {estampas.length > 0 ? (
              estampas.map((design) => (
                <div key={design.id} className="flex flex-col items-center">
                  <button
                    className={`logo relative w-24 h-24 border rounded-lg overflow-hidden ${
                      order.estampaId === design.id
                        ? "ring-2 ring-indigo-500 bg-indigo-100 border-indigo-600"
                        : ""
                    } ${
                      !order.talle || !order.color
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() =>
                      handleEstampasSelect(design.id, design.imagen_url)
                    }
                    disabled={!order.talle || !order.color}
                  >
                    <Image
                      src={design.imagen_url}
                      alt={design.nombre}
                      fill
                      className="object-contain p-1"
                    ></Image>
                  </button>
                  <p className="text-center text-xs font-medium text-gray-700 mt-1 uppercase">
                    {design.nombre}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No hay estampas disponibles</p>
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
            disabled={
              !selectedProduct ||
              !order.talle ||
              !order.color ||
              !order.estampaId
            }
          >
            Siguiente
          </button>
        </div>

        {/* Modal para ingresar nombre y apellido */}
        {showModal && !showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Ingresa tus datos</h3>
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border rounded-lg p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="border rounded-lg p-2 mb-4 w-full"
              />
              <div className="gap-4 flex">
                <button
                  className="w-full slot"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="slot w-full btn-secondary"
                  onClick={handleSaveDetails}
                  disabled={!nombre || !apellido}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para resumen del pedido */}
        {showModal && showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Resumen del pedido</h3>
              <p>Producto: {selectedProduct?.nombre}</p>
              <p>Talle: {order.talle}</p>
              <p>
                Color:{" "}
                {coloresDisponibles.find((c) => c.hex === order.color)
                  ?.nombre || order.color}
              </p>
              <p>
                Estampa:{" "}
                {estampas.find((d) => d.id === order.estampaId)?.nombre ||
                  "Sin estampa"}
              </p>
              <p>Nombre: {nombre}</p>
              <p>Apellido: {apellido}</p>
              <p>Precio: ${selectedProduct?.precio.toFixed(2) || "0.00"}</p>
              <div className="flex justify-center mt-6">
                <button className="slot" onClick={() => setShowSummary(false)}>
                  Volver
                </button>
                <button
                  onClick={handleCreatePedido}
                  className="slot btn-secondary"
                >
                  Guardar Pedido
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
