"use client";

import React, { useRef, useState, useMemo } from "react";

interface StepAnnotation {
  label: string;
  startLine: number;
  endLine: number;
}

/**
 * Parse step annotations from meta string.
 * Format: {"1. Label text": 2-4} {"2. Another label": 6-8}
 */
function parseStepAnnotations(meta: string): StepAnnotation[] {
  const annotations: StepAnnotation[] = [];
  // Match {"label": start-end} patterns
  const regex = /\{"([^"]+)":\s*(\d+)-(\d+)\}/g;
  let match;
  while ((match = regex.exec(meta)) !== null) {
    annotations.push({
      label: match[1],
      startLine: parseInt(match[2], 10),
      endLine: parseInt(match[3], 10),
    });
  }
  return annotations;
}

/**
 * Custom <pre> wrapper with copy-to-clipboard button, language badge, and step annotations.
 */
export function Pre({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & {
  "data-language"?: string;
  "data-theme"?: string;
  raw?: string;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = props["data-language"] || "";
  const theme = props["data-theme"] || "";

  // Extract meta from raw prop or data attributes
  const rawMeta = (props as any)["data-meta"] || "";
  const steps = useMemo(() => parseStepAnnotations(rawMeta), [rawMeta]);

  const handleCopy = async () => {
    const code = preRef.current?.querySelector("code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for insecure contexts (e.g. HTTP)
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      {lang && <span className="code-lang-badge">{lang}</span>}
      <button
        className={`copy-btn${copied ? " success" : ""}`}
        onClick={handleCopy}
        aria-label="Copy code"
        title="Copy code"
      >
        {copied ? (
          <svg
            className="copy-btn-icon"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 0 1 1.06 0z" />
          </svg>
        ) : (
          <svg
            className="copy-btn-icon"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
          </svg>
        )}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      {steps.length > 0 && (
        <div className="code-steps" aria-hidden="true">
          {steps.map((step, i) => (
            <div
              key={i}
              className="code-step-label"
              style={{
                top: `${16 + (step.startLine - 1) * 24.65}px`,
                height: `${(step.endLine - step.startLine + 1) * 24.65}px`,
              }}
            >
              <span className="code-step-text">{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
