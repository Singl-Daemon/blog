const titles = new Map<string, string>();

export function formatDocumentTitle(pageTitle: string, siteTitle: string) {
  const page = pageTitle.trim();
  if (!page || page === siteTitle) return siteTitle;
  return `${page} · ${siteTitle}`;
}

export function rememberDocumentTitle(href: string, title: string) {
  titles.set(stripHash(href), title);
}

export function applyDocumentTitle(href: string, fallback?: string) {
  const title = titles.get(stripHash(href)) ?? fallback;
  if (title) document.title = title;
}

export function rememberAndApplyTitle(
  href: string,
  pageTitle: string,
  siteTitle: string,
) {
  const title = formatDocumentTitle(pageTitle, siteTitle);
  rememberDocumentTitle(href, title);
  document.title = title;
}

function stripHash(href: string) {
  return href.split("#")[0] ?? href;
}
