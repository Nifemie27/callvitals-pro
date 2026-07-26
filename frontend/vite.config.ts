import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Recharts + shadcn + Query + Router are all needed by the default
    // (Dashboard) route, so route-level code-splitting doesn't reduce this —
    // it's the expected weight of a chart-heavy dashboard, not an oversight.
    chunkSizeWarningLimit: 1000,
  },
});
