import React, { createContext, useContext, useState } from "react";

type Order = {
  talle: string;
  producto: string;
  color: string;
  diseño: string;
  precio: number;
};

type OrderContextType = {
  order: Order;
  setOrder: (order: Partial<Order>) => void;
};

const defaultOrder: Order = {
  talle: "",
  producto: "",
  color: "#ffffff",
  diseño: "",
  precio: 0,
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [order, updateOrder] = useState<Order>(defaultOrder);

  const setOrder = (newValues: Partial<Order>) => {
    updateOrder((prev) => ({ ...prev, ...newValues }));
  };

  return (
    <OrderContext.Provider value={{ order, setOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder debe usarse dentro de OrderProvider");
  return context;
};
