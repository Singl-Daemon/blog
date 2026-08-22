"use client";

import { Dismiss24Regular, List24Regular } from "@fluentui/react-icons";
import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TocItem } from "@/lib/posts";

const FAB = 52;
const PANEL_WIDTH = 300;
const SCROLL_CLOSE_PX = 72;
const TOC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function findHeading(id: string, text: string): HTMLElement | null {
  const byId = document.getElementById(id);
  if (byId) return byId;

  const normalized = text.replace(/\s*#\s*$/, "").trim();
  const headings = document.querySelectorAll<HTMLElement>(
    ".prose h1, .prose h2, .prose h3, .prose h4",
  );
  for (const heading of headings) {
    const label = heading.textContent?.replace(/\s*#\s*$/, "").trim();
    if (label === normalized) return heading;
  }
  return null;
}

export function TocFab({
  toc,
  activeId,
}: {
  toc: TocItem[];
  activeId: string;
}) {
  const [open, setOpen] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(160);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLElement>(null);
  const scrollYRef = useRef(0);
  const ignoreScrollRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted || toc.length === 0) return;
    const el = bodyRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.scrollHeight;
      if (h > 0) setBodyHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [toc, mounted]);

  useEffect(() => {
    if (!open) return;

    scrollYRef.current = window.scrollY;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onScroll = () => {
      if (ignoreScrollRef.current) return;
      if (Math.abs(window.scrollY - scrollYRef.current) >= SCROLL_CLOSE_PX) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const goToHeading = (id: string, text: string) => {
    ignoreScrollRef.current = true;
    const el = findHeading(id, text);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (el.id) {
        history.replaceState(null, "", `#${el.id}`);
      }
    }
    setOpen(false);
    window.setTimeout(() => {
      ignoreScrollRef.current = false;
    }, 900);
  };

  const visibleBody = bodyHeight;
  const openHeight = visibleBody + FAB;
  const duration = 0.28;

  const node = (
    <div ref={rootRef} className="toc-fab-root">
      <motion.div
        className={`toc-shell${open ? " is-open" : ""}`}
        initial={false}
        animate={{
          width: open ? PANEL_WIDTH : FAB,
          height: open ? openHeight : FAB,
        }}
        transition={{
          width: { duration, ease: TOC_EASE },
          height: { duration, ease: TOC_EASE },
        }}
      >
        <div className="toc-shell-glass" aria-hidden="true" />
        <nav ref={bodyRef} className="toc-body" aria-hidden={!open}>
          <div className="toc-title">目录</div>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              tabIndex={open ? 0 : -1}
              onClick={(event) => {
                event.preventDefault();
                goToHeading(item.id, item.text);
              }}
              style={{
                display: "block",
                textDecoration: "none",
                padding: "6px 0",
                paddingLeft: `${(item.level - 1) * 12}px`,
                fontSize: "14px",
                fontWeight:
                  activeId === item.id ? 700 : item.level === 1 ? 600 : 400,
                color:
                  activeId === item.id
                    ? "var(--fluent-primary)"
                    : "var(--color-text-secondary)",
              }}
            >
              {item.text}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="toc-icon-btn"
          aria-label={open ? "收起目录" : "目录"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={`toc-icon-swap${open ? " is-open" : ""}`}>
            <span className="toc-icon-swap-item toc-icon-list">
              <List24Regular />
            </span>
            <span className="toc-icon-swap-item toc-icon-close">
              <Dismiss24Regular />
            </span>
          </span>
        </button>
      </motion.div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(node, document.body);
}
