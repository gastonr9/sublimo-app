// src/context/OrderContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Producto } from "@/app/types"; // <-- IMPORTA EL TIPO

interface Order {
  talle?: string;
  color?: string;
  productoId?: string; // ID del producto seleccionado
  estampaId?: string; // Add this line
  estampaUrl?: string; // Add this line
}

interface OrderContextType {
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
  selectedProduct: Producto | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Producto | null>>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [order, setOrder] = useState<Order>({});
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  return (
    <OrderContext.Provider
      value={{ order, setOrder, selectedProduct, setSelectedProduct }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder debe usarse dentro de OrderProvider");
  return context;
};
