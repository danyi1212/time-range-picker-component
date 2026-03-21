import * as React from "react";
import { Command, CommandList } from "./ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { cn } from "./utils";
import { DEFAULT_TIME_RANGE_EXAMPLES } from "./time-range";
import {
  EmptyState,
  ExamplesSection,
  ParsedPreviewBadge,
  ParsedResultSection,
  PickerInput,
  PresetGridSection,
} from "./time-range-picker-parts";
import type { TimeRangePickerProps } from "./time-range-picker.types";
import { useTimeRangePickerState } from "./use-time-range-picker-state";

export type { TimeRangePickerProps } from "./time-range-picker.types";

export function TimeRangePicker({
  placeholder = "Search time range...",
  className,
  examples = DEFAULT_TIME_RANGE_EXAMPLES,
  ...props
}: TimeRangePickerProps) {
  const state = useTimeRangePickerState(props);

  const showParsedResult = Boolean(state.resolvedParsedFromInput && state.userHasTyped);
  const showExamples = !state.userHasTyped;
  const showEmptyState =
    state.userHasTyped &&
    Boolean(state.inputValue) &&
    state.filteredPresets.length === 0 &&
    !state.parsedFromInput;
  const inputPlaceholder = state.placeholderText ?? placeholder;

  return (
    <div ref={state.containerRef} className={cn("relative", className)}>
      <Popover open={state.open} onOpenChange={state.setOpen}>
        <PopoverAnchor asChild>
          <PickerInput
            value={props.value}
            inputValue={state.inputValue}
            placeholder={inputPlaceholder}
            resolvedDuration={state.resolvedDuration}
            inputRef={state.inputRef}
            onChange={state.handleInputChange}
            onKeyDown={state.handleKeyDown}
            onFocus={state.handleFocus}
            onBlur={state.handleBlur}
            onPause={state.handlePause}
            onClear={state.handleClear}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-anchor-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (state.inputRef.current?.contains(event.target as Node)) {
              event.preventDefault();
            }
          }}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[320px]">
              {showParsedResult && state.resolvedParsedFromInput && (
                <ParsedResultSection
                  result={state.resolvedParsedFromInput}
                  options={state.timeRangeOptions}
                  onSelect={state.handleSelectParsed}
                />
              )}

              <PresetGridSection
                presets={state.filteredPresets}
                options={state.timeRangeOptions}
                onSelect={state.handleSelectPreset}
              />

              {showExamples && <ExamplesSection examples={examples} />}
              {showEmptyState && <EmptyState inputValue={state.inputValue} />}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {state.resolvedParsedFromInput && !props.value && state.parsedDuration && (
        <ParsedPreviewBadge duration={state.parsedDuration} />
      )}
    </div>
  );
}
