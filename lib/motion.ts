import { capturePageEnter } from "@/lib/page-motion";

export function skipActiveViewTransition() {
  const vt = document.activeViewTransition;
  if (vt) vt.skipTransition();
}

export function interruptPageMotion() {
  skipActiveViewTransition();
  capturePageEnter();
}

export function replaceUrlPreservingHistory(url: string) {
  const current = window.history.state;
  const nextState =
    current && typeof current === "object"
      ? { ...current }
      : { __NA: true as const };
  window.history.replaceState(nextState, "", url);
}

const scrollKey = "blog-scroll-map";

function readScrollMap(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(scrollKey);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function disableBrowserScrollRestoration() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  try {
    sessionStorage.removeItem(scrollKey);
  } catch {
    /* ignore */
  }
}

export function scrollWindowInstant(y: number) {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, y);
  root.style.scrollBehavior = prev;
}

export function saveScroll(href: string, y = window.scrollY) {
  if (href.startsWith("/posts/")) return;
  const map = readScrollMap();
  map[href.split("#")[0] ?? href] = y;
  sessionStorage.setItem(scrollKey, JSON.stringify(map));
}

let historyRestore = false;

export function markHistoryRestore() {
  historyRestore = true;
}

export function consumeHistoryRestore() {
  const next = historyRestore;
  historyRestore = false;
  return next;
}

export function restoreSavedScroll(href: string) {
  const y = readScrollMap()[href.split("#")[0] ?? href];
  scrollWindowInstant(typeof y === "number" ? y : 0);
}
