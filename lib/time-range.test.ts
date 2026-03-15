import {
  parseTimeRange,
  formatDuration,
  formatRangeDisplay,
  getFilteredPresets,
  getPresets,
  TimeRange,
} from "./time-range";
import {
  startOfDay,
  endOfDay,
  subHours,
  subDays,
  subMonths,
  addHours,
  addMinutes,
  setHours,
  setMinutes,
  format,
} from "date-fns";

// Test utility to create a fixed reference date
const createReferenceDate = () => new Date("2024-03-15T14:30:00.000Z");

describe("formatDuration", () => {
  test("formats duration less than 1 minute", () => {
    const start = new Date("2024-03-15T14:30:00");
    const end = new Date("2024-03-15T14:30:30");
    expect(formatDuration(start, end)).toBe("< 1 minute");
  });

  test("formats duration in minutes (singular)", () => {
    const start = new Date("2024-03-15T14:30:00");
    const end = new Date("2024-03-15T14:31:00");
    expect(formatDuration(start, end)).toBe("1 minute");
  });

  test("formats duration in minutes (plural)", () => {
    const start = new Date("2024-03-15T14:00:00");
    const end = new Date("2024-03-15T14:45:00");
    expect(formatDuration(start, end)).toBe("45 minutes");
  });

  test("formats duration in hours (exact)", () => {
    const start = new Date("2024-03-15T12:00:00");
    const end = new Date("2024-03-15T15:00:00");
    expect(formatDuration(start, end)).toBe("3 hours");
  });

  test("formats duration in hours (singular)", () => {
    const start = new Date("2024-03-15T12:00:00");
    const end = new Date("2024-03-15T13:00:00");
    expect(formatDuration(start, end)).toBe("1 hour");
  });

  test("formats duration in hours and minutes", () => {
    const start = new Date("2024-03-15T12:00:00");
    const end = new Date("2024-03-15T14:30:00");
    expect(formatDuration(start, end)).toBe("2h 30m");
  });

  test("formats duration in days (exact)", () => {
    const start = new Date("2024-03-10T12:00:00");
    const end = new Date("2024-03-13T12:00:00");
    expect(formatDuration(start, end)).toBe("3 days");
  });

  test("formats duration in days (singular)", () => {
    const start = new Date("2024-03-14T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("1 day");
  });

  test("formats duration in days and hours", () => {
    const start = new Date("2024-03-10T12:00:00");
    const end = new Date("2024-03-13T18:00:00");
    expect(formatDuration(start, end)).toBe("3d 6h");
  });

  test("formats duration in weeks (exact)", () => {
    const start = new Date("2024-03-01T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("2 weeks");
  });

  test("formats duration in weeks (singular)", () => {
    const start = new Date("2024-03-08T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("1 week");
  });

  test("formats duration in weeks and days", () => {
    const start = new Date("2024-03-01T12:00:00");
    const end = new Date("2024-03-12T12:00:00");
    expect(formatDuration(start, end)).toBe("1w 4d");
  });

  test("formats duration in months (exact)", () => {
    const start = new Date("2024-01-15T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("2 months");
  });

  test("formats duration in months (singular)", () => {
    const start = new Date("2024-02-15T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("1 month");
  });

  test("formats duration in months and days", () => {
    const start = new Date("2024-01-01T12:00:00");
    const end = new Date("2024-03-15T12:00:00");
    expect(formatDuration(start, end)).toBe("2mo 13d");
  });
});

describe("formatRangeDisplay", () => {
  test("formats same day range with times", () => {
    const today = new Date();
    const start = setMinutes(setHours(today, 14), 0);
    const end = setMinutes(setHours(today, 16), 30);
    const result = formatRangeDisplay({ start, end });
    expect(result).toContain("14:00 - 16:30");
  });

  test("formats different day range in same year", () => {
    const start = new Date("2024-03-03T00:00:00");
    const end = new Date("2024-03-13T23:59:59");
    const result = formatRangeDisplay({ start, end });
    expect(result).toBe("Mar 3 - Mar 13");
  });

  test("formats range spanning years", () => {
    const start = new Date("2023-12-25T00:00:00");
    const end = new Date("2024-01-05T23:59:59");
    const result = formatRangeDisplay({ start, end });
    expect(result).toBe("Dec 25, 2023 - Jan 5, 2024");
  });
});

describe("parseTimeRange", () => {
  describe("preset matching", () => {
    test("parses 'today'", () => {
      const result = parseTimeRange("today");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Today");
    });

    test("parses 'yesterday'", () => {
      const result = parseTimeRange("yesterday");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Yesterday");
    });

    test("parses 'past 1 hour' (case insensitive)", () => {
      const result = parseTimeRange("PAST 1 HOUR");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 1 hour");
    });

    test("parses 'past 3 hours'", () => {
      const result = parseTimeRange("past 3 hours");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 3 hours");
    });

    test("parses 'past 3 days'", () => {
      const result = parseTimeRange("past 3 days");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Past 3 days");
    });

    test("parses 'this month'", () => {
      const result = parseTimeRange("this month");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("This month");
    });

    test("parses 'last month'", () => {
      const result = parseTimeRange("last month");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Last month");
    });

    test("parses 'this week'", () => {
      const result = parseTimeRange("this week");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("This week");
    });

    test("parses 'last week'", () => {
      const result = parseTimeRange("last week");
      expect(result).not.toBeNull();
      expect(result?.label).toBe("Last week");
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
    });

    test("parses 'last friday to today'", () => {
      const ref = new Date("2024-03-15T12:00:00");
      const result = parseTimeRange("last friday to today", ref);
      expect(result).not.toBeNull();
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
      ];

      testCases.forEach((input) => {
        const result = parseTimeRange(input);
        if (result) {
          expect(result.start.getTime()).toBeLessThanOrEqual(
            result.end.getTime()
          );
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
      expect(typeof preset.label).toBe("string");
      expect(typeof preset.value).toBe("string");
      expect(typeof preset.getRange).toBe("function");
    });
  });

  test("each preset getRange returns valid TimeRange", () => {
    const presets = getPresets();
    presets.forEach((preset) => {
      const range = preset.getRange();
      expect(range).toHaveProperty("start");
      expect(range).toHaveProperty("end");
      expect(range.start instanceof Date).toBe(true);
      expect(range.end instanceof Date).toBe(true);
      expect(range.start.getTime()).toBeLessThanOrEqual(range.end.getTime());
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

    expect(startISO).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    );
    expect(endISO).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    );
  });

  test("workflow: parse custom range, format duration", () => {
    const range = parseTimeRange("Mar 1 - Mar 15");
    expect(range).not.toBeNull();

    const duration = formatDuration(range!.start, range!.end);
    expect(duration).toBe("2 weeks");
  });

  test("workflow: parse time range, get formatted display", () => {
    const ref = new Date("2024-03-15T12:00:00");
    const range = parseTimeRange("14:00 - 16:00", ref);
    expect(range).not.toBeNull();

    const display = formatRangeDisplay(range!);
    expect(display).toContain("14:00 - 16:00");
  });
});
