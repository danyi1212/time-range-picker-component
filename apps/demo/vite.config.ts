import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@danyi/time-range-picker": path.resolve(
        __dirname,
        "../../packages/time-range-picker/src/index.ts",
      ),
    },
  },
});
