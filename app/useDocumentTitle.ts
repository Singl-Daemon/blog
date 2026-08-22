"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { rememberAndApplyTitle } from "@/lib/document-title";

export function useDocumentTitle(pageTitle: string, siteTitle: string) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const href = `${pathname}${window.location.search}`;
    rememberAndApplyTitle(href, pageTitle, siteTitle);
  }, [pageTitle, siteTitle, pathname]);
}
