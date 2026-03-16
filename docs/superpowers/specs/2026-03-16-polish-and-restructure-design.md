# Polish & Restructure: Time Range Picker Component

## Overview

Restructure a vibe-coded Next.js demo app into a polished monorepo with a publishable shadcn-compatible component library and a Vite-powered showcase app. Add modern tooling (oxlint, oxc-fmt, husky), comprehensive tests (component + E2E), and clean up unused code.

## Monorepo Structure

```
time-range-picker-component/
├── pnpm-workspace.yaml
├── package.json                    # root — workspaces, shared dev deps, lint-staged
├── .husky/
│   └── pre-commit
├── packages/
│   └── time-range-picker/
│       ├── package.json            # publishable @danyi/time-range-picker
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── registry/
│       │   └── time-range-picker.json   # shadcn CLI registry entry
│       ├── src/
│       │   ├── index.ts                 # public API barrel export
│       │   ├── time-range.ts            # core parsing/formatting logic
│       │   ├── time-range.test.ts       # unit tests (existing 68 tests)
│       │   ├── time-range-picker.tsx     # the component
│       │   ├── time-range-picker.test.tsx # component tests (new)
│       │   ├── utils.ts                 # cn() helper
│       │   └── ui/                      # only used shadcn components
│       │       ├── popover.tsx
│       │       ├── command.tsx
│       │       ├── badge.tsx
│       │       └── button.tsx
│       └── README.md
├── apps/
│   └── demo/
│       ├── package.json            # private, depends on workspace:*
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx             # demo page (migrated from page.tsx)
│       │   └── globals.css         # Tailwind + theme variables
│       ├── e2e/
│       │   ├── playwright.config.ts
│       │   └── time-range-picker.spec.ts
│       └── components/             # demo-only shadcn components
│           ├── card.tsx
│           ├── separator.tsx
│           └── badge.tsx
```

## Distribution: shadcn CLI Registry

The component is distributed as a shadcn-compatible registry entry. Consumers install via:

```bash
npx shadcn@latest add https://time-range-picker.vercel.app/r/time-range-picker.json
```

### Registry Entry (`registry/time-range-picker.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "time-range-picker",
  "type": "registry:ui",
  "title": "Time Range Picker",
  "description": "A time range picker with natural language parsing",
  "dependencies": ["date-fns", "chrono-node"],
  "registryDependencies": ["popover", "command", "badge", "button"],
  "files": [
    { "path": "components/time-range-picker.tsx", "type": "registry:ui" },
    { "path": "lib/time-range.ts", "type": "registry:lib" }
  ]
}
```

### Conventions

- Source files use `@/lib/utils`, `@/components/ui/*` path aliases (shadcn convention)
- `registryDependencies` auto-installs Popover, Command, Badge, Button from shadcn
- `dependencies` auto-installs `date-fns` and `chrono-node`
- The npm package (`@danyi/time-range-picker`) re-exports the same source as an alternative install path

### Library `package.json` Key Fields

```json
{
  "name": "@danyi/time-range-picker",
  "version": "0.1.0",
  "type": "module",
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
    "cmdk": "^1.1.1"
  },
  "files": ["src/", "registry/", "README.md"]
}
```

## Tooling

### Linting & Formatting

- **oxlint** — replaces ESLint. Fast, zero-config Rust-based linter.
- **oxc-fmt** — replaces Prettier. Companion formatter from the OXC project.
- Both installed as root dev dependencies shared across workspaces.

### Pre-commit Hooks

- **husky** — manages git hooks
- **lint-staged** — runs linters on staged files only

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["oxlint --fix", "oxc-fmt --write"],
    "*.{css,json,yaml}": ["oxc-fmt --write"]
  }
}
```

### Root Scripts

```json
{
  "scripts": {
    "lint": "oxlint .",
    "fmt": "oxc-fmt --write .",
    "fmt:check": "oxc-fmt --check .",
    "test": "pnpm -r test",
    "test:e2e": "pnpm --filter demo exec playwright test",
    "typecheck": "pnpm -r typecheck",
    "prepare": "husky"
  }
}
```

## Testing Strategy

### Unit Tests (library)

Existing 68 tests for `time-range.ts` — migrate as-is to `packages/time-range-picker/src/`.

### Component Tests (library — new)

Using `@testing-library/react` + `jsdom` via Vitest:

- Renders with default placeholder
- Renders with custom placeholder
- Opens popover on click
- Displays presets when popover is open
- Parses typed input and shows preview
- Selects a preset and fires `onChange` with correct `TimeRange`
- Enter key selects parsed result
- Escape key closes popover
- Clear button (X) resets value and fires `onChange(null)`
- Shows duration badge when range is selected
- Controlled mode: reflects external `value` changes
- Uncontrolled mode: manages own state
- 12h vs 24h clock format affects display
- Invalid input shows "no results" state

### E2E Tests (demo app — new)

Using Playwright against the running Vite dev server:

- **Page load**: demo renders, picker visible, no console errors
- **Preset selection**: open picker → click "Past 1 hour" → result card shows correct range with duration
- **Shortcut input**: type "3h" → Enter → result card validates parsed range
- **Natural language**: type "last friday" → Enter → correct date in result
- **Date range**: type "Mar 3 - Mar 13" → Enter → validates start/end dates
- **Time range**: type "9am - 5pm" → Enter → validates times
- **Clear**: select range → click X → result card disappears
- **Keyboard flow**: Tab to picker → type → Enter → Escape → validates state
- **Dark mode toggle**: click toggle → verify CSS class and visual change
- **12h/24h toggle**: switch format → verify time display format updates
- **Responsive**: test at mobile (375px) and desktop (1280px) viewports
- **Edge cases**: empty input submit, invalid input ("asdfgh"), "now" keyword, very long range ("past 90 days")

## Cleanup

1. Delete ~55 unused shadcn/ui components from `components/ui/`
2. Remove duplicate `styles/globals.css`
3. Remove Next.js: `next`, `next-themes`, `@vercel/analytics`, `next.config.mjs`, `app/layout.tsx`
4. Remove `ignoreBuildErrors: true` — fix any actual TS errors
5. Replace `next-themes` dark mode with simple class toggle
6. Remove unused hooks: `use-mobile.ts`, `use-toast.ts`
7. Remove `scripts/run-tests.*`
8. Clean up `public/` — remove unused placeholder images, logos, icons
9. Remove `components.json` (shadcn init config — not needed in final structure)

## Migration Notes

- `app/page.tsx` → `apps/demo/src/App.tsx` (remove "use client", server component wrappers)
- `app/layout.tsx` → `apps/demo/index.html` + `main.tsx` (fonts via CSS, no Next.js metadata)
- `app/globals.css` → `apps/demo/src/globals.css`
- `components/time-range-picker.tsx` → `packages/time-range-picker/src/time-range-picker.tsx`
- `lib/time-range.ts` → `packages/time-range-picker/src/time-range.ts`
- `lib/time-range.test.ts` → `packages/time-range-picker/src/time-range.test.ts`
- `lib/utils.ts` → `packages/time-range-picker/src/utils.ts`
- Used shadcn components → `packages/time-range-picker/src/ui/` (library deps) and `apps/demo/src/components/` (demo-only)
