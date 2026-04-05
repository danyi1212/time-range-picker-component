# @danyi1212/time-range-picker

A React time range picker with natural language parsing, preset ranges, and
utility helpers for working with relative and absolute ranges.

Live preview: https://time-range-picker-component.vercel.app/

## Features

- Natural language parsing for inputs like `past 3 hours`, `last friday`, or
  `Mar 1 - Mar 15`
- Shortcut syntax such as `3h`, `30m`, `7d`, `2w`, and `1mo`
- Built-in presets for common ranges like today, yesterday, this week, and last
  month
- Inline controls to shift ranges backward and forward or pause live ranges
- 12h and 24h clock support
- Utility exports for parsing, formatting, shifting, and resolving ranges

## Installation

```bash
npm install @danyi1212/time-range-picker date-fns chrono-node lucide-react
```

Peer dependencies:

- `react >= 18`
- `react-dom >= 18`
- `tailwindcss >= 4`

This package uses Radix UI primitives and Tailwind-based styling.

## Usage

```tsx
import { useState } from "react";
import { enGB } from "date-fns/locale";
import { TimeRangePicker, type TimeRange } from "@danyi1212/time-range-picker";

export function Example() {
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

## Exports

From `@danyi1212/time-range-picker`:

- `TimeRangePicker`
- `DEFAULT_TIME_RANGE_EXAMPLES`
- `parseTimeRange`
- `resolveTimeRange`
- `formatDuration`
- `formatRangeDisplay`
- `formatInputDisplay`
- `formatPresetHint`
- `getPresets`
- `getFilteredPresets`

From `@danyi1212/time-range-picker/time-range`:

- `resolveTimeRangeToIso`
- `getTimeRangeStart`
- `getTimeRangeEnd`
- `getTimeRangeDurationMs`
- `getTimeRangeDuration`
- `pauseTimeRange`
- `canShiftTimeRangeForward`
- `shiftTimeRange`
- `isLiveTimeRange`
- `isStaticTimeRange`

## Example Utilities

```ts
import { parseTimeRange } from "@danyi1212/time-range-picker";

const range = parseTimeRange("past 3 hours", new Date(), {
  clockFormat: "24h",
});
```

```ts
import { shiftTimeRange } from "@danyi1212/time-range-picker/time-range";

const previousWindow = shiftTimeRange(range, "backward");
```

## Types

The package exports these types from the root entrypoint:

- `TimeRangePickerProps`
- `TimeRangePickerControlLabels`
- `TimeRange`
- `TimeRangePreset`
- `ClockFormat`
- `RelativeDuration`
- `RelativeDurationUnit`
- `TimeRangeOptions`
- `TimeRangeLabels`
- `TimeRangeFormatPatterns`

And these types from `@danyi1212/time-range-picker/time-range`:

- `LiveRangeDetails`
- `StaticTimeRange`
- `LiveTimeRange`
- `ResolvedTimeRange`

## Links

- Live preview: https://time-range-picker-component.vercel.app/
- Source: https://github.com/danyi1212/time-range-picker
- shadcn registry entry:
  https://raw.githubusercontent.com/danyi1212/time-range-picker/main/packages/time-range-picker/registry/time-range-picker.json
