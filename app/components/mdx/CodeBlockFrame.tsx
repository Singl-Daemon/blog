"use client";

import type { ClipboardEvent, ReactNode } from "react";

export function CodeBlockFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const handleSelectionCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }
    const fragment = selection.getRangeAt(0).cloneContents();
    fragment.querySelectorAll(".copy-btn, .code-lang-badge").forEach((node) => {
      node.remove();
    });
    event.preventDefault();
    event.clipboardData.setData("text/plain", fragment.textContent ?? "");
  };

  return (
    <div
      className={className ? `code-block-wrapper ${className}` : "code-block-wrapper"}
      onCopy={handleSelectionCopy}
    >
      {children}
    </div>
  );
}
