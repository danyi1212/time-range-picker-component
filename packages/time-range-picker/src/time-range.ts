import * as chrono from "chrono-node";
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameYear,
  isToday,
  isValid,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subWeeks,
  type Locale,
} from "date-fns";

interface TimeRangeBase {
  start: Date;
  end: Date;
  label?: string;
  isLive?: boolean;
}

export type LiveRangeDetails =
  | {
      mode: "anchored";
    }
  | {
      mode: "relative";
      duration: RelativeDuration;
    }
  | {
      mode: "calendarStart";
      unit: "day" | "week" | "month";
      weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    };

export interface StaticTimeRange extends TimeRangeBase {
  mode: "static";
}

export interface LiveTimeRange extends TimeRangeBase {
  mode: "live";
  liveRange: LiveRangeDetails;
}

export type TimeRange = StaticTimeRange | LiveTimeRange;

export type ClockFormat = "12h" | "24h";
export type RelativeDurationUnit = "minute" | "hour" | "day" | "week" | "month";

export interface RelativeDuration {
  value: number;
  unit: RelativeDurationUnit;
}

export interface ResolvedTimeRange {
  mode: "static" | "live";
  start: Date;
  end: Date;
  label?: string;
  isLive?: boolean;
}

export interface TimeRangeLabels {
  now: string;
  today: string;
  yesterday: string;
}

export interface TimeRangeFormatPatterns {
  time: string;
  shortDate: string;
  shortDateWithYear: string;
  dateTime: string;
  dateTimeWithYear: string;
}

export interface TimeRangeOptions {
  clockFormat?: ClockFormat;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  labels?: Partial<TimeRangeLabels>;
  formatPatterns?: Partial<TimeRangeFormatPatterns>;
  presets?: TimeRangePreset[];
  includeDefaultPresets?: boolean;
}

export interface TimeRangePreset {
  label: string;
  value: string;
  shortcut?: string;
  getRange: (referenceDate?: Date) => TimeRange;
  getHint: (options?: boolean | TimeRangeOptions, referenceDate?: Date) => string;
}

type LegacyTimeRange = TimeRangeBase & {
  mode?: "static" | "live";
  liveRange?: LiveRangeDetails;
};

interface ResolvedTimeRangeOptions {
  clockFormat: ClockFormat;
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  labels: TimeRangeLabels;
  formatPatterns: TimeRangeFormatPatterns;
  presets?: TimeRangePreset[];
  includeDefaultPresets: boolean;
}

const DEFAULT_TIME_RANGE_LABELS: TimeRangeLabels = {
  now: "now",
  today: "Today",
  yesterday: "Yesterday",
};

export const DEFAULT_TIME_RANGE_EXAMPLES = [
  "3h",
  "30m",
  "7d",
  "Mar 3 - Mar 13",
  "14:00 - 16:30",
  "9am - now",
  "past 2 weeks",
  "last friday",
];

function getRangeMode(range: {
  mode?: "static" | "live";
  isLive?: boolean;
  liveRange?: LiveRangeDetails;
}): "static" | "live" {
  if (range.mode) {
    return range.mode;
  }

  if (range.isLive || range.liveRange) {
    return "live";
  }

  return "static";
}

function resolveFormatPatterns(
  clockFormat: ClockFormat,
  overrides?: Partial<TimeRangeFormatPatterns>,
): TimeRangeFormatPatterns {
  const defaults: TimeRangeFormatPatterns =
    clockFormat === "24h"
      ? {
          time: "HH:mm",
          shortDate: "MMM d",
          shortDateWithYear: "MMM d, yyyy",
          dateTime: "MMM d, HH:mm",
          dateTimeWithYear: "MMM d, yyyy, HH:mm",
        }
      : {
          time: "h:mm a",
          shortDate: "MMM d",
          shortDateWithYear: "MMM d, yyyy",
          dateTime: "MMM d, h:mm a",
          dateTimeWithYear: "MMM d, yyyy, h:mm a",
        };

  return { ...defaults, ...overrides };
}

function normalizeTimeRangeOptions(
  optionsOrUse24Hour?: boolean | TimeRangeOptions,
): ResolvedTimeRangeOptions {
  if (typeof optionsOrUse24Hour === "boolean") {
    return normalizeTimeRangeOptions({
      clockFormat: optionsOrUse24Hour ? "24h" : "12h",
    });
  }

  const clockFormat = optionsOrUse24Hour?.clockFormat ?? "24h";

  return {
    clockFormat,
    locale: optionsOrUse24Hour?.locale,
    weekStartsOn: optionsOrUse24Hour?.weekStartsOn ?? 1,
    labels: { ...DEFAULT_TIME_RANGE_LABELS, ...optionsOrUse24Hour?.labels },
    formatPatterns: resolveFormatPatterns(clockFormat, optionsOrUse24Hour?.formatPatterns),
    presets: optionsOrUse24Hour?.presets,
    includeDefaultPresets: optionsOrUse24Hour?.includeDefaultPresets ?? true,
  };
}

function formatWithPattern(
  date: Date,
  pattern: keyof TimeRangeFormatPatterns,
  options: ResolvedTimeRangeOptions,
): string {
  return format(date, options.formatPatterns[pattern], { locale: options.locale });
}

function hasExplicitTime(date: Date): boolean {
  return (
    date.getHours() !== 0 ||
    date.getMinutes() !== 0 ||
    date.getSeconds() !== 0 ||
    date.getMilliseconds() !== 0
  );
}

function isEndOfDayDate(date: Date): boolean {
  return (
    date.getHours() === 23 &&
    date.getMinutes() === 59 &&
    date.getSeconds() === 59 &&
    date.getMilliseconds() === 999
  );
}

function subtractRelativeDuration(referenceDate: Date, duration: RelativeDuration): Date {
  switch (duration.unit) {
    case "minute":
      return subMinutes(referenceDate, duration.value);
    case "hour":
      return subHours(referenceDate, duration.value);
    case "day":
      return subDays(referenceDate, duration.value);
    case "week":
      return subWeeks(referenceDate, duration.value);
    case "month":
      return subMonths(referenceDate, duration.value);
  }
}

function createRangeLabel(start: Date, end: Date, options: ResolvedTimeRangeOptions): string {
  if (isSameDay(start, end)) {
    return `${formatWithPattern(start, "time", options)} - ${formatWithPattern(end, "time", options)}`;
  }

  const startPattern = isSameYear(start, end) ? "shortDate" : "shortDateWithYear";
  const endPattern = isSameYear(end, new Date()) ? "shortDate" : "shortDateWithYear";

  return `${formatWithPattern(start, startPattern, options)} - ${formatWithPattern(
    end,
    endPattern,
    options,
  )}`;
}

function getDayLabel(date: Date, options: ResolvedTimeRangeOptions): string {
  if (isToday(date)) {
    return options.labels.today;
  }

  if (isYesterday(date)) {
    return options.labels.yesterday;
  }

  return formatWithPattern(date, "shortDate", options);
}

function coercePresetHintOptions(
  options?: boolean | TimeRangeOptions,
): ResolvedTimeRangeOptions {
  return normalizeTimeRangeOptions(options);
}

function buildPresetHint(range: TimeRange, options?: boolean | TimeRangeOptions): string {
  return formatPresetHint(range, options);
}

function createPreset(
  definition: Omit<TimeRangePreset, "getHint"> & {
    getHint?: (options?: boolean | TimeRangeOptions, referenceDate?: Date) => string;
  },
): TimeRangePreset {
  return {
    ...definition,
    getHint: definition.getHint ?? ((options, referenceDate) => buildPresetHint(definition.getRange(referenceDate), options)),
  };
}

function buildDefaultPresets(options?: TimeRangeOptions): TimeRangePreset[] {
  const resolvedOptions = normalizeTimeRangeOptions(options);

  return [
    createPreset({
      label: "Past 15 minutes",
      value: "past 15 minutes",
      shortcut: "15m",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: subMinutes(referenceDate, 15),
        end: referenceDate,
        label: "Past 15 minutes",
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 15, unit: "minute" } },
      }),
    }),
    createPreset({
      label: "Past 30 minutes",
      value: "past 30 minutes",
      shortcut: "30m",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: subMinutes(referenceDate, 30),
        end: referenceDate,
        label: "Past 30 minutes",
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
      }),
    }),
    createPreset({
      label: "Past 1 hour",
      value: "past 1 hour",
      shortcut: "1h",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: subHours(referenceDate, 1),
        end: referenceDate,
        label: "Past 1 hour",
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 1, unit: "hour" } },
      }),
    }),
    createPreset({
      label: "Past 3 hours",
      value: "past 3 hours",
      shortcut: "3h",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: subHours(referenceDate, 3),
        end: referenceDate,
        label: "Past 3 hours",
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 3, unit: "hour" } },
      }),
    }),
    createPreset({
      label: "Past 6 hours",
      value: "past 6 hours",
      shortcut: "6h",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: subHours(referenceDate, 6),
        end: referenceDate,
        label: "Past 6 hours",
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 6, unit: "hour" } },
      }),
    }),
    createPreset({
      label: "Past 12 hours",
      value: "past 12 hours",
      shortcut: "12h",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: subHours(referenceDate, 12),
        end: referenceDate,
        label: "Past 12 hours",
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 12, unit: "hour" } },
      }),
    }),
    createPreset({
      label: "Past 24 hours",
      value: "past 24 hours",
      shortcut: "24h",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: subHours(referenceDate, 24),
        end: referenceDate,
        label: "Past 24 hours",
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 24, unit: "hour" } },
      }),
    }),
    createPreset({
      label: "Today",
      value: "today",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: startOfDay(referenceDate),
        end: referenceDate,
        label: "Today",
        isLive: true,
        liveRange: { mode: "calendarStart", unit: "day" },
      }),
    }),
    createPreset({
      label: "Yesterday",
      value: "yesterday",
      getRange: (referenceDate = new Date()) => {
        const yesterday = subDays(referenceDate, 1);
        return {
          mode: "static",
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
          label: "Yesterday",
          isLive: false,
        };
      },
    }),
    createPreset({
      label: "Past 3 days",
      value: "past 3 days",
      shortcut: "3d",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: startOfDay(subDays(referenceDate, 3)),
        end: referenceDate,
        label: "Past 3 days",
        isLive: true,
        liveRange: { mode: "anchored" },
      }),
    }),
    createPreset({
      label: "Past 7 days",
      value: "past 7 days",
      shortcut: "7d",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: startOfDay(subDays(referenceDate, 7)),
        end: referenceDate,
        label: "Past 7 days",
        isLive: true,
        liveRange: { mode: "anchored" },
      }),
    }),
    createPreset({
      label: "This week",
      value: "this week",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: startOfWeek(referenceDate, { weekStartsOn: resolvedOptions.weekStartsOn }),
        end: referenceDate,
        label: "This week",
        isLive: true,
        liveRange: {
          mode: "calendarStart",
          unit: "week",
          weekStartsOn: resolvedOptions.weekStartsOn,
        },
      }),
    }),
    createPreset({
      label: "Last week",
      value: "last week",
      getRange: (referenceDate = new Date()) => {
        const lastWeek = subWeeks(referenceDate, 1);
        return {
          mode: "static",
          start: startOfWeek(lastWeek, { weekStartsOn: resolvedOptions.weekStartsOn }),
          end: endOfWeek(lastWeek, { weekStartsOn: resolvedOptions.weekStartsOn }),
          label: "Last week",
          isLive: false,
        };
      },
    }),
    createPreset({
      label: "This month",
      value: "this month",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: startOfMonth(referenceDate),
        end: referenceDate,
        label: "This month",
        isLive: true,
        liveRange: { mode: "calendarStart", unit: "month" },
      }),
    }),
    createPreset({
      label: "Last month",
      value: "last month",
      getRange: (referenceDate = new Date()) => {
        const lastMonth = subMonths(referenceDate, 1);
        return {
          mode: "static",
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
          label: "Last month",
          isLive: false,
        };
      },
    }),
    createPreset({
      label: "Past 30 days",
      value: "past 30 days",
      shortcut: "30d",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: startOfDay(subDays(referenceDate, 30)),
        end: referenceDate,
        label: "Past 30 days",
        isLive: true,
        liveRange: { mode: "anchored" },
      }),
    }),
    createPreset({
      label: "Past 90 days",
      value: "past 90 days",
      shortcut: "90d",
      getRange: (referenceDate = new Date()) => ({
        mode: "live",
        start: startOfDay(subDays(referenceDate, 90)),
        end: referenceDate,
        label: "Past 90 days",
        isLive: true,
        liveRange: { mode: "anchored" },
      }),
    }),
  ];
}

function getAllPresets(options?: TimeRangeOptions): TimeRangePreset[] {
  const resolvedOptions = normalizeTimeRangeOptions(options);
  const defaultPresets = resolvedOptions.includeDefaultPresets ? buildDefaultPresets(options) : [];
  return [...defaultPresets, ...(resolvedOptions.presets ?? [])];
}

function parseShortcut(input: string, referenceDate: Date, options?: TimeRangeOptions): TimeRange | null {
  const shortcutMatch = input.match(/^(\d+)(m|min|h|hr|d|day|w|wk|mo)s?$/i);
  if (!shortcutMatch) {
    return null;
  }

  const value = Number.parseInt(shortcutMatch[1], 10);
  const token = shortcutMatch[2].toLowerCase();
  const normalizedUnit =
    token === "m" || token === "min"
      ? "minute"
      : token === "h" || token === "hr"
        ? "hour"
        : token === "d" || token === "day"
          ? "day"
          : token === "w" || token === "wk"
            ? "week"
            : "month";

  const labelUnit = `${normalizedUnit}${value === 1 ? "" : "s"}`;
  const label = `Past ${value} ${labelUnit}`;

  if (normalizedUnit === "minute" || normalizedUnit === "hour") {
    return {
      mode: "live",
      start: subtractRelativeDuration(referenceDate, { value, unit: normalizedUnit }),
      end: referenceDate,
      label,
      isLive: true,
      liveRange: { mode: "relative", duration: { value, unit: normalizedUnit } },
    };
  }

  const start =
    normalizedUnit === "day"
      ? startOfDay(subDays(referenceDate, value))
      : normalizedUnit === "week"
        ? startOfDay(subWeeks(referenceDate, value))
        : startOfDay(subMonths(referenceDate, value));

  return {
    mode: "live",
    start,
    end: referenceDate,
    label,
    isLive: true,
    liveRange: { mode: "anchored" },
  };
}

function hasCertainTime(component: any) {
  return component.isCertain("hour") || component.isCertain("minute");
}

export function isLiveTimeRange(range: TimeRange): range is LiveTimeRange {
  return getRangeMode(range) === "live";
}

export function isStaticTimeRange(range: TimeRange): range is StaticTimeRange {
  return getRangeMode(range) === "static";
}

export function resolveTimeRange(
  range: TimeRange | LegacyTimeRange,
  referenceDate: Date = new Date(),
): ResolvedTimeRange {
  const mode = getRangeMode(range);
  const liveRange = "liveRange" in range ? range.liveRange : undefined;

  if (mode === "static") {
    return {
      mode: "static",
      start: range.start,
      end: range.end,
      label: range.label,
      isLive: false,
    };
  }

  if (!liveRange || liveRange.mode === "anchored") {
    return {
      mode: "live",
      start: range.start,
      end: referenceDate,
      label: range.label,
      isLive: true,
    };
  }

  if (liveRange.mode === "relative") {
    return {
      mode: "live",
      start: subtractRelativeDuration(referenceDate, liveRange.duration),
      end: referenceDate,
      label: range.label,
      isLive: true,
    };
  }

  switch (liveRange.unit) {
    case "day":
      return {
        mode: "live",
        start: startOfDay(referenceDate),
        end: referenceDate,
        label: range.label,
        isLive: true,
      };
    case "week":
      return {
        mode: "live",
        start: startOfWeek(referenceDate, { weekStartsOn: liveRange.weekStartsOn ?? 1 }),
        end: referenceDate,
        label: range.label,
        isLive: true,
      };
    case "month":
      return {
        mode: "live",
        start: startOfMonth(referenceDate),
        end: referenceDate,
        label: range.label,
        isLive: true,
      };
  }

  return {
    mode: "live",
    start: range.start,
    end: referenceDate,
    label: range.label,
    isLive: true,
  };
}

export function resolveTimeRangeToIso(range: TimeRange, referenceDate: Date = new Date()) {
  const resolved = resolveTimeRange(range, referenceDate);
  return {
    mode: resolved.mode,
    start: resolved.start.toISOString(),
    end: resolved.end.toISOString(),
    label: resolved.label,
  };
}

export function getTimeRangeStart(range: TimeRange, referenceDate: Date = new Date()): Date {
  return resolveTimeRange(range, referenceDate).start;
}

export function getTimeRangeEnd(range: TimeRange, referenceDate: Date = new Date()): Date {
  return resolveTimeRange(range, referenceDate).end;
}

export function getTimeRangeDurationMs(
  range: TimeRange,
  referenceDate: Date = new Date(),
): number {
  const resolved = resolveTimeRange(range, referenceDate);
  return resolved.end.getTime() - resolved.start.getTime();
}

export function formatDuration(
  start: Date,
  end: Date,
  _options?: boolean | TimeRangeOptions,
): string {
  if (differenceInMinutes(end, start) < 1) {
    return "< 1 min";
  }

  let cursor = start;
  const parts: Array<{ label: string; value: number }> = [];
  const wholeDayRange = !hasExplicitTime(start) && isEndOfDayDate(end);

  const years = differenceInYears(end, cursor);
  if (years > 0) {
    parts.push({ label: "y", value: years });
    cursor = addYears(cursor, years);
  }

  const months = differenceInMonths(end, cursor);
  if (months > 0) {
    parts.push({ label: "mo", value: months });
    cursor = addMonths(cursor, months);
  }

  let days = differenceInDays(end, cursor);
  if (parts.length === 0 && days >= 7) {
    const weeks = Math.floor(days / 7);
    if (weeks > 0) {
      parts.push({ label: "w", value: weeks });
      cursor = addWeeks(cursor, weeks);
      days = differenceInDays(end, cursor);
    }
  }

  if (days > 0) {
    parts.push({ label: "d", value: days });
    cursor = addDays(cursor, days);
  }

  if (!wholeDayRange && parts.length < 2) {
    const hours = differenceInHours(end, cursor);
    if (hours > 0) {
      parts.push({ label: "h", value: hours });
      cursor = addHours(cursor, hours);
    }

    if (parts.length < 2) {
      const minutes = differenceInMinutes(end, cursor);
      if (minutes > 0) {
        parts.push({ label: parts.length > 0 ? "m" : " min", value: minutes });
      }
    }
  }

  const compact = parts
    .slice(0, 2)
    .map((part) => `${part.value}${part.label}`)
    .join(" ");

  return compact || "< 1 min";
}

export function getTimeRangeDuration(
  range: TimeRange,
  referenceDate: Date = new Date(),
  options?: boolean | TimeRangeOptions,
): string {
  const resolved = resolveTimeRange(range, referenceDate);
  return formatDuration(resolved.start, resolved.end, options);
}

export function pauseTimeRange(
  range: TimeRange,
  referenceDate: Date = new Date(),
): StaticTimeRange {
  const resolved = resolveTimeRange(range, referenceDate);
  return {
    mode: "static",
    start: resolved.start,
    end: resolved.end,
    label: resolved.label,
    isLive: false,
  };
}

function getShiftDurationMs(range: ResolvedTimeRange): number {
  const durationMs = range.end.getTime() - range.start.getTime();

  if (!hasExplicitTime(range.start) && isEndOfDayDate(range.end)) {
    return durationMs + 1;
  }

  return durationMs;
}

export function canShiftTimeRangeForward(
  range: TimeRange,
  referenceDate: Date = new Date(),
): boolean {
  const resolved = resolveTimeRange(range, referenceDate);
  const shiftDurationMs = getShiftDurationMs(resolved);

  return resolved.end.getTime() + shiftDurationMs <= referenceDate.getTime();
}

export function shiftTimeRange(
  range: TimeRange,
  direction: "backward" | "forward",
  referenceDate: Date = new Date(),
): StaticTimeRange {
  const resolved = resolveTimeRange(range, referenceDate);
  const shiftDurationMs = getShiftDurationMs(resolved);
  const directionMultiplier = direction === "backward" ? -1 : 1;

  if (direction === "forward" && resolved.end.getTime() + shiftDurationMs > referenceDate.getTime()) {
    return {
      mode: "static",
      start: resolved.start,
      end: resolved.end,
      isLive: false,
    };
  }

  return {
    mode: "static",
    start: new Date(resolved.start.getTime() + shiftDurationMs * directionMultiplier),
    end: new Date(resolved.end.getTime() + shiftDurationMs * directionMultiplier),
    isLive: false,
  };
}

export function formatRangeDisplay(
  range: ResolvedTimeRange | LegacyTimeRange,
  optionsOrUse24Hour?: boolean | TimeRangeOptions,
): string {
  const options = normalizeTimeRangeOptions(optionsOrUse24Hour);
  const mode = getRangeMode(range);
  const endLabel =
    mode === "live"
      ? options.labels.now
      : formatWithPattern(range.end, "time", options);

  if (isSameDay(range.start, range.end)) {
    return `${getDayLabel(range.start, options)}, ${formatWithPattern(
      range.start,
      "time",
      options,
    )} - ${endLabel}`;
  }

  if (mode === "live") {
    const startPattern = isSameYear(range.start, range.end) ? "shortDate" : "shortDateWithYear";
    return `${formatWithPattern(range.start, startPattern, options)} - ${options.labels.now}`;
  }

  const startPattern = isSameYear(range.start, range.end) ? "shortDate" : "shortDateWithYear";
  const endPattern = isSameYear(range.end, new Date()) ? "shortDate" : "shortDateWithYear";

  return `${formatWithPattern(range.start, startPattern, options)} - ${formatWithPattern(
    range.end,
    endPattern,
    options,
  )}`;
}

export function formatInputDisplay(
  range: ResolvedTimeRange | LegacyTimeRange,
  optionsOrUse24Hour?: boolean | TimeRangeOptions,
): string {
  const options = normalizeTimeRangeOptions(optionsOrUse24Hour);
  const mode = getRangeMode(range);

  if (mode === "live") {
    if (isSameDay(range.start, range.end)) {
      return `${formatWithPattern(range.start, "time", options)} - ${options.labels.now}`;
    }

    const startPattern = isSameYear(range.start, range.end) ? "dateTime" : "dateTimeWithYear";
    return `${formatWithPattern(range.start, startPattern, options)} - ${options.labels.now}`;
  }

  const isWholeDayRange = !hasExplicitTime(range.start) && isEndOfDayDate(range.end);
  if (!isWholeDayRange && !isSameDay(range.start, range.end)) {
    const pattern = isSameYear(range.start, range.end) ? "dateTime" : "dateTimeWithYear";
    return `${formatWithPattern(range.start, pattern, options)} - ${formatWithPattern(
      range.end,
      pattern,
      options,
    )}`;
  }

  return formatRangeDisplay(range, options);
}

export function formatPresetHint(
  range: ResolvedTimeRange | LegacyTimeRange,
  optionsOrUse24Hour?: boolean | TimeRangeOptions,
): string {
  const options = normalizeTimeRangeOptions(optionsOrUse24Hour);
  const mode = getRangeMode(range);

  if (mode === "live") {
    if (isSameDay(range.start, range.end)) {
      return `${formatWithPattern(range.start, "time", options)} - ${options.labels.now}`;
    }

    return `${formatWithPattern(range.start, "shortDate", options)} - ${options.labels.now}`;
  }

  if (isSameDay(range.start, range.end)) {
    return `${formatWithPattern(range.start, "time", options)} - ${formatWithPattern(
      range.end,
      "time",
      options,
    )}`;
  }

  return `${formatWithPattern(range.start, "shortDate", options)} - ${formatWithPattern(
    range.end,
    "shortDate",
    options,
  )}`;
}

export function getPresets(options?: TimeRangeOptions): TimeRangePreset[] {
  return getAllPresets(options);
}

export function parseTimeRange(
  input: string,
  referenceDate: Date = new Date(),
  options?: TimeRangeOptions,
): TimeRange | null {
  const trimmedInput = input.trim();
  const lowerInput = trimmedInput.toLowerCase();

  if (!lowerInput) {
    return null;
  }

  const resolvedOptions = normalizeTimeRangeOptions(options);

  if (lowerInput === resolvedOptions.labels.now.toLowerCase()) {
    return {
      mode: "live",
      start: referenceDate,
      end: referenceDate,
      label: resolvedOptions.labels.now,
      isLive: true,
      liveRange: { mode: "anchored" },
    };
  }

  const shortcutResult = parseShortcut(lowerInput, referenceDate, options);
  if (shortcutResult) {
    return shortcutResult;
  }

  if (trimmedInput.includes("T") && trimmedInput.includes(":")) {
    const parsed = parseISO(trimmedInput);
    if (isValid(parsed)) {
      return {
        mode: "static",
        start: parsed,
        end: parsed,
        label: formatWithPattern(parsed, "dateTimeWithYear", resolvedOptions),
        isLive: false,
      };
    }
  }

  const matchedPreset = getAllPresets(options).find(
    (preset) =>
      preset.value.toLowerCase() === lowerInput ||
      preset.label.toLowerCase() === lowerInput ||
      (preset.shortcut && preset.shortcut.toLowerCase() === lowerInput),
  );

  if (matchedPreset) {
    return matchedPreset.getRange(referenceDate);
  }

  const nowPattern = resolvedOptions.labels.now.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nowRangeMatch = trimmedInput.match(
    new RegExp(`^(.+?)\\s*(?:[-–]|\\bto\\b)\\s*${nowPattern}$`, "i"),
  );
  if (nowRangeMatch) {
    const startDate = chrono.parseDate(nowRangeMatch[1], referenceDate);
    if (startDate) {
      return {
        mode: "live",
        start: startDate,
        end: referenceDate,
        label: `${formatWithPattern(startDate, "shortDate", resolvedOptions)} - ${resolvedOptions.labels.now}`,
        isLive: true,
        liveRange: { mode: "anchored" },
      };
    }
  }

  const timeRangeMatch = trimmedInput.match(
    /^(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)\s*(?:[-–]|\bto\b)\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)$/i,
  );
  if (timeRangeMatch) {
    const startTime = chrono.parseDate(timeRangeMatch[1], referenceDate);
    const endTime = chrono.parseDate(timeRangeMatch[2], referenceDate);
    if (startTime && endTime) {
      const adjustedEnd =
        endTime >= startTime ? endTime : new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

      return {
        mode: "static",
        start: startTime,
        end: adjustedEnd,
        label: createRangeLabel(startTime, adjustedEnd, resolvedOptions),
        isLive: false,
      };
    }
  }

  const dateRangeMatch = trimmedInput.match(/^(.+?)\s*(?:[-–]|\bto\b)\s*(.+?)$/i);
  if (dateRangeMatch) {
    const startDate = chrono.parseDate(dateRangeMatch[1], referenceDate);
    const endDate = chrono.parseDate(dateRangeMatch[2], referenceDate);
    if (startDate && endDate) {
      return {
        mode: "static",
        start: startOfDay(startDate),
        end: endOfDay(endDate),
        label: createRangeLabel(startOfDay(startDate), endOfDay(endDate), resolvedOptions),
        isLive: false,
      };
    }
  }

  const results = chrono.parse(trimmedInput, referenceDate);
  if (results.length === 0) {
    return null;
  }

  const result = results[0];

  if (result.start && result.end) {
    const startDate = hasCertainTime(result.start) ? result.start.date() : startOfDay(result.start.date());
    const endDate = hasCertainTime(result.end) ? result.end.date() : endOfDay(result.end.date());

    return {
      mode: "static",
      start: startDate,
      end: endDate,
      label: createRangeLabel(startDate, endDate, resolvedOptions),
      isLive: false,
    };
  }

  if (!result.start) {
    return null;
  }

  const startDate = result.start.date();
  const inputSuggestsRelative =
    lowerInput.includes("past") || lowerInput.includes("last") || lowerInput.includes("ago");

  if (inputSuggestsRelative) {
    return {
      mode: "live",
      start: startDate,
      end: referenceDate,
      label: trimmedInput,
      isLive: true,
      liveRange: { mode: "anchored" },
    };
  }

  if (!hasCertainTime(result.start)) {
    return {
      mode: "static",
      start: startOfDay(startDate),
      end: endOfDay(startDate),
      label: trimmedInput,
      isLive: false,
    };
  }

  return {
    mode: "static",
    start: startDate,
    end: startDate,
    label: trimmedInput,
    isLive: false,
  };
}

export function getFilteredPresets(input: string, options?: TimeRangeOptions): TimeRangePreset[] {
  const presets = getAllPresets(options);

  if (!input.trim()) {
    return presets;
  }

  const lowerInput = input.trim().toLowerCase();

  return presets.filter(
    (preset) =>
      preset.label.toLowerCase().includes(lowerInput) ||
      preset.value.toLowerCase().includes(lowerInput) ||
      (preset.shortcut && preset.shortcut.toLowerCase().startsWith(lowerInput)),
  );
}
