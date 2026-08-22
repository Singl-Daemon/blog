const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION = 420;

type EnterSnap = {
  opacity: number;
  y: number;
};

type PageHandoff = {
  shell: EnterSnap;
};

let handoff: PageHandoff | null = null;
let handoffDuration: number | null = null;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function readSnap(el: Element | null): EnterSnap {
  if (!el) return { opacity: 1, y: 0 };
  const cs = getComputedStyle(el);
  const opacity = Number.parseFloat(cs.opacity);
  let y = 0;
  if (cs.transform && cs.transform !== "none") {
    try {
      y = new DOMMatrixReadOnly(cs.transform).f;
    } catch {
      y = 0;
    }
  }
  return {
    opacity: Number.isFinite(opacity) ? opacity : 1,
    y,
  };
}

function isMidEnter(snap: EnterSnap) {
  return snap.opacity < 0.98 || Math.abs(snap.y) > 0.5;
}

function clearPageEnterFlag() {
  const root = document.documentElement;
  delete root.dataset.pageEnter;
  root.style.removeProperty("--page-enter-opacity");
  root.style.removeProperty("--page-enter-y");
}

function setPageEnterFlag(snap: EnterSnap) {
  const root = document.documentElement;
  root.dataset.pageEnter = "handoff";
  root.style.setProperty("--page-enter-opacity", String(snap.opacity));
  root.style.setProperty("--page-enter-y", `${snap.y}px`);
}

function suppressEnter(el: HTMLElement) {
  el.style.animation = "none";
  el.style.setProperty("--fade-y", "0px");
}

function playEnter(el: HTMLElement, from: EnterSnap, duration: number) {
  suppressEnter(el);
  el.style.opacity = String(from.opacity);
  el.style.transform = from.y ? `translateY(${from.y}px)` : "none";
  const anim = el.animate(
    [
      { opacity: from.opacity, transform: `translateY(${from.y}px)` },
      { opacity: 1, transform: "none" },
    ],
    { duration, easing: EASE, fill: "forwards" },
  );
  const settle = () => {
    if (!el.isConnected) return;
    el.style.opacity = "";
    el.style.transform = "";
  };
  anim.addEventListener("finish", settle);
  anim.addEventListener("cancel", settle);
}

export function resetPageEnter() {
  handoff = null;
  handoffDuration = null;
  clearPageEnterFlag();
}

export function markMorphEnter() {
  handoff = null;
  handoffDuration = null;
  const root = document.documentElement;
  root.dataset.pageEnter = "morph";
  root.style.removeProperty("--page-enter-opacity");
  root.style.removeProperty("--page-enter-y");
}

export function capturePageEnter(duration?: number) {
  if (typeof document === "undefined" || reducedMotion()) {
    handoff = null;
    handoffDuration = null;
    clearPageEnterFlag();
    return;
  }

  const shell = document.querySelector(".page-shell");
  const snap = readSnap(shell);
  if (!isMidEnter(snap)) {
    handoff = null;
    handoffDuration = null;
    clearPageEnterFlag();
    return;
  }

  handoff = { shell: snap };
  handoffDuration =
    duration ?? Math.max(160, DURATION * (1 - clamp01(snap.opacity)));
  setPageEnterFlag(snap);
}

export function applyPageEnter() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const shell = document.querySelector(".page-shell");

  if (root.dataset.pageEnter === "morph") {
    if (shell instanceof HTMLElement) {
      suppressEnter(shell);
      shell.style.opacity = "";
      shell.style.transform = "none";
      for (const el of shell.querySelectorAll(".fade-in, .stagger-in-item")) {
        if (el instanceof HTMLElement) suppressEnter(el);
      }
    }
    handoff = null;
    handoffDuration = null;
    clearPageEnterFlag();
    return;
  }

  const from = handoff;
  const duration = handoffDuration ?? DURATION;
  handoff = null;
  handoffDuration = null;

  if (!from || !(shell instanceof HTMLElement) || reducedMotion()) {
    clearPageEnterFlag();
    return;
  }

  suppressEnter(shell);
  for (const el of shell.querySelectorAll(
    ".fade-in, .stagger-in-item, .post-article-body",
  )) {
    if (el instanceof HTMLElement) suppressEnter(el);
  }
  playEnter(shell, from.shell, duration);
  clearPageEnterFlag();
}
