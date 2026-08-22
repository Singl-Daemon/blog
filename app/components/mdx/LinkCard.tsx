import Link from "next/link";
import { cx, type DirectiveProps, isExternalHref } from "./mdx-utils";

type LinkCardProps = DirectiveProps & {
  href?: string;
  desc?: string;
  description?: string;
};

function siteLabel(href: string): string {
  if (!isExternalHref(href)) return href.startsWith("/") ? href : `/${href}`;
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "github.com") {
      const [owner, repo] = url.pathname.split("/").filter(Boolean);
      if (owner && repo) return `${host}/${owner}/${repo}`;
    }
    return host;
  } catch {
    return href;
  }
}

export function LinkCard({
  href,
  title,
  desc,
  description,
  children,
  className,
}: LinkCardProps) {
  const summary = desc ?? description ?? children;
  if (!href) return null;

  const external = isExternalHref(href);
  const site = siteLabel(href);
  const heading = title?.trim() || site;

  const inner = (
    <>
      <span className="mdx-link-card-icon" aria-hidden="true" />
      <span className="mdx-link-card-body">
        <span className="mdx-link-card-title">{heading}</span>
        {summary ? <span className="mdx-link-card-desc">{summary}</span> : null}
        <span className="mdx-link-card-url">{site}</span>
      </span>
      <span className="mdx-link-card-go" aria-hidden="true" />
    </>
  );

  const classes = cx(
    "mdx-link-card",
    external ? "is-external" : "is-internal",
    className,
  );

  if (external) {
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
    <Link prefetch={false} className={classes} href={href}>
      {inner}
    </Link>
  );
}
