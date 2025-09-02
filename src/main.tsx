import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { OrderProvider } from "./context/OrderContext";
import "./styles/index.css";
import { AuthProvider } from "./context/AuthContext";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <OrderProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </OrderProvider>
    </HashRouter>
  </StrictMode>
);
