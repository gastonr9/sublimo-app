import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/common/Navbar";
import { OrderProvider } from "./context/OrderContext";

export const metadata: Metadata = {
  title: "Sublimo App",
  description: "Sublimo & Burgon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <OrderProvider>
        <body className=" antialiased flex flex-col min-h-screen">
          <Navbar></Navbar>
          <main className="flex-1 w-full ">{children}</main>
        </body>
      </OrderProvider>
    </html>
  );
}
