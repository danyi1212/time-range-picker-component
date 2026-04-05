import type {
  ClockFormat,
  TimeRangePickerProps,
  TimeRangePreset,
} from "@danyi1212/time-range-picker";
import type { CustomPresetConfig, LocaleKey, PresetSelection } from "@/demo/types";

export function getPropReferenceId(name: string) {
  return `prop-${name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

export function withTime(referenceDate: Date, time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  const nextDate = new Date(referenceDate);

  nextDate.setHours(
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );

  return nextDate;
}

export function clonePresetSelection(selection: PresetSelection) {
  return { ...selection };
}

export function cloneCustomPresetConfigs(configs: CustomPresetConfig[]) {
  return configs.map((config) => ({ ...config }));
}

function buildPresetSnippet(
  includeDefaultPresets: boolean,
  curatedDefaultPresets: TimeRangePreset[],
  customPresetConfigs: CustomPresetConfig[],
) {
  if (includeDefaultPresets) {
    return "\n      presets={customPresets}\n      includeDefaultPresets";
  }

  const presetValues = [
    ...curatedDefaultPresets.map((preset) => preset.value),
    ...customPresetConfigs.filter((preset) => preset.enabled).map((preset) => preset.id),
  ];

  return `\n      presets={curatedPresets /* ${presetValues.join(", ")} */}\n      includeDefaultPresets={false}`;
}

function formatLocaleSnippetImport(localeKey: LocaleKey, localeCode: string) {
  if (localeCode === "en-US") {
    return { importLine: "", propLine: "" };
  }

  return {
    importLine: `import { ${localeKey} } from "date-fns/locale";`,
    propLine: `\n      locale={${localeKey}}`,
  };
}

export function buildPlaygroundSnippet({
  clockFormat,
  weekStartsOn,
  localeKey,
  localeCode,
  placeholder,
  nowLabel,
  includeDefaultPresets,
  showExamples,
  curatedDefaultPresets,
  customPresetConfigs,
}: {
  clockFormat: ClockFormat;
  weekStartsOn: NonNullable<TimeRangePickerProps["weekStartsOn"]>;
  localeKey: LocaleKey;
  localeCode: string;
  placeholder: string;
  nowLabel: string;
  includeDefaultPresets: boolean;
  showExamples: boolean;
  curatedDefaultPresets: TimeRangePreset[];
  customPresetConfigs: CustomPresetConfig[];
}) {
  const { importLine: localeImport, propLine: localeValue } = formatLocaleSnippetImport(
    localeKey,
    localeCode,
  );
  const weekValue = weekStartsOn === 1 ? "\n      weekStartsOn={1}" : "\n      weekStartsOn={0}";
  const labelsValue = nowLabel !== "now" ? `\n      labels={{ now: "${nowLabel}" }}` : "";
  const placeholderValue =
    placeholder !== "Search time range..." ? `\n      placeholder="${placeholder}"` : "";
  const presetValue = buildPresetSnippet(
    includeDefaultPresets,
    curatedDefaultPresets,
    customPresetConfigs,
  );
  const examplesValue = showExamples
    ? '\n      examples={["3h", "Mar 3 - Mar 13", "14:00 - 16:30"]}'
    : "\n      examples={[]}";

  return `import { useState } from "react";
import { TimeRangePicker, type TimeRange } from "@danyi1212/time-range-picker";
${localeImport}

export function Example() {
  const [range, setRange] = useState<TimeRange | null>(null);

  return (
    <TimeRangePicker
      value={range}
      onChange={setRange}
      clockFormat="${clockFormat}"${localeValue}${weekValue}${placeholderValue}${labelsValue}${presetValue}${examplesValue}
    />
  );
}`;
}
