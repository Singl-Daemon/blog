import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import Link from "next/link";
import { cx, type DirectiveProps, isExternalHref } from "./mdx-utils";

type CardProps = DirectiveProps & {
  href?: string;
};

function isCard(node: ReactNode): node is ReactElement<CardProps> {
  return isValidElement(node) && node.type === Card;
}

export function Cards({ children, className }: DirectiveProps) {
  return (
    <div className={cx("mdx-cards", className)}>
      {Children.toArray(children).filter(isCard)}
    </div>
  );
}

export function Card({ title, href, children, className }: CardProps) {
  const inner = (
    <>
      {title ? <div className="mdx-card-title">{title}</div> : null}
      {children ? <div className="mdx-card-desc">{children}</div> : null}
    </>
  );

  const classes = cx("mdx-card", className);
  if (!href) {
    return <div className={classes}>{inner}</div>;
  }
  if (isExternalHref(href)) {
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link className={classes} href={href}>
      {inner}
    </Link>
  );
}
