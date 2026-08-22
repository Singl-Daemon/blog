import { scrollWindowInstant } from "@/lib/motion";

const KEY = "blog-nav-stack";
const MAX_FRAMES = 20;

export type NavFrame = {
  href: string;
  slug: string;
  scrollY: number;
  morph: boolean;
};

function pathSearch(href: string) {
  return href.split("#")[0] ?? href;
}

export function isPostHref(href: string) {
  return pathSearch(href).startsWith("/posts/");
}

export function isHomeHref(href: string) {
  const path = pathSearch(href);
  return path === "/" || path.startsWith("/?");
}

function readStack(): NavFrame[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      if (typeof row.href !== "string" || typeof row.slug !== "string") {
        return [];
      }
      return [
        {
          href: row.href,
          slug: row.slug,
          scrollY: typeof row.scrollY === "number" ? row.scrollY : 0,
          morph: row.morph === true || row.source === "home",
        },
      ];
    });
  } catch {
    return [];
  }
}

function writeStack(stack: NavFrame[]) {
  sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-MAX_FRAMES)));
}

export function currentAppHref(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || "/";
  }
  return `${path}${window.location.search}`;
}

export function pushReturn(
  slug: string,
  options?: { morph?: boolean; href?: string },
) {
  const href = options?.href ?? currentAppHref();
  const frame: NavFrame = {
    href,
    slug,
    scrollY: window.scrollY,
    morph: Boolean(options?.morph),
  };
  if (!isPostHref(href)) {
    writeStack([frame]);
    return;
  }
  const stack = readStack().filter((item) => item.slug !== slug);
  stack.push(frame);
  writeStack(stack);
}

export function peekReturn(slug?: string): NavFrame | null {
  const stack = readStack();
  const top = stack[stack.length - 1];
  if (!top) return null;
  if (slug && top.slug !== slug) return null;
  return top;
}

export function consumeReturn(slug?: string): NavFrame | null {
  const top = peekReturn(slug);
  if (!top) return null;
  const stack = readStack();
  stack.pop();
  writeStack(stack);
  return top;
}

export function consumeReturnIfLanding(href = currentAppHref()) {
  const frame = peekReturn();
  if (!frame) return false;
  if (pathSearch(frame.href) !== pathSearch(href)) return false;
  consumeReturn();
  scrollWindowInstant(frame.scrollY);
  return true;
}
