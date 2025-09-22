"use client";
import { AuthProvider } from "@/app/context/AuthContext";
import { OrderProvider } from "@/app/context/OrderContext";
import Navbar from "@/app/components/common/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <OrderProvider>
        <Navbar />
        <main className="flex-1 w-full pt-20">{children}</main>
      </OrderProvider>
    </AuthProvider>
  );
}
