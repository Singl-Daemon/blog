import { cx, type DirectiveProps } from "./mdx-utils";

export function Gallery({ children, className }: DirectiveProps) {
  return <div className={cx("mdx-gallery", className)}>{children}</div>;
}
