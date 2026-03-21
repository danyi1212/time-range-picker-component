import * as React from "react";
import { Calendar, ChevronRight, Clock, Pause, X } from "lucide-react";
import { cn } from "./utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "./ui/command";
import {
  formatDuration,
  formatRangeDisplay,
  type ResolvedTimeRange,
  type TimeRange,
  type TimeRangeOptions,
  type TimeRangePreset,
} from "./time-range";

interface PickerInputProps {
  value?: TimeRange | null;
  inputValue: string;
  placeholder: string;
  resolvedDuration?: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onPause: (event: React.MouseEvent) => void;
  onClear: (event: React.MouseEvent) => void;
}

export function PickerInput({
  value,
  inputValue,
  placeholder,
  resolvedDuration,
  inputRef,
  onChange,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  onPause,
  onClear,
}: PickerInputProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Clock className="size-4" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={onChange}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "pl-9 pr-32",
          value && !inputValue && "placeholder:text-foreground",
        )}
      />
      {value && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <Badge variant="secondary" className="text-xs font-normal">
            {resolvedDuration}
          </Badge>
          {value.isLive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={onPause}
                  onMouseDown={(event) => event.preventDefault()}
                  tabIndex={-1}
                >
                  <Pause className="size-3" />
                  <span className="sr-only">Pause live range</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Freeze this range</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 text-muted-foreground hover:text-foreground"
                onClick={onClear}
                onMouseDown={(event) => event.preventDefault()}
                tabIndex={-1}
              >
                <X className="size-3" />
                <span className="sr-only">Clear selection</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear selection</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

interface ParsedResultSectionProps {
  result: ResolvedTimeRange;
  options: TimeRangeOptions;
  onSelect: () => void;
}

export function ParsedResultSection({ result, options, onSelect }: ParsedResultSectionProps) {
  return (
    <>
      <CommandGroup heading="Parsed Result">
        <CommandItem onSelect={onSelect} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">{formatRangeDisplay(result, options)}</span>
              <span className="text-xs text-muted-foreground">
                {formatDuration(result.start, result.end, options)}
              </span>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
    </>
  );
}

interface PresetGridSectionProps {
  presets: TimeRangePreset[];
  options: TimeRangeOptions;
  onSelect: (preset: TimeRangePreset) => void;
}

export function PresetGridSection({ presets, options, onSelect }: PresetGridSectionProps) {
  if (presets.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading="Presets">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(12rem,100%),1fr))] gap-1 p-1">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onSelect(preset)}
            className={cn(
              "flex flex-col items-start rounded-md px-2 py-1.5 text-left text-sm",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none",
              "cursor-pointer transition-colors",
            )}
          >
            <span className="font-medium truncate w-full">{preset.label}</span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {preset.getHint(options)}
            </span>
          </button>
        ))}
      </div>
    </CommandGroup>
  );
}

interface ExamplesSectionProps {
  examples: string[];
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Examples">
        <div className="px-3 py-2 text-xs text-muted-foreground space-y-1.5">
          <p className="font-medium">Try typing:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {examples.map((example) => (
              <span key={example}>{example}</span>
            ))}
          </div>
        </div>
      </CommandGroup>
    </>
  );
}

interface EmptyStateProps {
  inputValue: string;
}

export function EmptyState({ inputValue }: EmptyStateProps) {
  return (
    <CommandEmpty>
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Could not parse "{inputValue}"</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try "3h", "past 3 hours" or "Mar 1 - Mar 15"
        </p>
      </div>
    </CommandEmpty>
  );
}

interface ParsedPreviewBadgeProps {
  duration: string;
}

export function ParsedPreviewBadge({ duration }: ParsedPreviewBadgeProps) {
  return (
    <div className="absolute right-2 top-1/2 -translate-y-1/2">
      <Badge variant="outline" className="text-xs font-normal opacity-60">
        {duration}
      </Badge>
    </div>
  );
}
