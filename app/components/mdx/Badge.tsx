import { cx, type DirectiveProps } from "./mdx-utils";

const BADGE_TYPES = new Set(["note", "tip", "important", "warning", "caution"]);

type BadgeProps = DirectiveProps & {
  type?: string;
};

export function Badge({
  children,
  label,
  type = "note",
  className,
}: BadgeProps) {
  const kind = BADGE_TYPES.has(type) ? type : "note";
  return (
    <span className={cx("mdx-badge", `mdx-badge-${kind}`, className)}>
      {label ?? children}
    </span>
  );
}
