import * as React from "react";
import { formatDuration, formatRangeDisplay, resolveTimeRange } from "@danyi1212/time-range-picker";
import type { ClockFormat } from "@danyi1212/time-range-picker";
import type { Locale } from "date-fns";
import { ArrowUpRight, Check, Code2, Timer } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { inferCodeLanguage } from "@/lib/code-language";
import type {
  ApiDocEntry,
  ApiDocSection,
  ApiTableOfContentsItem,
  CustomPresetConfig,
} from "@/demo/types";
import { getPropReferenceId } from "@/demo/utils";

interface InlineSelectionDetailsProps {
  range: ReturnType<typeof resolveTimeRange> | null;
  clockFormat: ClockFormat;
  locale: Locale;
  weekStartsOn: 0 | 1;
}

export function InlineSelectionDetails({
  range,
  clockFormat,
  locale,
  weekStartsOn,
}: InlineSelectionDetailsProps) {
  if (!range) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 p-4">
        <div className="text-sm font-medium">Selected range</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a preset or type a range to inspect the resolved timestamps.
        </p>
      </div>
    );
  }

  const duration = formatDuration(range.start, range.end, {
    clockFormat,
    locale,
    weekStartsOn,
  });
  const summary = formatRangeDisplay(range, {
    clockFormat,
    locale,
    weekStartsOn,
  });

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-background/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="flex items-center gap-2 text-base font-semibold">
            <Timer className="size-5" />
            Selected Range
          </span>
          <div className="text-sm text-muted-foreground">{summary}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {duration}
          </Badge>
          {range.isLive && (
            <Badge variant="secondary" className="text-xs font-normal">
              Live
            </Badge>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <DetailTile label="Range">
          <div className="text-sm text-foreground">{summary}</div>
        </DetailTile>
        <DetailTile label="Start">
          <ResolvedDateTime value={range.start} />
        </DetailTile>
        <DetailTile label={range.isLive ? "End (now)" : "End"}>
          <ResolvedDateTime value={range.end} />
        </DetailTile>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <IsoTile label="Start ISO" value={range.start.toISOString()} />
        <IsoTile
          label={range.isLive ? "End ISO (now)" : "End ISO"}
          value={range.end.toISOString()}
        />
      </div>
    </div>
  );
}

function DetailTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 min-w-0">{children}</div>
    </div>
  );
}

function ResolvedDateTime({ value }: { value: Date }) {
  const date = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);

  return (
    <div className="space-y-1">
      <div className="text-sm text-foreground">{date}</div>
      <div className="font-mono text-sm text-muted-foreground">{time}</div>
    </div>
  );
}

function IsoTile({ label, value }: { label: string; value: string }) {
  return (
    <DetailTile label={label}>
      <div className="font-mono text-sm leading-6 break-all text-muted-foreground">{value}</div>
    </DetailTile>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-2">
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}

export function LinkPill({
  icon: Icon,
  label,
  detail,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail?: string;
  href: string;
}) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm transition hover:border-border hover:bg-background"
    >
      <Icon className="size-4" />
      <span className="font-medium">{label}</span>
      {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
      <ArrowUpRight className="size-4 text-muted-foreground" />
    </a>
  );
}

export function QuickInstallStep({ title, code }: { title: string; code: string }) {
  return <CodeBlock code={code} language="bash" title={title} />;
}

export function ApiDocSectionBlock({ section }: { section: ApiDocSection }) {
  return (
    <section id={section.id} className="scroll-mt-28 space-y-4">
      <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
      <div className="space-y-5">
        {section.entries.map((entry) => (
          <ApiDocEntryBlock key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function ApiDocEntryBlock({ entry }: { entry: ApiDocEntry }) {
  return (
    <article id={entry.id} className="scroll-mt-28 border-t border-border/70 pt-4">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-lg font-semibold tracking-tight">
            <a href={`#${entry.id}`} className="transition hover:text-primary">
              {entry.name}
            </a>
          </h4>
          <Badge variant="secondary" className="font-mono text-[11px]">
            {entry.type}
          </Badge>
        </div>

        <p className="max-w-3xl text-sm text-muted-foreground">{entry.description}</p>
        <ApiDocMeta entry={entry} />

        {entry.example ? (
          <CodeBlock
            showHeader={false}
            code={entry.example}
            language={inferCodeLanguage(entry.example)}
            title="Example"
            className="bg-background/40"
          />
        ) : null}
      </div>
    </article>
  );
}

function ApiDocMeta({ entry }: { entry: ApiDocEntry }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      {entry.defaultValue ? (
        <span>
          default <code className="font-mono text-foreground">{entry.defaultValue}</code>
        </span>
      ) : null}
    </div>
  );
}

export function ApiTableOfContents({ items }: { items: ApiTableOfContentsItem[] }) {
  const activeId = useActiveHeading(items.map((item) => item.id));

  return (
    <aside className="hidden self-start xl:sticky xl:top-28 xl:block">
      <nav
        aria-label="API reference table of contents"
        className="max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded-[24px] border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur"
      >
        <div className="mb-4 text-sm font-semibold tracking-tight text-foreground">
          On This Page
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[
                  "block rounded-lg px-3 py-2 text-sm leading-5 transition",
                  item.level === 1
                    ? "ml-3 text-muted-foreground"
                    : "font-medium text-foreground/80",
                  isActive ? "bg-muted text-foreground" : "hover:bg-muted/70 hover:text-foreground",
                ].join(" ")}
              >
                <span className="block whitespace-nowrap">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = React.useState<string>(ids[0] ?? "");

  React.useEffect(() => {
    if (ids.length === 0) {
      return;
    }

    const resolveActiveHeading = () => {
      const headings = ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element instanceof HTMLElement);

      if (headings.length === 0) {
        return;
      }

      const scrollOffset = 140;
      let nextActiveId = headings[0].id;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - scrollOffset <= 0) {
          nextActiveId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(nextActiveId);
    };

    resolveActiveHeading();
    window.addEventListener("scroll", resolveActiveHeading, { passive: true });
    window.addEventListener("resize", resolveActiveHeading);

    return () => {
      window.removeEventListener("scroll", resolveActiveHeading);
      window.removeEventListener("resize", resolveActiveHeading);
    };
  }, [ids]);

  return activeId;
}

export function CodeExample({ title, code }: { title: string; code: string }) {
  return (
    <Card className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Code2 className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <CodeBlock
          showHeader={false}
          code={code}
          language={inferCodeLanguage(code)}
          title={title}
        />
      </CardContent>
    </Card>
  );
}

export function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
        <Check className="size-3.5" />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

export function ControlLabel({
  htmlFor,
  propName,
  children,
}: React.LabelHTMLAttributes<HTMLLabelElement> & { propName: string }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor} className="text-foreground">
        {children}
      </Label>
      <ReferenceButton
        href={`#${getPropReferenceId(propName)}`}
        label={`Open ${propName} reference`}
      />
    </div>
  );
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className={props.className} />;
}

export function ToggleButtonGroup({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <ToggleGroup
      id={id}
      type="single"
      value={value}
      variant="outline"
      className="w-full rounded-md border border-input bg-background p-1 shadow-xs"
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="h-8 flex-1 rounded-sm border-0 px-3 text-sm shadow-none"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function SelectField({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function InlineField({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className ? `space-y-2 ${className}` : "space-y-2"}>{children}</div>;
}

export function SwitchRow({
  id,
  checked,
  label,
  description,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  description?: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-left transition hover:border-border"
    >
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? (
          <span className="block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

export function CheckboxRow({
  id,
  checked,
  disabled = false,
  label,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={
        disabled
          ? "flex cursor-not-allowed items-center gap-3 rounded-2xl border border-border/70 bg-background/40 px-3 py-2 text-sm text-muted-foreground"
          : "flex cursor-pointer items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
      }
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function CheckboxCard({
  checked,
  disabled = false,
  label,
  hint,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  hint: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={
        disabled
          ? "flex cursor-not-allowed gap-3 rounded-2xl border border-border/70 bg-background/40 p-3 text-muted-foreground"
          : "flex cursor-pointer gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 transition hover:border-border"
      }
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)}
        className="mt-1"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

export function CustomPresetCard({
  preset,
  onChange,
}: {
  preset: CustomPresetConfig;
  onChange: (preset: CustomPresetConfig) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
      <CheckboxRow
        id={`preset-enabled-${preset.id}`}
        checked={preset.enabled}
        label={`${preset.label} (${preset.shortcut})`}
        onCheckedChange={(enabled) => onChange({ ...preset, enabled })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <InlineField>
          <label
            htmlFor={`preset-start-${preset.id}`}
            className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            Start time
          </label>
          <TextField
            id={`preset-start-${preset.id}`}
            type="time"
            value={preset.startTime}
            onChange={(event) => onChange({ ...preset, startTime: event.target.value })}
          />
        </InlineField>
        <InlineField>
          <label
            htmlFor={`preset-end-${preset.id}`}
            className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            End time
          </label>
          <TextField
            id={`preset-end-${preset.id}`}
            type="time"
            value={preset.endTime}
            onChange={(event) => onChange({ ...preset, endTime: event.target.value })}
          />
        </InlineField>
      </div>
      <p className="text-xs text-muted-foreground">
        Hint: {preset.startTime} - {preset.endTime}
      </p>
    </div>
  );
}

function ReferenceButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex size-5 items-center justify-center rounded-full border border-border/70 bg-background/80 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
    >
      ?
    </a>
  );
}

export function InstallCardShell({ children }: { children: React.ReactNode }) {
  return (
    <Card id="install" className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
      {children}
    </Card>
  );
}

export function PlaygroundCardShell({ children }: { children: React.ReactNode }) {
  return (
    <Card id="playground" className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
      {children}
    </Card>
  );
}

export function ApiSectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="api"
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-10"
    >
      {children}
    </section>
  );
}

export function ExamplesSectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section id="examples" className="grid gap-6">
      {children}
    </section>
  );
}
