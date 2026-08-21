"use client";

import {
  Badge,
  Body1,
  makeStyles,
  Title1,
  tokens,
} from "@fluentui/react-components";
import {
  Calendar24Regular,
  Folder24Regular,
  Tag24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import GiscusComments from "@/app/components/GiscusComments";
import { TocFab } from "@/app/components/TocFab";
import { formatDateLong } from "@/lib/date";

const useStyles = makeStyles({
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  title: {
    fontSize: "40px",
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
    fontWeight: 700,
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
    color: tokens.colorNeutralForeground2,
  },
  metaDivider: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: tokens.colorNeutralForeground3,
  },
  metaLink: {
    textDecoration: "none",
    color: "inherit",
    outline: "none",
    transitionProperty: "color",
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

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface PostClientProps {
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
  title,
  date,
  category,
  tags,
  toc,
  giscus,
  children,
}: PostClientProps) {
  const styles = useStyles();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    // Use IntersectionObserver to track which heading is currently in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );

    // Give it a tiny delay to ensure prose content is fully rendered
    const timeout = setTimeout(() => {
      document
        .querySelectorAll(".prose h1, .prose h2, .prose h3, .prose h4")
        .forEach((el) => {
          observer.observe(el);
        });
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [toc]);

  return (
    <div className="page-shell page-shell-article">
      <header className={styles.header}>
        <Title1 as="h1" className={styles.title}>
          {title}
        </Title1>

        <div className={styles.metaContainer}>
          <div className={styles.metaItem}>
            <Calendar24Regular
              style={{ color: tokens.colorBrandForeground1 }}
            />
            <Body1
              style={{
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatDateLong(date)}
            </Body1>
          </div>

          {category && (
            <>
              <div className={styles.metaDivider} />
              <Link
                href={`/categories/${encodeURIComponent(category)}`}
                className={styles.metaLink}
              >
                <div className={styles.metaItem} style={{ cursor: "pointer" }}>
                  <Folder24Regular
                    style={{ color: tokens.colorBrandForeground1 }}
                  />
                  <Body1 style={{ fontWeight: 600 }}>{category}</Body1>
                </div>
              </Link>
            </>
          )}

          {tags && tags.length > 0 && (
            <>
              <div className={styles.metaDivider} />
              <div className={styles.tags}>
                <Tag24Regular
                  style={{ color: tokens.colorBrandForeground1 }}
                />
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className={styles.tagLink}
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
          )}
        </div>
      </header>

      <main className={styles.content}>
        <div className="prose">{children}</div>
      </main>
      <GiscusComments {...giscus} />

      {toc && toc.length > 0 ? <TocFab toc={toc} activeId={activeId} /> : null}
    </div>
  );
}
