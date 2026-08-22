"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const HIDE_MS = 500;
const MIN_THUMB = 32;
const GUTTER = 16;
const TRACK_PAD = 4;
const SELECTOR = [
  ".blog-sidebar",
  ".toc-body",
  ".code-block-wrapper pre",
  ".prose pre",
  ".prose .katex-display",
].join(",");

type Axis = "x" | "y";

type Target = {
  id: string;
  el: HTMLElement | Window;
  axis: Axis;
};

function isWindow(el: HTMLElement | Window): el is Window {
  return el === window;
}

function metrics(el: HTMLElement | Window, axis: Axis) {
  if (isWindow(el)) {
    const root = document.documentElement;
    const client = axis === "y" ? root.clientHeight : root.clientWidth;
    const scrollSize = axis === "y" ? root.scrollHeight : root.scrollWidth;
    const scroll = axis === "y" ? window.scrollY : window.scrollX;
    const length = axis === "y" ? window.innerHeight : window.innerWidth;
    return {
      client,
      scrollSize,
      scroll,
      top: axis === "y" ? 0 : window.innerHeight - GUTTER,
      left: axis === "y" ? window.innerWidth - GUTTER : 0,
      length,
    };
  }

  const rect = el.getBoundingClientRect();
  const client = axis === "y" ? el.clientHeight : el.clientWidth;
  const scrollSize = axis === "y" ? el.scrollHeight : el.scrollWidth;
  const scroll = axis === "y" ? el.scrollTop : el.scrollLeft;
  const other = axis === "y" ? "x" : "y";
  const otherOverflow =
    (other === "y" ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth) > 1;
  const length = Math.max(
    (axis === "y" ? rect.height : rect.width) - (otherOverflow ? GUTTER : 0),
    0,
  );
  return {
    client,
    scrollSize,
    scroll,
    top: axis === "y" ? rect.top : rect.bottom - GUTTER,
    left: axis === "y" ? rect.right - GUTTER : rect.left,
    length,
  };
}

function hostShown(el: HTMLElement | Window) {
  if (isWindow(el)) return true;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number.parseFloat(style.opacity) === 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 8 && rect.height > 8;
}

function overflowed(el: HTMLElement | Window, axis: Axis) {
  if (!hostShown(el)) return false;
  const m = metrics(el, axis);
  return m.scrollSize > m.client + 1 && m.length > 16;
}

function thumbSize(client: number, scrollSize: number, track: number) {
  return Math.max(MIN_THUMB, (client / Math.max(scrollSize, 1)) * track);
}

function thumbOffset(
  scroll: number,
  client: number,
  scrollSize: number,
  track: number,
  size: number,
) {
  const range = Math.max(scrollSize - client, 1);
  return (scroll / range) * Math.max(track - size, 0);
}

function clampScroll(next: number, client: number, scrollSize: number) {
  return Math.min(Math.max(next, 0), Math.max(scrollSize - client, 0));
}

function applyScroll(el: HTMLElement | Window, axis: Axis, next: number) {
  const m = metrics(el, axis);
  const value = clampScroll(next, m.client, m.scrollSize);
  if (isWindow(el)) {
    if (axis === "y") window.scrollTo(window.scrollX, value);
    else window.scrollTo(value, window.scrollY);
    return;
  }
  if (axis === "y") el.scrollTop = value;
  else el.scrollLeft = value;
}

function ScrollRail({ target, axis }: { target: HTMLElement | Window; axis: Axis }) {
  const railRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ start: number; scroll: number } | null>(null);
  const hoverRef = useRef(false);
  const hideTimer = useRef(0);

  useEffect(() => {
    const rail = railRef.current;
    const handle = handleRef.current;
    if (!rail || !handle) return;

    let raf = 0;
    const sync = () => {
      const visible = overflowed(target, axis);
      rail.style.display = visible ? "block" : "none";
      if (!visible) return;
      const m = metrics(target, axis);
      const track = Math.max(m.length - TRACK_PAD * 2, 0);
      const size = thumbSize(m.client, m.scrollSize, track);
      const offset = thumbOffset(m.scroll, m.client, m.scrollSize, track, size);
      rail.style.top = `${m.top}px`;
      rail.style.left = `${m.left}px`;
      if (axis === "y") {
        rail.style.height = `${m.length}px`;
        rail.style.width = `${GUTTER}px`;
        handle.style.height = `${size}px`;
        handle.style.transform = `translate3d(0, ${offset}px, 0)`;
      } else {
        rail.style.width = `${m.length}px`;
        rail.style.height = `${GUTTER}px`;
        handle.style.width = `${size}px`;
        handle.style.transform = `translate3d(${offset}px, 0, 0)`;
      }
    };

    const scheduleSync = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    const reveal = () => {
      rail.classList.add("is-visible");
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        if (dragRef.current || hoverRef.current) return;
        rail.classList.remove("is-visible");
      }, HIDE_MS);
    };

    const onHostScroll = () => {
      reveal();
      scheduleSync();
    };

    sync();
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("scroll", scheduleSync, { passive: true, capture: true });

    if (isWindow(target)) {
      window.addEventListener("scroll", onHostScroll, { passive: true });
      window.addEventListener("mousemove", reveal, { passive: true });
    } else {
      target.addEventListener("scroll", onHostScroll, { passive: true });
      target.addEventListener("mousemove", reveal, { passive: true });
    }

    const observed = isWindow(target) ? document.documentElement : target;
    const ro = new ResizeObserver(scheduleSync);
    ro.observe(observed);

    const watch = new MutationObserver(scheduleSync);
    if (!isWindow(target)) {
      watch.observe(target, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
      const shell = target.closest(".toc-shell, .blog-sidebar");
      if (shell && shell !== target) {
        watch.observe(shell, {
          attributes: true,
          attributeFilter: ["class", "style"],
        });
      }
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer.current);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("scroll", scheduleSync, true);
      if (isWindow(target)) {
        window.removeEventListener("scroll", onHostScroll);
        window.removeEventListener("mousemove", reveal);
      } else {
        target.removeEventListener("scroll", onHostScroll);
        target.removeEventListener("mousemove", reveal);
      }
      ro.disconnect();
      watch.disconnect();
    };
  }, [target, axis]);

  const onPointerDownHandle = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const m = metrics(target, axis);
    dragRef.current = {
      start: axis === "y" ? event.clientY : event.clientX,
      scroll: m.scroll,
    };
    railRef.current?.classList.add("is-visible", "is-dragging");
    document.documentElement.classList.add("is-scrollbar-drag");
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const m = metrics(target, axis);
    const track = Math.max(m.length - TRACK_PAD * 2, 0);
    const size = thumbSize(m.client, m.scrollSize, track);
    const pos = axis === "y" ? event.clientY : event.clientX;
    const travel = Math.max(track - size, 1);
    const range = Math.max(m.scrollSize - m.client, 1);
    applyScroll(target, axis, drag.scroll + ((pos - drag.start) / travel) * range);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    railRef.current?.classList.remove("is-dragging");
    document.documentElement.classList.remove("is-scrollbar-drag");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (hoverRef.current) return;
      railRef.current?.classList.remove("is-visible");
    }, HIDE_MS);
  };

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    document.documentElement.classList.add("is-scrollbar-drag");
    const m = metrics(target, axis);
    const track = Math.max(m.length - TRACK_PAD * 2, 0);
    const size = thumbSize(m.client, m.scrollSize, track);
    const origin = (axis === "y" ? m.top : m.left) + TRACK_PAD;
    const pos = (axis === "y" ? event.clientY : event.clientX) - origin;
    const travel = Math.max(track - size, 1);
    const range = Math.max(m.scrollSize - m.client, 1);
    applyScroll(target, axis, ((pos - size / 2) / travel) * range);
    document.documentElement.classList.remove("is-scrollbar-drag");
    railRef.current?.classList.add("is-visible");
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (hoverRef.current) return;
      railRef.current?.classList.remove("is-visible");
    }, HIDE_MS);
  };

  return (
    <div
      ref={railRef}
      className={`custom-scrollbar custom-scrollbar-${axis}`}
      aria-hidden="true"
      onPointerEnter={() => {
        hoverRef.current = true;
        railRef.current?.classList.add("is-hovered", "is-visible");
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
        railRef.current?.classList.remove("is-hovered");
        if (dragRef.current) return;
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => {
          railRef.current?.classList.remove("is-visible");
        }, HIDE_MS);
      }}
      onPointerDown={onTrackPointerDown}
    >
      <div
        ref={handleRef}
        className="custom-scrollbar-handle"
        onPointerDown={onPointerDownHandle}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </div>
  );
}

export default function CustomScrollbar() {
  const [ready, setReady] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);

  useLayoutEffect(() => {
    document.documentElement.dataset.customScrollbar = "1";
    setReady(true);
    return () => {
      delete document.documentElement.dataset.customScrollbar;
      document.documentElement.classList.remove("is-scrollbar-drag");
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const collect = () => {
      const next: Target[] = [
        { id: "window-y", el: window, axis: "y" },
        { id: "window-x", el: window, axis: "x" },
      ];
      for (const node of document.querySelectorAll<HTMLElement>(SELECTOR)) {
        const id = idOf(node);
        next.push({ id: `${id}-y`, el: node, axis: "y" });
        next.push({ id: `${id}-x`, el: node, axis: "x" });
      }
      setTargets((prev) => (sameTargets(prev, next) ? prev : next));
    };

    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(collect, 50);
    };
    const onMutate = (records: MutationRecord[]) => {
      if (
        records.every((record) => {
          const target = record.target;
          return (
            target instanceof Element &&
            Boolean(target.closest("#custom-scrollbar-root"))
          );
        })
      ) {
        return;
      }
      schedule();
    };

    collect();
    const mo = new MutationObserver(onMutate);
    mo.observe(document.body, { childList: true, subtree: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    window.addEventListener("resize", schedule);
    document.addEventListener("load", schedule, true);
    return () => {
      window.clearTimeout(timer);
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      document.removeEventListener("load", schedule, true);
    };
  }, [ready]);

  if (!ready) return null;

  return createPortal(
    <div id="custom-scrollbar-root">
      {targets.map((item) => (
        <ScrollRail key={item.id} target={item.el} axis={item.axis} />
      ))}
    </div>,
    document.body,
  );
}

let scrollbarSeq = 0;

function idOf(el: HTMLElement) {
  if (el.dataset.scrollbarId) return el.dataset.scrollbarId;
  scrollbarSeq += 1;
  const id = `sb-${scrollbarSeq}`;
  el.dataset.scrollbarId = id;
  return id;
}

function sameTargets(a: Target[], b: Target[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      Boolean(other) &&
      item.id === other.id &&
      item.axis === other.axis &&
      item.el === other.el
    );
  });
}
