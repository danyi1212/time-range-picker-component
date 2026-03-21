import type { Locale } from "date-fns";
import type {
  ClockFormat,
  TimeRange,
  TimeRangeFormatPatterns,
  TimeRangeLabels,
  TimeRangePreset,
} from "./time-range";

export interface TimeRangePickerProps {
  value?: TimeRange | null;
  onChange?: (range: TimeRange | null) => void;
  placeholder?: string;
  className?: string;
  clockFormat?: ClockFormat;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  labels?: Partial<TimeRangeLabels>;
  formatPatterns?: Partial<TimeRangeFormatPatterns>;
  presets?: TimeRangePreset[];
  includeDefaultPresets?: boolean;
  examples?: string[];
}
