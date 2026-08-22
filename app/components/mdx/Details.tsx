import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx, type DirectiveProps, splitDirectiveChildren } from "./mdx-utils";

type DetailsProps = DirectiveProps & {
  open?: boolean | string;
};

function isSummary(node: ReactNode): node is ReactElement {
  return isValidElement(node) && node.type === "summary";
}

export function Details({
  children,
  label,
  title,
  className,
  open,
  "has-directive-label": labeled,
}: DetailsProps) {
  const childArray = Children.toArray(children);
  const nativeSummary = childArray.find(isSummary);
  const isOpen = open !== undefined && open !== false && open !== "false";

  if (nativeSummary) {
    return (
      <details
        className={cx("mdx-details", className)}
        open={isOpen || undefined}
      >
        {children}
      </details>
    );
  }

  const { body } = splitDirectiveChildren(children, labeled);
  const summary = label || title || "Details";

  return (
    <details
      className={cx("mdx-details", className)}
      open={isOpen || undefined}
    >
      <summary>{summary}</summary>
      <div className="mdx-details-body">{body}</div>
    </details>
  );
}
