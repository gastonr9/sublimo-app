import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

build: {
    outDir: "dist" // tells vite to output the build to a folder called docs
  },
  base: '/' // tells vite to request dependencies from the root domain
})
