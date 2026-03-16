import { defineConfig } from "vitest/config";

export default defineConfig({
  css: { postcss: {} },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    setupFiles: ["src/test-setup.ts"],
  },
});
