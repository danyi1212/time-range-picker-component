const SHELL_PREFIXES = [
  "npm ",
  "pnpm ",
  "bun ",
  "yarn ",
  "npx ",
  "pnpm dlx ",
  "bunx ",
  "git ",
  "curl ",
];

export function inferCodeLanguage(code: string): string {
  const trimmed = code.trim();

  if (SHELL_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return "bash";
  }

  if (
    trimmed.startsWith("<") ||
    trimmed.includes("</") ||
    (trimmed.includes("return (") && trimmed.includes("<"))
  ) {
    return "tsx";
  }

  if (
    trimmed.includes("type ") ||
    trimmed.includes("interface ") ||
    trimmed.includes(": string") ||
    trimmed.includes(" as const") ||
    trimmed.includes("import type ")
  ) {
    return "ts";
  }

  if (trimmed.includes("import ") || trimmed.includes("export ")) {
    return "tsx";
  }

  return "text";
}
