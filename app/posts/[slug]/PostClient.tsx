"use client";

import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Button,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from "@fluentui/react-components";
import {
  ArrowLeft24Regular,
  Calendar24Regular,
  Folder24Regular,
  Tag24Regular,
  List24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FadeIn } from "../../components/FadeIn";
import GiscusComments from "../../components/GiscusComments";

const useStyles = makeStyles({
  container: {
    display: "flex",
    maxWidth: "1024px",
    margin: "0 auto",
    flexDirection: "column",
    gap: "32px",
    width: "100%",
  },
  backBtn: {
    marginBottom: "-12px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "0 8px",
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
  tocFabContainer: {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    zIndex: 1000,
    "@media (max-width: 768px)": {
      bottom: "24px",
      right: "24px",
    },
  },
  tocFab: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    backgroundColor: "var(--color-surface)",
    backdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid var(--color-border)",
    color: tokens.colorBrandForeground1,
    boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)",
    transitionProperty: "transform, box-shadow, background-color",
    transitionDuration: "0.25s",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    ":hover": {
      transform: "scale(1.08)",
      boxShadow: "0 6px 28px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)",
      backgroundColor: "var(--color-surface-hover)",
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
  tocTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
    fontSize: "16px",
    marginBottom: "16px",
    color: tokens.colorNeutralForeground1,
  },
  tocItem: {
    textDecoration: "none",
    color: tokens.colorNeutralForeground2,
    fontSize: "14px",
    transitionProperty: "color",
    transitionDuration: "0.2s",
    display: "block",
    paddingTop: "6px",
    paddingBottom: "6px",
    ":hover": {
      color: tokens.colorBrandForeground1,
    },
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
  children: React.ReactNode;
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
      toc.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [toc]);

  return (
    <div className={styles.container}>
      <FadeIn yOffset={20}>
        <div className={styles.backBtn}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              icon={<ArrowLeft24Regular />}
              appearance="subtle"
              size="large"
            >
              返回
            </Button>
          </Link>
        </div>
      </FadeIn>

      <FadeIn yOffset={30} delay={0.1}>
        <header className={styles.header}>
          <Title1
            as="h1"
            style={{
              fontSize: "44px",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              fontWeight: 700,
            }}
          >
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
                  fontFamily: "Cascadia Code, Consolas, monospace",
                }}
              >
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </Body1>
            </div>

            {category && (
              <>
                <div className={styles.metaDivider} />
                <Link
                  href={`/categories/${encodeURIComponent(category)}`}
                  className={styles.metaLink}
                >
                  <div
                    className={styles.metaItem}
                    style={{ cursor: "pointer" }}
                  >
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
      </FadeIn>

      <FadeIn yOffset={40} delay={0.2}>
        <main className={styles.content}>
          <div className="prose">{children}</div>
        </main>
        <GiscusComments {...giscus} />
      </FadeIn>

      {toc && toc.length > 0 && (
        <div className={styles.tocFabContainer}>
          <Popover
            positioning={{
              position: "before",
              overflowBoundaryPadding: 24,
              fallbackPositions: ["above", "after"],
            }}
          >
            <PopoverTrigger disableButtonEnhancement>
              <Button
                icon={<List24Regular />}
                appearance="subtle"
                shape="rounded"
                size="large"
                className={styles.tocFab}
                aria-label="目录"
              />
            </PopoverTrigger>
            <PopoverSurface
              style={{
                padding: "20px 24px",
                maxHeight: "60vh",
                overflowY: "auto",
                minWidth: "260px",
                maxWidth: "320px",
                borderRadius: "12px",
              }}
            >
              <div className={styles.tocTitle}>
                <List24Regular
                  style={{ color: tokens.colorBrandForeground1 }}
                />
                <span>目录</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={styles.tocItem}
                    style={{
                      paddingLeft: `${(item.level - 1) * 12}px`,
                      fontWeight:
                        activeId === item.id
                          ? 700
                          : item.level === 1
                            ? 600
                            : 400,
                      color:
                        activeId === item.id
                          ? tokens.colorBrandForeground1
                          : undefined,
                    }}
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            </PopoverSurface>
          </Popover>
        </div>
      )}
    </div>
  );
}
