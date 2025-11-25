// src/context/ProductContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/supabase/client"; // Asume la ruta de Supabase
import { getProductos } from "../services/inventario"; // Asume esta función existe y trae la data completa del producto con su inventario

// ===================================
// 1. TIPOS DE DATOS (ASUMIDOS)
// ===================================
interface InventarioItem {
  id: string;
  producto_id: string;
  talla: string;
  color: string;
  stock: number;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  inventario?: InventarioItem[]; // Lista de items de inventario (talle/color/stock)
  // ... otras propiedades del producto
}

interface ProductContextType {
  productos: Producto[];
  selectedProduct: Producto | null;
  loading: boolean;
  fetchProducts: () => Promise<void>; // Función para forzar la recarga
  setSelectedProduct: (product: Producto | null) => void;
}

// Inicialización del Contexto
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ===================================
// 2. PROVEEDOR DEL CONTEXTO
// ===================================
export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener los productos del servicio (incluyendo inventario)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // getProductos debe traer los productos con la información anidada del inventario
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================================
  // 3. EFECTO DE TIEMPO REAL (REALTIME)
  // ===================================
  useEffect(() => {
    // 1. Carga Inicial
    fetchProducts();

    // 2. Suscripción a la tabla 'inventario'
    const inventarioSubscription = supabase
      .channel("inventario-changes") // Nombre único del canal
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventario" },
        () => {
          console.log(
            "Cambio en inventario detectado. Recargando productos..."
          );
          // Si hay algún cambio en el inventario (stock), forzamos la recarga.
          fetchProducts();
        }
      )
      .subscribe();

    // Función de limpieza: desuscribirse al desmontar el componente
    return () => {
      supabase.removeChannel(inventarioSubscription);
    };
  }, [fetchProducts]);

  // Sincronizar el producto seleccionado si la lista global cambia
  useEffect(() => {
    if (selectedProduct) {
      const updatedProduct = productos.find((p) => p.id === selectedProduct.id);
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      } else if (productos.length > 0) {
        // Si el producto seleccionado ya no existe, seleccionar el primero
        setSelectedProduct(productos[0]);
      } else {
        setSelectedProduct(null);
      }
    } else if (productos.length > 0) {
      // Si no hay seleccionado, selecciona el primero por defecto
      setSelectedProduct(productos[0]);
    }
  }, [productos, selectedProduct]); // Depende de la lista de productos actualizada por fetchProducts/Realtime

  return (
    <ProductContext.Provider
      value={{
        productos,
        selectedProduct,
        loading,
        fetchProducts,
        setSelectedProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// ===================================
// 4. HOOK PERSONALIZADO
// ===================================
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
