import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/time-range-picker.tsx", "src/time-range.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
});
