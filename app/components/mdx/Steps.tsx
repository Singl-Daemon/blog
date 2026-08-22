import { cx, type DirectiveProps } from "./mdx-utils";

export function Steps({ children, className }: DirectiveProps) {
  return <div className={cx("mdx-steps", className)}>{children}</div>;
}
