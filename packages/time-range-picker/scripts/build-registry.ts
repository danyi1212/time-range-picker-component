import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, "..");

function readSource(relativePath: string): string {
  return readFileSync(resolve(pkgRoot, relativePath), "utf-8");
}

function transformToShadcnPaths(source: string, fileType: "component" | "lib"): string {
  if (fileType === "component") {
    return source
      .replace(/from ["']\.\/utils["']/g, 'from "@/lib/utils"')
      .replace(/from ["']\.\/ui\//g, 'from "@/components/ui/')
      .replace(/from ["']\.\/time-range["']/g, 'from "@/lib/time-range"');
  }
  return source;
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "time-range-picker",
  type: "registry:ui",
  title: "Time Range Picker",
  description:
    "A time range picker with natural language parsing. Supports shortcuts (3h, 7d), presets (today, last week), date/time ranges, and natural language input.",
  dependencies: ["date-fns", "chrono-node"],
  registryDependencies: ["popover", "command", "badge", "button"],
  files: [
    {
      path: "components/time-range-picker.tsx",
      type: "registry:ui",
      content: transformToShadcnPaths(readSource("src/time-range-picker.tsx"), "component"),
    },
    {
      path: "lib/time-range.ts",
      type: "registry:lib",
      content: readSource("src/time-range.ts"),
    },
  ],
};

mkdirSync(resolve(pkgRoot, "registry"), { recursive: true });
writeFileSync(
  resolve(pkgRoot, "registry/time-range-picker.json"),
  JSON.stringify(registry, null, 2) + "\n",
);

console.log("Registry entry built: registry/time-range-picker.json");
