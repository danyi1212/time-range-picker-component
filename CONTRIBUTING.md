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
pnpm --filter @danyi1212/time-range-picker test:watch

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
pnpm --filter @danyi1212/time-range-picker build:registry
```

Commit the updated `registry/time-range-picker.json` alongside your source changes.

## Pull requests

1. Create a branch from `main`
2. Make your changes
3. If the package behavior changes, add a changeset: `pnpm changeset`
4. Regenerate the registry JSON if component source changed: `pnpm --filter @danyi1212/time-range-picker build:registry`
5. Ensure all checks pass: `pnpm typecheck && pnpm lint && pnpm fmt:check && pnpm test && pnpm test:e2e`
6. Open a PR against `main`

Please keep PRs focused — one feature or fix per PR.

## Release workflow

This project uses Changesets plus npm trusted publishing from GitHub Actions.

### Contributor flow

For any package change that should be released:

```bash
pnpm changeset
```

Choose the release type for `@danyi1212/time-range-picker` and describe the change in one short paragraph. Commit that generated file with your code changes.

### Maintainer flow

1. Merge a PR with at least one changeset into `main`.
2. The `Release` GitHub Actions workflow updates or opens a release PR.
3. Review the generated version bump and release notes.
4. Merge the release PR.
5. GitHub Actions publishes `@danyi1212/time-range-picker` to npm and creates the matching GitHub release.

### npm trusted publishing setup

The release workflow is configured for npm trusted publishing with GitHub Actions OIDC, not a stored `NPM_TOKEN`.

Before the automated publish can work, a maintainer must configure the trusted publisher in npm for `@danyi1212/time-range-picker`:

1. Open npm package settings for `@danyi1212/time-range-picker`.
2. Add a trusted publisher for this GitHub repository and the `release.yml` workflow on the `main` branch.
3. If npm requires an initial manual publish before trusted publishing can be attached, do that once, then enable the trusted publisher.

After trusted publishing is configured, no npm credential secret is needed in GitHub Actions.

## Reporting issues

Open an issue on GitHub. Include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser / OS if relevant
