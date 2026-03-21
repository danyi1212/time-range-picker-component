import * as React from "react";
import { Clock, Calendar, ChevronRight, Pause, X } from "lucide-react";
import { cn } from "./utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  TimeRange,
  parseTimeRange,
  getFilteredPresets,
  formatDuration,
  formatInputDisplay,
  formatRangeDisplay,
  getPresets,
  ClockFormat,
  resolveTimeRange,
} from "./time-range";

interface TimeRangePickerProps {
  value?: TimeRange | null;
  onChange?: (range: TimeRange | null) => void;
  placeholder?: string;
  className?: string;
  clockFormat?: ClockFormat;
}

export function TimeRangePicker({
  value,
  onChange,
  placeholder = "Search time range...",
  className,
  clockFormat = "24h",
}: TimeRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [userHasTyped, setUserHasTyped] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [liveReferenceTime, setLiveReferenceTime] = React.useState(() => new Date());

  const use24Hour = clockFormat === "24h";

  React.useEffect(() => {
    if (!value?.isLive) {
      return;
    }

    const scheduleNextTick = () => {
      const now = new Date();
      const msUntilNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

      return window.setTimeout(() => {
        setLiveReferenceTime(new Date());

        const intervalId = window.setInterval(() => {
          setLiveReferenceTime(new Date());
        }, 60_000);

        cleanup = () => window.clearInterval(intervalId);
      }, msUntilNextMinute);
    };

    let cleanup = () => {};
    setLiveReferenceTime(new Date());
    const timeoutId = scheduleNextTick();

    return () => {
      window.clearTimeout(timeoutId);
      cleanup();
    };
  }, [value?.isLive]);

  const resolvedValue = React.useMemo(
    () => (value ? resolveTimeRange(value, liveReferenceTime) : null),
    [value, liveReferenceTime],
  );

  const filteredPresets = React.useMemo(
    () => (userHasTyped ? getFilteredPresets(inputValue) : getFilteredPresets("")),
    [inputValue, userHasTyped],
  );

  const parsedFromInput = React.useMemo(() => {
    if (!inputValue.trim()) return null;
    return parseTimeRange(inputValue);
  }, [inputValue]);

  const resolvedParsedFromInput = React.useMemo(
    () => (parsedFromInput ? resolveTimeRange(parsedFromInput, liveReferenceTime) : null),
    [parsedFromInput, liveReferenceTime],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setUserHasTyped(true);

    if (!open) {
      setOpen(true);
    }
  };

  const handleSelectPreset = (preset: ReturnType<typeof getPresets>[number]) => {
    const range = preset.getRange();
    onChange?.(range);
    setInputValue("");
    setUserHasTyped(false);
    setOpen(false);
  };

  const handleSelectParsed = () => {
    if (parsedFromInput) {
      onChange?.(parsedFromInput);
      setInputValue("");
      setUserHasTyped(false);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange?.(null);
    setInputValue("");
    setUserHasTyped(false);
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!value || !resolvedValue) {
      return;
    }

    onChange?.({
      ...value,
      start: resolvedValue.start,
      end: resolvedValue.end,
      isLive: false,
      liveRange: undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && parsedFromInput) {
      handleSelectParsed();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (resolvedValue && !inputValue) {
      const displayText = formatInputDisplay(resolvedValue, use24Hour);
      setInputValue(displayText);
      setUserHasTyped(false);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(displayText.length, displayText.length);
        }
      });
    }
    setOpen(true);
  };

  React.useEffect(() => {
    if (!resolvedValue || userHasTyped || document.activeElement !== inputRef.current) {
      return;
    }

    setInputValue(formatInputDisplay(resolvedValue, use24Hour));
  }, [resolvedValue, use24Hour, userHasTyped]);

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking within the popover
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (containerRef.current?.contains(relatedTarget)) {
      return;
    }
    // Small delay to allow click events to process
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        // If we have a valid parsed result and user blurs, apply it
        if (parsedFromInput && inputValue) {
          onChange?.(parsedFromInput);
        }
        setInputValue("");
        setUserHasTyped(false);
      }
    }, 150);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Clock className="size-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={resolvedValue ? formatInputDisplay(resolvedValue, use24Hour) : placeholder}
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
                  {resolvedValue ? formatDuration(resolvedValue.start, resolvedValue.end) : null}
                </Badge>
                {value.isLive && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 text-muted-foreground hover:text-foreground"
                        onClick={handlePause}
                        onMouseDown={(e) => e.preventDefault()}
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
                      onClick={handleClear}
                      onMouseDown={(e) => e.preventDefault()}
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
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-anchor-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Prevent closing when clicking the input
            if (inputRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[320px]">
              {/* Show parsed result only when user has actively typed */}
              {resolvedParsedFromInput && userHasTyped && (
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
                            {formatRangeDisplay(resolvedParsedFromInput, use24Hour)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(
                              resolvedParsedFromInput.start,
                              resolvedParsedFromInput.end,
                            )}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Show filtered presets in 3 columns */}
              {filteredPresets.length > 0 && (
                <CommandGroup heading="Presets">
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {filteredPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleSelectPreset(preset)}
                        className={cn(
                          "flex flex-col items-start rounded-md px-2 py-1.5 text-left text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                          "cursor-pointer transition-colors",
                        )}
                      >
                        <span className="font-medium truncate w-full">{preset.label}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {preset.getHint(use24Hour)}
                        </span>
                      </button>
                    ))}
                  </div>
                </CommandGroup>
              )}

              {/* Show examples when no user input */}
              {!userHasTyped && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Examples">
                    <div className="px-3 py-2 text-xs text-muted-foreground space-y-1.5">
                      <p className="font-medium">Try typing:</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span>3h, 30m, 7d</span>
                        <span>Mar 3 - Mar 13</span>
                        <span>14:00 - 16:30</span>
                        <span>9am - now</span>
                        <span>past 2 weeks</span>
                        <span>last friday</span>
                      </div>
                    </div>
                  </CommandGroup>
                </>
              )}

              {/* No results */}
              {userHasTyped && inputValue && filteredPresets.length === 0 && !parsedFromInput && (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Could not parse "{inputValue}"</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try "3h", "past 3 hours" or "Mar 1 - Mar 15"
                    </p>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Preview indicator */}
      {resolvedParsedFromInput && !value && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Badge variant="outline" className="text-xs font-normal opacity-60">
            {formatDuration(resolvedParsedFromInput.start, resolvedParsedFromInput.end)}
          </Badge>
        </div>
      )}
    </div>
  );
}
