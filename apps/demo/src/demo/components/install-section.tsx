import { BookOpen, Github, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  InlineField,
  InstallCardShell,
  LinkPill,
  QuickInstallStep,
  ToggleButtonGroup,
} from "@/demo/components/shared";
import type { PackageManager } from "@/demo/types";

const repoUrl = "https://github.com/danyi1212/time-range-picker-component";
const npmUrl = "https://www.npmjs.com/package/@danyi/time-range-picker";
const registryUrl =
  "https://raw.githubusercontent.com/danyi1212/time-range-picker-component/main/packages/time-range-picker/registry/time-range-picker.json";

export function InstallSection({
  githubStars,
  githubUnavailable,
  packageManager,
  onPackageManagerChange,
}: {
  githubStars: string | null;
  githubUnavailable: boolean;
  packageManager: PackageManager;
  onPackageManagerChange: (value: PackageManager) => void;
}) {
  const installCommands = {
    npm: {
      registry: `npx shadcn@latest add ${registryUrl}`,
      package: "npm install @danyi/time-range-picker date-fns chrono-node lucide-react",
      primitives: "npx shadcn@latest add popover command badge button",
    },
    pnpm: {
      registry: `pnpm dlx shadcn@latest add ${registryUrl}`,
      package: "pnpm add @danyi/time-range-picker date-fns chrono-node lucide-react",
      primitives: "pnpm dlx shadcn@latest add popover command badge button",
    },
    yarn: {
      registry: `yarn dlx shadcn@latest add ${registryUrl}`,
      package: "yarn add @danyi/time-range-picker date-fns chrono-node lucide-react",
      primitives: "yarn dlx shadcn@latest add popover command badge button",
    },
    bun: {
      registry: `bunx shadcn@latest add ${registryUrl}`,
      package: "bun add @danyi/time-range-picker date-fns chrono-node lucide-react",
      primitives: "bunx shadcn@latest add popover command badge button",
    },
  }[packageManager];

  return (
    <InstallCardShell>
      <CardHeader className="space-y-4">
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs uppercase">
          Essentials
        </Badge>
        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Natural language time range picker
          </h1>
          <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
            Polished. Familiar. Ready for production.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkPill
            href={repoUrl}
            icon={Github}
            label={githubStars ? `GitHub ${githubStars} stars` : "GitHub"}
            detail={githubUnavailable ? "stars unavailable" : undefined}
          />
          <LinkPill href={npmUrl} icon={Package} label="npm package" />
          <LinkPill href="#api" icon={BookOpen} label="API docs" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <InlineField>
          <div className="space-y-2">
            <div className="text-sm font-medium">Package manager</div>
            <ToggleButtonGroup
              id="package-manager"
              value={packageManager}
              options={[
                { value: "npm", label: "npm" },
                { value: "pnpm", label: "pnpm" },
                { value: "yarn", label: "yarn" },
                { value: "bun", label: "bun" },
              ]}
              onChange={(value) => onPackageManagerChange(value as PackageManager)}
            />
          </div>
        </InlineField>
        <QuickInstallStep title="shadcn registry" code={installCommands.registry} />
        <QuickInstallStep title="package install" code={installCommands.package} />
        <QuickInstallStep title="required shadcn primitives" code={installCommands.primitives} />
      </CardContent>
    </InstallCardShell>
  );
}
