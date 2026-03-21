import * as React from "react";
import { TimeRangePicker } from "@danyi/time-range-picker";
import {
  TimeRange,
  TimeRangePreset,
  formatDuration,
  formatRangeDisplay,
  ClockFormat,
  resolveTimeRange,
} from "@danyi/time-range-picker";
import { Badge, Button } from "@danyi/time-range-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Separator } from "@/components/separator";
import { Clock, CalendarDays, Timer, Code, Moon, Sun } from "lucide-react";
import { enGB, enUS } from "date-fns/locale";

export default function App() {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange | null>(null);
  const [isDark, setIsDark] = React.useState(false);
  const [clockFormat, setClockFormat] = React.useState<ClockFormat>("24h");
  const [weekStartsOn, setWeekStartsOn] = React.useState<0 | 1>(1);
  const [localeKey, setLocaleKey] = React.useState<"en-US" | "en-GB">("en-US");
  const [useCustomPresets, setUseCustomPresets] = React.useState(false);
  const [liveReferenceTime, setLiveReferenceTime] = React.useState(() => new Date());

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  const toggleClockFormat = () => {
    setClockFormat((prev) => (prev === "24h" ? "12h" : "24h"));
  };

  const locale = localeKey === "en-GB" ? enGB : enUS;

  const customPresets = React.useMemo<TimeRangePreset[]>(
    () => [
      {
        label: "Business hours",
        value: "business hours",
        shortcut: "biz",
        getRange: (referenceDate = new Date()) => {
          const start = new Date(referenceDate);
          start.setHours(9, 0, 0, 0);
          const end = new Date(referenceDate);
          end.setHours(17, 0, 0, 0);
          return {
            mode: "static",
            start,
            end,
            label: "Business hours",
            isLive: false,
          };
        },
        getHint: () => "09:00 - 17:00",
      },
    ],
    [],
  );

  React.useEffect(() => {
    if (!selectedRange?.isLive) {
      return;
    }

    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setLiveReferenceTime(now);

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setLiveReferenceTime(new Date());
      intervalId = window.setInterval(() => {
        setLiveReferenceTime(new Date());
      }, 60_000);
    }, msUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [selectedRange?.isLive]);

  const displayRange = React.useMemo(
    () => (selectedRange ? resolveTimeRange(selectedRange, liveReferenceTime) : null),
    [selectedRange, liveReferenceTime],
  );

  return (
    <main className="min-h-screen bg-background p-8 transition-colors">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header with theme toggle */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              Natural Language Time Range Picker
            </h1>
            <p className="text-muted-foreground text-pretty">
              Type natural language or select from presets. Supports date ranges, time ranges, and
              relative periods.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleClockFormat}
              className="font-mono text-xs"
            >
              {clockFormat === "24h" ? "24h" : "12h"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStartsOn((prev) => (prev === 1 ? 0 : 1))}
              className="font-mono text-xs"
            >
              Week {weekStartsOn === 1 ? "Mon" : "Sun"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocaleKey((prev) => (prev === "en-US" ? "en-GB" : "en-US"))}
              className="font-mono text-xs"
            >
              {localeKey}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseCustomPresets((prev) => !prev)}
              className="font-mono text-xs"
            >
              {useCustomPresets ? "Preset+" : "Preset-"}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Time Range Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Select Time Range
            </CardTitle>
            <CardDescription>
              Try typing "3h", "30m", "Mar 3 - Mar 13", "14:00 - now", or select a preset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeRangePicker
              value={selectedRange}
              onChange={setSelectedRange}
              placeholder="Search time range..."
              clockFormat={clockFormat}
              locale={locale}
              weekStartsOn={weekStartsOn}
              labels={{ now: "now" }}
              presets={useCustomPresets ? customPresets : undefined}
              examples={[
                "3h",
                "Mar 3 - Mar 13",
                "14:00 - 16:30",
                "last friday",
                "business hours",
              ]}
            />
          </CardContent>
        </Card>

        {/* Results Display */}
        {displayRange && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-5" />
                Selected Range
                {displayRange.isLive && (
                  <Badge variant="secondary" className="text-xs font-normal ml-auto">
                    Live
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {formatRangeDisplay(displayRange, {
                  clockFormat,
                  locale,
                  weekStartsOn,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Badge */}
              <div className="flex items-center gap-3">
                <Timer className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Duration:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatDuration(displayRange.start, displayRange.end, {
                    clockFormat,
                    locale,
                    weekStartsOn,
                  })}
                </Badge>
              </div>

              <Separator />

              {/* ISO Timestamps */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ISO Timestamps</span>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Start
                    </label>
                    <div className="font-mono text-sm bg-background rounded-md px-3 py-2 border">
                      {displayRange.start.toISOString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      End {displayRange.isLive && "(now)"}
                    </label>
                    <div className="font-mono text-sm bg-background rounded-md px-3 py-2 border">
                      {displayRange.end.toISOString()}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Formatted Display */}
              <div className="space-y-4">
                <span className="text-sm font-medium">Formatted Values</span>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Local Start</label>
                    <div className="font-medium">{displayRange.start.toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Local End</label>
                    <div className="font-medium">{displayRange.end.toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Unix Start (ms)</label>
                    <div className="font-mono text-xs">{displayRange.start.getTime()}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Unix End (ms)</label>
                    <div className="font-mono text-xs">{displayRange.end.getTime()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supported Input Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Shortcuts</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>15m, 30m</li>
                  <li>1h, 3h, 12h, 24h</li>
                  <li>3d, 7d, 30d</li>
                  <li>now</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Presets</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>today, yesterday</li>
                  <li>this week / last week</li>
                  <li>this month / last month</li>
                  <li>past 90 days</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Custom Ranges</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Mar 3 - Mar 13</li>
                  <li>14:00 - 16:30</li>
                  <li>9am - now</li>
                  <li>last friday to today</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
