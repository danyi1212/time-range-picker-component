/**
 * Time Range Parser Tests
 * 
 * This script runs comprehensive tests on the time range parsing functionality.
 * Run with: npx tsx scripts/run-tests.ts
 */

import {
  parseTimeRange,
  formatDuration,
  formatRangeDisplay,
  getFilteredPresets,
  getPresets,
} from "../lib/time-range";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`${GREEN}✓${RESET} ${name}`);
    passed++;
  } catch (error) {
    console.log(`${RED}✗${RESET} ${name}`);
    console.log(`  ${RED}${error}${RESET}`);
    failed++;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
      }
    },
    not: {
      toBeNull() {
        if (actual === null) {
          throw new Error("Expected non-null value");
        }
      },
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${actual}`);
      }
    },
    toContain(expected: string) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
  };
}

console.log(`\n${BOLD}Time Range Parser Tests${RESET}\n`);

// ==========================================
// formatDuration tests
// ==========================================
console.log(`${YELLOW}formatDuration${RESET}`);

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

test("formats duration in weeks and days", () => {
  const start = new Date("2024-03-01T12:00:00");
  const end = new Date("2024-03-12T12:00:00");
  expect(formatDuration(start, end)).toBe("1w 4d");
});

test("formats duration in months", () => {
  const start = new Date("2024-01-15T12:00:00");
  const end = new Date("2024-03-15T12:00:00");
  expect(formatDuration(start, end)).toBe("2 months");
});

// ==========================================
// parseTimeRange - Preset tests
// ==========================================
console.log(`\n${YELLOW}parseTimeRange - Presets${RESET}`);

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

// ==========================================
// parseTimeRange - Time ranges
// ==========================================
console.log(`\n${YELLOW}parseTimeRange - Time Ranges${RESET}`);

test("parses 24-hour time range '14:00 - 14:30'", () => {
  const ref = new Date("2024-03-15T12:00:00");
  const result = parseTimeRange("14:00 - 14:30", ref);
  expect(result).not.toBeNull();
  expect(result?.start.getHours()).toBe(14);
  expect(result?.start.getMinutes()).toBe(0);
  expect(result?.end.getHours()).toBe(14);
  expect(result?.end.getMinutes()).toBe(30);
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

// ==========================================
// parseTimeRange - Date ranges
// ==========================================
console.log(`\n${YELLOW}parseTimeRange - Date Ranges${RESET}`);

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

// ==========================================
// parseTimeRange - Natural language
// ==========================================
console.log(`\n${YELLOW}parseTimeRange - Natural Language${RESET}`);

test("parses 'last friday'", () => {
  const ref = new Date("2024-03-15T12:00:00");
  const result = parseTimeRange("last friday", ref);
  expect(result).not.toBeNull();
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

// ==========================================
// parseTimeRange - Edge cases
// ==========================================
console.log(`\n${YELLOW}parseTimeRange - Edge Cases${RESET}`);

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

// ==========================================
// parseTimeRange - Range validation
// ==========================================
console.log(`\n${YELLOW}parseTimeRange - Range Validation${RESET}`);

test("returns valid date objects", () => {
  const result = parseTimeRange("past 1 hour");
  expect(result).not.toBeNull();
  expect(result?.start instanceof Date).toBeTruthy();
  expect(result?.end instanceof Date).toBeTruthy();
});

test("start is before or equal to end for all valid inputs", () => {
  const testCases = [
    "past 1 hour",
    "today",
    "yesterday",
    "this month",
    "Mar 3 - Mar 13",
  ];

  testCases.forEach((input) => {
    const result = parseTimeRange(input);
    if (result) {
      expect(result.start.getTime()).toBeLessThanOrEqual(result.end.getTime());
    }
  });
});

// ==========================================
// getFilteredPresets tests
// ==========================================
console.log(`\n${YELLOW}getFilteredPresets${RESET}`);

test("returns all presets for empty input", () => {
  const presets = getFilteredPresets("");
  const allPresets = getPresets();
  expect(presets.length).toBe(allPresets.length);
});

test("filters presets by label", () => {
  const presets = getFilteredPresets("hour");
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

// ==========================================
// getPresets tests
// ==========================================
console.log(`\n${YELLOW}getPresets${RESET}`);

test("returns array of presets", () => {
  const presets = getPresets();
  expect(Array.isArray(presets)).toBeTruthy();
  expect(presets.length).toBeGreaterThan(0);
});

test("each preset has required properties", () => {
  const presets = getPresets();
  presets.forEach((preset) => {
    expect(typeof preset.label).toBe("string");
    expect(typeof preset.value).toBe("string");
    expect(typeof preset.getRange).toBe("function");
  });
});

test("each preset getRange returns valid TimeRange", () => {
  const presets = getPresets();
  presets.forEach((preset) => {
    const range = preset.getRange();
    expect(range.start instanceof Date).toBeTruthy();
    expect(range.end instanceof Date).toBeTruthy();
    expect(range.start.getTime()).toBeLessThanOrEqual(range.end.getTime());
  });
});

// ==========================================
// Integration tests
// ==========================================
console.log(`\n${YELLOW}Integration Tests${RESET}`);

test("workflow: select preset, get valid ISO timestamps", () => {
  const presets = getPresets();
  const todayPreset = presets.find((p) => p.label === "Today");
  expect(todayPreset).toBeTruthy();

  const range = todayPreset!.getRange();
  const startISO = range.start.toISOString();
  const endISO = range.end.toISOString();

  expect(startISO.includes("T")).toBeTruthy();
  expect(endISO.includes("T")).toBeTruthy();
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
  expect(display).toContain("14:00");
  expect(display).toContain("16:00");
});

// ==========================================
// Summary
// ==========================================
console.log(`\n${BOLD}─────────────────────────────${RESET}`);
console.log(`${BOLD}Test Results${RESET}`);
console.log(`${BOLD}─────────────────────────────${RESET}`);
console.log(`${GREEN}Passed: ${passed}${RESET}`);
console.log(`${failed > 0 ? RED : GREEN}Failed: ${failed}${RESET}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
