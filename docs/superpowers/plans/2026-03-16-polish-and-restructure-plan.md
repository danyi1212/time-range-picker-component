# Polish & Restructure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure a Next.js time-range-picker demo into a polished pnpm monorepo with a shadcn-compatible library package, Vite demo app, modern tooling, and comprehensive tests.

**Architecture:** pnpm workspaces with `packages/time-range-picker` (publishable library) and `apps/demo` (Vite showcase). Library ships TypeScript source (shadcn convention). shadcn CLI registry entry generated via build script with inlined file contents.

**Tech Stack:** React 19, Vite, Tailwind CSS 4, Vitest, Playwright, oxlint, oxfmt, husky, lint-staged, pnpm workspaces

**Spec:** `docs/superpowers/specs/2026-03-16-polish-and-restructure-design.md`

---

## Chunk 1: Scaffold Monorepo & Migrate Library

### Task 1: Create monorepo root config

**Files:**
- Create: `pnpm-workspace.yaml`
- Modify: `package.json` (root)

- [x] **Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [x] **Step 2: Rewrite root package.json**

Replace the current root `package.json` with a workspace root config. Remove all app-level dependencies — they'll move to the workspace packages.

```json
{
  "name": "time-range-picker-component",
  "private": true,
  "scripts": {
    "lint": "oxlint .",
    "fmt": "oxfmt .",
    "fmt:check": "oxfmt --check .",
    "test": "pnpm -r test",
    "test:e2e": "pnpm --filter demo test:e2e",
    "typecheck": "pnpm -r typecheck",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^15.4.3",
    "oxlint": "^0.16.10",
    "oxfmt": "^0.40.0",
    "typescript": "^5.7.3"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["oxlint --fix", "oxfmt"],
    "*.{css,json,yaml}": ["oxfmt"]
  },
  "packageManager": "pnpm@10.11.0"
}
```

- [x] **Step 3: Delete old lockfile and install**

The old `pnpm-lock.yaml` references dependencies from the previous flat project. Delete it and reinstall:

```bash
rm pnpm-lock.yaml && pnpm install
```

(Will warn about missing workspace packages — that's expected at this stage.)

- [x] **Step 4: Commit**

```bash
git add pnpm-workspace.yaml package.json
git commit -m "chore: scaffold pnpm monorepo workspace root"
```

---

### Task 2: Create library package and migrate source files

**Files:**
- Create: `packages/time-range-picker/package.json`
- Create: `packages/time-range-picker/tsconfig.json`
- Create: `packages/time-range-picker/vitest.config.ts`
- Move: `lib/time-range.ts` → `packages/time-range-picker/src/time-range.ts`
- Move: `lib/time-range.test.ts` → `packages/time-range-picker/src/time-range.test.ts`
- Move: `lib/utils.ts` → `packages/time-range-picker/src/utils.ts`
- Move: `components/time-range-picker.tsx` → `packages/time-range-picker/src/time-range-picker.tsx`
- Move: `components/ui/popover.tsx` → `packages/time-range-picker/src/ui/popover.tsx`
- Move: `components/ui/command.tsx` → `packages/time-range-picker/src/ui/command.tsx` (strip CommandDialog)
- Move: `components/ui/badge.tsx` → `packages/time-range-picker/src/ui/badge.tsx`
- Move: `components/ui/button.tsx` → `packages/time-range-picker/src/ui/button.tsx`
- Create: `packages/time-range-picker/src/index.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/time-range-picker/src/ui
```

- [ ] **Step 2: Create library package.json**

```json
{
  "name": "@danyi/time-range-picker",
  "version": "0.1.0",
  "type": "module",
  "private": false,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./time-range-picker": "./src/time-range-picker.tsx",
    "./time-range": "./src/time-range.ts"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "tailwindcss": ">=4"
  },
  "dependencies": {
    "date-fns": "^4.1.0",
    "chrono-node": "^2.7.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "lucide-react": "^0.564.0",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-slot": "^1.2.4",
    "cmdk": "^1.1.1"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "jsdom": "^26.1.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "vitest": "^2.1.8",
    "@vitest/ui": "^2.1.8"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "typecheck": "tsc --noEmit"
  },
  "files": ["src/", "registry/", "README.md"]
}
```

- [ ] **Step 3: Create library tsconfig.json**

No `@/` path alias — the library uses relative imports exclusively.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

All imports in the library files will be converted to relative paths (no `@/` aliases). This makes the package portable and avoids any alias resolution issues. The `@/` alias is NOT used in the library — only the demo app uses it.

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
  },
});
```

No `@` alias needed — all library imports use relative paths.

- [ ] **Step 5: Move and update source files**

Copy files to their new locations:

```bash
cp lib/time-range.ts packages/time-range-picker/src/time-range.ts
cp lib/time-range.test.ts packages/time-range-picker/src/time-range.test.ts
cp lib/utils.ts packages/time-range-picker/src/utils.ts
cp components/time-range-picker.tsx packages/time-range-picker/src/time-range-picker.tsx
cp components/ui/popover.tsx packages/time-range-picker/src/ui/popover.tsx
cp components/ui/command.tsx packages/time-range-picker/src/ui/command.tsx
cp components/ui/badge.tsx packages/time-range-picker/src/ui/badge.tsx
cp components/ui/button.tsx packages/time-range-picker/src/ui/button.tsx
```

- [ ] **Step 6: Update import paths in all moved library files**

All files currently use `@/lib/utils` and `@/components/ui/*` path aliases. Since the library's `@` alias points to the package root and files now live under `src/`, we need to use relative imports instead (more portable, no alias dependency):

**`src/time-range-picker.tsx`** — update imports:
```typescript
// OLD:
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { TimeRange, parseTimeRange, getFilteredPresets, formatDuration, formatRangeDisplay, getPresets, ClockFormat } from "@/lib/time-range";

// NEW:
import { cn } from "./utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "./ui/command";
import { TimeRange, parseTimeRange, getFilteredPresets, formatDuration, formatRangeDisplay, getPresets, ClockFormat } from "./time-range";
```

Also remove `"use client"` directives from all library files — let consumers decide. This applies to `time-range-picker.tsx`, `popover.tsx`, `command.tsx`, and `separator.tsx`.

**`src/ui/popover.tsx`** — update:
```typescript
// OLD: import { cn } from '@/lib/utils'
// NEW:
import { cn } from '../utils'
```

**`src/ui/command.tsx`** — update imports AND strip CommandDialog:
```typescript
// OLD:
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// NEW: remove dialog import entirely
import { cn } from '../utils'
```

Remove the entire `CommandDialog` function (lines 32-61 of original) and remove `CommandDialog` from the export statement.

**`src/ui/badge.tsx`** — update:
```typescript
// OLD: import { cn } from '@/lib/utils'
// NEW:
import { cn } from '../utils'
```

**`src/ui/button.tsx`** — update:
```typescript
// OLD: import { cn } from '@/lib/utils'
// NEW:
import { cn } from '../utils'
```

**`src/time-range.test.ts`** — update:
```typescript
// OLD: import { ... } from "./time-range";
// NEW: (stays the same — already uses relative import)
```

- [ ] **Step 7: Create barrel export `src/index.ts`**

```typescript
export { TimeRangePicker } from "./time-range-picker";
export type { TimeRange, TimeRangePreset, ClockFormat } from "./time-range";
export {
  parseTimeRange,
  formatDuration,
  formatRangeDisplay,
  formatPresetHint,
  getPresets,
  getFilteredPresets,
} from "./time-range";
export { Badge, badgeVariants } from "./ui/badge";
export { Button, buttonVariants } from "./ui/button";
```

- [ ] **Step 8: Install library dependencies and run existing tests**

```bash
cd packages/time-range-picker && pnpm install
```

Run: `cd packages/time-range-picker && pnpm test`
Expected: All 68 existing tests pass.

- [ ] **Step 9: Commit**

```bash
git add packages/time-range-picker/
git commit -m "feat: create library package with migrated source and tests"
```

---

### Task 3: Create Vite demo app

**Files:**
- Create: `apps/demo/package.json`
- Create: `apps/demo/tsconfig.json`
- Create: `apps/demo/vite.config.ts`
- Create: `apps/demo/index.html`
- Create: `apps/demo/src/main.tsx`
- Create: `apps/demo/src/App.tsx` (migrated from `app/page.tsx`)
- Create: `apps/demo/src/globals.css` (from `app/globals.css`)
- Copy: `components/ui/card.tsx` → `apps/demo/src/components/card.tsx`
- Copy: `components/ui/separator.tsx` → `apps/demo/src/components/separator.tsx`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p apps/demo/src/components apps/demo/e2e
```

- [ ] **Step 2: Create demo package.json**

```json
{
  "name": "demo",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@danyi/time-range-picker": "workspace:*",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "lucide-react": "^0.564.0",
    "@radix-ui/react-separator": "^1.1.8",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@tailwindcss/vite": "^4.2.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.5.2",
    "tailwindcss": "^4.2.0",
    "tw-animate-css": "^1.3.3",
    "vite": "^6.3.5"
  }
}
```

- [ ] **Step 3: Create demo tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Time Range Picker — Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create src/main.tsx**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 7: Create src/globals.css**

Copy `app/globals.css` as-is (it already has `@import 'tailwindcss'` and `@import 'tw-animate-css'`, theme variables, and dark mode). No changes needed — it doesn't reference anything Next.js-specific.

```bash
cp app/globals.css apps/demo/src/globals.css
```

- [ ] **Step 8: Create src/App.tsx (migrate from app/page.tsx)**

Adapt `app/page.tsx` with these changes:
- Remove `"use client"` directive
- Change `export default function` to `export default function App`
- Import `TimeRangePicker` from `@danyi/time-range-picker`
- Import `TimeRange`, `formatDuration`, `formatRangeDisplay`, `ClockFormat` from `@danyi/time-range-picker`
- Import `Badge`, `Button` from `@danyi/time-range-picker`
- Import `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` from `@/components/card`
- Import `Separator` from `@/components/separator`
- Import icons from `lucide-react`
- Remove hydration guard (`mounted` state and SSR placeholder) — Vite is client-only, no hydration needed

The demo app component structure stays the same, just the imports change and the hydration guard is removed.

- [ ] **Step 9: Copy demo-only shadcn components**

```bash
cp components/ui/card.tsx apps/demo/src/components/card.tsx
cp components/ui/separator.tsx apps/demo/src/components/separator.tsx
```

Update import paths in both files:
- `@/lib/utils` → inline the `cn` utility or create a local utils.ts

Create `apps/demo/src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Update `apps/demo/src/components/card.tsx`:
```typescript
// OLD: import { cn } from '@/lib/utils'
// NEW:
import { cn } from '@/lib/utils'
```
(This already works because the demo's `@` alias points to `src/` and we created `src/lib/utils.ts`)

Update `apps/demo/src/components/separator.tsx`:
```typescript
// Same — import { cn } from '@/lib/utils' already works
```

- [ ] **Step 10: Install demo dependencies and verify dev server starts**

```bash
cd /path/to/root && pnpm install
cd apps/demo && pnpm dev
```

Expected: Vite dev server starts, demo page renders at `http://localhost:5173` with working time range picker.

- [ ] **Step 11: Commit**

```bash
git add apps/demo/
git commit -m "feat: create Vite demo app with migrated page"
```

---

## Chunk 2: Tooling, Hooks & Cleanup

### Task 4: Set up oxlint, oxfmt, husky, and lint-staged

**Files:**
- Modify: `package.json` (root — already has devDependencies from Task 1)
- Create: `.husky/pre-commit`

- [ ] **Step 1: Install root dev dependencies**

```bash
pnpm install -D husky lint-staged oxlint oxfmt -w
```

- [ ] **Step 2: Initialize husky**

```bash
pnpm exec husky init
```

This creates `.husky/pre-commit` with a default script.

- [ ] **Step 3: Configure pre-commit hook**

Write `.husky/pre-commit`:
```bash
pnpm exec lint-staged
```

- [ ] **Step 4: Initialize oxfmt config**

```bash
pnpm exec oxfmt --init
```

This creates `.oxfmtrc.json` with defaults. Review and adjust if needed.

- [ ] **Step 5: Run formatter on entire codebase**

```bash
pnpm fmt
```

This formats all `.ts`, `.tsx`, `.css`, `.json`, `.yaml` files.

- [ ] **Step 6: Run linter on entire codebase**

```bash
pnpm lint
```

Fix any reported issues.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: add oxlint, oxfmt, husky, and lint-staged"
```

---

### Task 5: Delete old files and clean up

**Files to delete:**
- `app/` (entire directory — layout.tsx, page.tsx, globals.css)
- `components/` (entire directory — all 60+ shadcn components, time-range-picker.tsx, theme-provider.tsx)
- `hooks/` (entire directory — use-mobile.ts, use-toast.ts)
- `lib/` (entire directory — moved to packages/)
- `scripts/` (run-tests.ts, run-tests.js)
- `styles/` (duplicate globals.css)
- `public/` (unused placeholder assets)
- `next.config.mjs`
- `postcss.config.mjs`
- `components.json`
- `vitest.config.ts` (root — now in library package)

- [ ] **Step 1: Delete old source directories**

```bash
rm -rf app/ components/ hooks/ lib/ scripts/ styles/ public/
```

- [ ] **Step 2: Delete old config files**

```bash
rm -f next.config.mjs postcss.config.mjs components.json vitest.config.ts tsconfig.json
```

Note: the root `tsconfig.json` has stale Next.js references (`.next/types`, `next-env.d.ts`). Each workspace package has its own `tsconfig.json` now.

- [ ] **Step 3: Update .gitignore**

Remove any Next.js-specific entries (`.next/`) and add Vite/Playwright entries:

```
node_modules
dist
.next
*.tsbuildinfo

# Vite
apps/demo/dist

# Playwright
apps/demo/e2e/test-results
apps/demo/e2e/playwright-report

# OS
.DS_Store
```

- [ ] **Step 4: Remove unused dependencies from pnpm-lock.yaml**

```bash
pnpm install
```

This will clean the lockfile since we deleted package.json entries that referenced old deps.

- [ ] **Step 5: Verify library tests still pass**

Run: `pnpm test`
Expected: All 68 tests pass in the library workspace.

- [ ] **Step 6: Verify demo dev server still works**

Run: `cd apps/demo && pnpm dev`
Expected: Dev server starts, page renders correctly.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove Next.js, unused shadcn components, and old files"
```

---

## Chunk 3: Component Tests

### Task 6: Write component tests for TimeRangePicker

**Files:**
- Create: `packages/time-range-picker/src/time-range-picker.test.tsx`

These tests exercise the React component in jsdom using `@testing-library/react`. The vitest config already has `environment: "jsdom"` set up from Task 2.

- [ ] **Step 1: Create test setup file**

Create `packages/time-range-picker/src/test-setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Update `packages/time-range-picker/vitest.config.ts` to include setup:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    setupFiles: ["src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Write component tests**

Create `packages/time-range-picker/src/time-range-picker.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { TimeRangePicker } from "./time-range-picker";
import type { TimeRange } from "./time-range";

describe("TimeRangePicker", () => {
  test("renders with default placeholder", () => {
    render(<TimeRangePicker />);
    expect(screen.getByPlaceholderText("Search time range...")).toBeInTheDocument();
  });

  test("renders with custom placeholder", () => {
    render(<TimeRangePicker placeholder="Pick a time..." />);
    expect(screen.getByPlaceholderText("Pick a time...")).toBeInTheDocument();
  });

  test("opens popover on input focus", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await waitFor(() => {
      expect(screen.getByText("Presets")).toBeInTheDocument();
    });
  });

  test("displays presets when popover is open", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await waitFor(() => {
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Yesterday")).toBeInTheDocument();
    });
  });

  test("shows examples section when no input", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await waitFor(() => {
      expect(screen.getByText("Examples")).toBeInTheDocument();
      expect(screen.getByText("Try typing:")).toBeInTheDocument();
    });
  });

  test("parses typed input and shows preview", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await userEvent.type(input, "3h");
    await waitFor(() => {
      expect(screen.getByText("Parsed Result")).toBeInTheDocument();
    });
  });

  test("selects a preset and fires onChange", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await waitFor(() => {
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("Past 1 hour"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0] as TimeRange;
    expect(range.start).toBeInstanceOf(Date);
    expect(range.end).toBeInstanceOf(Date);
    expect(range.isLive).toBe(true);
  });

  test("Enter key selects parsed result", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await userEvent.type(input, "3h");
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0] as TimeRange;
    expect(range.isLive).toBe(true);
  });

  test("Escape key closes popover", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await waitFor(() => {
      expect(screen.getByText("Presets")).toBeInTheDocument();
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText("Presets")).not.toBeInTheDocument();
    });
  });

  test("clear button resets value", async () => {
    const onChange = vi.fn();
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T14:30:00"),
      isLive: true,
    };
    render(<TimeRangePicker value={value} onChange={onChange} />);
    const clearButton = screen.getByRole("button", { name: /clear selection/i });
    await userEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  test("shows duration badge when range is selected", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T14:30:00"),
      isLive: false,
    };
    render(<TimeRangePicker value={value} />);
    expect(screen.getByText("3h")).toBeInTheDocument();
  });

  test("controlled mode reflects external value changes", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T14:30:00"),
      isLive: false,
    };
    const { rerender } = render(<TimeRangePicker value={value} />);
    expect(screen.getByText("3h")).toBeInTheDocument();

    const newValue: TimeRange = {
      start: new Date("2024-03-15T00:00:00"),
      end: new Date("2024-03-15T23:59:59"),
      isLive: false,
    };
    rerender(<TimeRangePicker value={newValue} />);
    // Duration should update
    expect(screen.queryByText("3h")).not.toBeInTheDocument();
  });

  test("invalid input shows no results message", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    await userEvent.click(input);
    await userEvent.type(input, "asdfghjkl");
    await waitFor(() => {
      expect(screen.getByText(/could not parse/i)).toBeInTheDocument();
    });
  });

  test("12h clock format changes display", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T14:00:00"),
      end: new Date("2024-03-15T16:30:00"),
      isLive: false,
    };
    const { rerender } = render(
      <TimeRangePicker value={value} clockFormat="24h" />,
    );
    // 24h format shows as placeholder text
    const input24 = screen.getByRole("textbox") as HTMLInputElement;
    expect(input24.placeholder).toContain("14:00");

    rerender(<TimeRangePicker value={value} clockFormat="12h" />);
    const input12 = screen.getByRole("textbox") as HTMLInputElement;
    expect(input12.placeholder).toContain("2:00 PM");
  });
});
```

- [ ] **Step 3: Add @testing-library/user-event to devDependencies**

```bash
cd packages/time-range-picker && pnpm add -D @testing-library/user-event
```

- [ ] **Step 4: Run component tests**

Run: `cd packages/time-range-picker && pnpm test`
Expected: All unit tests (68) + new component tests pass.

Some component tests may fail due to jsdom limitations with Radix UI portals. If so, adjust by:
1. Mocking `PopoverContent` portal rendering
2. Using `baseElement` queries instead of `screen` for portaled content
3. Adding `ResizeObserver` and `IntersectionObserver` polyfills to test setup

Debug and fix iteratively until all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/time-range-picker/src/time-range-picker.test.tsx packages/time-range-picker/src/test-setup.ts packages/time-range-picker/vitest.config.ts packages/time-range-picker/package.json
git commit -m "test: add component tests for TimeRangePicker"
```

---

## Chunk 4: E2E Tests

### Task 7: Set up Playwright and write E2E tests

**Files:**
- Create: `apps/demo/e2e/playwright.config.ts`
- Create: `apps/demo/e2e/time-range-picker.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd apps/demo && pnpm exec playwright install chromium
```

- [ ] **Step 2: Create Playwright config**

Create `apps/demo/playwright.config.ts` (at demo root, not inside e2e/):

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Write E2E tests**

Create `apps/demo/e2e/time-range-picker.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Time Range Picker Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with picker visible and no console errors", async ({ page }) => {
    // Register listener BEFORE navigating so we catch all errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByText("Natural Language Time Range Picker")).toBeVisible();
    await expect(page.getByPlaceholderText("Search time range...")).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test("preset selection shows result card", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await expect(page.getByText("Past 1 hour")).toBeVisible();
    await page.getByText("Past 1 hour").click();

    await expect(page.getByText("Selected Range")).toBeVisible();
    await expect(page.getByText("1h")).toBeVisible();
    await expect(page.getByText("ISO Timestamps")).toBeVisible();
  });

  test("shortcut input parses correctly", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await input.fill("3h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
    await expect(page.getByText("3h")).toBeVisible();
  });

  test("natural language input", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await input.fill("last friday");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
  });

  test("date range input", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await input.fill("Mar 3 - Mar 13");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
    // Verify the dates show up in the ISO timestamps section
    const startField = page.locator("text=Start").locator("..").locator(".font-mono");
    await expect(startField).toContainText("03");
  });

  test("time range input", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await input.fill("9am - 5pm");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
  });

  test("clear selection", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await page.getByText("Today").click();
    await expect(page.getByText("Selected Range")).toBeVisible();

    // Click clear button (X icon)
    await page.getByRole("button", { name: /clear selection/i }).click();
    await expect(page.getByText("Selected Range")).not.toBeVisible();
  });

  test("keyboard flow: type, enter, escape", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await input.fill("1h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Selected Range")).toBeVisible();

    // Escape closes the dropdown if reopened
    await input.click();
    await expect(page.getByText("Presets")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Presets")).not.toBeVisible();
  });

  test("dark mode toggle", async ({ page }) => {
    // Initially light mode
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    // Click theme toggle (the button with Moon icon)
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await expect(html).toHaveClass(/dark/);

    // Toggle back
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("12h/24h format toggle", async ({ page }) => {
    // Select a range first
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await page.getByText("Past 1 hour").click();

    // Default is 24h — check the toggle button text
    const formatToggle = page.getByRole("button", { name: /24h|12h/ });
    await expect(formatToggle).toContainText("24h");

    // Switch to 12h
    await formatToggle.click();
    await expect(formatToggle).toContainText("12h");
  });

  test("responsive layout at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByPlaceholderText("Search time range...")).toBeVisible();
    await expect(page.getByText("Supported Input Formats")).toBeVisible();
  });

  test("responsive layout at desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByPlaceholderText("Search time range...")).toBeVisible();
    await expect(page.getByText("Supported Input Formats")).toBeVisible();
  });

  test("invalid input shows error message", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await input.fill("asdfgh");
    await expect(page.getByText(/could not parse/i)).toBeVisible();
  });

  test("long range: past 90 days", async ({ page }) => {
    const input = page.getByPlaceholderText("Search time range...");
    await input.click();
    await input.fill("90d");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Selected Range")).toBeVisible();
  });
});
```

- [ ] **Step 4: Run E2E tests**

Run: `cd apps/demo && pnpm test:e2e`
Expected: All E2E tests pass against the running Vite dev server.

Debug and fix iteratively. Common issues:
- Timing: add `waitFor` or increase timeouts for slow renders
- Selectors: adjust if DOM structure differs from expectations
- Portal rendering: popover content may be outside the main DOM tree

- [ ] **Step 5: Commit**

```bash
git add apps/demo/playwright.config.ts apps/demo/e2e/ apps/demo/package.json
git commit -m "test: add Playwright E2E tests for demo app"
```

---

## Chunk 5: shadcn Registry & Final Polish

### Task 8: Create shadcn registry build script

**Files:**
- Create: `packages/time-range-picker/scripts/build-registry.ts`
- Create: `packages/time-range-picker/registry/` (output directory)

- [ ] **Step 1: Create the build script**

Create `packages/time-range-picker/scripts/build-registry.ts`:

```typescript
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, "..");

function readSource(relativePath: string): string {
  return readFileSync(resolve(pkgRoot, relativePath), "utf-8");
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
      content: readSource("src/time-range-picker.tsx"),
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
```

- [ ] **Step 2: Add build:registry script to library package.json**

Add to `packages/time-range-picker/package.json` scripts:
```json
"build:registry": "tsx scripts/build-registry.ts"
```

Also add `tsx` as a devDependency:
```bash
cd packages/time-range-picker && pnpm add -D tsx
```

- [ ] **Step 3: Run the build script**

Run: `cd packages/time-range-picker && pnpm build:registry`
Expected: `registry/time-range-picker.json` is created with inlined source content.

- [ ] **Step 4: Verify the generated JSON is valid**

```bash
cat packages/time-range-picker/registry/time-range-picker.json | head -20
```

Check that `files[].content` fields contain the actual source code.

- [ ] **Step 5: Note about shadcn import paths**

The registry `content` fields contain the source files with relative imports (e.g., `./utils`, `./ui/badge`). When a consumer installs via `npx shadcn add`, the files land at `components/time-range-picker.tsx` and `lib/time-range.ts`. The component file needs to use `@/lib/time-range` and `@/components/ui/*` paths for the consumer's project — NOT relative imports.

This means we need **two versions** of the component imports:
1. **Library package version** (relative imports) — for npm package usage
2. **Registry version** (shadcn `@/` aliases) — for shadcn CLI installation

The simplest approach: the build-registry script rewrites relative imports to `@/` paths before inlining.

Update `scripts/build-registry.ts` to transform imports:

```typescript
function transformToShadcnPaths(source: string, fileType: "component" | "lib"): string {
  if (fileType === "component") {
    return source
      .replace(/from ["']\.\/utils["']/g, 'from "@/lib/utils"')
      .replace(/from ["']\.\/ui\//g, 'from "@/components/ui/')
      .replace(/from ["']\.\/time-range["']/g, 'from "@/lib/time-range"');
  }
  return source; // lib files don't need path changes
}
```

Apply to the files array:
```typescript
files: [
  {
    path: "components/time-range-picker.tsx",
    type: "registry:ui",
    content: transformToShadcnPaths(readSource("src/time-range-picker.tsx"), "component"),
  },
  // ...
]
```

- [ ] **Step 6: Commit**

```bash
git add packages/time-range-picker/scripts/ packages/time-range-picker/registry/ packages/time-range-picker/package.json
git commit -m "feat: add shadcn registry build script"
```

---

### Task 9: Final verification and format pass

**Files:** Various

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```
Expected: All library tests (unit + component) pass.

- [ ] **Step 2: Run E2E tests**

```bash
pnpm test:e2e
```
Expected: All Playwright tests pass.

- [ ] **Step 3: Run linter**

```bash
pnpm lint
```
Expected: No errors.

- [ ] **Step 4: Run formatter check**

```bash
pnpm fmt:check
```
Expected: No formatting issues (we already ran `pnpm fmt` in Task 4).

- [ ] **Step 5: Run typecheck**

```bash
pnpm typecheck
```
Expected: No TypeScript errors in either workspace.

- [ ] **Step 6: Test pre-commit hook**

Make a small change, stage it, and attempt a commit to verify the hook fires. Then reset to avoid a noise commit:
```bash
echo "" >> packages/time-range-picker/src/index.ts
git add packages/time-range-picker/src/index.ts
git commit -m "test: verify pre-commit hook"
```
Expected: husky triggers lint-staged, which runs oxlint and oxfmt on the staged file. If the commit succeeds, revert it:
```bash
git reset HEAD~1
git checkout -- packages/time-range-picker/src/index.ts
```

- [ ] **Step 7: Verify demo app works end-to-end**

```bash
cd apps/demo && pnpm dev
```

Manually verify:
1. Page loads at localhost:5173
2. Picker opens on click
3. Typing "3h" shows parsed result
4. Selecting preset shows result card with ISO timestamps
5. Dark mode toggle works
6. 12h/24h toggle works
7. Clear button works

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass"
```
