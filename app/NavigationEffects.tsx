"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  addTransitionType,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import {
  applyDocumentTitle,
  formatDocumentTitle,
  rememberDocumentTitle,
} from "@/lib/document-title";
import {
  interruptCardMorph,
  snapshotArticleForCollapse,
} from "@/lib/card-morph";
import {
  disableBrowserScrollRestoration,
  interruptPageMotion,
  markHistoryRestore,
  saveScroll,
  skipActiveViewTransition,
} from "@/lib/motion";
import {
  currentAppHref,
  isHomeHref,
  isPostHref,
  peekReturn,
  pushReturn,
} from "@/lib/nav-stack";

function appHrefFromLocation() {
  return currentAppHref() + window.location.hash;
}

function pathSearch(href: string) {
  return href.split("#")[0] ?? href;
}

function postSlugFromHref(href: string) {
  const path = pathSearch(href);
  if (!path.startsWith("/posts/")) return null;
  return decodeURIComponent(path.slice("/posts/".length));
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function isInternalLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  try {
    const url = new URL(anchor.href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function NavigationEffects({
  siteTitle,
}: {
  siteTitle: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lastPathSearch = useRef("");
  const navIndex = useRef(0);

  useLayoutEffect(() => {
    disableBrowserScrollRestoration();
  }, []);

  useEffect(() => {
    const onPointerDown = () => {
      skipActiveViewTransition();
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedClick(event)) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || !isInternalLink(anchor)) return;

      const from = currentAppHref();
      if (!isPostHref(from)) saveScroll(from);
      interruptPageMotion();

      try {
        const url = new URL(anchor.href, window.location.href);
        const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        let path = url.pathname;
        if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
        const href = path + url.search;
        const destSlug = postSlugFromHref(href);
        if (destSlug && postSlugFromHref(from) !== destSlug) {
          pushReturn(destSlug, {
            morph: isHomeHref(from) && anchor.hasAttribute("data-post-slug"),
          });
        }
        const pageTitle = anchor.getAttribute("data-page-title");
        if (pageTitle) {
          rememberDocumentTitle(
            href,
            formatDocumentTitle(pageTitle, siteTitle),
          );
        }
      } catch {
        /* ignore */
      }
    };

    const onPopState = (event: PopStateEvent) => {
      const next = appHrefFromLocation();
      if (pathSearch(next) === lastPathSearch.current) return;

      event.stopImmediatePropagation();
      if (!isPostHref(lastPathSearch.current)) {
        saveScroll(lastPathSearch.current);
      }

      const fromSlug = postSlugFromHref(lastPathSearch.current);
      if (fromSlug && peekReturn(fromSlug)?.morph && isHomeHref(next)) {
        skipActiveViewTransition();
        snapshotArticleForCollapse(fromSlug);
      } else {
        interruptCardMorph();
        interruptPageMotion();
      }

      const nextIndex =
        window.navigation?.currentEntry?.index ?? navIndex.current;
      const direction = nextIndex < navIndex.current ? "nav-back" : "nav-forward";
      navIndex.current = nextIndex;
      lastPathSearch.current = pathSearch(next);

      applyDocumentTitle(pathSearch(next), siteTitle);

      if (!isPostHref(next)) markHistoryRestore();

      startTransition(() => {
        addTransitionType(direction);
        router.replace(pathSearch(next), { scroll: false });
      });
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState, true);
    };
  }, [router, siteTitle]);

  useEffect(() => {
    lastPathSearch.current = `${pathname}${window.location.search}`;
    navIndex.current =
      window.navigation?.currentEntry?.index ?? navIndex.current;
  }, [pathname]);

  return null;
}
