import React, { createContext, useContext, useState } from 'react';

interface Order {
  talle?: string;
  color?: string;
}

interface OrderContextType {
  order: Order;
  setOrder: (order: Partial<Order>) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [order, setOrderState] = useState<Order>({});

  const setOrder = (newOrder: Partial<Order>) => {
    setOrderState((prev) => ({ ...prev, ...newOrder }));
  };

  return (
    <OrderContext.Provider value={{ order, setOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder debe usarse dentro de un OrderProvider');
  return context;
};