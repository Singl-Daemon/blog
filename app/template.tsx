import type { ReactNode } from "react";

/**
 * Keep a remounting template so page CSS enter animations restart,
 * without a View Transition snapshot overlay that blocks sidebar clicks.
 */
export default function Template({ children }: { children: ReactNode }) {
  return children;
}
