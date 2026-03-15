// Time Range Parser Tests - JavaScript Version
// This script tests the time range parsing functionality

import * as chrono from 'chrono-node';
import { formatDistanceStrict, differenceInMinutes, differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths, startOfDay, endOfDay, startOfMonth, endOfMonth, subHours, subDays, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

// ============================================
// TIME RANGE PARSER IMPLEMENTATION
// ============================================

const TIME_PRESETS = [
  { label: 'Past 1 hour', value: 'past 1 hour' },
  { label: 'Past 3 hours', value: 'past 3 hours' },
  { label: 'Past 6 hours', value: 'past 6 hours' },
  { label: 'Past 12 hours', value: 'past 12 hours' },
  { label: 'Past 24 hours', value: 'past 24 hours' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Past 3 days', value: 'past 3 days' },
  { label: 'Past 7 days', value: 'past 7 days' },
  { label: 'This week', value: 'this week' },
  { label: 'Last week', value: 'last week' },
  { label: 'This month', value: 'this month' },
  { label: 'Last month', value: 'last month' },
  { label: 'Past 3 months', value: 'past 3 months' },
];

function parseTimeRange(input, referenceDate = new Date()) {
  const normalizedInput = input.toLowerCase().trim();
  
  // Handle preset patterns
  const pastHoursMatch = normalizedInput.match(/^past\s+(\d+)\s+hours?$/);
  if (pastHoursMatch) {
    const hours = parseInt(pastHoursMatch[1], 10);
    const end = new Date(referenceDate);
    const start = subHours(end, hours);
    return { start, end, label: `Past ${hours} hour${hours > 1 ? 's' : ''}` };
  }
  
  const pastDaysMatch = normalizedInput.match(/^past\s+(\d+)\s+days?$/);
  if (pastDaysMatch) {
    const days = parseInt(pastDaysMatch[1], 10);
    const end = new Date(referenceDate);
    const start = subDays(end, days);
    return { start, end, label: `Past ${days} day${days > 1 ? 's' : ''}` };
  }
  
  const pastWeeksMatch = normalizedInput.match(/^past\s+(\d+)\s+weeks?$/);
  if (pastWeeksMatch) {
    const weeks = parseInt(pastWeeksMatch[1], 10);
    const end = new Date(referenceDate);
    const start = subWeeks(end, weeks);
    return { start, end, label: `Past ${weeks} week${weeks > 1 ? 's' : ''}` };
  }
  
  const pastMonthsMatch = normalizedInput.match(/^past\s+(\d+)\s+months?$/);
  if (pastMonthsMatch) {
    const months = parseInt(pastMonthsMatch[1], 10);
    const end = new Date(referenceDate);
    const start = subMonths(end, months);
    return { start, end, label: `Past ${months} month${months > 1 ? 's' : ''}` };
  }
  
  // Handle "today"
  if (normalizedInput === 'today') {
    const start = startOfDay(referenceDate);
    const end = endOfDay(referenceDate);
    return { start, end, label: 'Today' };
  }
  
  // Handle "yesterday"
  if (normalizedInput === 'yesterday') {
    const yesterday = subDays(referenceDate, 1);
    const start = startOfDay(yesterday);
    const end = endOfDay(yesterday);
    return { start, end, label: 'Yesterday' };
  }
  
  // Handle "this week"
  if (normalizedInput === 'this week') {
    const start = startOfWeek(referenceDate, { weekStartsOn: 0 });
    const end = endOfWeek(referenceDate, { weekStartsOn: 0 });
    return { start, end, label: 'This week' };
  }
  
  // Handle "last week"
  if (normalizedInput === 'last week') {
    const lastWeek = subWeeks(referenceDate, 1);
    const start = startOfWeek(lastWeek, { weekStartsOn: 0 });
    const end = endOfWeek(lastWeek, { weekStartsOn: 0 });
    return { start, end, label: 'Last week' };
  }
  
  // Handle "this month"
  if (normalizedInput === 'this month') {
    const start = startOfMonth(referenceDate);
    const end = endOfMonth(referenceDate);
    return { start, end, label: 'This month' };
  }
  
  // Handle "last month"
  if (normalizedInput === 'last month') {
    const lastMonth = subMonths(referenceDate, 1);
    const start = startOfMonth(lastMonth);
    const end = endOfMonth(lastMonth);
    return { start, end, label: 'Last month' };
  }
  
  // Handle time ranges like "14:00 - 14:30" or "2pm - 3pm"
  const timeRangeMatch = normalizedInput.match(/^(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)\s*[-–to]+\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)$/i);
  if (timeRangeMatch) {
    const startTimeStr = timeRangeMatch[1];
    const endTimeStr = timeRangeMatch[2];
    
    const startParsed = chrono.parseDate(startTimeStr, referenceDate);
    const endParsed = chrono.parseDate(endTimeStr, referenceDate);
    
    if (startParsed && endParsed) {
      return { start: startParsed, end: endParsed, label: input };
    }
  }
  
  // Handle date ranges like "Mar 3 - Mar 13" or "March 3rd to March 13th"
  const dateRangePatterns = [
    /^(.+?)\s*[-–]\s*(.+)$/,
    /^(.+?)\s+to\s+(.+)$/i,
    /^from\s+(.+?)\s+to\s+(.+)$/i,
  ];
  
  for (const pattern of dateRangePatterns) {
    const match = normalizedInput.match(pattern);
    if (match) {
      const startStr = match[1].trim();
      const endStr = match[2].trim();
      
      // Skip if this looks like a time range (already handled above)
      if (/^\d{1,2}(:\d{2})?\s*(am|pm)?$/i.test(startStr)) {
        continue;
      }
      
      const startParsed = chrono.parseDate(startStr, referenceDate);
      const endParsed = chrono.parseDate(endStr, referenceDate);
      
      if (startParsed && endParsed) {
        // If no time specified, use start of day for start date and end of day for end date
        const start = startOfDay(startParsed);
        const end = endOfDay(endParsed);
        return { start, end, label: input };
      }
    }
  }
  
  // Fall back to chrono for natural language parsing
  const parsed = chrono.parse(input, referenceDate);
  
  if (parsed.length > 0) {
    const result = parsed[0];
    
    if (result.start && result.end) {
      return {
        start: result.start.date(),
        end: result.end.date(),
        label: input,
      };
    }
    
    if (result.start) {
      const start = result.start.date();
      // For single date, assume it's a day range
      return {
        start: startOfDay(start),
        end: endOfDay(start),
        label: input,
      };
    }
  }
  
  return null;
}

function formatDuration(start, end) {
  const minutes = differenceInMinutes(end, start);
  const hours = differenceInHours(end, start);
  const days = differenceInDays(end, start);
  const weeks = differenceInWeeks(end, start);
  const months = differenceInMonths(end, start);
  
  if (months >= 1) {
    const remainingDays = days - (months * 30);
    if (remainingDays > 0) {
      return `${months}mo ${remainingDays}d`;
    }
    return `${months}mo`;
  }
  
  if (weeks >= 1) {
    const remainingDays = days - (weeks * 7);
    if (remainingDays > 0) {
      return `${weeks}w ${remainingDays}d`;
    }
    return `${weeks}w`;
  }
  
  if (days >= 1) {
    const remainingHours = hours - (days * 24);
    if (remainingHours > 0 && days < 7) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d`;
  }
  
  if (hours >= 1) {
    const remainingMinutes = minutes - (hours * 60);
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h`;
  }
  
  return `${minutes}m`;
}

function filterPresets(query) {
  if (!query) return TIME_PRESETS;
  const lowerQuery = query.toLowerCase();
  return TIME_PRESETS.filter(preset =>
    preset.label.toLowerCase().includes(lowerQuery) ||
    preset.value.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// TEST FRAMEWORK
// ============================================

let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failedTests++;
    failures.push({ name, error: error.message });
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (!(actual <= expected)) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toContain(expected) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined but got undefined`);
      }
    },
    not: {
      toBeNull() {
        if (actual === null) {
          throw new Error(`Expected value not to be null`);
        }
      },
      toBe(expected) {
        if (actual === expected) {
          throw new Error(`Expected value not to be ${expected}`);
        }
      }
    }
  };
}

// ============================================
// TESTS
// ============================================

console.log('========================================');
console.log('TIME RANGE PARSER TESTS');
console.log('========================================');

// Use a fixed reference date for consistent tests
const referenceDate = new Date('2024-03-15T12:00:00.000Z');

describe('parseTimeRange - Preset patterns', () => {
  test('parses "past 1 hour" correctly', () => {
    const result = parseTimeRange('past 1 hour', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Past 1 hour');
    expect(differenceInHours(result.end, result.start)).toBe(1);
  });

  test('parses "past 3 hours" correctly', () => {
    const result = parseTimeRange('past 3 hours', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Past 3 hours');
    expect(differenceInHours(result.end, result.start)).toBe(3);
  });

  test('parses "past 6 hours" correctly', () => {
    const result = parseTimeRange('past 6 hours', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInHours(result.end, result.start)).toBe(6);
  });

  test('parses "past 12 hours" correctly', () => {
    const result = parseTimeRange('past 12 hours', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInHours(result.end, result.start)).toBe(12);
  });

  test('parses "past 24 hours" correctly', () => {
    const result = parseTimeRange('past 24 hours', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInHours(result.end, result.start)).toBe(24);
  });

  test('parses "past 3 days" correctly', () => {
    const result = parseTimeRange('past 3 days', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Past 3 days');
    expect(differenceInDays(result.end, result.start)).toBe(3);
  });

  test('parses "past 7 days" correctly', () => {
    const result = parseTimeRange('past 7 days', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInDays(result.end, result.start)).toBe(7);
  });

  test('parses "past 1 week" correctly', () => {
    const result = parseTimeRange('past 1 week', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInWeeks(result.end, result.start)).toBe(1);
  });

  test('parses "past 2 weeks" correctly', () => {
    const result = parseTimeRange('past 2 weeks', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInWeeks(result.end, result.start)).toBe(2);
  });

  test('parses "past 1 month" correctly', () => {
    const result = parseTimeRange('past 1 month', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInMonths(result.end, result.start)).toBe(1);
  });

  test('parses "past 3 months" correctly', () => {
    const result = parseTimeRange('past 3 months', referenceDate);
    expect(result).not.toBeNull();
    expect(differenceInMonths(result.end, result.start)).toBe(3);
  });
});

describe('parseTimeRange - Named periods', () => {
  test('parses "today" correctly', () => {
    const result = parseTimeRange('today', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Today');
    expect(result.start.getDate()).toBe(referenceDate.getDate());
    expect(result.start.getHours()).toBe(0);
    expect(result.start.getMinutes()).toBe(0);
    expect(result.end.getHours()).toBe(23);
    expect(result.end.getMinutes()).toBe(59);
  });

  test('parses "yesterday" correctly', () => {
    const result = parseTimeRange('yesterday', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Yesterday');
    expect(result.start.getDate()).toBe(referenceDate.getDate() - 1);
  });

  test('parses "this week" correctly', () => {
    const result = parseTimeRange('this week', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('This week');
    expect(result.start.getDay()).toBe(0); // Sunday
  });

  test('parses "last week" correctly', () => {
    const result = parseTimeRange('last week', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Last week');
  });

  test('parses "this month" correctly', () => {
    const result = parseTimeRange('this month', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('This month');
    expect(result.start.getDate()).toBe(1);
  });

  test('parses "last month" correctly', () => {
    const result = parseTimeRange('last month', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Last month');
    expect(result.start.getMonth()).toBe(referenceDate.getMonth() - 1);
  });
});

describe('parseTimeRange - Date ranges', () => {
  test('parses "Mar 3 - Mar 13" correctly', () => {
    const result = parseTimeRange('Mar 3 - Mar 13', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getMonth()).toBe(2); // March
    expect(result.start.getDate()).toBe(3);
    expect(result.end.getMonth()).toBe(2);
    expect(result.end.getDate()).toBe(13);
  });

  test('parses "March 3 - March 13" correctly', () => {
    const result = parseTimeRange('March 3 - March 13', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getMonth()).toBe(2);
    expect(result.start.getDate()).toBe(3);
  });

  test('parses "Jan 1 - Jan 31" correctly', () => {
    const result = parseTimeRange('Jan 1 - Jan 31', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getMonth()).toBe(0);
    expect(result.start.getDate()).toBe(1);
    expect(result.end.getDate()).toBe(31);
  });

  test('parses "February 14 to February 21" correctly', () => {
    const result = parseTimeRange('February 14 to February 21', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getMonth()).toBe(1);
    expect(result.start.getDate()).toBe(14);
  });

  test('parses date range with ordinals "March 3rd - March 13th"', () => {
    const result = parseTimeRange('March 3rd - March 13th', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getDate()).toBe(3);
    expect(result.end.getDate()).toBe(13);
  });
});

describe('parseTimeRange - Time ranges', () => {
  test('parses "14:00 - 14:30" correctly', () => {
    const result = parseTimeRange('14:00 - 14:30', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getHours()).toBe(14);
    expect(result.start.getMinutes()).toBe(0);
    expect(result.end.getHours()).toBe(14);
    expect(result.end.getMinutes()).toBe(30);
  });

  test('parses "9:00 - 17:00" correctly', () => {
    const result = parseTimeRange('9:00 - 17:00', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getHours()).toBe(9);
    expect(result.end.getHours()).toBe(17);
  });

  test('parses "2pm - 3pm" correctly', () => {
    const result = parseTimeRange('2pm - 3pm', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getHours()).toBe(14);
    expect(result.end.getHours()).toBe(15);
  });

  test('parses "10:30 - 11:45" correctly', () => {
    const result = parseTimeRange('10:30 - 11:45', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getHours()).toBe(10);
    expect(result.start.getMinutes()).toBe(30);
    expect(result.end.getHours()).toBe(11);
    expect(result.end.getMinutes()).toBe(45);
  });
});

describe('parseTimeRange - Natural language (chrono-node)', () => {
  test('parses "next week" correctly', () => {
    const result = parseTimeRange('next week', referenceDate);
    expect(result).not.toBeNull();
  });

  test('parses "2 days ago" correctly', () => {
    const result = parseTimeRange('2 days ago', referenceDate);
    expect(result).not.toBeNull();
  });

  test('parses "last Friday" correctly', () => {
    const result = parseTimeRange('last Friday', referenceDate);
    expect(result).not.toBeNull();
    expect(result.start.getDay()).toBe(5); // Friday
  });
});

describe('parseTimeRange - Edge cases', () => {
  test('handles case insensitivity', () => {
    const result1 = parseTimeRange('TODAY', referenceDate);
    const result2 = parseTimeRange('Today', referenceDate);
    const result3 = parseTimeRange('today', referenceDate);
    
    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    expect(result3).not.toBeNull();
    expect(result1.label).toBe('Today');
    expect(result2.label).toBe('Today');
    expect(result3.label).toBe('Today');
  });

  test('handles extra whitespace', () => {
    const result = parseTimeRange('  past 3 hours  ', referenceDate);
    expect(result).not.toBeNull();
    expect(result.label).toBe('Past 3 hours');
  });

  test('returns null for invalid input', () => {
    const result = parseTimeRange('not a valid date', referenceDate);
    expect(result).toBeNull();
  });

  test('returns null for empty string', () => {
    const result = parseTimeRange('', referenceDate);
    expect(result).toBeNull();
  });

  test('handles singular vs plural (1 day vs 3 days)', () => {
    const result1 = parseTimeRange('past 1 day', referenceDate);
    const result3 = parseTimeRange('past 3 days', referenceDate);
    
    expect(result1).not.toBeNull();
    expect(result3).not.toBeNull();
    expect(differenceInDays(result1.end, result1.start)).toBe(1);
    expect(differenceInDays(result3.end, result3.start)).toBe(3);
  });
});

describe('formatDuration', () => {
  test('formats minutes correctly', () => {
    const start = new Date('2024-03-15T12:00:00Z');
    const end = new Date('2024-03-15T12:30:00Z');
    expect(formatDuration(start, end)).toBe('30m');
  });

  test('formats hours and minutes correctly', () => {
    const start = new Date('2024-03-15T12:00:00Z');
    const end = new Date('2024-03-15T14:30:00Z');
    expect(formatDuration(start, end)).toBe('2h 30m');
  });

  test('formats hours correctly', () => {
    const start = new Date('2024-03-15T12:00:00Z');
    const end = new Date('2024-03-15T15:00:00Z');
    expect(formatDuration(start, end)).toBe('3h');
  });

  test('formats days correctly', () => {
    const start = new Date('2024-03-15T00:00:00Z');
    const end = new Date('2024-03-18T00:00:00Z');
    expect(formatDuration(start, end)).toBe('3d');
  });

  test('formats days and hours correctly', () => {
    const start = new Date('2024-03-15T00:00:00Z');
    const end = new Date('2024-03-17T06:00:00Z');
    expect(formatDuration(start, end)).toBe('2d 6h');
  });

  test('formats weeks correctly', () => {
    const start = new Date('2024-03-01T00:00:00Z');
    const end = new Date('2024-03-15T00:00:00Z');
    expect(formatDuration(start, end)).toBe('2w');
  });

  test('formats weeks and days correctly', () => {
    const start = new Date('2024-03-01T00:00:00Z');
    const end = new Date('2024-03-12T00:00:00Z');
    expect(formatDuration(start, end)).toBe('1w 4d');
  });

  test('formats months correctly', () => {
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-03-01T00:00:00Z');
    expect(formatDuration(start, end)).toBe('2mo');
  });
});

describe('filterPresets', () => {
  test('returns all presets when query is empty', () => {
    const result = filterPresets('');
    expect(result.length).toBe(TIME_PRESETS.length);
  });

  test('filters presets by label', () => {
    const result = filterPresets('hour');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(preset => {
      expect(preset.label.toLowerCase()).toContain('hour');
    });
  });

  test('filters presets by value', () => {
    const result = filterPresets('past');
    expect(result.length).toBeGreaterThan(0);
  });

  test('is case insensitive', () => {
    const result1 = filterPresets('TODAY');
    const result2 = filterPresets('today');
    expect(result1.length).toBe(result2.length);
  });

  test('returns empty array for non-matching query', () => {
    const result = filterPresets('xyznonexistent');
    expect(result.length).toBe(0);
  });
});

// ============================================
// SUMMARY
// ============================================

console.log('\n========================================');
console.log('TEST SUMMARY');
console.log('========================================');
console.log(`Total: ${passedTests + failedTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(({ name, error }) => {
    console.log(`  - ${name}: ${error}`);
  });
}

console.log('\n========================================');
if (failedTests === 0) {
  console.log('All tests passed!');
} else {
  console.log(`${failedTests} test(s) failed.`);
  process.exit(1);
}
