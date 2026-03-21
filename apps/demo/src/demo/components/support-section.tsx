import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistItem } from "@/demo/components/shared";

export function SupportSection() {
  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <Card className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Supported Input Formats</CardTitle>
          <CardDescription>
            Users can move between terse shortcuts and human phrasing without changing components.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Shortcuts",
              examples: ["15m", "3h", "7d", "2w", "1mo", "90d"],
            },
            {
              title: "Presets",
              examples: ["today", "yesterday", "this week", "last month", "past 90 days"],
            },
            {
              title: "Ranges",
              examples: ["Mar 3 - Mar 13", "14:00 - now", "9am - 5pm", "last friday to today"],
            },
          ].map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-border/70 bg-background/70 p-4"
            >
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {group.examples.map((example) => (
                  <li key={example} className="font-mono text-xs sm:text-sm">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/60 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Integration checklist</CardTitle>
          <CardDescription>
            The same set of details that normally get scattered between docs, README, and source
            comments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ChecklistItem text="React 18+ and Tailwind CSS 4+ in the host app." />
          <ChecklistItem text="`date-fns`, `chrono-node`, and `lucide-react` installed." />
          <ChecklistItem text="Popover, command, badge, and button primitives available." />
          <ChecklistItem text="Controlled state in the parent when the range drives filtering." />
          <ChecklistItem text="Shared options passed to both the picker and your formatting helpers." />
        </CardContent>
      </Card>
    </section>
  );
}
