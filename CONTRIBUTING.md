# Contributing

Thanks for your interest in contributing! Here's how to get started.

## Getting started

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Start the demo app: `pnpm --filter demo dev`

## Project structure

```
packages/time-range-picker/   # Component library
  src/
    time-range-picker.tsx      # Main React component
    time-range.ts              # Parsing logic, presets, utilities
    time-range-picker.test.tsx # Component tests
    time-range.test.ts         # Logic tests
    ui/                        # Vendored shadcn primitives
  registry/                    # shadcn registry JSON (generated)
  scripts/
    build-registry.ts          # Registry build script

apps/demo/                     # Demo / showcase app
  src/
  e2e/                         # Playwright E2E tests
```

## Development workflow

### Running tests

```bash
# Unit tests
pnpm test

# Unit tests in watch mode
pnpm --filter @danyi/time-range-picker test:watch

# E2E tests
pnpm test:e2e
```

### Code quality

This project uses [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) instead of ESLint and Prettier.

```bash
pnpm lint       # Lint
pnpm fmt        # Format
pnpm fmt:check  # Check formatting without modifying files
pnpm typecheck  # TypeScript type checking
```

A pre-commit hook runs `lint-staged` automatically to lint and format changed files.

### Updating the registry

After modifying the component source, regenerate the shadcn registry JSON:

```bash
pnpm --filter @danyi/time-range-picker build:registry
```

Commit the updated `registry/time-range-picker.json` alongside your source changes.

## Pull requests

1. Create a branch from `main`
2. Make your changes
3. Ensure all checks pass: `pnpm typecheck && pnpm lint && pnpm fmt:check && pnpm test`
4. Open a PR against `main`

Please keep PRs focused — one feature or fix per PR.

## Reporting issues

Open an issue on GitHub. Include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser / OS if relevant
