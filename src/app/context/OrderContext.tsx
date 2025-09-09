// src/context/OrderContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Order {
  talle?: string;
  color?: string;
  productoId?: string; // ID del producto seleccionado
}

interface OrderContextType {
  order: Order;
  setOrder: (order: Order) => void;
  selectedProduct?: Producto | null; // Producto seleccionado con su inventario
  setSelectedProduct: (product: Producto | null) => void;
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
