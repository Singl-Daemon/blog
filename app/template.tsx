"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Remount page contents on each route so CSS enter animations restart.
 * display:contents keeps this wrapper out of layout.
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
