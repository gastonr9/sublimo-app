import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/sublimo-app/", // solo si tu repo se llama así
  assetsInclude: ["**/*.glb"], // ✅ si querés importar con `?url`
});
