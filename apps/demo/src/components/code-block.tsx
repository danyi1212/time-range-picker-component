"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  showHeader?: boolean;
}

export function CodeBlock({
  code,
  language = "tsx",
  title,
  className,
  showHeader = true,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains("dark"));
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-background/80",
        "shadow-[0_1px_0_color-mix(in_oklab,var(--border)_65%,transparent)_inset]",
        className,
      )}
    >
      {showHeader ? (
        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/45 px-4 py-2.5">
          <div className="min-w-0 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {title ?? language}
          </div>
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label="Copy code"
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
              "border-border/70 bg-background/90 text-muted-foreground hover:bg-background hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
            )}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label="Copy code"
          className={cn(
            "absolute top-3 right-3 z-10 inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
            "border-border/70 bg-background/90 text-muted-foreground hover:bg-background hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}

      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "transparent",
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.65",
        }}
        codeTagProps={{
          className: "font-mono",
        }}
        wrapLongLines={false}
        showLineNumbers={false}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
