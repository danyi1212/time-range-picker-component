import * as React from "react";
import {
  getPresets,
  resolveTimeRange,
  type ClockFormat,
  type TimeRange,
  type TimeRangePreset,
} from "@danyi/time-range-picker";
import type { Locale } from "date-fns";
import * as dateFnsLocales from "date-fns/locale";
import { ApiReferenceSection } from "@/demo/components/api-reference-section";
import { ExamplesSection } from "@/demo/components/examples-section";
import { InstallSection } from "@/demo/components/install-section";
import { PlaygroundSection } from "@/demo/components/playground-section";
import { SiteHeader } from "@/demo/components/site-header";
import { SupportSection } from "@/demo/components/support-section";
import { useGithubStars, useLiveReferenceTime, useThemePreference } from "@/demo/hooks";
import {
  buildPlaygroundSnippet,
  cloneCustomPresetConfigs,
  clonePresetSelection,
  withTime,
} from "@/demo/utils";
import type {
  CustomPresetConfig,
  LocaleKey,
  LocaleOption,
  PackageManager,
  PresetSelection,
  ThemePreference,
} from "@/demo/types";

const themeOrder: ThemePreference[] = ["system", "dark", "light"];

const localeOptions: LocaleOption[] = Object.entries(dateFnsLocales)
  .flatMap(([key, value]) => {
    if (!value || typeof value !== "object" || !("code" in value)) {
      return [];
    }

    const locale = value as Locale & { code?: string };

    if (typeof locale.code !== "string") {
      return [];
    }

    return [{ key, code: locale.code, locale }];
  })
  .sort((first, second) => first.code.localeCompare(second.code));

const defaultLocaleKey =
  localeOptions.find((option) => option.code === "en-US")?.key ?? localeOptions[0]?.key ?? "enUS";

const defaultCustomPresetConfigs: CustomPresetConfig[] = [
  {
    id: "business-hours",
    label: "Business hours",
    shortcut: "biz",
    enabled: true,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    id: "morning-standup",
    label: "Morning standup",
    shortcut: "standup",
    enabled: true,
    startTime: "10:00",
    endTime: "10:30",
  },
];

const defaultPresetSelection: PresetSelection = Object.fromEntries(
  getPresets().map((preset) => [preset.value, true]),
);

export default function App() {
  const [range, setRange] = React.useState<TimeRange | null>(null);
  const [themePreference, setThemePreference] = React.useState<ThemePreference>("system");
  const [packageManager, setPackageManager] = React.useState<PackageManager>("pnpm");
  const [clockFormat, setClockFormat] = React.useState<ClockFormat>("24h");
  const [weekStartsOn, setWeekStartsOn] = React.useState<0 | 1>(1);
  const [localeKey, setLocaleKey] = React.useState<LocaleKey>(defaultLocaleKey);
  const [placeholder, setPlaceholder] = React.useState("Search time range...");
  const [nowLabel, setNowLabel] = React.useState("now");
  const [includeDefaultPresets, setIncludeDefaultPresets] = React.useState(true);
  const [showExamples, setShowExamples] = React.useState(true);
  const [defaultPresetSelectionState, setDefaultPresetSelection] = React.useState<PresetSelection>(
    () => clonePresetSelection(defaultPresetSelection),
  );
  const [customPresetConfigs, setCustomPresetConfigs] = React.useState<CustomPresetConfig[]>(() =>
    cloneCustomPresetConfigs(defaultCustomPresetConfigs),
  );

  useThemePreference(themePreference);
  const { githubStars, githubUnavailable } = useGithubStars();
  const liveReferenceTime = useLiveReferenceTime(Boolean(range?.isLive));

  const selectedLocaleOption =
    localeOptions.find((option) => option.key === localeKey) ??
    localeOptions.find((option) => option.key === defaultLocaleKey) ??
    localeOptions[0];

  const locale = selectedLocaleOption.locale;

  const customPresets = React.useMemo<TimeRangePreset[]>(
    () =>
      customPresetConfigs
        .filter((preset) => preset.enabled)
        .map((preset) => ({
          label: preset.label,
          value: preset.id,
          shortcut: preset.shortcut,
          getRange: (referenceDate = new Date()) => {
            const start = withTime(referenceDate, preset.startTime);
            const end = withTime(referenceDate, preset.endTime);

            return {
              mode: "static" as const,
              start,
              end,
              label: preset.label,
              isLive: false,
            };
          },
          getHint: () => `${preset.startTime} - ${preset.endTime}`,
        })),
    [customPresetConfigs],
  );

  const defaultPresets = React.useMemo(
    () =>
      getPresets({
        clockFormat,
        locale,
        weekStartsOn,
        labels: { now: nowLabel },
      }),
    [clockFormat, locale, nowLabel, weekStartsOn],
  );

  const curatedDefaultPresets = React.useMemo(
    () => defaultPresets.filter((preset) => defaultPresetSelectionState[preset.value] ?? true),
    [defaultPresetSelectionState, defaultPresets],
  );

  const resolvedRange = React.useMemo(
    () => (range ? resolveTimeRange(range, liveReferenceTime) : null),
    [liveReferenceTime, range],
  );

  const presets = React.useMemo(() => {
    const selectedPresets = includeDefaultPresets
      ? customPresets
      : [...curatedDefaultPresets, ...customPresets];

    return selectedPresets.length > 0 ? selectedPresets : undefined;
  }, [curatedDefaultPresets, customPresets, includeDefaultPresets]);

  const playgroundSnippet = React.useMemo(
    () =>
      buildPlaygroundSnippet({
        clockFormat,
        weekStartsOn,
        localeKey,
        localeCode: selectedLocaleOption.code,
        placeholder,
        nowLabel,
        includeDefaultPresets,
        showExamples,
        curatedDefaultPresets,
        customPresetConfigs,
      }),
    [
      clockFormat,
      curatedDefaultPresets,
      customPresetConfigs,
      includeDefaultPresets,
      localeKey,
      nowLabel,
      placeholder,
      selectedLocaleOption.code,
      showExamples,
      weekStartsOn,
    ],
  );

  function toggleTheme() {
    setThemePreference((current) => {
      const currentIndex = themeOrder.indexOf(current);
      return themeOrder[(currentIndex + 1) % themeOrder.length];
    });
  }

  function resetPlayground() {
    setRange(null);
    setClockFormat("24h");
    setWeekStartsOn(1);
    setLocaleKey(defaultLocaleKey);
    setPlaceholder("Search time range...");
    setNowLabel("now");
    setIncludeDefaultPresets(true);
    setShowExamples(true);
    setDefaultPresetSelection(clonePresetSelection(defaultPresetSelection));
    setCustomPresetConfigs(cloneCustomPresetConfigs(defaultCustomPresetConfigs));
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground transition-colors sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-8">
        <SiteHeader
          githubStars={githubStars}
          themePreference={themePreference}
          onToggleTheme={toggleTheme}
        />

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <InstallSection
            githubStars={githubStars}
            githubUnavailable={githubUnavailable}
            packageManager={packageManager}
            onPackageManagerChange={setPackageManager}
          />

          <PlaygroundSection
            range={range}
            resolvedRange={resolvedRange}
            placeholder={placeholder}
            clockFormat={clockFormat}
            locale={locale}
            localeKey={localeKey}
            localeOptions={localeOptions}
            weekStartsOn={weekStartsOn}
            nowLabel={nowLabel}
            includeDefaultPresets={includeDefaultPresets}
            showExamples={showExamples}
            defaultPresets={defaultPresets}
            defaultPresetSelection={defaultPresetSelectionState}
            customPresetConfigs={customPresetConfigs}
            presets={presets}
            examples={
              showExamples
                ? ["3h", "Mar 3 - Mar 13", "14:00 - 16:30", "last friday", "business hours"]
                : []
            }
            onRangeChange={setRange}
            onReset={resetPlayground}
            onClockFormatChange={setClockFormat}
            onLocaleKeyChange={setLocaleKey}
            onWeekStartsOnChange={setWeekStartsOn}
            onNowLabelChange={setNowLabel}
            onShowExamplesChange={setShowExamples}
            onIncludeDefaultPresetsChange={setIncludeDefaultPresets}
            onPlaceholderChange={setPlaceholder}
            onDefaultPresetSelectionChange={setDefaultPresetSelection}
            onCustomPresetConfigsChange={setCustomPresetConfigs}
          />
        </section>

        <ApiReferenceSection />
        <ExamplesSection playgroundSnippet={playgroundSnippet} />
        <SupportSection />
      </div>
    </main>
  );
}
