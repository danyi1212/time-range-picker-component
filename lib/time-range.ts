import * as chrono from "chrono-node";
import {
  format,
  formatDistanceStrict,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  startOfDay,
  endOfDay,
  startOfHour,
  subHours,
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
  isSameMonth,
  isSameYear,
  parseISO,
  isValid,
} from "date-fns";

export interface TimeRange {
  start: Date;
  end: Date;
  label?: string;
}

export interface TimeRangePreset {
  label: string;
  value: string;
  getRange: () => TimeRange;
}

export function formatDuration(start: Date, end: Date): string {
  const minutes = differenceInMinutes(end, start);
  const hours = differenceInHours(end, start);
  const days = differenceInDays(end, start);
  const weeks = differenceInWeeks(end, start);
  const months = differenceInMonths(end, start);

  if (minutes < 1) {
    return "< 1 minute";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else if (hours < 24) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  } else if (days < 7) {
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
    return `${days}d ${remainingHours}h`;
  } else if (days < 30) {
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    }
    return `${weeks}w ${remainingDays}d`;
  } else {
    const remainingDays = days - months * 30;
    if (remainingDays <= 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    return `${months}mo ${remainingDays}d`;
  }
}

export function formatRangeDisplay(range: TimeRange): string {
  const { start, end } = range;

  // Check if it's a time-only range (same day)
  if (isSameDay(start, end)) {
    const startTime = format(start, "HH:mm");
    const endTime = format(end, "HH:mm");
    const dayLabel = isToday(start)
      ? "Today"
      : isYesterday(start)
        ? "Yesterday"
        : format(start, "MMM d");
    return `${dayLabel}, ${startTime} - ${endTime}`;
  }

  // Different days
  const startFormat = isSameYear(start, new Date()) ? "MMM d" : "MMM d, yyyy";
  const endFormat = isSameYear(end, new Date()) ? "MMM d" : "MMM d, yyyy";

  return `${format(start, startFormat)} - ${format(end, endFormat)}`;
}

export function getPresets(): TimeRangePreset[] {
  return [
    {
      label: "Past 1 hour",
      value: "past 1 hour",
      getRange: () => ({
        start: subHours(new Date(), 1),
        end: new Date(),
        label: "Past 1 hour",
      }),
    },
    {
      label: "Past 3 hours",
      value: "past 3 hours",
      getRange: () => ({
        start: subHours(new Date(), 3),
        end: new Date(),
        label: "Past 3 hours",
      }),
    },
    {
      label: "Past 6 hours",
      value: "past 6 hours",
      getRange: () => ({
        start: subHours(new Date(), 6),
        end: new Date(),
        label: "Past 6 hours",
      }),
    },
    {
      label: "Past 12 hours",
      value: "past 12 hours",
      getRange: () => ({
        start: subHours(new Date(), 12),
        end: new Date(),
        label: "Past 12 hours",
      }),
    },
    {
      label: "Past 24 hours",
      value: "past 24 hours",
      getRange: () => ({
        start: subHours(new Date(), 24),
        end: new Date(),
        label: "Past 24 hours",
      }),
    },
    {
      label: "Today",
      value: "today",
      getRange: () => ({
        start: startOfDay(new Date()),
        end: new Date(),
        label: "Today",
      }),
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
        };
      },
    },
    {
      label: "Past 3 days",
      value: "past 3 days",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 3)),
        end: new Date(),
        label: "Past 3 days",
      }),
    },
    {
      label: "Past 7 days",
      value: "past 7 days",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 7)),
        end: new Date(),
        label: "Past 7 days",
      }),
    },
    {
      label: "This week",
      value: "this week",
      getRange: () => ({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: new Date(),
        label: "This week",
      }),
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
        };
      },
    },
    {
      label: "This month",
      value: "this month",
      getRange: () => ({
        start: startOfMonth(new Date()),
        end: new Date(),
        label: "This month",
      }),
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
        };
      },
    },
    {
      label: "Past 30 days",
      value: "past 30 days",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 30)),
        end: new Date(),
        label: "Past 30 days",
      }),
    },
    {
      label: "Past 90 days",
      value: "past 90 days",
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 90)),
        end: new Date(),
        label: "Past 90 days",
      }),
    },
  ];
}

export function parseTimeRange(input: string, referenceDate?: Date): TimeRange | null {
  const ref = referenceDate || new Date();
  const trimmedInput = input.trim().toLowerCase();

  // Handle ISO format dates
  if (trimmedInput.includes("t") && trimmedInput.includes(":")) {
    const parsed = parseISO(trimmedInput);
    if (isValid(parsed)) {
      return {
        start: parsed,
        end: parsed,
        label: format(parsed, "PPpp"),
      };
    }
  }

  // Check presets first (case-insensitive)
  const presets = getPresets();
  const matchedPreset = presets.find(
    (p) =>
      p.value.toLowerCase() === trimmedInput ||
      p.label.toLowerCase() === trimmedInput
  );
  if (matchedPreset) {
    return matchedPreset.getRange();
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
        };
      }
      
      return {
        start: startDate,
        end: startDate,
        label: input,
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
      preset.value.toLowerCase().includes(lowerInput)
  );
}
