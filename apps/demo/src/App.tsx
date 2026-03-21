import * as React from "react";
import {
  Badge,
  Button,
  ClockFormat,
  TimeRange,
  TimeRangePicker,
  TimeRangePreset,
  formatDuration,
  formatRangeDisplay,
  getPresets,
  resolveTimeRange,
} from "@danyi/time-range-picker";
import type { Locale } from "date-fns";
import * as dateFnsLocales from "date-fns/locale";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Component,
  Github,
  Monitor,
  Moon,
  Package,
  Sun,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";

type LocaleKey = string;
type ThemePreference = "system" | "light" | "dark";
type PresetSelection = Record<string, boolean>;

interface LocaleOption {
  key: string;
  code: string;
  locale: Locale;
}

interface CustomPresetConfig {
  id: string;
  label: string;
  shortcut: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const THEME_ORDER: ThemePreference[] = ["system", "dark", "light"];
const REPO_URL = "https://github.com/danyi1212/time-range-picker-component";
const NPM_URL = "https://www.npmjs.com/package/@danyi/time-range-picker";
const REGISTRY_URL =
  "https://raw.githubusercontent.com/danyi1212/time-range-picker-component/main/packages/time-range-picker/registry/time-range-picker.json";

const NAV_ITEMS = [
  { href: "#install", label: "Install" },
  { href: "#playground", label: "Playground" },
  { href: "#api", label: "API" },
  { href: "#examples", label: "Examples" },
];

const INPUT_GROUPS = [
  {
    title: "Shortcuts",
    examples: ["15m", "3h", "7d", "2w", "1mo", "90d"],
  },
  {
    title: "Presets",
    examples: ["today", "yesterday", "this week", "last month", "past 90 days"],
  },
  {
    title: "Ranges",
    examples: ["Mar 3 - Mar 13", "14:00 - now", "9am - 5pm", "last friday to today"],
  },
];

const INSTALL_COMMANDS = {
  registry: `npx shadcn@latest add ${REGISTRY_URL}`,
  package: "npm install @danyi/time-range-picker date-fns chrono-node lucide-react",
  primitives: "npx shadcn@latest add popover command badge button",
};

const LIVE_EXAMPLES = ["3h", "30m", "Mar 3 - Mar 13", "14:00 - now", "last friday", "past 2 weeks"];
const CUSTOM_EXAMPLES = ["3h", "Mar 3 - Mar 13", "14:00 - 16:30", "last friday", "business hours"];

const LOCALE_OPTIONS: LocaleOption[] = Object.entries(dateFnsLocales)
  .flatMap(([key, value]) => {
    if (!value || typeof value !== "object" || !("code" in value)) {
      return [];
    }

    const locale = value as Locale & { code?: string };

    if (typeof locale.code !== "string") {
      return [];
    }

    return [{ key, code: locale.code, locale }];
  })
  .sort((first, second) => first.code.localeCompare(second.code));

const DEFAULT_LOCALE_KEY = LOCALE_OPTIONS.find((option) => option.code === "en-US")?.key ?? LOCALE_OPTIONS[0]?.key ?? "enUS";
const DEFAULT_PRESET_VALUES = getPresets().map((preset) => preset.value);
const DEFAULT_PRESET_SELECTION: PresetSelection = Object.fromEntries(
  DEFAULT_PRESET_VALUES.map((value) => [value, true]),
);
const DEFAULT_CUSTOM_PRESET_CONFIGS: CustomPresetConfig[] = [
  {
    id: "business-hours",
    label: "Business hours",
    shortcut: "biz",
    enabled: true,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    id: "morning-standup",
    label: "Morning standup",
    shortcut: "standup",
    enabled: true,
    startTime: "10:00",
    endTime: "10:30",
  },
];

const BASIC_USAGE_EXAMPLE = `import { useState } from "react";
import { TimeRangePicker, type TimeRange } from "@danyi/time-range-picker";

export function ReportsToolbar() {
  const [range, setRange] = useState<TimeRange | null>(null);

  return (
    <TimeRangePicker
      value={range}
      onChange={setRange}
      placeholder="Search time range..."
    />
  );
}`;

const LOCALE_EXAMPLE = `import { TimeRangePicker } from "@danyi/time-range-picker";
import { enGB } from "date-fns/locale";

<TimeRangePicker
  clockFormat="24h"
  locale={enGB}
  weekStartsOn={1}
  labels={{ now: "live" }}
/>;
`;

const CUSTOM_PRESET_EXAMPLE = `import { TimeRangePicker, type TimeRangePreset } from "@danyi/time-range-picker";

const presets: TimeRangePreset[] = [
  {
    label: "Business hours",
    value: "business-hours",
    shortcut: "biz",
    getRange: (referenceDate = new Date()) => {
      const start = new Date(referenceDate);
      start.setHours(9, 0, 0, 0);

      const end = new Date(referenceDate);
      end.setHours(17, 0, 0, 0);

      return { mode: "static", start, end, label: "Business hours" };
    },
    getHint: () => "09:00 - 17:00",
  },
];

<TimeRangePicker presets={presets} includeDefaultPresets />;`;

const UTILITY_EXAMPLE = `import {
  formatDuration,
  formatRangeDisplay,
  parseTimeRange,
} from "@danyi/time-range-picker";
import { enGB } from "date-fns/locale";

const options = {
  clockFormat: "24h" as const,
  locale: enGB,
  weekStartsOn: 1 as const,
  labels: { now: "live" },
};

const range = parseTimeRange("this week", new Date(), options);
const text = range ? formatRangeDisplay(range, options) : "";
const duration = range ? formatDuration(range.start, range.end, options) : "";`;

interface ApiDocEntry {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  importPath?: string;
  example?: string;
}

interface ApiDocSection {
  id: string;
  title: string;
  entries: ApiDocEntry[];
}

interface ApiTableOfContentsItem {
  id: string;
  label: string;
  level: 0 | 1;
}

const PACKAGE_EXPORT_DOCS: ApiDocEntry[] = [
  {
    id: "export-time-range-picker",
    name: "TimeRangePicker",
    type: "React component",
    importPath: "@danyi/time-range-picker",
    description: "Main picker component.",
    example: `<TimeRangePicker value={range} onChange={setRange} />`,
  },
  {
    id: "export-default-time-range-examples",
    name: "DEFAULT_TIME_RANGE_EXAMPLES",
    type: "string[]",
    importPath: "@danyi/time-range-picker",
    description: "Built-in example prompts.",
    example: `import { DEFAULT_TIME_RANGE_EXAMPLES } from "@danyi/time-range-picker";

<TimeRangePicker examples={[...DEFAULT_TIME_RANGE_EXAMPLES, "past quarter"]} />`,
  },
];

const PROP_DOCS: ApiDocEntry[] = [
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

const UTILITY_DOCS: ApiDocEntry[] = [
  {
    id: "utility-parse-time-range",
    name: "parseTimeRange",
    type: "(input: string, referenceDate?: Date, options?: TimeRangeOptions) => TimeRange | null",
    importPath: "@danyi/time-range-picker",
    description: "Parses input into a `TimeRange`.",
    example: `const range = parseTimeRange("past 3 hours", new Date(), {
  clockFormat: "24h",
});`,
  },
  {
    id: "utility-resolve-time-range",
    name: "resolveTimeRange",
    type: "(range: TimeRange, referenceDate?: Date) => ResolvedTimeRange",
    importPath: "@danyi/time-range-picker",
    description: "Resolves live ranges against a reference time.",
    example: `const resolved = resolveTimeRange(range, new Date());`,
  },
  {
    id: "utility-resolve-time-range-to-iso",
    name: "resolveTimeRangeToIso",
    type: "(range: TimeRange, referenceDate?: Date) => { mode: string; start: string; end: string; label?: string }",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Resolved range as ISO strings.",
    example: `import { resolveTimeRangeToIso } from "@danyi/time-range-picker/time-range";

const query = resolveTimeRangeToIso(range);`,
  },
  {
    id: "utility-get-time-range-start",
    name: "getTimeRangeStart",
    type: "(range: TimeRange, referenceDate?: Date) => Date",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Resolved start date.",
  },
  {
    id: "utility-get-time-range-end",
    name: "getTimeRangeEnd",
    type: "(range: TimeRange, referenceDate?: Date) => Date",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Resolved end date.",
  },
  {
    id: "utility-get-time-range-duration-ms",
    name: "getTimeRangeDurationMs",
    type: "(range: TimeRange, referenceDate?: Date) => number",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Resolved duration in milliseconds.",
  },
  {
    id: "utility-format-duration",
    name: "formatDuration",
    type: "(start: Date, end: Date, options?: boolean | TimeRangeOptions) => string",
    importPath: "@danyi/time-range-picker",
    description: "Formats a compact duration.",
    example: `const label = formatDuration(range.start, range.end, { clockFormat: "24h" });`,
  },
  {
    id: "utility-get-time-range-duration",
    name: "getTimeRangeDuration",
    type: "(range: TimeRange, referenceDate?: Date, options?: boolean | TimeRangeOptions) => string",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Resolves then formats duration.",
  },
  {
    id: "utility-format-range-display",
    name: "formatRangeDisplay",
    type: "(range: ResolvedTimeRange | TimeRange, options?: boolean | TimeRangeOptions) => string",
    importPath: "@danyi/time-range-picker",
    description: "Formats a range for display.",
    example: `const text = formatRangeDisplay(resolveTimeRange(range), options);`,
  },
  {
    id: "utility-format-input-display",
    name: "formatInputDisplay",
    type: "(range: ResolvedTimeRange | TimeRange, options?: boolean | TimeRangeOptions) => string",
    importPath: "@danyi/time-range-picker",
    description: "Formats a range for an input field.",
  },
  {
    id: "utility-format-preset-hint",
    name: "formatPresetHint",
    type: "(range: ResolvedTimeRange | TimeRange, options?: boolean | TimeRangeOptions) => string",
    importPath: "@danyi/time-range-picker",
    description: "Formats preset hint text.",
  },
  {
    id: "utility-get-presets",
    name: "getPresets",
    type: "(options?: TimeRangeOptions) => TimeRangePreset[]",
    importPath: "@danyi/time-range-picker",
    description: "Returns the merged preset list.",
    example: `const presets = getPresets({ includeDefaultPresets: false, presets: customPresets });`,
  },
  {
    id: "utility-get-filtered-presets",
    name: "getFilteredPresets",
    type: "(input: string, options?: TimeRangeOptions) => TimeRangePreset[]",
    importPath: "@danyi/time-range-picker",
    description: "Filters presets by input.",
  },
  {
    id: "utility-pause-time-range",
    name: "pauseTimeRange",
    type: "(range: TimeRange, referenceDate?: Date) => StaticTimeRange",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Freezes a live range into a static range.",
  },
  {
    id: "utility-can-shift-time-range-forward",
    name: "canShiftTimeRangeForward",
    type: "(range: TimeRange, referenceDate?: Date) => boolean",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Checks whether a forward shift is allowed.",
  },
  {
    id: "utility-shift-time-range",
    name: "shiftTimeRange",
    type: "(range: TimeRange, direction: \"backward\" | \"forward\", referenceDate?: Date) => StaticTimeRange",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Shifts a range by its current duration.",
    example: `import { shiftTimeRange } from "@danyi/time-range-picker/time-range";

const previousWindow = shiftTimeRange(range, "backward");`,
  },
  {
    id: "utility-is-live-time-range",
    name: "isLiveTimeRange",
    type: "(range: TimeRange) => range is LiveTimeRange",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Type guard for live ranges.",
  },
  {
    id: "utility-is-static-time-range",
    name: "isStaticTimeRange",
    type: "(range: TimeRange) => range is StaticTimeRange",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Type guard for static ranges.",
  },
];

const TYPE_DOCS: ApiDocEntry[] = [
  {
    id: "type-time-range-picker-props",
    name: "TimeRangePickerProps",
    type: "interface",
    importPath: "@danyi/time-range-picker",
    description: "Props for `TimeRangePicker`.",
  },
  {
    id: "type-time-range-picker-control-labels",
    name: "TimeRangePickerControlLabels",
    type: "interface",
    importPath: "@danyi/time-range-picker",
    description: "Labels for live controls.",
  },
  {
    id: "type-time-range",
    name: "TimeRange",
    type: "type",
    importPath: "@danyi/time-range-picker",
    description: "Static or live range.",
  },
  {
    id: "type-live-range-details",
    name: "LiveRangeDetails",
    type: "type",
    importPath: "@danyi/time-range-picker/time-range",
    description: "How a live range stays live.",
  },
  {
    id: "type-static-time-range",
    name: "StaticTimeRange",
    type: "interface",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Range with fixed start and end dates.",
  },
  {
    id: "type-live-time-range",
    name: "LiveTimeRange",
    type: "interface",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Range whose end tracks now.",
  },
  {
    id: "type-resolved-time-range",
    name: "ResolvedTimeRange",
    type: "interface",
    importPath: "@danyi/time-range-picker/time-range",
    description: "Range after live resolution.",
  },
  {
    id: "type-time-range-preset",
    name: "TimeRangePreset",
    type: "interface",
    importPath: "@danyi/time-range-picker",
    description: "Preset definition.",
  },
  {
    id: "type-clock-format",
    name: "ClockFormat",
    type: "type",
    importPath: "@danyi/time-range-picker",
    description: "Clock format preference.",
  },
  {
    id: "type-relative-duration",
    name: "RelativeDuration",
    type: "interface",
    importPath: "@danyi/time-range-picker",
    description: "Relative amount plus unit.",
  },
  {
    id: "type-relative-duration-unit",
    name: "RelativeDurationUnit",
    type: "type",
    importPath: "@danyi/time-range-picker",
    description: "Supported relative duration units.",
  },
  {
    id: "type-time-range-options",
    name: "TimeRangeOptions",
    type: "interface",
    importPath: "@danyi/time-range-picker",
    description: "Shared parsing and formatting options.",
  },
  {
    id: "type-time-range-labels",
    name: "TimeRangeLabels",
    type: "interface",
    importPath: "@danyi/time-range-picker",
    description: "Label overrides.",
  },
  {
    id: "type-time-range-format-patterns",
    name: "TimeRangeFormatPatterns",
    type: "interface",
    importPath: "@danyi/time-range-picker",
    description: "Date/time format token map.",
  },
];

const API_DOC_SECTIONS: ApiDocSection[] = [
  {
    id: "api-exports",
    title: "Package exports",
    entries: PACKAGE_EXPORT_DOCS,
  },
  {
    id: "api-props",
    title: "TimeRangePicker props",
    entries: PROP_DOCS,
  },
  {
    id: "api-utilities",
    title: "Utility functions",
    entries: UTILITY_DOCS,
  },
  {
    id: "api-types",
    title: "Exported types",
    entries: TYPE_DOCS,
  },
];

const API_TABLE_OF_CONTENTS: ApiTableOfContentsItem[] = API_DOC_SECTIONS.flatMap((section) => [
  { id: section.id, label: section.title, level: 0 as const },
  ...section.entries.map((entry) => ({
    id: entry.id,
    label: entry.name,
    level: 1 as const,
  })),
]);

export default function App() {
  const [range, setRange] = React.useState<TimeRange | null>(null);
  const [themePreference, setThemePreference] = React.useState<ThemePreference>("system");
  const [clockFormat, setClockFormat] = React.useState<ClockFormat>("24h");
  const [weekStartsOn, setWeekStartsOn] = React.useState<0 | 1>(1);
  const [localeKey, setLocaleKey] = React.useState<LocaleKey>(DEFAULT_LOCALE_KEY);
  const [placeholder, setPlaceholder] = React.useState("Search time range...");
  const [nowLabel, setNowLabel] = React.useState("now");
  const [includeDefaultPresets, setIncludeDefaultPresets] = React.useState(true);
  const [showExamples, setShowExamples] = React.useState(true);
  const [defaultPresetSelection, setDefaultPresetSelection] =
    React.useState<PresetSelection>(() => clonePresetSelection(DEFAULT_PRESET_SELECTION));
  const [customPresetConfigs, setCustomPresetConfigs] = React.useState<CustomPresetConfig[]>(() =>
    cloneCustomPresetConfigs(DEFAULT_CUSTOM_PRESET_CONFIGS),
  );
  const [liveReferenceTime, setLiveReferenceTime] = React.useState(() => new Date());
  const [githubStars, setGithubStars] = React.useState<string | null>(null);
  const [githubUnavailable, setGithubUnavailable] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (preference: ThemePreference) => {
      const darkModeEnabled = preference === "system" ? mediaQuery.matches : preference === "dark";
      document.documentElement.classList.toggle("dark", darkModeEnabled);
    };

    applyTheme(themePreference);

    const handleChange = () => {
      if (themePreference === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [themePreference]);

  React.useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      setGithubUnavailable(true);
      return;
    }

    const controller = new AbortController();

    async function loadGithubStars() {
      try {
        const response = await fetch("https://api.github.com/repos/danyi1212/time-range-picker-component", {
          signal: controller.signal,
        });

        if (!response.ok) {
          setGithubUnavailable(true);
          return;
        }

        const data = (await response.json()) as { stargazers_count?: number };
        setGithubStars(
          typeof data.stargazers_count === "number" ? data.stargazers_count.toLocaleString() : null,
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setGithubUnavailable(true);
        }
      }
    }

    void loadGithubStars();

    return () => {
      controller.abort();
    };
  }, []);

  const selectedLocaleOption =
    LOCALE_OPTIONS.find((option) => option.key === localeKey) ??
    LOCALE_OPTIONS.find((option) => option.key === DEFAULT_LOCALE_KEY) ??
    LOCALE_OPTIONS[0];

  const locale = selectedLocaleOption.locale;

  const customPresets = React.useMemo<TimeRangePreset[]>(
    () =>
      customPresetConfigs
        .filter((preset) => preset.enabled)
        .map((preset) => ({
          label: preset.label,
          value: preset.id,
          shortcut: preset.shortcut,
          getRange: (referenceDate = new Date()) => {
            const start = withTime(referenceDate, preset.startTime);
            const end = withTime(referenceDate, preset.endTime);

            return {
              mode: "static" as const,
              start,
              end,
              label: preset.label,
              isLive: false,
            };
          },
          getHint: () => `${preset.startTime} - ${preset.endTime}`,
        })),
    [customPresetConfigs],
  );

  const defaultPresets = React.useMemo(
    () => getPresets({ clockFormat, locale, weekStartsOn, labels: { now: nowLabel } }),
    [clockFormat, locale, nowLabel, weekStartsOn],
  );

  const curatedDefaultPresets = React.useMemo(
    () => defaultPresets.filter((preset) => defaultPresetSelection[preset.value] ?? true),
    [defaultPresetSelection, defaultPresets],
  );

  React.useEffect(() => {
    if (!range?.isLive) {
      return;
    }

    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setLiveReferenceTime(now);

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setLiveReferenceTime(new Date());
      intervalId = window.setInterval(() => {
        setLiveReferenceTime(new Date());
      }, 60_000);
    }, msUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [range?.isLive]);

  const resolvedRange = React.useMemo(
    () => (range ? resolveTimeRange(range, liveReferenceTime) : null),
    [liveReferenceTime, range],
  );

  const examples = showExamples ? CUSTOM_EXAMPLES : [];
  const presets = React.useMemo(() => {
    const curatedPresets = includeDefaultPresets
      ? customPresets
      : [...curatedDefaultPresets, ...customPresets];

    return curatedPresets.length > 0 ? curatedPresets : undefined;
  }, [curatedDefaultPresets, customPresets, includeDefaultPresets]);

  const playgroundSnippet = React.useMemo(
    () =>
      buildPlaygroundSnippet({
        clockFormat,
        weekStartsOn,
        localeKey,
        localeCode: selectedLocaleOption.code,
        placeholder,
        nowLabel,
        includeDefaultPresets,
        showExamples,
        curatedDefaultPresets,
        customPresetConfigs,
      }),
    [
      clockFormat,
      curatedDefaultPresets,
      customPresetConfigs,
      includeDefaultPresets,
      localeKey,
      selectedLocaleOption.code,
      nowLabel,
      placeholder,
      showExamples,
      weekStartsOn,
    ],
  );

  const toggleTheme = () => {
    setThemePreference((current) => {
      const currentIndex = THEME_ORDER.indexOf(current);
      return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
    });
  };

  const resetPlayground = () => {
    setRange(null);
    setClockFormat("24h");
    setWeekStartsOn(1);
    setLocaleKey(DEFAULT_LOCALE_KEY);
    setPlaceholder("Search time range...");
    setNowLabel("now");
    setIncludeDefaultPresets(true);
    setShowExamples(true);
    setDefaultPresetSelection(clonePresetSelection(DEFAULT_PRESET_SELECTION));
    setCustomPresetConfigs(cloneCustomPresetConfigs(DEFAULT_CUSTOM_PRESET_CONFIGS));
  };

  const themeIcon =
    themePreference === "system" ? (
      <Monitor className="size-4" />
    ) : themePreference === "dark" ? (
      <Moon className="size-4" />
    ) : (
      <Sun className="size-4" />
    );

  const themeLabel =
    themePreference === "system" ? "System" : themePreference === "dark" ? "Dark" : "Light";

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground transition-colors sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-8">
        <header className="sticky top-4 z-20 rounded-[24px] border border-border/70 bg-background/85 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground">
                <Component className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Time Range Picker</div>
                <div className="text-xs text-muted-foreground">shadcn-style docs demo</div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 transition hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={REPO_URL} target="_blank" rel="noreferrer">
                  <Github className="size-4" />
                  GitHub
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                aria-label={`Theme: ${themeLabel}`}
                className="gap-2 font-mono text-xs"
              >
                {themeIcon}
                {themeLabel}
              </Button>
            </div>
          </div>
        </header>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <Card id="install" className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
            <CardHeader className="space-y-4">
              <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs uppercase">
                Essentials
              </Badge>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Natural language time range picker for shadcn/ui apps
                </h1>
                <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
                  Install it, try it, and grab the links you need. The rest of the docs stay below.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <LinkPill
                  href={REPO_URL}
                  icon={Github}
                  label={githubStars ? `GitHub ${githubStars} stars` : "GitHub"}
                  detail={githubUnavailable ? "stars unavailable" : undefined}
                />
                <LinkPill href={NPM_URL} icon={Package} label="npm package" />
                <LinkPill href="#api" icon={BookOpen} label="API docs" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickInstallStep title="shadcn registry" code={INSTALL_COMMANDS.registry} />
              <QuickInstallStep title="npm install" code={INSTALL_COMMANDS.package} />
              <QuickInstallStep title="required shadcn primitives" code={INSTALL_COMMANDS.primitives} />
            </CardContent>
          </Card>

          <Card id="playground" className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="size-5" />
                  Playground
                </CardTitle>
                <Button variant="outline" size="sm" onClick={resetPlayground}>
                  Reset
                </Button>
              </div>
              <CardDescription>
                Try the component first. Open configuration only when you need to tweak behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TimeRangePicker
                value={range}
                onChange={setRange}
                placeholder={placeholder}
                clockFormat={clockFormat}
                locale={locale}
                weekStartsOn={weekStartsOn}
                labels={{ now: nowLabel }}
                presets={presets}
                includeDefaultPresets={includeDefaultPresets}
                examples={examples}
              />

              <InlineSelectionDetails
                range={resolvedRange}
                clockFormat={clockFormat}
                locale={locale}
                weekStartsOn={weekStartsOn}
              />

              <details className="group rounded-2xl border border-border/70 bg-background/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
                  Configuration
                  <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
                </summary>
                <div className="grid gap-4 border-t border-border/70 px-4 py-4">
                  <InlineField>
                    <ControlLabel htmlFor="clock-format" propName="clockFormat">
                      Clock format
                    </ControlLabel>
                    <ToggleButtonGroup
                      id="clock-format"
                      value={clockFormat}
                      options={[
                        { value: "24h", label: "24h" },
                        { value: "12h", label: "12h" },
                      ]}
                      onChange={(value) => setClockFormat(value as ClockFormat)}
                    />
                  </InlineField>

                  <InlineField>
                    <ControlLabel htmlFor="selected-locale" propName="locale">
                      Locale
                    </ControlLabel>
                    <SelectField
                      id="selected-locale"
                      value={localeKey}
                      onChange={(event) => setLocaleKey(event.target.value as LocaleKey)}
                    >
                      {LOCALE_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.code}
                        </option>
                      ))}
                    </SelectField>
                  </InlineField>

                  <InlineField>
                    <ControlLabel htmlFor="week-start" propName="weekStartsOn">
                      Week starts on
                    </ControlLabel>
                    <ToggleButtonGroup
                      id="week-start"
                      value={String(weekStartsOn)}
                      options={[
                        { value: "0", label: "Sunday" },
                        { value: "1", label: "Monday" },
                      ]}
                      onChange={(value) => setWeekStartsOn(Number(value) as 0 | 1)}
                    />
                  </InlineField>

                  <InlineField>
                    <ControlLabel htmlFor="now-label" propName="labels">
                      Live label
                    </ControlLabel>
                    <TextField
                      id="now-label"
                      value={nowLabel}
                      onChange={(event) => setNowLabel(event.target.value)}
                    />
                  </InlineField>

                  <InlineField>
                    <ControlLabel htmlFor="show-examples" propName="examples">
                      Example prompts
                    </ControlLabel>
                    <CheckboxRow
                      id="show-examples"
                      checked={showExamples}
                      label="Show built-in example prompts"
                      onCheckedChange={setShowExamples}
                    />
                  </InlineField>

                  <InlineField>
                    <ControlLabel htmlFor="include-default-presets" propName="includeDefaultPresets">
                      Default presets
                    </ControlLabel>
                    <SwitchRow
                      id="include-default-presets"
                      checked={includeDefaultPresets}
                      label="Enable all built-in presets"
                      description="Turn this off to choose an explicit subset below."
                      onCheckedChange={setIncludeDefaultPresets}
                    />
                    {includeDefaultPresets ? (
                      <p className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                        All built-in presets are enabled. Disable the switch to choose a curated subset.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs leading-5 text-muted-foreground">
                          Choose which built-in presets to pass through the `presets` prop.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {defaultPresets.map((preset) => (
                            <CheckboxCard
                              key={preset.value}
                              checked={defaultPresetSelection[preset.value] ?? true}
                              label={preset.label}
                              hint={preset.getHint({ clockFormat, locale, weekStartsOn, labels: { now: nowLabel } })}
                              onCheckedChange={(checked) =>
                                setDefaultPresetSelection((current) => ({
                                  ...current,
                                  [preset.value]: checked,
                                }))
                              }
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </InlineField>

                  <InlineField>
                    <ControlLabel htmlFor="placeholder" propName="placeholder">
                      Placeholder
                    </ControlLabel>
                    <TextField
                      id="placeholder"
                      value={placeholder}
                      onChange={(event) => setPlaceholder(event.target.value)}
                    />
                  </InlineField>

                  <InlineField>
                    <ControlLabel propName="presets">Custom presets</ControlLabel>
                    <div className="grid gap-3 xl:grid-cols-2">
                      {customPresetConfigs.map((preset) => (
                        <CustomPresetCard
                          key={preset.id}
                          preset={preset}
                          onChange={(nextPreset) =>
                            setCustomPresetConfigs((current) =>
                              current.map((item) => (item.id === nextPreset.id ? nextPreset : item)),
                            )
                          }
                        />
                      ))}
                    </div>
                  </InlineField>
                </div>
              </details>
            </CardContent>
          </Card>
        </section>

        <section id="api" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-10">
          <div className="grid gap-6">
            <SectionIntro
              eyebrow="API"
              title="Exported API"
              description="Compact reference for the public API."
            />

            <div className="flex flex-wrap gap-2">
              {API_DOC_SECTIONS.map((section) => (
                <LinkPill key={section.id} href={`#${section.id}`} icon={BookOpen} label={section.title} />
              ))}
            </div>

            <div className="grid gap-8">
              {API_DOC_SECTIONS.map((section) => (
                <ApiDocSectionBlock key={section.id} section={section} />
              ))}
            </div>
          </div>

          <ApiTableOfContents items={API_TABLE_OF_CONTENTS} />
        </section>

        <section id="examples" className="grid gap-6">
          <SectionIntro
            eyebrow="Examples"
            title="Copy-paste starting points"
            description="These cover the common setups most teams need first: basic usage, localization, custom presets, and standalone utilities."
          />

          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <CodeExample title="Basic usage" code={BASIC_USAGE_EXAMPLE} />
            <CodeExample title="Localization and formatting" code={LOCALE_EXAMPLE} />
            <CodeExample title="Custom presets" code={CUSTOM_PRESET_EXAMPLE} />
            <CodeExample title="Standalone utility helpers" code={UTILITY_EXAMPLE} />
            <CodeExample title="Generated snippet from the playground" code={playgroundSnippet} />
            <CodeExample
              title="Suggested starter examples"
              code={LIVE_EXAMPLES.map((example) => `"${example}"`).join(",\n")}
            />
          </div>
        </section>

        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Supported Input Formats</CardTitle>
              <CardDescription>
                Users can move between terse shortcuts and human phrasing without changing components.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {INPUT_GROUPS.map((group) => (
                <div key={group.title} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {group.examples.map((example) => (
                      <li key={example} className="font-mono text-xs sm:text-sm">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Integration checklist</CardTitle>
              <CardDescription>
                The same set of details that normally get scattered between docs, README, and source comments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ChecklistItem text="React 18+ and Tailwind CSS 4+ in the host app." />
              <ChecklistItem text="`date-fns`, `chrono-node`, and `lucide-react` installed." />
              <ChecklistItem text="Popover, command, badge, and button primitives available." />
              <ChecklistItem text="Controlled state in the parent when the range drives filtering." />
              <ChecklistItem text="Shared options passed to both the picker and your formatting helpers." />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

interface InlineSelectionDetailsProps {
  range: ReturnType<typeof resolveTimeRange> | null;
  clockFormat: ClockFormat;
  locale: Locale;
  weekStartsOn: 0 | 1;
}

function InlineSelectionDetails({
  range,
  clockFormat,
  locale,
  weekStartsOn,
}: InlineSelectionDetailsProps) {
  if (!range) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 p-4">
        <div className="text-sm font-medium">Selected range</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a preset or type a range to inspect duration, start ISO, and end ISO.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-background/50 p-4">
      <div className="flex items-center gap-2 text-base font-semibold">
        <span className="flex items-center gap-2">
          <Timer className="size-5" />
          Selected Range
        </span>
        {range.isLive && (
          <Badge variant="secondary" className="ml-auto text-xs font-normal">
            Live
          </Badge>
        )}
      </div>
      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Duration
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="font-mono">
              {formatDuration(range.start, range.end, { clockFormat, locale, weekStartsOn })}
            </Badge>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {formatRangeDisplay(range, { clockFormat, locale, weekStartsOn })}
          </div>
        </div>

        <div className="grid gap-3">
          <IsoTile label="Start ISO" value={range.start.toISOString()} />
        </div>
        <div className="grid gap-3">
          <IsoTile
            label={range.isLive ? "End ISO (now)" : "End ISO"}
            value={range.end.toISOString()}
          />
        </div>
      </div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-2">
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}

function LinkPill({
  icon: Icon,
  label,
  detail,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail?: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm transition hover:border-border hover:bg-background"
    >
      <Icon className="size-4" />
      <span className="font-medium">{label}</span>
      {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
      <ArrowUpRight className="size-4 text-muted-foreground" />
    </a>
  );
}

function QuickInstallStep({ title, code }: { title: string; code: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="mb-3 text-sm font-medium">{title}</div>
      <pre className="doc-code-block max-w-full overflow-x-auto rounded-2xl border border-border/70 p-4 text-sm leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ApiDocSectionBlock({ section }: { section: ApiDocSection }) {
  return (
    <section id={section.id} className="scroll-mt-28 space-y-4">
      <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
      <div className="space-y-5">
        {section.entries.map((entry) => (
          <ApiDocEntryBlock key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function ApiDocEntryBlock({ entry }: { entry: ApiDocEntry }) {
  return (
    <article id={entry.id} className="scroll-mt-28 border-t border-border/70 pt-4">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-lg font-semibold tracking-tight">
            <a href={`#${entry.id}`} className="transition hover:text-primary">
              {entry.name}
            </a>
          </h4>
          <Badge variant="secondary" className="font-mono text-[11px]">
            {entry.type}
          </Badge>
        </div>

        <p className="max-w-3xl text-sm text-muted-foreground">{entry.description}</p>
        <ApiDocMeta entry={entry} />

        {entry.example ? (
          <pre className="doc-code-block max-w-full overflow-x-auto rounded-2xl border border-border/70 bg-background/40 p-4 text-sm leading-6">
            <code>{entry.example}</code>
          </pre>
        ) : null}
      </div>
    </article>
  );
}

function ApiDocMeta({ entry }: { entry: ApiDocEntry }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      {entry.importPath ? (
        <span>
          import <code className="font-mono text-foreground">{entry.importPath}</code>
        </span>
      ) : null}
      {entry.defaultValue ? (
        <span>
          default <code className="font-mono text-foreground">{entry.defaultValue}</code>
        </span>
      ) : null}
    </div>
  );
}

function ApiTableOfContents({ items }: { items: ApiTableOfContentsItem[] }) {
  const activeId = useActiveHeading(items.map((item) => item.id));

  return (
    <aside className="hidden self-start xl:sticky xl:top-28 xl:block">
      <nav
        aria-label="API reference table of contents"
        className="max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded-[24px] border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur"
      >
        <div className="mb-4 text-sm font-semibold tracking-tight text-foreground">On This Page</div>
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[
                  "block rounded-lg px-3 py-2 text-sm leading-5 transition",
                  item.level === 1 ? "ml-3 text-muted-foreground" : "font-medium text-foreground/80",
                  isActive
                    ? "bg-muted text-foreground"
                    : "hover:bg-muted/70 hover:text-foreground",
                ].join(" ")}
              >
                <span className="block whitespace-nowrap">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = React.useState<string>(ids[0] ?? "");

  React.useEffect(() => {
    if (ids.length === 0) {
      return;
    }

    const resolveActiveHeading = () => {
      const headings = ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element instanceof HTMLElement);

      if (headings.length === 0) {
        return;
      }

      const scrollOffset = 140;
      let nextActiveId = headings[0].id;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - scrollOffset <= 0) {
          nextActiveId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(nextActiveId);
    };

    resolveActiveHeading();
    window.addEventListener("scroll", resolveActiveHeading, { passive: true });
    window.addEventListener("resize", resolveActiveHeading);

    return () => {
      window.removeEventListener("scroll", resolveActiveHeading);
      window.removeEventListener("resize", resolveActiveHeading);
    };
  }, [ids]);

  return activeId;
}

function IsoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 overflow-x-auto font-mono text-sm">{value}</div>
    </div>
  );
}

function CodeExample({ title, code }: { title: string; code: string }) {
  return (
    <Card className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Code2 className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <pre className="doc-code-block max-w-full overflow-x-auto rounded-2xl border border-border/70 p-4 text-sm leading-6">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
        <Check className="size-3.5" />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function ControlLabel({
  htmlFor,
  propName,
  children,
}: React.LabelHTMLAttributes<HTMLLabelElement> & { propName: string }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {children}
      </label>
      <ReferenceButton href={`#${getPropReferenceId(propName)}`} label={`Open ${propName} reference`} />
    </div>
  );
}

function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="flex h-10 w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function ToggleButtonGroup({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div id={id} className="inline-flex w-full rounded-xl border border-input bg-background/80 p-1 shadow-sm">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={
              selected
                ? "flex-1 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition"
                : "flex-1 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectField(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="flex h-10 w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function InlineField({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className ? `space-y-2 ${className}` : "space-y-2"}>{children}</div>;
}

function SwitchRow({
  id,
  checked,
  label,
  description,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  description?: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-left transition hover:border-border"
    >
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="block text-xs text-muted-foreground">{description}</span> : null}
      </span>
      <span
        className={
          checked
            ? "relative inline-flex h-6 w-11 shrink-0 rounded-full bg-foreground transition"
            : "relative inline-flex h-6 w-11 shrink-0 rounded-full bg-muted transition"
        }
      >
        <span
          className={
            checked
              ? "absolute left-[22px] top-[2px] size-5 rounded-full bg-background transition"
              : "absolute left-[2px] top-[2px] size-5 rounded-full bg-background transition"
          }
        />
      </span>
    </button>
  );
}

function CheckboxRow({
  id,
  checked,
  disabled = false,
  label,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={
        disabled
          ? "flex cursor-not-allowed items-center gap-3 rounded-2xl border border-border/70 bg-background/40 px-3 py-2 text-sm text-muted-foreground"
          : "flex cursor-pointer items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
      }
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="size-4 accent-foreground"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function CheckboxCard({
  checked,
  disabled = false,
  label,
  hint,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  hint: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={
        disabled
          ? "flex cursor-not-allowed gap-3 rounded-2xl border border-border/70 bg-background/40 p-3 text-muted-foreground"
          : "flex cursor-pointer gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 transition hover:border-border"
      }
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-1 size-4 accent-foreground"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

function CustomPresetCard({
  preset,
  onChange,
}: {
  preset: CustomPresetConfig;
  onChange: (preset: CustomPresetConfig) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
      <CheckboxRow
        id={`preset-enabled-${preset.id}`}
        checked={preset.enabled}
        label={`${preset.label} (${preset.shortcut})`}
        onCheckedChange={(enabled) => onChange({ ...preset, enabled })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <InlineField>
          <label
            htmlFor={`preset-start-${preset.id}`}
            className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            Start time
          </label>
          <TextField
            id={`preset-start-${preset.id}`}
            type="time"
            value={preset.startTime}
            onChange={(event) => onChange({ ...preset, startTime: event.target.value })}
          />
        </InlineField>
        <InlineField>
          <label
            htmlFor={`preset-end-${preset.id}`}
            className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            End time
          </label>
          <TextField
            id={`preset-end-${preset.id}`}
            type="time"
            value={preset.endTime}
            onChange={(event) => onChange({ ...preset, endTime: event.target.value })}
          />
        </InlineField>
      </div>
      <p className="text-xs text-muted-foreground">
        Hint: {preset.startTime} - {preset.endTime}
      </p>
    </div>
  );
}

function ReferenceButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex size-5 items-center justify-center rounded-full border border-border/70 bg-background/80 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
    >
      ?
    </a>
  );
}

function getPropReferenceId(name: string) {
  return `prop-${name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

function withTime(referenceDate: Date, time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  const nextDate = new Date(referenceDate);

  nextDate.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);

  return nextDate;
}

function clonePresetSelection(selection: PresetSelection) {
  return { ...selection };
}

function cloneCustomPresetConfigs(configs: CustomPresetConfig[]) {
  return configs.map((config) => ({ ...config }));
}

function buildPresetSnippet(
  includeDefaultPresets: boolean,
  curatedDefaultPresets: TimeRangePreset[],
  customPresetConfigs: CustomPresetConfig[],
) {
  if (includeDefaultPresets) {
    return "\n      presets={customPresets}\n      includeDefaultPresets";
  }

  const presetValues = [
    ...curatedDefaultPresets.map((preset) => preset.value),
    ...customPresetConfigs.filter((preset) => preset.enabled).map((preset) => preset.id),
  ];

  return `\n      presets={curatedPresets /* ${presetValues.join(", ")} */}\n      includeDefaultPresets={false}`;
}

function formatLocaleSnippetImport(localeKey: LocaleKey, localeCode: string) {
  if (localeCode === "en-US") {
    return { importLine: "", propLine: "" };
  }

  return {
    importLine: `import { ${localeKey} } from "date-fns/locale";`,
    propLine: `\n      locale={${localeKey}}`,
  };
}

function buildPlaygroundSnippet({
  clockFormat,
  weekStartsOn,
  localeKey,
  localeCode,
  placeholder,
  nowLabel,
  includeDefaultPresets,
  showExamples,
  curatedDefaultPresets,
  customPresetConfigs,
}: {
  clockFormat: ClockFormat;
  weekStartsOn: 0 | 1;
  localeKey: LocaleKey;
  localeCode: string;
  placeholder: string;
  nowLabel: string;
  includeDefaultPresets: boolean;
  showExamples: boolean;
  curatedDefaultPresets: TimeRangePreset[];
  customPresetConfigs: CustomPresetConfig[];
}) {
  const { importLine: localeImport, propLine: localeValue } = formatLocaleSnippetImport(
    localeKey,
    localeCode,
  );
  const weekValue = weekStartsOn === 1 ? "\n      weekStartsOn={1}" : "\n      weekStartsOn={0}";
  const labelsValue = nowLabel !== "now" ? `\n      labels={{ now: "${nowLabel}" }}` : "";
  const placeholderValue =
    placeholder !== "Search time range..." ? `\n      placeholder="${placeholder}"` : "";
  const presetValue = buildPresetSnippet(
    includeDefaultPresets,
    curatedDefaultPresets,
    customPresetConfigs,
  );
  const examplesValue = showExamples
    ? '\n      examples={["3h", "Mar 3 - Mar 13", "14:00 - 16:30"]}'
    : "\n      examples={[]}";

  return `import { useState } from "react";
import { TimeRangePicker, type TimeRange } from "@danyi/time-range-picker";
${localeImport}

export function Example() {
  const [range, setRange] = useState<TimeRange | null>(null);

  return (
    <TimeRangePicker
      value={range}
      onChange={setRange}
      clockFormat="${clockFormat}"${localeValue}${weekValue}${placeholderValue}${labelsValue}${presetValue}${examplesValue}
    />
  );
}`;
}
