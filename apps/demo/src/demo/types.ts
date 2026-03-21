import type { Locale } from "date-fns";

export type LocaleKey = string;
export type ThemePreference = "system" | "light" | "dark";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type PresetSelection = Record<string, boolean>;

export interface LocaleOption {
  key: string;
  code: string;
  locale: Locale;
}

export interface CustomPresetConfig {
  id: string;
  label: string;
  shortcut: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface ApiDocEntry {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  example?: string;
}

export interface ApiDocSection {
  id: string;
  title: string;
  entries: ApiDocEntry[];
}

export interface ApiTableOfContentsItem {
  id: string;
  label: string;
  level: 0 | 1;
}
