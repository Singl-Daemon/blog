"use client";

import {
  type ClipboardEvent,
  type HTMLAttributes,
  useMemo,
  useRef,
  useState,
} from "react";

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
  for (const match of meta.matchAll(/\{"([^"]+)":\s*(\d+)-(\d+)\}/g)) {
    annotations.push({
      label: match[1],
      startLine: Number.parseInt(match[2], 10),
      endLine: Number.parseInt(match[3], 10),
    });
  }
  return annotations;
}

interface PreProps extends HTMLAttributes<HTMLPreElement> {
  "data-language"?: string;
  "data-theme"?: string;
  "data-meta"?: string;
  dataMeta?: string;
  raw?: string;
}

export function Pre({ children, ...props }: PreProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = props["data-language"] || "";

  const rawMeta = props["data-meta"] || props.dataMeta || "";
  const steps = useMemo(() => parseStepAnnotations(rawMeta), [rawMeta]);

  const writeClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    }
  };

  const handleCopy = async () => {
    const code = preRef.current?.querySelector("code")?.textContent || "";
    await writeClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectionCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }
    const fragment = selection.getRangeAt(0).cloneContents();
    fragment
      .querySelectorAll(".copy-btn, .code-lang-badge")
      .forEach((node) => {
        node.remove();
      });
    event.preventDefault();
    event.clipboardData.setData("text/plain", fragment.textContent ?? "");
  };

  return (
    <div className="code-block-wrapper" onCopy={handleSelectionCopy}>
      {lang && <span className="code-lang-badge">{lang}</span>}
      <button
        type="button"
        className={`copy-btn${copied ? " success" : ""}`}
        onClick={handleCopy}
        aria-label="复制代码"
        title="复制代码"
      >
        {copied ? (
          <svg
            className="copy-btn-icon"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 0 1 1.06 0z" />
          </svg>
        ) : (
          <svg
            className="copy-btn-icon"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
          </svg>
        )}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      {steps.length > 0 ? (
        <div className="code-steps">
          {steps.map((step) => (
            <div
              key={`${step.label}-${step.startLine}-${step.endLine}`}
              className="code-step-label"
              style={{
                top: `${16 + (step.startLine - 1) * 24.65}px`,
              }}
            >
              {step.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
