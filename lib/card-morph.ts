import { skipActiveViewTransition } from "@/lib/motion";
import { capturePageEnter, markMorphEnter } from "@/lib/page-motion";

const EASE_MOVE = "cubic-bezier(0.22, 0.82, 0.24, 1)";
const EASE_TYPE = "cubic-bezier(0.4, 0, 0.2, 1)";
const DURATION = 360;
const LINE_HEIGHT = "1.3";

type MorphRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type TextSnap = {
  rect: MorphRect;
  fontSize: number;
  color: string;
  fontFamily: string;
  letterSpacing: string;
  text: string;
  lines?: string[];
};

type Pending = {
  slug: string;
  title: TextSnap | null;
};

let pendingExpand: Pending | null = null;
let pendingCollapse: Pending | null = null;
let flyer: HTMLElement | null = null;
let covered: HTMLElement | null = null;
let active: Animation | null = null;
let lastVisual: TextSnap | null = null;
let destLive: HTMLElement | null = null;
let destCard: HTMLElement | null = null;
let destSnap: TextSnap | null = null;
let destMode: "expand" | "collapse" | null = null;
let destWatch: ResizeObserver | null = null;
let destRaf = 0;
let safetyTimer = 0;
let pendingTimer = 0;
let liftTimer = 0;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isUsable(snap: TextSnap | null): snap is TextSnap {
  return Boolean(snap && snap.rect.width >= 8 && snap.rect.height >= 4);
}

function near(a: number, b: number, epsilon = 0.5) {
  return Math.abs(a - b) < epsilon;
}

function sameDest(a: TextSnap, b: TextSnap) {
  return (
    near(a.rect.left, b.rect.left) &&
    near(a.rect.top, b.rect.top) &&
    near(a.rect.width, b.rect.width) &&
    near(a.fontSize, b.fontSize) &&
    a.color === b.color &&
    (a.lines?.join("\n") ?? a.text) === (b.lines?.join("\n") ?? b.text)
  );
}

function snapOf(el: Element | null): TextSnap | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  const cs = getComputedStyle(el);
  const text = el.textContent?.trim() ?? "";
  if (!text) return null;
  const base = Number.parseFloat(cs.fontSize) || 16;
  let scale = 1;
  if (cs.transform && cs.transform !== "none") {
    try {
      scale = Math.abs(new DOMMatrixReadOnly(cs.transform).m11) || 1;
    } catch {
      scale = 1;
    }
  }
  const snap: TextSnap = {
    rect: { left: r.left, top: r.top, width: r.width, height: r.height },
    fontSize: base * scale,
    color: cs.color,
    fontFamily: cs.fontFamily,
    letterSpacing: cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing,
    text,
  };
  if (el === flyer) lastVisual = snap;
  return snap;
}

function neutralizeEnterOffset(from: HTMLElement) {
  let node: HTMLElement | null = from;
  while (node && node !== document.body) {
    if (
      node.classList.contains("page-shell") ||
      node.classList.contains("stagger-in-item") ||
      node.classList.contains("fade-in")
    ) {
      node.style.setProperty("--fade-y", "0px");
      node.style.transform = "none";
    }
    node = node.parentElement;
  }
}

function copyTitleStyles(to: HTMLElement, from: HTMLElement) {
  const cs = getComputedStyle(from);
  to.style.fontFamily = cs.fontFamily;
  to.style.fontWeight = cs.fontWeight;
  to.style.fontStyle = cs.fontStyle;
  to.style.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
  to.style.wordSpacing = cs.wordSpacing;
  to.style.wordBreak = cs.wordBreak;
  to.style.overflowWrap = cs.overflowWrap;
  to.style.lineBreak = cs.lineBreak;
  to.style.hyphens = cs.hyphens;
  to.style.whiteSpace = cs.whiteSpace;
  to.style.textRendering = cs.textRendering;
  to.style.fontKerning = cs.fontKerning;
  to.style.fontFeatureSettings = cs.fontFeatureSettings;
  to.style.fontVariationSettings = cs.fontVariationSettings;
}

function textAt(el: HTMLElement, index: number): [Text, number] | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let left = index;
  let node = walker.nextNode();
  while (node) {
    const len = node.textContent?.length ?? 0;
    if (left < len) return [node as Text, left];
    left -= len;
    node = walker.nextNode();
  }
  return null;
}

function readLines(el: HTMLElement): string[] {
  const text = el.textContent ?? "";
  if (!text) return [];
  const range = document.createRange();
  const lines: string[] = [];
  let lineStart = 0;
  let lastTop: number | null = null;
  for (let i = 0; i < text.length; i += 1) {
    const pos = textAt(el, i);
    if (!pos) break;
    range.setStart(pos[0], pos[1]);
    range.setEnd(pos[0], pos[1] + 1);
    const rect = range.getBoundingClientRect();
    if (rect.height < 1) continue;
    if (lastTop !== null && rect.top - lastTop > Math.max(4, rect.height * 0.4)) {
      const chunk = text.slice(lineStart, i);
      if (chunk) lines.push(chunk);
      lineStart = i;
    }
    lastTop = rect.top;
  }
  const tail = text.slice(lineStart);
  if (tail) lines.push(tail);
  return lines.length > 0 ? lines : [text];
}

function applyFlyerLines(el: HTMLElement, lines: string[] | undefined, text: string) {
  if (!lines || lines.length <= 1) {
    el.textContent = text;
    return;
  }
  el.replaceChildren();
  for (let i = 0; i < lines.length; i += 1) {
    if (i > 0) el.appendChild(document.createElement("br"));
    el.appendChild(document.createTextNode(lines[i]));
  }
}

function snapExpandTitleDest(title: HTMLElement): TextSnap | null {
  neutralizeEnterOffset(title);
  const snap = snapOf(title);
  if (!snap) return null;
  const box = title.getBoundingClientRect();
  snap.rect.left = box.left;
  snap.rect.top = box.top;
  snap.rect.width = Math.max(8, title.clientWidth);
  snap.lines = readLines(title);
  return snap;
}

function snapCardTitleDest(title: HTMLElement, card: HTMLElement): TextSnap | null {
  const text = title.textContent?.trim() ?? "";
  if (!text) return null;
  const body = card.querySelector("[data-card-morph-body]") ?? card;
  const cardRect = card.getBoundingClientRect();
  const pad = getComputedStyle(body);
  const top = Number.parseFloat(pad.paddingTop) || 24;
  const left = Number.parseFloat(pad.paddingLeft) || 24;
  const right = Number.parseFloat(pad.paddingRight) || 24;
  const cs = getComputedStyle(title);
  const fontSize = Number.parseFloat(cs.fontSize) || 22;
  return {
    rect: {
      left: cardRect.left + left,
      top: cardRect.top + top,
      width: Math.max(8, cardRect.width - left - right),
      height: fontSize * 1.3,
    },
    fontSize,
    color: cs.color,
    fontFamily: cs.fontFamily,
    letterSpacing: cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing,
    text,
    lines: readLines(title),
  };
}

function animationProgress() {
  if (!active?.effect) return 0;
  const progress = active.effect.getComputedTiming().progress;
  return typeof progress === "number" ? progress : 0;
}

function remainingMs() {
  return Math.max(160, DURATION * (1 - animationProgress()));
}

function reverseMs() {
  return Math.max(160, DURATION * animationProgress());
}

function markExpandMorph() {
  markMorphEnter();
  document.documentElement.dataset.cardMorph = "expand";
}

function clearExpandMorph() {
  delete document.documentElement.dataset.cardMorph;
}

function freezeFlyer(): TextSnap | null {
  const current = flyer ? snapOf(flyer) ?? lastVisual : lastVisual;
  if (active) {
    active.cancel();
    active = null;
  }
  if (flyer) {
    for (const anim of flyer.getAnimations()) anim.cancel();
  }
  if (flyer && isUsable(current)) applyFlyerSnap(flyer, current);
  return isUsable(current) ? current : null;
}

function cover(el: HTMLElement | null) {
  if (covered && covered !== el) covered.style.visibility = "";
  covered = el;
  if (el) el.style.visibility = "hidden";
}

function uncover() {
  if (covered?.isConnected) covered.style.visibility = "";
  covered = null;
}

function quietCardSlot(card: HTMLElement) {
  const item = card.closest(".stagger-in-item");
  if (item instanceof HTMLElement) {
    item.style.animation = "none";
    item.style.transform = "none";
    item.style.opacity = "1";
  }
  card.style.transition = "none";
  card.style.transform = "none";
}

function applyFlyerSnap(el: HTMLElement, snap: TextSnap) {
  el.style.left = `${snap.rect.left}px`;
  el.style.top = `${snap.rect.top}px`;
  el.style.width = `${snap.rect.width}px`;
  el.style.height = "auto";
  el.style.maxHeight = "none";
  el.style.fontSize = `${snap.fontSize}px`;
  el.style.color = snap.color;
  el.style.fontFamily = snap.fontFamily;
  el.style.letterSpacing = snap.letterSpacing;
  el.style.lineHeight = LINE_HEIGHT;
  el.style.transform = "none";
  lastVisual = snap;
}

function adoptFluentTokens(target: HTMLElement) {
  const provider = document.querySelector(".fui-FluentProvider");
  if (!provider) return;
  const source = getComputedStyle(provider);
  for (const name of source) {
    if (name.startsWith("--")) {
      target.style.setProperty(name, source.getPropertyValue(name));
    }
  }
}

function armSafety() {
  window.clearTimeout(safetyTimer);
  safetyTimer = window.setTimeout(() => {
    commitToLive();
  }, DURATION + 240);
}

function armPendingTimeout() {
  window.clearTimeout(pendingTimer);
  pendingTimer = window.setTimeout(() => {
    if (pendingExpand) commitToLive();
  }, 2000);
}

function morphLayer() {
  let layer = document.getElementById("card-morph-layer");
  if (!(layer instanceof HTMLElement)) {
    layer = document.createElement("div");
    layer.id = "card-morph-layer";
    layer.className = "card-morph-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.position = "fixed";
    layer.style.left = "0";
    layer.style.top = "0";
    layer.style.width = "0";
    layer.style.height = "0";
    layer.style.overflow = "visible";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = "40";
    (document.body ?? document.documentElement).appendChild(layer);
    adoptFluentTokens(layer);
  }
  return layer;
}

function ensureFlyer(from: TextSnap) {
  if (!flyer) {
    flyer = document.createElement("div");
    flyer.className = "card-morph-title";
    flyer.setAttribute("aria-hidden", "true");
    flyer.style.position = "fixed";
    flyer.style.inset = "auto";
    flyer.style.margin = "0";
    flyer.style.padding = "0";
    flyer.style.border = "none";
    flyer.style.zIndex = "40";
    flyer.style.pointerEvents = "none";
    flyer.style.fontWeight = "700";
    flyer.style.whiteSpace = "normal";
    flyer.style.overflow = "visible";
    flyer.style.textAlign = "left";
    flyer.style.boxSizing = "border-box";
    flyer.style.lineHeight = LINE_HEIGHT;
    flyer.style.height = "auto";
    flyer.style.maxHeight = "none";
    flyer.style.opacity = "1";
    morphLayer().appendChild(flyer);
  }
  flyer.textContent = from.text;
  applyFlyerSnap(flyer, from);
  return flyer;
}

function dropFlyer() {
  flyer?.remove();
  flyer = null;
  lastVisual = null;
  document.getElementById("card-morph-layer")?.remove();
}

function liftTitle(el: Element | null, snap: TextSnap | null) {
  if (!isUsable(snap) || !(el instanceof HTMLElement)) return;
  cover(el);
  if (flyer && isUsable(snapOf(flyer))) return;
  ensureFlyer(snap);
}

function stopDestWatch() {
  destWatch?.disconnect();
  destWatch = null;
  destLive = null;
  destCard = null;
  destSnap = null;
  destMode = null;
  if (destRaf) {
    cancelAnimationFrame(destRaf);
    destRaf = 0;
  }
  window.removeEventListener("scroll", scheduleDestRetarget, true);
  window.removeEventListener("resize", scheduleDestRetarget);
}

function scheduleDestRetarget() {
  if (destRaf || !destLive) return;
  destRaf = requestAnimationFrame(() => {
    destRaf = 0;
    retargetDest();
  });
}

function readDest(): TextSnap | null {
  if (destCard && destLive) return snapCardTitleDest(destLive, destCard);
  return destLive ? snapExpandTitleDest(destLive) : null;
}

function retargetDest() {
  if (!destLive || !flyer) return;
  const next = readDest();
  if (!isUsable(next)) return;
  if (destSnap && sameDest(next, destSnap)) return;
  destSnap = next;
  if (flyer && destLive) {
    copyTitleStyles(flyer, destLive);
    applyFlyerLines(flyer, next.lines, next.text);
  }
  const anim = animateFlyerTo(next, remainingMs(), destMode ?? "expand");
  if (anim) bindCommit(anim);
}

function watchDest(live: HTMLElement, card: HTMLElement | null) {
  destWatch?.disconnect();
  destWatch = null;
  if (destRaf) {
    cancelAnimationFrame(destRaf);
    destRaf = 0;
  }
  window.removeEventListener("scroll", scheduleDestRetarget, true);
  window.removeEventListener("resize", scheduleDestRetarget);

  destLive = live;
  destCard = card;
  destWatch = new ResizeObserver(scheduleDestRetarget);
  destWatch.observe(card ?? live);
  window.addEventListener("scroll", scheduleDestRetarget, {
    passive: true,
    capture: true,
  });
  window.addEventListener("resize", scheduleDestRetarget);
  void document.fonts?.ready.then(scheduleDestRetarget);
}

function animateFlyerTo(
  to: TextSnap,
  duration: number,
  mode: "expand" | "collapse",
) {
  if (!flyer || !isUsable(to)) return null;

  const from = freezeFlyer() ?? lastVisual;
  if (!isUsable(from)) return null;

  applyFlyerSnap(flyer, from);

  if (mode === "expand") {
    flyer.style.width = `${to.rect.width}px`;
  }

  const move = flyer.animate(
    [
      {
        left: `${from.rect.left}px`,
        top: `${from.rect.top}px`,
        color: from.color,
      },
      {
        left: `${to.rect.left}px`,
        top: `${to.rect.top}px`,
        color: to.color,
      },
    ],
    { duration, easing: EASE_MOVE, fill: "forwards" },
  );
  const typeFrom: Keyframe = {
    fontSize: `${from.fontSize}px`,
    letterSpacing: from.letterSpacing,
  };
  const typeTo: Keyframe = {
    fontSize: `${to.fontSize}px`,
    letterSpacing: to.letterSpacing,
  };
  if (mode === "collapse") {
    typeFrom.width = `${from.rect.width}px`;
    typeTo.width = `${to.rect.width}px`;
  }
  flyer.animate([typeFrom, typeTo], {
    duration,
    easing: EASE_TYPE,
    fill: "forwards",
  });

  active = move;
  move.addEventListener("cancel", () => {
    if (active === move) active = null;
  });
  return move;
}

function bindCommit(anim: Animation) {
  anim.addEventListener("finish", () => {
    if (active !== anim) return;
    active = null;
    commitToLive();
  });
}

function commitToLive() {
  window.clearTimeout(safetyTimer);
  window.clearTimeout(pendingTimer);
  window.clearTimeout(liftTimer);
  safetyTimer = 0;
  pendingTimer = 0;
  liftTimer = 0;
  pendingExpand = null;
  pendingCollapse = null;
  if (destLive?.isConnected && flyer) {
    const dest = readDest();
    if (isUsable(dest)) applyFlyerSnap(flyer, dest);
  }
  stopDestWatch();
  dropFlyer();
  uncover();
  clearExpandMorph();
  active = null;
}

function currentTitleSnap(): TextSnap | null {
  if (flyer) return snapOf(flyer) ?? lastVisual;
  return snapOf(
    document.querySelector("[data-card-morph-frame] [data-card-morph-title]"),
  );
}

export function armCardExpand(slug: string, card: HTMLElement) {
  if (reducedMotion()) {
    pendingExpand = null;
    return;
  }
  skipActiveViewTransition();
  pendingCollapse = null;
  stopDestWatch();
  const visual = freezeFlyer();

  const titleEl = card.querySelector("[data-card-morph-title]");
  const title = snapOf(titleEl);
  const start = isUsable(visual)
    ? { ...visual, text: title?.text || visual.text }
    : title;
  pendingExpand = { slug, title: start };
  armPendingTimeout();

  // Covering the clicked title in the same click turn cancels the link default.
  window.clearTimeout(liftTimer);
  liftTimer = window.setTimeout(() => {
    liftTimer = 0;
    if (pendingExpand?.slug !== slug) return;
    markExpandMorph();
    liftTitle(titleEl, start);
  }, 0);
}

export function peekPendingExpandSlug() {
  return pendingExpand?.slug ?? null;
}

export function takePendingExpand(slug: string): Pending | null {
  if (pendingExpand?.slug !== slug) return null;
  const next = pendingExpand;
  pendingExpand = null;
  return next;
}

function playTo(
  live: HTMLElement,
  from: TextSnap | null,
  mode: "expand" | "collapse",
) {
  const card = live.closest<HTMLElement>(".post-card");
  if (card) {
    neutralizeEnterOffset(card);
    quietCardSlot(card);
  } else {
    neutralizeEnterOffset(live);
  }

  cover(live);
  destLive = live;
  destCard = mode === "collapse" ? card : null;
  destMode = mode;
  const dest =
    destCard && destLive
      ? snapCardTitleDest(destLive, destCard)
      : snapExpandTitleDest(live);
  const start = (flyer && snapOf(flyer)) || lastVisual || from;
  if (!isUsable(dest) || !isUsable(start)) {
    commitToLive();
    return;
  }

  destSnap = dest;
  const node = ensureFlyer(start);
  copyTitleStyles(node, live);
  applyFlyerLines(node, dest.lines, dest.text);

  watchDest(live, destCard);
  skipActiveViewTransition();
  window.clearTimeout(pendingTimer);
  pendingTimer = 0;
  const anim = animateFlyerTo(dest, remainingMs(), mode);
  if (!anim) {
    commitToLive();
    return;
  }
  armSafety();
  bindCommit(anim);
}

export function playExpand(header: HTMLElement, pending: Pending) {
  if (reducedMotion()) {
    commitToLive();
    return;
  }
  const live = header.querySelector<HTMLElement>("[data-card-morph-title]");
  if (!live) {
    commitToLive();
    return;
  }
  playTo(live, pending.title, "expand");
}

export function snapshotArticleForCollapse(slug: string) {
  if (reducedMotion()) return;
  clearExpandMorph();
  const duration = destMode === "expand" ? reverseMs() : undefined;
  capturePageEnter(duration);
  const live = document.querySelector(
    "[data-card-morph-frame] [data-card-morph-title]",
  );
  const article =
    live instanceof HTMLElement ? snapExpandTitleDest(live) : currentTitleSnap();
  pendingCollapse = { slug, title: article ?? currentTitleSnap() };
  liftTitle(live, pendingCollapse.title);
}

export function playPendingCollapse(): boolean {
  const pending = pendingCollapse;
  if (!pending) return true;

  const cardTitle = document.querySelector<HTMLElement>(
    `[data-post-slug="${pending.slug}"] [data-card-morph-title]`,
  );
  if (!cardTitle) return false;
  pendingCollapse = null;
  playTo(cardTitle, pending.title, "collapse");
  return true;
}

export function interruptCardMorph() {
  commitToLive();
}
