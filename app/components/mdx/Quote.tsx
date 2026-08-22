import {
  cx,
  type DirectiveProps,
  isExternalHref,
  reactText,
} from "./mdx-utils";

type QuoteProps = DirectiveProps & {
  author?: string;
  source?: string;
  href?: string;
};

export function Quote({
  children,
  author,
  source,
  href,
  className,
}: QuoteProps) {
  const sourceNode =
    source && href ? (
      isExternalHref(href) ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {source}
        </a>
      ) : (
        <a href={href}>{source}</a>
      )
    ) : source ? (
      <span>{source}</span>
    ) : null;

  const hasBody = reactText(children).trim().length > 0;
  if (!hasBody && !author && !sourceNode) return null;

  return (
    <blockquote
      className={cx("mdx-quote", !hasBody && "is-cite-only", className)}
    >
      {hasBody ? <div className="mdx-quote-body">{children}</div> : null}
      {author || sourceNode ? (
        <footer className="mdx-quote-footer">
          {author ? <cite>{author}</cite> : null}
          {author && sourceNode ? <span aria-hidden="true"> · </span> : null}
          {sourceNode}
        </footer>
      ) : null}
    </blockquote>
  );
}
