# Time Range Picker

A [shadcn/ui](https://ui.shadcn.com) component for selecting time ranges with natural language parsing. Supports shortcuts (`3h`, `7d`), presets (today, last week), date/time ranges, and free-form natural language input.

![CI](https://github.com/danyi1212/time-range-picker-component/actions/workflows/ci.yml/badge.svg)

## Features

- Natural language parsing — type "past 3 hours", "last friday", or "Mar 1 - Mar 15"
- Shortcut syntax — `3h`, `30m`, `7d`, `2w`, `1mo`
- Built-in presets — today, yesterday, this week, last month, and more
- Inline range controls — step backward/forward by the current duration and pause live ranges
- 12h / 24h clock format support
- Accessible — keyboard navigation, screen reader labels
- Dark mode support
- Fully styled with Tailwind CSS and shadcn/ui primitives

## Installation

### Via shadcn registry (recommended)

```bash
npx shadcn@latest add https://raw.githubusercontent.com/danyi1212/time-range-picker-component/main/packages/time-range-picker/registry/time-range-picker.json
```

This installs the component and its dependencies (`date-fns`, `chrono-node`, `lucide-react`) and the required shadcn primitives (`popover`, `command`, `badge`, `button`).

### Manual

Copy the two source files into your project:

- `components/time-range-picker.tsx` — the React component
- `lib/time-range.ts` — time range parsing logic and presets

Then install the dependencies:

```bash
npm install date-fns chrono-node lucide-react
```

And make sure you have the shadcn primitives installed:

```bash
npx shadcn@latest add popover command badge button
```

## Usage

```tsx
import { useState } from "react";
import { TimeRangePicker } from "@/components/time-range-picker";
import { TimeRange } from "@/lib/time-range";
import { enGB } from "date-fns/locale";

export function MyComponent() {
  const [range, setRange] = useState<TimeRange | null>(null);

  return (
    <TimeRangePicker
      value={range}
      onChange={setRange}
      clockFormat="24h"
      locale={enGB}
      weekStartsOn={1}
      labels={{ now: "live" }}
      placeholder="Search time range..."
    />
  );
}
```

## API

### Package exports

- `TimeRangePicker`: React component.
- `DEFAULT_TIME_RANGE_EXAMPLES`: built-in example prompts.

### TimeRangePicker props

- `value`: `TimeRange | null`. Default `undefined`. Controlled value.
- `onChange`: `(range: TimeRange | null) => void`. Default `undefined`. Called when the value changes.
- `placeholder`: `string`. Default `"Search time range..."`.
- `className`: `string`. Default `undefined`.
- `clockFormat`: `"12h" | "24h"`. Default `"24h"`.
- `locale`: `Locale`. Default `undefined`.
- `weekStartsOn`: `0 | 1 | 2 | 3 | 4 | 5 | 6`. Default `1`.
- `labels`: `Partial<TimeRangeLabels>`. Default `undefined`.
- `formatPatterns`: `Partial<TimeRangeFormatPatterns>`. Default `undefined`.
- `presets`: `TimeRangePreset[]`. Default `undefined`.
- `includeDefaultPresets`: `boolean`. Default `true`.
- `examples`: `string[]`. Default built-in examples.
- `showShiftControls`: `boolean`. Default `true`.
- `showPauseControl`: `boolean`. Default `true`.
- `controlLabels`: `TimeRangePickerControlLabels`. Default `undefined`.

```tsx
<TimeRangePicker value={range} onChange={setRange} />
```

```tsx
import { enGB } from "date-fns/locale";

<TimeRangePicker locale={enGB} />;
```

```tsx
<TimeRangePicker
  controlLabels={{
    shiftBackward: (duration) => `Back ${duration}`,
    shiftForward: (duration) => `Forward ${duration}`,
    pause: "Pause updates",
    cannotShiftForward: "At live edge",
  }}
/>
```

### Utility functions

From `@danyi/time-range-picker`:

- `parseTimeRange(input, referenceDate?, options?)`
- `resolveTimeRange(range, referenceDate?)`
- `formatDuration(start, end, options?)`
- `formatRangeDisplay(range, options?)`
- `formatInputDisplay(range, options?)`
- `formatPresetHint(range, options?)`
- `getPresets(options?)`
- `getFilteredPresets(input, options?)`

From `@danyi/time-range-picker/time-range`:

- `resolveTimeRangeToIso(range, referenceDate?)`
- `getTimeRangeStart(range, referenceDate?)`
- `getTimeRangeEnd(range, referenceDate?)`
- `getTimeRangeDurationMs(range, referenceDate?)`
- `getTimeRangeDuration(range, referenceDate?, options?)`
- `pauseTimeRange(range, referenceDate?)`
- `canShiftTimeRangeForward(range, referenceDate?)`
- `shiftTimeRange(range, direction, referenceDate?)`
- `isLiveTimeRange(range)`
- `isStaticTimeRange(range)`

```ts
import { parseTimeRange } from "@danyi/time-range-picker";

const range = parseTimeRange("past 3 hours", new Date(), {
  clockFormat: "24h",
});
```

```ts
import { shiftTimeRange } from "@danyi/time-range-picker/time-range";

const previousWindow = shiftTimeRange(range, "backward");
```

### Exported types

- Root package:
  `TimeRangePickerProps`, `TimeRangePickerControlLabels`, `TimeRange`, `TimeRangePreset`, `ClockFormat`, `RelativeDuration`, `RelativeDurationUnit`, `TimeRangeOptions`, `TimeRangeLabels`, `TimeRangeFormatPatterns`
- `@danyi/time-range-picker/time-range`:
  `LiveRangeDetails`, `StaticTimeRange`, `LiveTimeRange`, `ResolvedTimeRange`

## Development

This is a pnpm monorepo with the component library in `packages/time-range-picker/` and a demo app in `apps/demo/`.

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io) 10

### Setup

```bash
pnpm install
```

### Commands

```bash
# Run the demo app
pnpm --filter demo dev

# Run unit tests
pnpm test

# Run E2E tests (requires the demo app built)
pnpm test:e2e

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm fmt

# Check formatting
pnpm fmt:check

# Build the shadcn registry JSON
pnpm --filter @danyi/time-range-picker build:registry
```

## Release Workflow

Releases are managed with Changesets.

```bash
# create a release note for the package changes in your branch
pnpm changeset

# apply pending version bumps locally
pnpm version-packages
```

When a changeset lands on `main`, GitHub Actions opens or updates a release PR. Merging that PR publishes `@danyi/time-range-picker` to npm with provenance enabled and creates the matching GitHub release.

## Deployment Targets

- `npm`: primary distribution channel for the compiled package in `packages/time-range-picker/dist`
- `GitHub Releases`: automatic release history alongside npm publishes
- `shadcn registry`: already served directly from this repository via `packages/time-range-picker/registry/time-range-picker.json`

### Required Secrets

No npm secret is required once npm trusted publishing is configured for this repository and workflow.

## License

[MIT](LICENSE)
