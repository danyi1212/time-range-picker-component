import { BookOpen } from "lucide-react";
import {
  ApiDocSectionBlock,
  ApiSectionShell,
  ApiTableOfContents,
  LinkPill,
  SectionIntro,
} from "@/demo/components/shared";
import { apiDocSections, apiTableOfContents } from "@/demo/components/api-reference-content";

export function ApiReferenceSection() {
  return (
    <ApiSectionShell>
      <div className="grid gap-6">
        <SectionIntro
          eyebrow="API"
          title="Exported API"
          description="Compact reference for the public API. Examples include the import you need, so the entries stay focused on behavior."
        />

        <div className="flex flex-wrap gap-2">
          {apiDocSections.map((section) => (
            <LinkPill
              key={section.id}
              href={`#${section.id}`}
              icon={BookOpen}
              label={section.title}
            />
          ))}
        </div>

        <div className="grid gap-8">
          {apiDocSections.map((section) => (
            <ApiDocSectionBlock key={section.id} section={section} />
          ))}
        </div>
      </div>

      <ApiTableOfContents items={apiTableOfContents} />
    </ApiSectionShell>
  );
}
