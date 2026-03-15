import * as chrono from "chrono-node";
import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  startOfDay,
  endOfDay,
  subHours,
  subMinutes,
  subDays,
  subWeeks,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isToday,
  isYesterday,
  isSameDay,
  isSameYear,
  parseISO,
  isValid,
} from "date-fns";

export interface TimeRange {
  start: Date;
  end: Date;
  label?: string;
  isLive?: boolean; // true if end is "now" (live/flexible)
}

export interface TimeRangePreset {
  label: string;
  value: string;
  shortcut?: string;
  getRange: () => TimeRange;
  getHint: (use24Hour: boolean) => string;
}

export type ClockFormat = "12h" | "24h";

function formatTime(date: Date, use24Hour: boolean): string {
  return format(date, use24Hour ? "HH:mm" : "h:mm a");
}

function formatShortDate(date: Date): string {
  return format(date, "MMM d");
}

export function formatDuration(start: Date, end: Date): string {
  const minutes = differenceInMinutes(end, start);
  const hours = differenceInHours(end, start);
  const days = differenceInDays(end, start);
  const weeks = differenceInWeeks(end, start);
  const months = differenceInMonths(end, start);

  if (minutes < 1) {
    return "< 1 min";
  } else if (minutes < 60) {
    return `${minutes} min`;
  } else if (hours < 24) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  } else if (days < 7) {
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days}d`;
    }
    return `${days}d ${remainingHours}h`;
  } else if (days < 30) {
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return `${weeks}w`;
    }
    return `${weeks}w ${remainingDays}d`;
  } else {
    const remainingDays = days - months * 30;
    if (remainingDays <= 0) {
      return `${months}mo`;
    }
    return `${months}mo ${remainingDays}d`;
  }
}

export function formatRangeDisplay(range: TimeRange, use24Hour: boolean = true): string {
  const { start, end, isLive } = range;
  const endLabel = isLive ? "now" : formatTime(end, use24Hour);

  // Check if it's a time-only range (same day)
  if (isSameDay(start, end)) {
    const startTime = formatTime(start, use24Hour);
    const dayLabel = isToday(start)
      ? "Today"
      : isYesterday(start)
        ? "Yesterday"
        : format(start, "MMM d");
    return `${dayLabel}, ${startTime} - ${endLabel}`;
  }

  // Different days
  const startFormat = isSameYear(start, new Date()) ? "MMM d" : "MMM d, yyyy";
  const endFormat = isSameYear(end, new Date()) ? "MMM d" : "MMM d, yyyy";

  if (isLive) {
    return `${format(start, startFormat)} - now`;
  }

  return `${format(start, startFormat)} - ${format(end, endFormat)}`;
}

export function formatPresetHint(range: TimeRange, use24Hour: boolean): string {
  const { start, end, isLive } = range;
  
  // For live ranges ending at "now"
  if (isLive) {
    // Same day - show time range
    if (isSameDay(start, end)) {
      return `${formatTime(start, use24Hour)} - now`;
    }
    // Different days - show date range
    return `${formatShortDate(start)} - now`;
  }
  
  // For fixed ranges
  if (isSameDay(start, end)) {
    return `${formatTime(start, use24Hour)} - ${formatTime(end, use24Hour)}`;
  }
  
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

export function getPresets(): TimeRangePreset[] {
  return [
    // Minutes
    {
      label: "Past 15 minutes",
      value: "past 15 minutes",
      shortcut: "15m",
      getRange: () => ({
        start: subMinutes(new Date(), 15),
        end: new Date(),
        label: "Past 15 minutes",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: subMinutes(new Date(), 15),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Past 30 minutes",
      value: "past 30 minutes",
      shortcut: "30m",
      getRange: () => ({
        start: subMinutes(new Date(), 30),
        end: new Date(),
        label: "Past 30 minutes",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: subMinutes(new Date(), 30),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    // Hours
    {
      label: "Past 1 hour",
      value: "past 1 hour",
      shortcut: "1h",
      getRange: () => ({
        start: subHours(new Date(), 1),
        end: new Date(),
        label: "Past 1 hour",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: subHours(new Date(), 1),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Past 3 hours",
      value: "past 3 hours",
      shortcut: "3h",
      getRange: () => ({
        start: subHours(new Date(), 3),
        end: new Date(),
        label: "Past 3 hours",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: subHours(new Date(), 3),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Past 6 hours",
      value: "past 6 hours",
      shortcut: "6h",
      getRange: () => ({
        start: subHours(new Date(), 6),
        end: new Date(),
        label: "Past 6 hours",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: subHours(new Date(), 6),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Past 12 hours",
      value: "past 12 hours",
      shortcut: "12h",
      getRange: () => ({
        start: subHours(new Date(), 12),
        end: new Date(),
        label: "Past 12 hours",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: subHours(new Date(), 12),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Past 24 hours",
      value: "past 24 hours",
      shortcut: "24h",
      getRange: () => ({
        start: subHours(new Date(), 24),
        end: new Date(),
        label: "Past 24 hours",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: subHours(new Date(), 24),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    // Days
    {
      label: "Today",
      value: "today",
      getRange: () => ({
        start: startOfDay(new Date()),
        end: new Date(),
        label: "Today",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: startOfDay(new Date()),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Yesterday",
      value: "yesterday",
      getRange: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
          label: "Yesterday",
          isLive: false,
        };
      },
      getHint: (use24Hour) => {
        const yesterday = subDays(new Date(), 1);
        return formatPresetHint({
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
          isLive: false,
        }, use24Hour);
      },
    },
    {
      label: "Past 3 days",
      value: "past 3 days",
      shortcut: "3d",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 3)),
        end: new Date(),
        label: "Past 3 days",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: startOfDay(subDays(new Date(), 3)),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Past 7 days",
      value: "past 7 days",
      shortcut: "7d",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 7)),
        end: new Date(),
        label: "Past 7 days",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: startOfDay(subDays(new Date(), 7)),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    // Weeks
    {
      label: "This week",
      value: "this week",
      getRange: () => ({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: new Date(),
        label: "This week",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Last week",
      value: "last week",
      getRange: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
          label: "Last week",
          isLive: false,
        };
      },
      getHint: (use24Hour) => {
        const lastWeek = subWeeks(new Date(), 1);
        return formatPresetHint({
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
          isLive: false,
        }, use24Hour);
      },
    },
    // Months
    {
      label: "This month",
      value: "this month",
      getRange: () => ({
        start: startOfMonth(new Date()),
        end: new Date(),
        label: "This month",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: startOfMonth(new Date()),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Last month",
      value: "last month",
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
          label: "Last month",
          isLive: false,
        };
      },
      getHint: (use24Hour) => {
        const lastMonth = subMonths(new Date(), 1);
        return formatPresetHint({
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
          isLive: false,
        }, use24Hour);
      },
    },
    {
      label: "Past 30 days",
      value: "past 30 days",
      shortcut: "30d",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 30)),
        end: new Date(),
        label: "Past 30 days",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: startOfDay(subDays(new Date(), 30)),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
    {
      label: "Past 90 days",
      value: "past 90 days",
      shortcut: "90d",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 90)),
        end: new Date(),
        label: "Past 90 days",
        isLive: true,
      }),
      getHint: (use24Hour) => formatPresetHint({
        start: startOfDay(subDays(new Date(), 90)),
        end: new Date(),
        isLive: true,
      }, use24Hour),
    },
  ];
}

// Parse shortcut patterns like "3h", "30m", "7d"
function parseShortcut(input: string): TimeRange | null {
  const shortcutMatch = input.match(/^(\d+)(m|min|h|hr|d|day|w|wk|mo)s?$/i);
  if (!shortcutMatch) return null;

  const value = parseInt(shortcutMatch[1], 10);
  const unit = shortcutMatch[2].toLowerCase();
  const now = new Date();

  let start: Date;
  switch (unit) {
    case "m":
    case "min":
      start = subMinutes(now, value);
      break;
    case "h":
    case "hr":
      start = subHours(now, value);
      break;
    case "d":
    case "day":
      start = startOfDay(subDays(now, value));
      break;
    case "w":
    case "wk":
      start = startOfDay(subWeeks(now, value));
      break;
    case "mo":
      start = startOfDay(subMonths(now, value));
      break;
    default:
      return null;
  }

  return {
    start,
    end: now,
    label: `Past ${value}${unit}`,
    isLive: true,
  };
}

export function parseTimeRange(input: string, referenceDate?: Date): TimeRange | null {
  const ref = referenceDate || new Date();
  const trimmedInput = input.trim().toLowerCase();

  if (!trimmedInput) return null;

  // Handle "now" keyword
  if (trimmedInput === "now") {
    return {
      start: ref,
      end: ref,
      label: "now",
      isLive: true,
    };
  }

  // Handle shortcuts like "3h", "30m", "7d"
  const shortcutResult = parseShortcut(trimmedInput);
  if (shortcutResult) {
    return shortcutResult;
  }

  // Handle ISO format dates
  if (trimmedInput.includes("t") && trimmedInput.includes(":")) {
    const parsed = parseISO(trimmedInput);
    if (isValid(parsed)) {
      return {
        start: parsed,
        end: parsed,
        label: format(parsed, "PPpp"),
        isLive: false,
      };
    }
  }

  // Check presets first (case-insensitive)
  const presets = getPresets();
  const matchedPreset = presets.find(
    (p) =>
      p.value.toLowerCase() === trimmedInput ||
      p.label.toLowerCase() === trimmedInput ||
      (p.shortcut && p.shortcut.toLowerCase() === trimmedInput)
  );
  if (matchedPreset) {
    return matchedPreset.getRange();
  }

  // Handle ranges with "now" as end: "9am - now", "Mar 1 - now"
  const nowRangeMatch = trimmedInput.match(
    /^(.+?)\s*[-–to]+\s*now$/i
  );
  if (nowRangeMatch) {
    const startDate = chrono.parseDate(nowRangeMatch[1], ref);
    if (startDate) {
      return {
        start: startDate,
        end: ref,
        label: `${format(startDate, "MMM d")} - now`,
        isLive: true,
      };
    }
  }

  // Handle time ranges like "14:00 - 14:30" or "2pm - 4pm"
  const timeRangeMatch = trimmedInput.match(
    /^(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)\s*[-–to]+\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)$/i
  );
  if (timeRangeMatch) {
    const startTime = chrono.parseDate(timeRangeMatch[1], ref);
    const endTime = chrono.parseDate(timeRangeMatch[2], ref);
    if (startTime && endTime) {
      // If end time is before start time, assume next day
      let adjustedEnd = endTime;
      if (endTime < startTime) {
        adjustedEnd = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
      }
      return {
        start: startTime,
        end: adjustedEnd,
        label: `${format(startTime, "HH:mm")} - ${format(adjustedEnd, "HH:mm")}`,
        isLive: false,
      };
    }
  }

  // Handle date ranges like "Mar 3 - Mar 13" or "March 3 to March 13"
  const dateRangeMatch = trimmedInput.match(
    /^(.+?)\s*[-–to]+\s*(.+?)$/i
  );
  if (dateRangeMatch) {
    const startDate = chrono.parseDate(dateRangeMatch[1], ref);
    const endDate = chrono.parseDate(dateRangeMatch[2], ref);
    if (startDate && endDate) {
      return {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
        label: `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`,
        isLive: false,
      };
    }
  }

  // Try chrono-node parsing for natural language
  const results = chrono.parse(input, ref);
  
  if (results.length > 0) {
    const result = results[0];
    
    // If chrono found a range
    if (result.start && result.end) {
      return {
        start: result.start.date(),
        end: result.end.date(),
        label: input,
        isLive: false,
      };
    }
    
    // If chrono found a single date/time
    if (result.start) {
      const startDate = result.start.date();
      
      // Check if input suggests a period (like "past X hours/days")
      if (
        trimmedInput.includes("past") ||
        trimmedInput.includes("last") ||
        trimmedInput.includes("ago")
      ) {
        return {
          start: startDate,
          end: ref,
          label: input,
          isLive: true,
        };
      }
      
      // For single date mentions, use start of day to end of day
      if (
        !result.start.get("hour") &&
        !result.start.get("minute")
      ) {
        return {
          start: startOfDay(startDate),
          end: endOfDay(startDate),
          label: input,
          isLive: false,
        };
      }
      
      return {
        start: startDate,
        end: startDate,
        label: input,
        isLive: false,
      };
    }
  }

  return null;
}

export function getFilteredPresets(input: string): TimeRangePreset[] {
  const presets = getPresets();
  
  if (!input.trim()) {
    return presets;
  }

  const lowerInput = input.toLowerCase();
  
  return presets.filter(
    (preset) =>
      preset.label.toLowerCase().includes(lowerInput) ||
      preset.value.toLowerCase().includes(lowerInput) ||
      (preset.shortcut && preset.shortcut.toLowerCase().startsWith(lowerInput))
  );
}
