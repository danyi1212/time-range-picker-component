import * as React from "react";
import {
  formatDuration,
  formatInputDisplay,
  getFilteredPresets,
  parseTimeRange,
  pauseTimeRange,
  resolveTimeRange,
  type TimeRange,
} from "./time-range";
import type { TimeRangePickerProps } from "./time-range-picker.types";
import { useLiveReferenceTime } from "./use-live-reference-time";

export function useTimeRangePickerState({
  value,
  onChange,
  clockFormat = "24h",
  locale,
  weekStartsOn,
  labels,
  formatPatterns,
  presets,
  includeDefaultPresets = true,
}: Pick<
  TimeRangePickerProps,
  | "value"
  | "onChange"
  | "clockFormat"
  | "locale"
  | "weekStartsOn"
  | "labels"
  | "formatPatterns"
  | "presets"
  | "includeDefaultPresets"
>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [userHasTyped, setUserHasTyped] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const liveReferenceTime = useLiveReferenceTime(value?.isLive);

  const timeRangeOptions = React.useMemo(
    () => ({
      clockFormat,
      locale,
      weekStartsOn,
      labels,
      formatPatterns,
      presets,
      includeDefaultPresets,
    }),
    [clockFormat, locale, weekStartsOn, labels, formatPatterns, presets, includeDefaultPresets],
  );

  const resolvedValue = React.useMemo(
    () => (value ? resolveTimeRange(value, liveReferenceTime) : null),
    [liveReferenceTime, value],
  );

  const parsedFromInput = React.useMemo(() => {
    if (!inputValue.trim()) {
      return null;
    }

    return parseTimeRange(inputValue, new Date(), timeRangeOptions);
  }, [inputValue, timeRangeOptions]);

  const resolvedParsedFromInput = React.useMemo(
    () => (parsedFromInput ? resolveTimeRange(parsedFromInput, liveReferenceTime) : null),
    [liveReferenceTime, parsedFromInput],
  );

  const filteredPresets = React.useMemo(
    () =>
      getFilteredPresets(userHasTyped ? inputValue : "", timeRangeOptions),
    [inputValue, timeRangeOptions, userHasTyped],
  );

  const resetInput = React.useCallback(() => {
    setInputValue("");
    setUserHasTyped(false);
  }, []);

  const closePicker = React.useCallback(() => {
    setOpen(false);
  }, []);

  const commitSelection = React.useCallback(
    (range: TimeRange | null) => {
      onChange?.(range);
      resetInput();
      closePicker();
    },
    [closePicker, onChange, resetInput],
  );

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      setUserHasTyped(true);
      setOpen(true);
    },
    [],
  );

  const handleSelectParsed = React.useCallback(() => {
    if (parsedFromInput) {
      commitSelection(parsedFromInput);
    }
  }, [commitSelection, parsedFromInput]);

  const handleSelectPreset = React.useCallback(
    (preset: (typeof filteredPresets)[number]) => {
      commitSelection(preset.getRange(new Date()));
    },
    [commitSelection, filteredPresets],
  );

  const handleClear = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onChange?.(null);
      resetInput();
    },
    [onChange, resetInput],
  );

  const handlePause = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (!value || !resolvedValue) {
        return;
      }

      onChange?.(pauseTimeRange(value, resolvedValue.end));
    },
    [onChange, resolvedValue, value],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && parsedFromInput) {
        handleSelectParsed();
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [handleSelectParsed, parsedFromInput],
  );

  const handleFocus = React.useCallback(() => {
    if (resolvedValue && !inputValue) {
      const displayText = formatInputDisplay(resolvedValue, timeRangeOptions);
      setInputValue(displayText);
      setUserHasTyped(false);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(displayText.length, displayText.length);
        }
      });
    }

    setOpen(true);
  }, [inputValue, resolvedValue, timeRangeOptions]);

  React.useEffect(() => {
    if (!resolvedValue || userHasTyped || document.activeElement !== inputRef.current) {
      return;
    }

    setInputValue(formatInputDisplay(resolvedValue, timeRangeOptions));
  }, [resolvedValue, timeRangeOptions, userHasTyped]);

  const handleBlur = React.useCallback(
    (event: React.FocusEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      if (containerRef.current?.contains(relatedTarget)) {
        return;
      }

      setTimeout(() => {
        if (!containerRef.current?.contains(document.activeElement)) {
          if (parsedFromInput && inputValue) {
            onChange?.(parsedFromInput);
          }
          resetInput();
        }
      }, 150);
    },
    [inputValue, onChange, parsedFromInput, resetInput],
  );

  const placeholderText = resolvedValue
    ? formatInputDisplay(resolvedValue, timeRangeOptions)
    : undefined;

  const resolvedDuration =
    resolvedValue && formatDuration(resolvedValue.start, resolvedValue.end, timeRangeOptions);

  const parsedDuration =
    resolvedParsedFromInput &&
    formatDuration(
      resolvedParsedFromInput.start,
      resolvedParsedFromInput.end,
      timeRangeOptions,
    );

  return {
    open,
    setOpen,
    inputValue,
    userHasTyped,
    inputRef,
    containerRef,
    timeRangeOptions,
    resolvedValue,
    parsedFromInput,
    resolvedParsedFromInput,
    filteredPresets,
    placeholderText,
    resolvedDuration,
    parsedDuration,
    handleInputChange,
    handleSelectPreset,
    handleSelectParsed,
    handleClear,
    handlePause,
    handleKeyDown,
    handleFocus,
    handleBlur,
  };
}
