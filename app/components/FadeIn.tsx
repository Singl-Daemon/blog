"use client";

import type { CSSProperties, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  style?: CSSProperties;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 12,
  className,
  style,
}: FadeInProps) {
  return (
    <div
      className={className ? `fade-in ${className}` : "fade-in"}
      style={{
        ...style,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        ["--fade-y" as string]: `${yOffset}px`,
      }}
    >
      {children}
    </div>
  );
}

