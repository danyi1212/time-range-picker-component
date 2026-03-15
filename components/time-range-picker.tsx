"use client";

import * as React from "react";
import { Clock, Calendar, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  TimeRange,
  parseTimeRange,
  getFilteredPresets,
  formatDuration,
  formatRangeDisplay,
  getPresets,
} from "@/lib/time-range";

interface TimeRangePickerProps {
  value?: TimeRange | null;
  onChange?: (range: TimeRange | null) => void;
  placeholder?: string;
  className?: string;
}

export function TimeRangePicker({
  value,
  onChange,
  placeholder = "Search time range...",
  className,
}: TimeRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [previewRange, setPreviewRange] = React.useState<TimeRange | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredPresets = React.useMemo(
    () => getFilteredPresets(inputValue),
    [inputValue]
  );

  const parsedFromInput = React.useMemo(() => {
    if (!inputValue.trim()) return null;
    return parseTimeRange(inputValue);
  }, [inputValue]);

  const displayRange = previewRange || value;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Parse and preview the range as user types
    const parsed = parseTimeRange(newValue);
    setPreviewRange(parsed);
    
    if (!open) {
      setOpen(true);
    }
  };

  const handleSelectPreset = (preset: ReturnType<typeof getPresets>[number]) => {
    const range = preset.getRange();
    onChange?.(range);
    setInputValue("");
    setPreviewRange(null);
    setOpen(false);
  };

  const handleSelectParsed = () => {
    if (parsedFromInput) {
      onChange?.(parsedFromInput);
      setInputValue("");
      setPreviewRange(null);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    setInputValue("");
    setPreviewRange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && parsedFromInput) {
      handleSelectParsed();
    } else if (e.key === "Escape") {
      setOpen(false);
      setPreviewRange(null);
    }
  };

  // Reset preview when closing
  React.useEffect(() => {
    if (!open) {
      setPreviewRange(null);
    }
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Clock className="size-4" />
            </div>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setOpen(true)}
              placeholder={value ? formatRangeDisplay(value) : placeholder}
              className={cn(
                "pl-9 pr-24",
                value && !inputValue && "text-foreground placeholder:text-foreground"
              )}
            />
            {value && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <Badge variant="secondary" className="text-xs font-normal">
                  {formatDuration(value.start, value.end)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                >
                  <X className="size-3" />
                  <span className="sr-only">Clear selection</span>
                </Button>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {/* Show parsed result if input is valid */}
              {parsedFromInput && (
                <>
                  <CommandGroup heading="Parsed Result">
                    <CommandItem
                      onSelect={handleSelectParsed}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-primary" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatRangeDisplay(parsedFromInput)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(parsedFromInput.start, parsedFromInput.end)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Show filtered presets */}
              {filteredPresets.length > 0 && (
                <CommandGroup heading="Presets">
                  {filteredPresets.map((preset) => {
                    const range = preset.getRange();
                    return (
                      <CommandItem
                        key={preset.value}
                        onSelect={() => handleSelectPreset(preset)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-muted-foreground" />
                          <span>{preset.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(range.start, range.end)}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Show examples when no input */}
              {!inputValue && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Examples">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground space-y-1">
                      <p>Try typing:</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>Mar 3 - Mar 13</li>
                        <li>14:00 - 14:30</li>
                        <li>last friday to today</li>
                        <li>past 2 weeks</li>
                      </ul>
                    </div>
                  </CommandGroup>
                </>
              )}

              {/* No results */}
              {inputValue && filteredPresets.length === 0 && !parsedFromInput && (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Could not parse "{inputValue}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try "past 3 hours" or "Mar 1 - Mar 15"
                    </p>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Preview indicator */}
      {previewRange && !value && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Badge variant="outline" className="text-xs font-normal opacity-60">
            {formatDuration(previewRange.start, previewRange.end)}
          </Badge>
        </div>
      )}
    </div>
  );
}
