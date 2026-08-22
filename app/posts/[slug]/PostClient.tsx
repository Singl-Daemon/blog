"use client";

import {
  Badge,
  Body1,
  Button,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowLeft16Regular,
  Calendar24Regular,
  Folder24Regular,
  Tag24Regular,
} from "@fluentui/react-icons";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDocumentTitle } from "@/app/useDocumentTitle";
import {
  playExpand,
  snapshotArticleForCollapse,
  takePendingExpand,
} from "@/lib/card-morph";
import { formatDateLong } from "@/lib/date";
import { scrollWindowInstant } from "@/lib/motion";
import { isHomeHref, peekReturn } from "@/lib/nav-stack";
import type { TocItem } from "@/lib/posts";
import { getClientSiteTitle } from "@/lib/site-title";

const GiscusComments = dynamic(() => import("@/app/components/GiscusComments"), {
  ssr: false,
});
const TocFab = dynamic(
  () => import("@/app/components/TocFab").then((mod) => mod.TocFab),
  { ssr: false },
);

const useStyles = makeStyles({
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  title: {
    display: "block",
    width: "100%",
    height: "auto",
    margin: 0,
    padding: 0,
    border: 0,
    fontSize: "40px",
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
    fontWeight: 700,
    textAlign: "left",
    overflow: "visible",
    "@media (max-width: 768px)": {
      fontSize: "30px",
    },
  },
  metaContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: tokens.colorNeutralForeground2,
    flexWrap: "wrap",
    width: "100%",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  metaDivider: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    opacity: 0.45,
  },
  metaLink: {
    textDecoration: "none",
    color: "inherit",
    outline: "none",
    transitionProperty: "color, opacity",
    transitionDuration: "0.15s",
    display: "flex",
    alignItems: "center",
    ":hover": {
      color: tokens.colorBrandForeground1,
    },
  },
  tags: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  tagLink: {
    textDecoration: "none",
    transitionProperty: "transform",
    transitionDuration: "0.15s",
    display: "inline-block",
    ":hover": {
      transform: "scale(1.05) translateY(-2px)",
    },
  },
  content: {
    minWidth: 0,
    width: "100%",
  },
});

interface PostClientProps {
  slug: string;
  title: string;
  date: string;
  category?: string;
  tags?: string[];
  toc?: TocItem[];
  giscus: {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
    strict: string;
    reactionsEnabled: string;
    emitMetadata: string;
    inputPosition: string;
    lang: string;
  };
  children: ReactNode;
}

export default function PostClient({
  slug,
  title,
  date,
  category,
  tags,
  toc,
  giscus,
  children,
}: PostClientProps) {
  const styles = useStyles();
  const router = useRouter();
  const frameRef = useRef<HTMLElement>(null);
  const playedSlug = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string>("");
  const [returnHref, setReturnHref] = useState<string | null>(null);
  useDocumentTitle(title, getClientSiteTitle());

  useLayoutEffect(() => {
    setReturnHref(peekReturn(slug)?.href ?? null);
    scrollWindowInstant(0);
    if (playedSlug.current === slug) return;
    const node = frameRef.current;
    if (!node) return;
    const pending = takePendingExpand(slug);
    if (!pending) return;
    playedSlug.current = slug;
    playExpand(node, pending);
  }, [slug]);

  const goBack = useCallback(() => {
    const dest = returnHref ?? "/";
    if (isHomeHref(dest) && peekReturn(slug)?.morph) {
      snapshotArticleForCollapse(slug);
    }
    router.replace(dest, { scroll: false });
  }, [returnHref, router, slug]);

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [toc]);

  return (
    <div className="page-shell page-shell-article">
      <header
        ref={frameRef}
        className={`${styles.header} page-header post-header`}
        data-card-morph-frame=""
      >
        <div className="post-back-slot">
          {returnHref ? (
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowLeft16Regular />}
              className="post-back"
              onClick={goBack}
            >
              返回
            </Button>
          ) : null}
        </div>

        <h1 className={styles.title} data-card-morph-title="">
          {title}
        </h1>

        <div className={styles.metaContainer} data-card-morph-meta="">
          <div className={styles.metaItem}>
            <Calendar24Regular style={{ color: tokens.colorBrandForeground1 }} />
            <Body1
              style={{
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatDateLong(date)}
            </Body1>
          </div>

          {category ? (
            <>
              <div className={styles.metaDivider} />
              <Link
                href={`/categories/${encodeURIComponent(category)}`}
                className={styles.metaLink}
                data-page-title={`分类: ${category}`}
              >
                <div className={styles.metaItem} style={{ cursor: "pointer" }}>
                  <Folder24Regular
                    style={{ color: tokens.colorBrandForeground1 }}
                  />
                  <Body1 style={{ fontWeight: 600 }}>{category}</Body1>
                </div>
              </Link>
            </>
          ) : null}

          {tags && tags.length > 0 ? (
            <>
              <div className={styles.metaDivider} />
              <div className={styles.tags}>
                <Tag24Regular style={{ color: tokens.colorBrandForeground1 }} />
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className={styles.tagLink}
                    data-page-title={`标签: ${tag}`}
                  >
                    <Badge
                      appearance="outline"
                      color="brand"
                      shape="rounded"
                      size="medium"
                      style={{ fontSize: "14px", padding: "4px 8px" }}
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </header>
      <hr className="page-header-rule" />

      <main className={`${styles.content} post-article-body`}>
        <div className="prose">{children}</div>
      </main>
      <GiscusComments {...giscus} />
      {toc && toc.length > 0 ? <TocFab toc={toc} activeId={activeId} /> : null}
    </div>
  );
}
