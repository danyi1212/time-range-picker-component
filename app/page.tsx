"use client";

import * as React from "react";
import { TimeRangePicker } from "@/components/time-range-picker";
import { TimeRange, formatDuration, formatRangeDisplay } from "@/lib/time-range";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CalendarDays, Timer, Code } from "lucide-react";

export default function TimeRangePickerDemo() {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              Natural Language Time Range Picker
            </h1>
            <p className="text-muted-foreground text-pretty">
              Type natural language or select from presets. Supports date ranges, time ranges, and relative periods.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Select Time Range
              </CardTitle>
              <CardDescription>
                Try typing "past 3 hours", "Mar 3 - Mar 13", "14:00 - 16:30", or select a preset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-10 rounded-md border bg-background" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Natural Language Time Range Picker
          </h1>
          <p className="text-muted-foreground text-pretty">
            Type natural language or select from presets. Supports date ranges, time ranges, and relative periods.
          </p>
        </div>

        {/* Time Range Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Select Time Range
            </CardTitle>
            <CardDescription>
              Try typing "past 3 hours", "Mar 3 - Mar 13", "14:00 - 16:30", or select a preset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeRangePicker
              value={selectedRange}
              onChange={setSelectedRange}
              placeholder="Search time range..."
            />
          </CardContent>
        </Card>

        {/* Results Display */}
        {selectedRange && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-5" />
                Selected Range
              </CardTitle>
              <CardDescription>
                {formatRangeDisplay(selectedRange)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Badge */}
              <div className="flex items-center gap-3">
                <Timer className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Duration:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatDuration(selectedRange.start, selectedRange.end)}
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
                      {selectedRange.start.toISOString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      End
                    </label>
                    <div className="font-mono text-sm bg-background rounded-md px-3 py-2 border">
                      {selectedRange.end.toISOString()}
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
                    <div className="font-medium">
                      {selectedRange.start.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Local End</label>
                    <div className="font-medium">
                      {selectedRange.end.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Unix Start (ms)</label>
                    <div className="font-mono text-xs">
                      {selectedRange.start.getTime()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Unix End (ms)</label>
                    <div className="font-mono text-xs">
                      {selectedRange.end.getTime()}
                    </div>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Presets</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• past 1 hour</li>
                  <li>• past 3 hours</li>
                  <li>• today</li>
                  <li>• yesterday</li>
                  <li>• past 3 days</li>
                  <li>• this week / last week</li>
                  <li>• this month / last month</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Custom Ranges</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mar 3 - Mar 13</li>
                  <li>• 14:00 - 14:30</li>
                  <li>• 9am - 5pm</li>
                  <li>• last friday to today</li>
                  <li>• 2 weeks ago</li>
                  <li>• next monday</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
