"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function readProgress() {
  const article = document.querySelector(".post-article-body");
  const root = article instanceof HTMLElement ? article : null;
  if (!root) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max <= 1 ? 1 : clamp01(window.scrollY / max);
  }

  const top = root.getBoundingClientRect().top + window.scrollY;
  const max = root.offsetHeight - window.innerHeight;
  if (max <= 1) return 1;
  return clamp01((window.scrollY - top) / max);
}

export default function ReadingProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const active = pathname.startsWith("/posts/");

  useLayoutEffect(() => {
    const bar = barRef.current;
    const host = hostRef.current;
    if (!bar || !host) return;

    const apply = (value: number, immediate = false) => {
      bar.style.transition = immediate ? "none" : "";
      bar.style.transform = `scaleX(${value})`;
      bar.setAttribute("aria-valuenow", String(Math.round(value * 100)));
      if (immediate) {
        void bar.offsetHeight;
        bar.style.transition = "";
      }
    };

    if (!active) {
      host.hidden = true;
      apply(0, true);
      return;
    }

    host.hidden = false;
    apply(readProgress(), true);

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply(readProgress());
      });
    };

    const main = host.closest(".site-main");
    const ro = new ResizeObserver(schedule);
    if (main instanceof HTMLElement) ro.observe(main);
    const article = document.querySelector(".post-article-body");
    if (article instanceof HTMLElement) ro.observe(article);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [active, pathname]);

  return (
    <div
      ref={hostRef}
      className="reading-progress"
      hidden
      aria-hidden={!active}
    >
      <div
        ref={barRef}
        className="reading-progress-bar"
        role="progressbar"
        aria-label="阅读进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      />
    </div>
  );
}
