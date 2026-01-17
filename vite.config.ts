import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    port: 5173,
    proxy: {
      "/admin": {
        target: "http://localhost:8080/bookvexe-be-j2e",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:8080/bookvexe-be-j2e",
        changeOrigin: true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
