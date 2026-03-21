import {
  parseTimeRange,
  formatDuration,
  formatRangeDisplay,
  formatInputDisplay,
  getFilteredPresets,
  getPresets,
  formatPresetHint,
  resolveTimeRange,
} from "./time-range";
import {
  startOfDay,
  endOfDay,
  subHours,
  subMinutes,
  subDays,
  subWeeks,
  subMonths,
  setHours,
  setMinutes,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { vi, beforeEach, afterEach } from "vitest";

// Freeze time so Date-dependent code (parseShortcut, isSameYear) is stable
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-03-15T14:30:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

// Test utility to create a fixed reference date
const createReferenceDate = () => new Date("2024-03-15T14:30:00.000Z");

describe("formatDuration", () => {
  test("formats duration less than 1 minute", () => {
    const start = new Date("2024-03-15T14:30:00");
    const end = new Date("2024-03-15T14:30:30");
    expect(formatDuration(start, end)).toBe("< 1 min");
  });

  test("formats duration in minutes", () => {
    const start = new Date("2024-03-15T14:00:00");
    const end = new Date("2024-03-15T14:45:00");
    expect(formatDuration(start, end)).toBe("45 min");
  });

  test("formats duration in hours (exact)", () => {
    const start = new Date("2024-03-15T12:00:00");
    const end = new Date("2024-03-15T15:00:00");
    expect(formatDuration(start, end)).toBe("3h");
  });

  test("formats duration in hours and minutes", () => {
    const start = new Date("2024-03-15T12:00:00");
    const end = new Date("2024-03-15T14:30:00");
    expect(formatDuration(start, end)).toBe("2h 30m");
  });

  test("formats duration in days (exact)", () => {
    const start = new Date("2024-03-10T12:00:00");
    const end = new Date("2024-03-13T12:00:00");
    expect(formatDuration(start, end)).toBe("3d");
  });

  test("formats duration in days and hours", () => {
    const start = new Date("2024-03-10T12:00:00");
    const end = new Date("2024-03-13T18:00:00");
    expect(formatDuration(start, end)).toBe("3d 6h");
  });

  test("formats duration in weeks (exact)", () => {
    const start = new Date("2024-03-01T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("2w");
  });

  test("formats duration in weeks and days", () => {
    const start = new Date("2024-03-01T12:00:00");
    const end = new Date("2024-03-12T12:00:00");
    expect(formatDuration(start, end)).toBe("1w 4d");
  });

  test("formats duration in months (exact)", () => {
    const start = new Date("2024-01-15T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("2mo");
  });

  test("formats duration in months and days", () => {
    const start = new Date("2024-01-01T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("2mo 14d");
  });
});

describe("formatRangeDisplay", () => {
  test("formats same day range with 24h times", () => {
    const today = new Date("2024-03-15T12:00:00");
    const start = setMinutes(setHours(today, 14), 0);
    const end = setMinutes(setHours(today, 16), 30);
    const result = formatRangeDisplay({ start, end, isLive: false }, true);
    expect(result).toContain("14:00");
    expect(result).toContain("16:30");
  });

  test("formats same day range with 12h times", () => {
    const today = new Date("2024-03-15T12:00:00");
    const start = setMinutes(setHours(today, 14), 0);
    const end = setMinutes(setHours(today, 16), 30);
    const result = formatRangeDisplay({ start, end, isLive: false }, false);
    expect(result).toContain("2:00 PM");
    expect(result).toContain("4:30 PM");
  });

  test("formats different day range in same year", () => {
    const start = new Date("2024-03-03T00:00:00");
    const end = new Date("2024-03-13T23:59:59");
    const result = formatRangeDisplay({ start, end, isLive: false }, true);
    expect(result).toBe("Mar 3 - Mar 13");
  });

  test("formats range spanning years", () => {
    const start = new Date("2023-12-25T00:00:00");
    const end = new Date("2024-01-05T23:59:59");
    const result = formatRangeDisplay({ start, end, isLive: false }, true);
    expect(result).toBe("Dec 25, 2023 - Jan 5");
  });

  test("shows 'now' for live ranges", () => {
    const start = new Date("2024-03-15T09:00:00");
    const end = new Date("2024-03-15T14:30:00");
    const result = formatRangeDisplay({ start, end, isLive: true }, true);
    expect(result).toContain("now");
  });
});

describe("formatInputDisplay", () => {
  test("formats live same-day preset selection as time to now", () => {
    const start = new Date("2024-03-15T09:30:00");
    const end = new Date("2024-03-15T12:30:00");
    const result = formatInputDisplay({ start, end, isLive: true }, true);
    expect(result).toBe("09:30 - now");
  });

  test("formats live multi-day preset selection as dated time to now", () => {
    const start = new Date("2024-03-14T12:30:00");
    const end = new Date("2024-03-15T12:30:00");
    const result = formatInputDisplay({ start, end, isLive: true }, true);
    expect(result).toBe("Mar 14, 12:30 - now");
  });
});

describe("resolveTimeRange", () => {
  test("recomputes relative live ranges from the reference date", () => {
    const referenceDate = new Date("2024-03-15T12:31:00");
    const result = resolveTimeRange(
      {
        start: new Date("2024-03-15T12:00:00"),
        end: new Date("2024-03-15T12:30:00"),
        isLive: true,
        liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
      },
      referenceDate,
    );

    expect(result.start.getTime()).toBe(new Date("2024-03-15T12:01:00").getTime());
    expect(result.end.getTime()).toBe(referenceDate.getTime());
  });

  test("recomputes calendar-start live ranges from the reference date", () => {
    const referenceDate = new Date("2024-03-16T08:00:00");
    const result = resolveTimeRange(
      {
        start: new Date("2024-03-15T00:00:00"),
        end: new Date("2024-03-15T23:59:00"),
        isLive: true,
        liveRange: { mode: "calendarStart", unit: "day" },
      },
      referenceDate,
    );

    expect(result.start.getTime()).toBe(new Date("2024-03-16T00:00:00").getTime());
    expect(result.end.getTime()).toBe(referenceDate.getTime());
  });

  test("recomputes anchored live ranges with a moving end only", () => {
    const referenceDate = new Date("2024-03-15T12:31:00");
    const start = new Date("2024-03-15T09:00:00");
    const result = resolveTimeRange(
      {
        start,
        end: new Date("2024-03-15T12:30:00"),
        isLive: true,
        liveRange: { mode: "anchored" },
      },
      referenceDate,
    );

    expect(result.start.getTime()).toBe(start.getTime());
    expect(result.end.getTime()).toBe(referenceDate.getTime());
  });
});

describe("formatPresetHint", () => {
  const ref = createReferenceDate();

  test("formats live same-day range with time and now", () => {
    const start = subHours(ref, 3);
    const result = formatPresetHint({ start, end: ref, isLive: true }, true);
    expect(result).toContain("now");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  test("formats live multi-day range with dates", () => {
    const start = startOfDay(subDays(ref, 7));
    const result = formatPresetHint({ start, end: ref, isLive: true }, true);
    expect(result).toContain("now");
    expect(result).toContain("Mar");
  });

  test("formats fixed range without now", () => {
    const yesterday = subDays(ref, 1);
    const start = startOfDay(yesterday);
    const end = endOfDay(yesterday);
    const result = formatPresetHint({ start, end, isLive: false }, true);
    expect(result).not.toContain("now");
  });

  test("uses 12h format when specified", () => {
    const start = subHours(ref, 3);
    const result = formatPresetHint({ start, end: ref, isLive: true }, false);
    expect(result).toMatch(/AM|PM/);
  });
});

describe("parseTimeRange", () => {
  describe("shortcut parsing", () => {
    const ref = createReferenceDate();

    test("parses minute shortcuts (15m)", () => {
      const result = parseTimeRange("15m", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(subMinutes(ref, 15).getTime());
      expect(result?.end.getTime()).toBe(ref.getTime());
      expect(result?.isLive).toBe(true);
    });

    test("parses minute shortcuts (30m)", () => {
      const result = parseTimeRange("30m", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(subMinutes(ref, 30).getTime());
      expect(result?.isLive).toBe(true);
      expect(result?.liveRange).toEqual({
        mode: "relative",
        duration: { value: 30, unit: "minute" },
      });
    });

    test("parses hour shortcuts (1h)", () => {
      const result = parseTimeRange("1h", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(subHours(ref, 1).getTime());
      expect(result?.isLive).toBe(true);
    });

    test("parses hour shortcuts (3h)", () => {
      const result = parseTimeRange("3h", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(subHours(ref, 3).getTime());
      expect(result?.isLive).toBe(true);
      expect(result?.liveRange).toEqual({
        mode: "relative",
        duration: { value: 3, unit: "hour" },
      });
    });

    test("parses hour shortcuts (24h)", () => {
      const result = parseTimeRange("24h", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(subHours(ref, 24).getTime());
    });

    test("parses day shortcuts (7d)", () => {
      const result = parseTimeRange("7d", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(startOfDay(subDays(ref, 7)).getTime());
      expect(result?.isLive).toBe(true);
    });

    test("parses week shortcuts (2w)", () => {
      const result = parseTimeRange("2w", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(startOfDay(subWeeks(ref, 2)).getTime());
    });

    test("parses month shortcuts (1mo)", () => {
      const result = parseTimeRange("1mo", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(startOfDay(subMonths(ref, 1)).getTime());
    });

    test("is case insensitive", () => {
      const resultLower = parseTimeRange("3h", ref);
      const resultUpper = parseTimeRange("3H", ref);
      expect(resultLower?.start.getTime()).toBe(resultUpper?.start.getTime());
    });
  });

  describe("now keyword", () => {
    const ref = createReferenceDate();

    test("parses 'now' as current time", () => {
      const result = parseTimeRange("now", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getTime()).toBe(ref.getTime());
      expect(result?.end.getTime()).toBe(ref.getTime());
      expect(result?.isLive).toBe(true);
    });
  });

  describe("ranges with now", () => {
    const ref = createReferenceDate();

    test("parses time range ending with now", () => {
      const result = parseTimeRange("9am - now", ref);
      expect(result).not.toBeNull();
      expect(result?.isLive).toBe(true);
      expect(result?.end.getTime()).toBe(ref.getTime());
    });

    test("parses date range ending with now", () => {
      const result = parseTimeRange("Mar 1 - now", ref);
      expect(result).not.toBeNull();
      expect(result?.isLive).toBe(true);
      expect(result?.end.getTime()).toBe(ref.getTime());
    });
  });

  describe("preset matching", () => {
    const ref = createReferenceDate();

    test("parses 'today'", () => {
      const result = parseTimeRange("today", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Today");
      expect(result?.isLive).toBe(true);
      expect(result?.liveRange).toEqual({ mode: "calendarStart", unit: "day" });
    });

    test("parses 'yesterday'", () => {
      const result = parseTimeRange("yesterday", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Yesterday");
      expect(result?.isLive).toBe(false);
    });

    test("parses 'past 1 hour' (case insensitive)", () => {
      const result = parseTimeRange("PAST 1 HOUR", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 1 hour");
    });

    test("parses 'past 3 hours'", () => {
      const result = parseTimeRange("past 3 hours", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 3 hours");
      expect(result?.isLive).toBe(true);
    });

    test("parses 'past 3 days'", () => {
      const result = parseTimeRange("past 3 days", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 3 days");
    });

    test("parses 'this month'", () => {
      const result = parseTimeRange("this month", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("This month");
      expect(result?.isLive).toBe(true);
    });

    test("parses 'last month'", () => {
      const result = parseTimeRange("last month", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Last month");
      expect(result?.isLive).toBe(false);
    });

    test("parses 'this week'", () => {
      const result = parseTimeRange("this week", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("This week");
      expect(result?.start.getTime()).toBe(startOfWeek(ref, { weekStartsOn: 1 }).getTime());
    });

    test("parses 'last week'", () => {
      const result = parseTimeRange("last week", ref);
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Last week");
      const lastWeek = subWeeks(ref, 1);
      expect(result?.start.getTime()).toBe(startOfWeek(lastWeek, { weekStartsOn: 1 }).getTime());
      expect(result?.end.getTime()).toBe(endOfWeek(lastWeek, { weekStartsOn: 1 }).getTime());
    });
  });

  describe("time range parsing", () => {
    test("parses 24-hour time range '14:00 - 14:30'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("14:00 - 14:30", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getHours()).toBe(14);
      expect(result?.start.getMinutes()).toBe(0);
      expect(result?.end.getHours()).toBe(14);
      expect(result?.end.getMinutes()).toBe(30);
      expect(result?.isLive).toBe(false);
    });

    test("parses time range with different separators '14:00 to 16:00'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("14:00 to 16:00", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getHours()).toBe(14);
      expect(result?.end.getHours()).toBe(16);
    });

    test("parses 12-hour time range '2pm - 4pm'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("2pm - 4pm", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getHours()).toBe(14);
      expect(result?.end.getHours()).toBe(16);
    });

    test("parses time range with am/pm '9am - 5pm'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("9am - 5pm", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getHours()).toBe(9);
      expect(result?.end.getHours()).toBe(17);
    });

    test("handles time range spanning midnight", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("23:00 - 02:00", ref);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.end.getTime()).toBeGreaterThan(result.start.getTime());
      }
    });
  });

  describe("date range parsing", () => {
    test("parses 'Mar 3 - Mar 13'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("Mar 3 - Mar 13", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getMonth()).toBe(2); // March
      expect(result?.start.getDate()).toBe(3);
      expect(result?.end.getMonth()).toBe(2);
      expect(result?.end.getDate()).toBe(13);
      expect(result?.isLive).toBe(false);
    });

    test("parses 'March 1 to March 15'", () => {
      const ref = new Date("2024-03-20T12:00:00");
      const result = parseTimeRange("March 1 to March 15", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getMonth()).toBe(2);
      expect(result?.start.getDate()).toBe(1);
      expect(result?.end.getMonth()).toBe(2);
      expect(result?.end.getDate()).toBe(15);
    });

    test("parses 'Jan 1 - Feb 28'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("Jan 1 - Feb 28", ref);
      expect(result).not.toBeNull();
      expect(result?.start.getMonth()).toBe(0); // January
      expect(result?.start.getDate()).toBe(1);
      expect(result?.end.getMonth()).toBe(1); // February
      expect(result?.end.getDate()).toBe(28);
    });

    test("parses date range with year 'Dec 25, 2023 - Jan 5, 2024'", () => {
      const result = parseTimeRange("Dec 25, 2023 - Jan 5, 2024");
      expect(result).not.toBeNull();
      expect(result?.start.getFullYear()).toBe(2023);
      expect(result?.start.getMonth()).toBe(11); // December
      expect(result?.end.getFullYear()).toBe(2024);
      expect(result?.end.getMonth()).toBe(0); // January
    });

    test("uses start of day for start date", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("Mar 1 - Mar 5", ref);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.start.getHours()).toBe(0);
        expect(result.start.getMinutes()).toBe(0);
      }
    });

    test("uses end of day for end date", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("Mar 1 - Mar 5", ref);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.end.getHours()).toBe(23);
        expect(result.end.getMinutes()).toBe(59);
      }
    });
  });

  describe("natural language parsing", () => {
    test("parses 'last friday'", () => {
      const ref = new Date("2024-03-15T12:00:00"); // Friday
      const result = parseTimeRange("last friday", ref);
      expect(result).not.toBeNull();
      expect(result?.start).toBeDefined();
    });

    test("parses 'next monday'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("next monday", ref);
      expect(result).not.toBeNull();
    });

    test("parses '2 weeks ago'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("2 weeks ago", ref);
      expect(result).not.toBeNull();
      expect(result?.isLive).toBe(true);
    });

    test("parses 'last friday to today'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("last friday to today", ref);
      expect(result).not.toBeNull();
    });

    test("parses 'past 2 weeks'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("past 2 weeks", ref);
      expect(result).not.toBeNull();
      expect(result?.isLive).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("returns null for empty string", () => {
      const result = parseTimeRange("");
      expect(result).toBeNull();
    });

    test("returns null for whitespace only", () => {
      const result = parseTimeRange("   ");
      expect(result).toBeNull();
    });

    test("returns null for gibberish", () => {
      const result = parseTimeRange("asdfghjkl");
      expect(result).toBeNull();
    });

    test("handles extra whitespace", () => {
      const result = parseTimeRange("  past 1 hour  ");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 1 hour");
    });

    test("handles mixed case", () => {
      const result = parseTimeRange("PaSt 3 DaYs");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 3 days");
    });
  });

  describe("range validation", () => {
    test("returns valid date objects", () => {
      const result = parseTimeRange("past 1 hour");
      expect(result).not.toBeNull();
      expect(result?.start instanceof Date).toBe(true);
      expect(result?.end instanceof Date).toBe(true);
      expect(isNaN(result?.start.getTime() ?? NaN)).toBe(false);
      expect(isNaN(result?.end.getTime() ?? NaN)).toBe(false);
    });

    test("start is before or equal to end", () => {
      const testCases = [
        "past 1 hour",
        "today",
        "yesterday",
        "this month",
        "Mar 3 - Mar 13",
        "14:00 - 16:00",
        "3h",
        "30m",
        "7d",
      ];

      testCases.forEach((input) => {
        const result = parseTimeRange(input);
        if (result) {
          expect(result.start.getTime()).toBeLessThanOrEqual(result.end.getTime());
        }
      });
    });
  });
});

describe("getFilteredPresets", () => {
  test("returns all presets for empty input", () => {
    const presets = getFilteredPresets("");
    const allPresets = getPresets();
    expect(presets.length).toBe(allPresets.length);
  });

  test("filters presets by label", () => {
    const presets = getFilteredPresets("hour");
    expect(presets.length).toBeGreaterThan(0);
    presets.forEach((preset) => {
      expect(preset.label.toLowerCase()).toContain("hour");
    });
  });

  test("filters presets by shortcut", () => {
    const presets = getFilteredPresets("3h");
    expect(presets.length).toBeGreaterThan(0);
    expect(presets.some((p) => p.shortcut === "3h")).toBe(true);
  });

  test("filters presets by value", () => {
    const presets = getFilteredPresets("day");
    expect(presets.length).toBeGreaterThan(0);
  });

  test("returns empty array for no matches", () => {
    const presets = getFilteredPresets("zzzznotexist");
    expect(presets.length).toBe(0);
  });

  test("is case insensitive", () => {
    const lowercasePresets = getFilteredPresets("hour");
    const uppercasePresets = getFilteredPresets("HOUR");
    expect(lowercasePresets.length).toBe(uppercasePresets.length);
  });
});

describe("getPresets", () => {
  test("returns array of presets", () => {
    const presets = getPresets();
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.length).toBeGreaterThan(0);
  });

  test("each preset has required properties", () => {
    const presets = getPresets();
    presets.forEach((preset) => {
      expect(preset).toHaveProperty("label");
      expect(preset).toHaveProperty("value");
      expect(preset).toHaveProperty("getRange");
      expect(preset).toHaveProperty("getHint");
      expect(typeof preset.label).toBe("string");
      expect(typeof preset.value).toBe("string");
      expect(typeof preset.getRange).toBe("function");
      expect(typeof preset.getHint).toBe("function");
    });
  });

  test("each preset getRange returns valid TimeRange with isLive", () => {
    const presets = getPresets();
    presets.forEach((preset) => {
      const range = preset.getRange();
      expect(range).toHaveProperty("start");
      expect(range).toHaveProperty("end");
      expect(range).toHaveProperty("isLive");
      expect(range.start instanceof Date).toBe(true);
      expect(range.end instanceof Date).toBe(true);
      expect(typeof range.isLive).toBe("boolean");
      expect(range.start.getTime()).toBeLessThanOrEqual(range.end.getTime());
    });
  });

  test("each preset getHint returns a string", () => {
    const presets = getPresets();
    presets.forEach((preset) => {
      const hint24h = preset.getHint(true);
      const hint12h = preset.getHint(false);
      expect(typeof hint24h).toBe("string");
      expect(typeof hint12h).toBe("string");
    });
  });

  test("includes expected presets", () => {
    const presets = getPresets();
    const labels = presets.map((p) => p.label);

    expect(labels).toContain("Past 1 hour");
    expect(labels).toContain("Past 3 hours");
    expect(labels).toContain("Today");
    expect(labels).toContain("Yesterday");
    expect(labels).toContain("Past 3 days");
    expect(labels).toContain("This month");
    expect(labels).toContain("Last month");
    expect(labels).toContain("Past 15 minutes");
    expect(labels).toContain("Past 30 minutes");
  });

  test("presets with shortcuts have correct shortcut values", () => {
    const presets = getPresets();
    const withShortcuts = presets.filter((p) => p.shortcut);

    expect(withShortcuts.some((p) => p.shortcut === "15m")).toBe(true);
    expect(withShortcuts.some((p) => p.shortcut === "30m")).toBe(true);
    expect(withShortcuts.some((p) => p.shortcut === "1h")).toBe(true);
    expect(withShortcuts.some((p) => p.shortcut === "3h")).toBe(true);
    expect(withShortcuts.some((p) => p.shortcut === "7d")).toBe(true);
    expect(withShortcuts.some((p) => p.shortcut === "30d")).toBe(true);
  });
});

// Integration tests
describe("integration tests", () => {
  test("workflow: select preset, get valid ISO timestamps", () => {
    const presets = getPresets();
    const todayPreset = presets.find((p) => p.label === "Today");
    expect(todayPreset).toBeDefined();

    const range = todayPreset!.getRange();
    const startISO = range.start.toISOString();
    const endISO = range.end.toISOString();

    expect(startISO).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    expect(endISO).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    expect(range.isLive).toBe(true);
  });

  test("workflow: parse custom range, format duration", () => {
    const range = parseTimeRange("Mar 1 - Mar 15");
    expect(range).not.toBeNull();

    const duration = formatDuration(range!.start, range!.end);
    expect(duration).toBe("2w");
  });

  test("workflow: parse time range, get formatted display", () => {
    const ref = new Date("2024-03-15T12:00:00");
    const range = parseTimeRange("14:00 - 16:00", ref);
    expect(range).not.toBeNull();

    const display = formatRangeDisplay(range!, true);
    expect(display).toContain("14:00");
    expect(display).toContain("16:00");
  });

  test("workflow: parse shortcut, verify duration", () => {
    const ref = new Date("2024-03-15T14:30:00");
    const range = parseTimeRange("3h", ref);
    expect(range).not.toBeNull();

    const duration = formatDuration(range!.start, range!.end);
    expect(duration).toBe("3h");
    expect(range!.isLive).toBe(true);
  });

  test("workflow: parse 'now' range", () => {
    const ref = new Date("2024-03-15T14:30:00");
    const range = parseTimeRange("9am - now", ref);
    expect(range).not.toBeNull();
    expect(range!.isLive).toBe(true);
    expect(range!.end.getTime()).toBe(ref.getTime());
  });

  test("workflow: preset hints show correct format", () => {
    const presets = getPresets();
    const past3Hours = presets.find((p) => p.label === "Past 3 hours");
    expect(past3Hours).toBeDefined();

    const hint24h = past3Hours!.getHint(true);
    const hint12h = past3Hours!.getHint(false);

    expect(hint24h).toContain("now");
    expect(hint24h).toMatch(/\d{2}:\d{2}/);
    expect(hint12h).toContain("now");
    expect(hint12h).toMatch(/AM|PM/);
  });
});
