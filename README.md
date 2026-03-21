# Time Range Picker

A [shadcn/ui](https://ui.shadcn.com) component for selecting time ranges with natural language parsing. Supports shortcuts (`3h`, `7d`), presets (today, last week), date/time ranges, and free-form natural language input.

![CI](https://github.com/danyi1212/time-range-picker-component/actions/workflows/ci.yml/badge.svg)

## Features

- Natural language parsing — type "past 3 hours", "last friday", or "Mar 1 - Mar 15"
- Shortcut syntax — `3h`, `30m`, `7d`, `2w`, `1mo`
- Built-in presets — today, yesterday, this week, last month, and more
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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `TimeRange \| null` | `undefined` | The selected time range |
| `onChange` | `(range: TimeRange \| null) => void` | `undefined` | Called when the selection changes |
| `placeholder` | `string` | `"Search time range..."` | Input placeholder text |
| `className` | `string` | `undefined` | Additional CSS classes |
| `clockFormat` | `"12h" \| "24h"` | `"24h"` | Clock display format |
| `locale` | `Locale` | `undefined` | `date-fns` locale used for formatting |
| `weekStartsOn` | `0 \| 1 \| ... \| 6` | `1` | First day of week for week-based presets |
| `labels` | `Partial<TimeRangeLabels>` | `undefined` | Override built-in labels like `now` |
| `formatPatterns` | `Partial<TimeRangeFormatPatterns>` | `undefined` | Override the `date-fns` format tokens used by the picker |
| `presets` | `TimeRangePreset[]` | `undefined` | Add or replace preset definitions |
| `includeDefaultPresets` | `boolean` | `true` | Include built-in presets alongside custom ones |
| `examples` | `string[]` | built-in examples | Customize the example strings shown in the popover |

## Types

```ts
interface TimeRange {
  start: Date;
  end: Date;
  label?: string;
  isLive?: boolean; // true if end represents "now"
}

type ClockFormat = "12h" | "24h";

interface TimeRangeLabels {
  now: string;
  today: string;
  yesterday: string;
}
```

## Utilities

The `time-range` module also exports helpers you can use independently:

```ts
import {
  parseTimeRange,
  formatDuration,
  formatRangeDisplay,
  getPresets,
  getFilteredPresets,
} from "@/lib/time-range";

// Parse natural language to a TimeRange
const range = parseTimeRange("past 3 hours");

// Format a duration string like "3h" or "2d 5h"
const duration = formatDuration(range.start, range.end);

// Format a display string like "Today, 14:00 - 17:00"
const display = formatRangeDisplay(range, true);
```

All parsing and formatting helpers now accept an optional `TimeRangeOptions` object as their last argument, so you can keep the picker and your own utility calls aligned:

```ts
import { formatRangeDisplay, parseTimeRange } from "@/lib/time-range";
import { enGB } from "date-fns/locale";

const options = {
  clockFormat: "24h" as const,
  locale: enGB,
  weekStartsOn: 1 as const,
  labels: { now: "live" },
};

const range = parseTimeRange("this week", new Date(), options);
const display = range ? formatRangeDisplay(range, options) : "";
```

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

## License

[MIT](LICENSE)
