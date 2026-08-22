"use client";

import { useState } from "react";

export function CopyButton({ targetId }: { targetId: string }) {
  const [copied, setCopied] = useState(false);

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
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
  };

  const handleCopy = async () => {
    const pre = document.getElementById(targetId);
    const code = pre?.querySelector("code")?.textContent || "";
    await writeClipboard(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
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
  );
}
