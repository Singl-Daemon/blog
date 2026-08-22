// biome-ignore-all lint/security/noDangerouslySetInnerHtml: mermaid.render SVG
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/app/providers";
import { cx, type DirectiveProps, reactText } from "./mdx-utils";

export function Mermaid({ children, className }: DirectiveProps) {
  const { theme } = useTheme();
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const seq = useRef(0);
  const source = reactText(children).trim();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    const renderId = `mermaid-${reactId}-${++seq.current}`;

    void import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: theme === "dark" ? "dark" : "default",
        fontFamily: "inherit",
      });
      try {
        const result = await mermaid.render(renderId, source);
        if (!cancelled) {
          setError(false);
          setSvg(result.svg);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setSvg("");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [source, theme, reactId]);

  if (!source) return null;

  if (error) {
    return (
      <pre className={cx("mdx-mermaid-error", className)}>
        <code>{source}</code>
      </pre>
    );
  }

  return <MermaidSvg className={cx("mdx-mermaid", className)} svg={svg} />;
}

function MermaidSvg({ className, svg }: { className?: string; svg: string }) {
  return (
    <div
      className={className}
      aria-busy={!svg}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
