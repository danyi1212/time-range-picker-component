import type { TimeRange, TimeRangePreset } from "@danyi1212/time-range-picker";
import { TimeRangePicker } from "@danyi1212/time-range-picker";
import type { Locale } from "date-fns";
import { BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckboxCard,
  CheckboxRow,
  ControlLabel,
  CustomPresetCard,
  InlineField,
  InlineSelectionDetails,
  PlaygroundCardShell,
  SelectField,
  SwitchRow,
  TextField,
  ToggleButtonGroup,
} from "@/demo/components/shared";
import type { CustomPresetConfig, LocaleKey, LocaleOption, PresetSelection } from "@/demo/types";

export function PlaygroundSection({
  range,
  resolvedRange,
  placeholder,
  clockFormat,
  locale,
  localeKey,
  localeOptions,
  weekStartsOn,
  nowLabel,
  includeDefaultPresets,
  showExamples,
  defaultPresets,
  defaultPresetSelection,
  customPresetConfigs,
  presets,
  examples,
  onRangeChange,
  onReset,
  onClockFormatChange,
  onLocaleKeyChange,
  onWeekStartsOnChange,
  onNowLabelChange,
  onShowExamplesChange,
  onIncludeDefaultPresetsChange,
  onPlaceholderChange,
  onDefaultPresetSelectionChange,
  onCustomPresetConfigsChange,
}: {
  range: TimeRange | null;
  resolvedRange: ReturnType<typeof import("@danyi1212/time-range-picker").resolveTimeRange> | null;
  placeholder: string;
  clockFormat: "12h" | "24h";
  locale: Locale;
  localeKey: LocaleKey;
  localeOptions: LocaleOption[];
  weekStartsOn: 0 | 1;
  nowLabel: string;
  includeDefaultPresets: boolean;
  showExamples: boolean;
  defaultPresets: TimeRangePreset[];
  defaultPresetSelection: PresetSelection;
  customPresetConfigs: CustomPresetConfig[];
  presets: TimeRangePreset[] | undefined;
  examples: string[];
  onRangeChange: (range: TimeRange | null) => void;
  onReset: () => void;
  onClockFormatChange: (value: "12h" | "24h") => void;
  onLocaleKeyChange: (value: LocaleKey) => void;
  onWeekStartsOnChange: (value: 0 | 1) => void;
  onNowLabelChange: (value: string) => void;
  onShowExamplesChange: (checked: boolean) => void;
  onIncludeDefaultPresetsChange: (checked: boolean) => void;
  onPlaceholderChange: (value: string) => void;
  onDefaultPresetSelectionChange: (selection: PresetSelection) => void;
  onCustomPresetConfigsChange: (configs: CustomPresetConfig[]) => void;
}) {
  return (
    <PlaygroundCardShell>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="size-5" />
            Playground
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>
        <CardDescription>
          Try the component first. Open configuration only when you need to tweak behavior.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimeRangePicker
          value={range}
          onChange={onRangeChange}
          placeholder={placeholder}
          clockFormat={clockFormat}
          locale={locale}
          weekStartsOn={weekStartsOn}
          labels={{ now: nowLabel }}
          presets={presets}
          includeDefaultPresets={includeDefaultPresets}
          examples={examples}
        />

        <InlineSelectionDetails
          range={resolvedRange}
          clockFormat={clockFormat}
          locale={locale}
          weekStartsOn={weekStartsOn}
        />

        <details className="group rounded-2xl border border-border/70 bg-background/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
            Configuration
            <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-border/70 px-4 py-4">
            <InlineField>
              <ControlLabel htmlFor="clock-format" propName="clockFormat">
                Clock format
              </ControlLabel>
              <ToggleButtonGroup
                id="clock-format"
                value={clockFormat}
                options={[
                  { value: "24h", label: "24h" },
                  { value: "12h", label: "12h" },
                ]}
                onChange={(value) => onClockFormatChange(value as "12h" | "24h")}
              />
            </InlineField>

            <InlineField>
              <ControlLabel htmlFor="selected-locale" propName="locale">
                Locale
              </ControlLabel>
              <SelectField
                id="selected-locale"
                value={localeKey}
                options={localeOptions.map((option) => ({
                  value: option.key,
                  label: option.code,
                }))}
                onChange={(value) => onLocaleKeyChange(value as LocaleKey)}
              />
            </InlineField>

            <InlineField>
              <ControlLabel htmlFor="week-start" propName="weekStartsOn">
                Week starts on
              </ControlLabel>
              <ToggleButtonGroup
                id="week-start"
                value={String(weekStartsOn)}
                options={[
                  { value: "0", label: "Sunday" },
                  { value: "1", label: "Monday" },
                ]}
                onChange={(value) => onWeekStartsOnChange(Number(value) as 0 | 1)}
              />
            </InlineField>

            <InlineField>
              <ControlLabel htmlFor="now-label" propName="labels">
                Live label
              </ControlLabel>
              <TextField
                id="now-label"
                value={nowLabel}
                onChange={(event) => onNowLabelChange(event.target.value)}
              />
            </InlineField>

            <InlineField>
              <ControlLabel htmlFor="show-examples" propName="examples">
                Example prompts
              </ControlLabel>
              <CheckboxRow
                id="show-examples"
                checked={showExamples}
                label="Show built-in example prompts"
                onCheckedChange={onShowExamplesChange}
              />
            </InlineField>

            <InlineField>
              <ControlLabel htmlFor="include-default-presets" propName="includeDefaultPresets">
                Default presets
              </ControlLabel>
              <SwitchRow
                id="include-default-presets"
                checked={includeDefaultPresets}
                label="Enable all built-in presets"
                description="Turn this off to choose an explicit subset below."
                onCheckedChange={onIncludeDefaultPresetsChange}
              />
              {includeDefaultPresets ? (
                <p className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  All built-in presets are enabled. Disable the switch to choose a curated subset.
                </p>
              ) : (
                <>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Choose which built-in presets to pass through the `presets` prop.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {defaultPresets.map((preset) => (
                      <CheckboxCard
                        key={preset.value}
                        checked={defaultPresetSelection[preset.value] ?? true}
                        label={preset.label}
                        hint={preset.getHint({
                          clockFormat,
                          locale,
                          weekStartsOn,
                          labels: { now: nowLabel },
                        })}
                        onCheckedChange={(checked) =>
                          onDefaultPresetSelectionChange({
                            ...defaultPresetSelection,
                            [preset.value]: checked,
                          })
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </InlineField>

            <InlineField>
              <ControlLabel htmlFor="placeholder" propName="placeholder">
                Placeholder
              </ControlLabel>
              <TextField
                id="placeholder"
                value={placeholder}
                onChange={(event) => onPlaceholderChange(event.target.value)}
              />
            </InlineField>

            <InlineField>
              <ControlLabel propName="presets">Custom presets</ControlLabel>
              <div className="grid gap-3 xl:grid-cols-2">
                {customPresetConfigs.map((preset) => (
                  <CustomPresetCard
                    key={preset.id}
                    preset={preset}
                    onChange={(nextPreset) =>
                      onCustomPresetConfigsChange(
                        customPresetConfigs.map((item) =>
                          item.id === nextPreset.id ? nextPreset : item,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            </InlineField>
          </div>
        </details>
      </CardContent>
    </PlaygroundCardShell>
  );
}
