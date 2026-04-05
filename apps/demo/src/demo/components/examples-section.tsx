import { CodeExample, ExamplesSectionShell, SectionIntro } from "@/demo/components/shared";

const basicUsageExample = `import { useState } from "react";
import { TimeRangePicker, type TimeRange } from "@danyi1212/time-range-picker";

export function ReportsToolbar() {
  const [range, setRange] = useState<TimeRange | null>(null);

  return (
    <TimeRangePicker
      value={range}
      onChange={setRange}
      placeholder="Search time range..."
    />
  );
}`;

const localeExample = `import { TimeRangePicker } from "@danyi1212/time-range-picker";
import { enGB } from "date-fns/locale";

<TimeRangePicker
  clockFormat="24h"
  locale={enGB}
  weekStartsOn={1}
  labels={{ now: "live" }}
/>;
`;

const customPresetExample = `import { TimeRangePicker, type TimeRangePreset } from "@danyi1212/time-range-picker";

const presets: TimeRangePreset[] = [
  {
    label: "Business hours",
    value: "business-hours",
    shortcut: "biz",
    getRange: (referenceDate = new Date()) => {
      const start = new Date(referenceDate);
      start.setHours(9, 0, 0, 0);

      const end = new Date(referenceDate);
      end.setHours(17, 0, 0, 0);

      return { mode: "static", start, end, label: "Business hours" };
    },
    getHint: () => "09:00 - 17:00",
  },
];

<TimeRangePicker presets={presets} includeDefaultPresets />;`;

const utilityExample = `import {
  formatDuration,
  formatRangeDisplay,
  parseTimeRange,
} from "@danyi1212/time-range-picker";
import { enGB } from "date-fns/locale";

const options = {
  clockFormat: "24h" as const,
  locale: enGB,
  weekStartsOn: 1 as const,
  labels: { now: "live" },
};

const range = parseTimeRange("this week", new Date(), options);
const text = range ? formatRangeDisplay(range, options) : "";
const duration = range ? formatDuration(range.start, range.end, options) : "";`;

export function ExamplesSection({ playgroundSnippet }: { playgroundSnippet: string }) {
  return (
    <ExamplesSectionShell>
      <SectionIntro
        eyebrow="Examples"
        title="Copy-paste starting points"
        description="These cover the common setups most teams need first: basic usage, localization, custom presets, and standalone utilities."
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <CodeExample title="Basic usage" code={basicUsageExample} />
        <CodeExample title="Localization and formatting" code={localeExample} />
        <CodeExample title="Custom presets" code={customPresetExample} />
        <CodeExample title="Standalone utility helpers" code={utilityExample} />
        <CodeExample title="Generated snippet from the playground" code={playgroundSnippet} />
        <CodeExample
          title="Suggested starter examples"
          code={["3h", "30m", "Mar 3 - Mar 13", "14:00 - now", "last friday", "past 2 weeks"]
            .map((example) => `"${example}"`)
            .join(",\n")}
        />
      </div>
    </ExamplesSectionShell>
  );
}
