import type { ApiDocEntry, ApiDocSection, ApiTableOfContentsItem } from "@/demo/types";

const packageExportDocs: ApiDocEntry[] = [
  {
    id: "export-time-range-picker",
    name: "TimeRangePicker",
    type: "React component",
    description: "Main picker component.",
    example: `import { TimeRangePicker } from "@danyi/time-range-picker";

<TimeRangePicker value={range} onChange={setRange} />`,
  },
  {
    id: "export-default-time-range-examples",
    name: "DEFAULT_TIME_RANGE_EXAMPLES",
    type: "string[]",
    description: "Built-in example prompts.",
    example: `import { DEFAULT_TIME_RANGE_EXAMPLES } from "@danyi/time-range-picker";

<TimeRangePicker examples={[...DEFAULT_TIME_RANGE_EXAMPLES, "past quarter"]} />`,
  },
];

const propDocs: ApiDocEntry[] = [
  {
    id: "prop-value",
    name: "value",
    type: "TimeRange | null",
    defaultValue: "undefined",
    description: "Controlled value.",
    example: `<TimeRangePicker value={range} onChange={setRange} />`,
  },
  {
    id: "prop-on-change",
    name: "onChange",
    type: "(range: TimeRange | null) => void",
    defaultValue: "undefined",
    description: "Called when the value changes.",
    example: `<TimeRangePicker onChange={(nextRange) => setRange(nextRange)} />`,
  },
  {
    id: "prop-placeholder",
    name: "placeholder",
    type: "string",
    defaultValue: `"Search time range..."`,
    description: "Input placeholder.",
    example: `<TimeRangePicker placeholder="Filter report window..." />`,
  },
  {
    id: "prop-class-name",
    name: "className",
    type: "string",
    defaultValue: "undefined",
    description: "Classes for the wrapper.",
    example: `<TimeRangePicker className="w-full max-w-md" />`,
  },
  {
    id: "prop-clock-format",
    name: "clockFormat",
    type: `"12h" | "24h"`,
    defaultValue: `"24h"`,
    description: "Time display format.",
    example: `<TimeRangePicker clockFormat="12h" />`,
  },
  {
    id: "prop-locale",
    name: "locale",
    type: "Locale",
    defaultValue: "undefined",
    description: "`date-fns` locale for parsing and formatting.",
    example: `import { enGB } from "date-fns/locale";

<TimeRangePicker locale={enGB} />`,
  },
  {
    id: "prop-week-starts-on",
    name: "weekStartsOn",
    type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
    defaultValue: "1",
    description: "First day used by week-based presets.",
    example: `<TimeRangePicker weekStartsOn={0} />`,
  },
  {
    id: "prop-labels",
    name: "labels",
    type: "Partial<TimeRangeLabels>",
    defaultValue: "undefined",
    description: "Overrides for labels such as `now`.",
    example: `<TimeRangePicker labels={{ now: "live", today: "Today so far" }} />`,
  },
  {
    id: "prop-format-patterns",
    name: "formatPatterns",
    type: "Partial<TimeRangeFormatPatterns>",
    defaultValue: "undefined",
    description: "Overrides for date/time format tokens.",
    example: `<TimeRangePicker formatPatterns={{ time: "HH:mm:ss", shortDate: "dd/MM" }} />`,
  },
  {
    id: "prop-presets",
    name: "presets",
    type: "TimeRangePreset[]",
    defaultValue: "undefined",
    description: "Custom presets.",
    example: `<TimeRangePicker presets={customPresets} includeDefaultPresets />`,
  },
  {
    id: "prop-include-default-presets",
    name: "includeDefaultPresets",
    type: "boolean",
    defaultValue: "true",
    description: "Include built-in presets alongside custom ones.",
    example: `<TimeRangePicker presets={customPresets} includeDefaultPresets={false} />`,
  },
  {
    id: "prop-examples",
    name: "examples",
    type: "string[]",
    defaultValue: "built-in examples",
    description: "Prompts shown before typing.",
    example: `<TimeRangePicker examples={["past quarter", "last deploy", "biz"]} />`,
  },
  {
    id: "prop-show-shift-controls",
    name: "showShiftControls",
    type: "boolean",
    defaultValue: "true",
    description: "Show back/forward controls.",
    example: `<TimeRangePicker showShiftControls={false} />`,
  },
  {
    id: "prop-show-pause-control",
    name: "showPauseControl",
    type: "boolean",
    defaultValue: "true",
    description: "Show the pause control for live ranges.",
    example: `<TimeRangePicker showPauseControl={false} />`,
  },
  {
    id: "prop-control-labels",
    name: "controlLabels",
    type: "TimeRangePickerControlLabels",
    defaultValue: "undefined",
    description: "Tooltip labels for live controls.",
    example: `<TimeRangePicker
  controlLabels={{
    shiftBackward: (duration) => \`Back \${duration}\`,
    shiftForward: (duration) => \`Forward \${duration}\`,
    pause: "Pause updates",
    cannotShiftForward: "At live edge",
  }}
/>`,
  },
];

const utilityDocs: ApiDocEntry[] = [
  {
    id: "utility-parse-time-range",
    name: "parseTimeRange",
    type: "(input: string, referenceDate?: Date, options?: TimeRangeOptions) => TimeRange | null",
    description: "Parses input into a `TimeRange`.",
    example: `import { parseTimeRange } from "@danyi/time-range-picker";

const range = parseTimeRange("past 3 hours", new Date(), {
  clockFormat: "24h",
});`,
  },
  {
    id: "utility-resolve-time-range",
    name: "resolveTimeRange",
    type: "(range: TimeRange, referenceDate?: Date) => ResolvedTimeRange",
    description: "Resolves live ranges against a reference time.",
    example: `import { resolveTimeRange } from "@danyi/time-range-picker";

const resolved = resolveTimeRange(range, new Date());`,
  },
  {
    id: "utility-resolve-time-range-to-iso",
    name: "resolveTimeRangeToIso",
    type: "(range: TimeRange, referenceDate?: Date) => { mode: string; start: string; end: string; label?: string }",
    description: "Resolved range as ISO strings.",
    example: `import { resolveTimeRangeToIso } from "@danyi/time-range-picker/time-range";

const query = resolveTimeRangeToIso(range);`,
  },
  {
    id: "utility-get-time-range-start",
    name: "getTimeRangeStart",
    type: "(range: TimeRange, referenceDate?: Date) => Date",
    description: "Resolved start date.",
    example: `import { getTimeRangeStart } from "@danyi/time-range-picker/time-range";

const start = getTimeRangeStart(range, new Date());`,
  },
  {
    id: "utility-get-time-range-end",
    name: "getTimeRangeEnd",
    type: "(range: TimeRange, referenceDate?: Date) => Date",
    description: "Resolved end date.",
    example: `import { getTimeRangeEnd } from "@danyi/time-range-picker/time-range";

const end = getTimeRangeEnd(range, new Date());`,
  },
  {
    id: "utility-get-time-range-duration-ms",
    name: "getTimeRangeDurationMs",
    type: "(range: TimeRange, referenceDate?: Date) => number",
    description: "Resolved duration in milliseconds.",
    example: `import { getTimeRangeDurationMs } from "@danyi/time-range-picker/time-range";

const durationMs = getTimeRangeDurationMs(range, new Date());`,
  },
  {
    id: "utility-format-duration",
    name: "formatDuration",
    type: "(start: Date, end: Date, options?: boolean | TimeRangeOptions) => string",
    description: "Formats a compact duration.",
    example: `import { formatDuration } from "@danyi/time-range-picker";

const label = formatDuration(range.start, range.end, { clockFormat: "24h" });`,
  },
  {
    id: "utility-get-time-range-duration",
    name: "getTimeRangeDuration",
    type: "(range: TimeRange, referenceDate?: Date, options?: boolean | TimeRangeOptions) => string",
    description: "Resolves then formats duration.",
    example: `import { getTimeRangeDuration } from "@danyi/time-range-picker/time-range";

const label = getTimeRangeDuration(range, new Date(), { clockFormat: "24h" });`,
  },
  {
    id: "utility-format-range-display",
    name: "formatRangeDisplay",
    type: "(range: ResolvedTimeRange | TimeRange, options?: boolean | TimeRangeOptions) => string",
    description: "Formats a range for display.",
    example: `import { formatRangeDisplay, resolveTimeRange } from "@danyi/time-range-picker";

const text = formatRangeDisplay(resolveTimeRange(range), options);`,
  },
  {
    id: "utility-format-input-display",
    name: "formatInputDisplay",
    type: "(range: ResolvedTimeRange | TimeRange, options?: boolean | TimeRangeOptions) => string",
    description: "Formats a range for an input field.",
    example: `import { formatInputDisplay } from "@danyi/time-range-picker";

const text = formatInputDisplay(range, { clockFormat: "24h" });`,
  },
  {
    id: "utility-format-preset-hint",
    name: "formatPresetHint",
    type: "(range: ResolvedTimeRange | TimeRange, options?: boolean | TimeRangeOptions) => string",
    description: "Formats preset hint text.",
    example: `import { formatPresetHint } from "@danyi/time-range-picker";

const hint = formatPresetHint(range, { clockFormat: "24h" });`,
  },
  {
    id: "utility-get-presets",
    name: "getPresets",
    type: "(options?: TimeRangeOptions) => TimeRangePreset[]",
    description: "Returns the merged preset list.",
    example: `import { getPresets } from "@danyi/time-range-picker";

const presets = getPresets({ includeDefaultPresets: false, presets: customPresets });`,
  },
  {
    id: "utility-get-filtered-presets",
    name: "getFilteredPresets",
    type: "(input: string, options?: TimeRangeOptions) => TimeRangePreset[]",
    description: "Filters presets by input.",
    example: `import { getFilteredPresets } from "@danyi/time-range-picker";

const matches = getFilteredPresets("last", { presets: customPresets });`,
  },
  {
    id: "utility-pause-time-range",
    name: "pauseTimeRange",
    type: "(range: TimeRange, referenceDate?: Date) => StaticTimeRange",
    description: "Freezes a live range into a static range.",
    example: `import { pauseTimeRange } from "@danyi/time-range-picker/time-range";

const paused = pauseTimeRange(range, new Date());`,
  },
  {
    id: "utility-can-shift-time-range-forward",
    name: "canShiftTimeRangeForward",
    type: "(range: TimeRange, referenceDate?: Date) => boolean",
    description: "Checks whether a forward shift is allowed.",
    example: `import { canShiftTimeRangeForward } from "@danyi/time-range-picker/time-range";

const canGoForward = canShiftTimeRangeForward(range, new Date());`,
  },
  {
    id: "utility-shift-time-range",
    name: "shiftTimeRange",
    type: '(range: TimeRange, direction: "backward" | "forward", referenceDate?: Date) => StaticTimeRange',
    description: "Shifts a range by its current duration.",
    example: `import { shiftTimeRange } from "@danyi/time-range-picker/time-range";

const previousWindow = shiftTimeRange(range, "backward");`,
  },
  {
    id: "utility-is-live-time-range",
    name: "isLiveTimeRange",
    type: "(range: TimeRange) => range is LiveTimeRange",
    description: "Type guard for live ranges.",
    example: `import { isLiveTimeRange } from "@danyi/time-range-picker/time-range";

if (isLiveTimeRange(range)) {
  console.log(range.duration.value, range.duration.unit);
}`,
  },
  {
    id: "utility-is-static-time-range",
    name: "isStaticTimeRange",
    type: "(range: TimeRange) => range is StaticTimeRange",
    description: "Type guard for static ranges.",
    example: `import { isStaticTimeRange } from "@danyi/time-range-picker/time-range";

if (isStaticTimeRange(range)) {
  console.log(range.start, range.end);
}`,
  },
];

export const apiDocSections: ApiDocSection[] = [
  {
    id: "api-exports",
    title: "Package exports",
    entries: packageExportDocs,
  },
  {
    id: "api-props",
    title: "TimeRangePicker props",
    entries: propDocs,
  },
  {
    id: "api-utilities",
    title: "Utility functions",
    entries: utilityDocs,
  },
];

export const apiTableOfContents: ApiTableOfContentsItem[] = apiDocSections.flatMap((section) => [
  { id: section.id, label: section.title, level: 0 as const },
  ...section.entries.map((entry) => ({
    id: entry.id,
    label: entry.name,
    level: 1 as const,
  })),
]);
