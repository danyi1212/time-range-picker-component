import { CalendarClock, Github, Monitor, Moon, Star, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemePreference } from "@/demo/types";

const repoUrl = "https://github.com/danyi1212/time-range-picker";

export function SiteHeader({
  githubStars,
  themePreference,
  onToggleTheme,
}: {
  githubStars: string | null;
  themePreference: ThemePreference;
  onToggleTheme: () => void;
}) {
  const themeIcon =
    themePreference === "system" ? (
      <Monitor className="size-4" />
    ) : themePreference === "dark" ? (
      <Moon className="size-4" />
    ) : (
      <Sun className="size-4" />
    );

  const themeLabel =
    themePreference === "system" ? "System" : themePreference === "dark" ? "Dark" : "Light";

  return (
    <header className="sticky top-4 z-20 rounded-3xl border border-border/70 bg-background/85 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground">
            <CalendarClock className="size-5" />
          </div>
          <div>
            <div className="text-xl font-semibold">Time Range Picker</div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {[
            { href: "#install", label: "Install" },
            { href: "#playground", label: "Playground" },
            { href: "#api", label: "API" },
            { href: "#examples", label: "Examples" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={
                githubStars
                  ? `Open GitHub repository and star the project. Current stars: ${githubStars}`
                  : "Open GitHub repository and star the project"
              }
            >
              <Star className="size-4" />
              {githubStars ?? "Star"}
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={repoUrl} target="_blank" rel="noreferrer">
              <Github className="size-4" />
              GitHub
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTheme}
            aria-label={`Theme: ${themeLabel}`}
            className="gap-2 font-mono text-xs"
          >
            {themeIcon}
            {themeLabel}
          </Button>
        </div>
      </div>
    </header>
  );
}
