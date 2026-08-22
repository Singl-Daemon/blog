"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import {
  interruptCardMorph,
  peekPendingExpandSlug,
  playPendingCollapse,
} from "@/lib/card-morph";
import {
  consumeHistoryRestore,
  restoreSavedScroll,
} from "@/lib/motion";
import {
  consumeReturnIfLanding,
  currentAppHref,
  isPostHref,
} from "@/lib/nav-stack";
import { applyPageEnter } from "@/lib/page-motion";

export default function CardMorphHost() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const href = currentAppHref();
    const restoredReturn = consumeReturnIfLanding(href);
    if (!isPostHref(href) && consumeHistoryRestore() && !restoredReturn) {
      restoreSavedScroll(href);
    }
    const pendingSlug = peekPendingExpandSlug();
    const postSlug = pathname.startsWith("/posts/")
      ? decodeURIComponent(pathname.slice("/posts/".length))
      : null;
    applyPageEnter();

    if (pathname === "/") {
      if (playPendingCollapse()) return;
      let frames = 0;
      let id = 0;
      const retry = () => {
        if (playPendingCollapse()) return;
        frames += 1;
        if (frames < 8) {
          id = requestAnimationFrame(retry);
          return;
        }
        interruptCardMorph();
      };
      id = requestAnimationFrame(retry);
      return () => cancelAnimationFrame(id);
    }

    if (pendingSlug && pendingSlug !== postSlug) interruptCardMorph();
    else if (!postSlug) interruptCardMorph();
  }, [pathname]);

  return null;
}
