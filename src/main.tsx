import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { OrderProvider } from "./context/OrderContext";
import "./styles/index.css";
import Header from "./components/common/Header";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <OrderProvider>
      <Header />

        <App />
      </OrderProvider>
    </HashRouter>
  </StrictMode>
);
