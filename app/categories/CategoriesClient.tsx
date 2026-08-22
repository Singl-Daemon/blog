"use client";

import {
  Body1,
  Caption1,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronRight20Regular,
  DocumentText24Regular,
  Folder24Regular,
  FolderOpen24Regular,
  TextBulletListLtr24Regular,
} from "@fluentui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useState } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { formatDateCompact } from "@/lib/date";
import type { CategoryWithPosts } from "@/lib/posts";

const useStyles = makeStyles({
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardInner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    width: "100%",
    textAlign: "left",
    font: "inherit",
    color: "inherit",
    borderRadius: "12px",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    cursor: "pointer",
    appearance: "none",
  },
  folderIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: tokens.colorBrandBackground2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  catInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: 0,
  },
  catName: {
    fontSize: "18px",
    fontWeight: 600,
  },
  catMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: tokens.colorNeutralForeground3,
    fontSize: "13px",
  },
  chevronIcon: {
    color: tokens.colorNeutralForeground4,
    flexShrink: 0,
    transitionProperty: "transform",
    transitionDuration: "0.2s",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    outline: "none",
  },
  articleList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "4px 0 12px 0",
  },
  articleItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid transparent",
  },
  articleThumb: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    objectFit: "cover",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke3}`,
    flexShrink: 0,
  },
  articleTitle: {
    fontWeight: 500,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

export default function CategoriesClient({
  categories,
  pageTitle,
  pageDescription,
}: {
  categories: CategoryWithPosts[];
  pageTitle: string;
  pageDescription: string;
}) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="page-shell">
      <PageHeader title={pageTitle} description={pageDescription} />

      <div className={styles.listContainer}>
        {categories.map((cat, index) => {
          const isExpanded = expanded === cat.name;

          return (
            <div
              key={cat.name}
              className="stagger-in-item"
              style={{ ["--i" as string]: index } as CSSProperties}
            >
              <button
                type="button"
                className={`${styles.cardInner} soft-hover`}
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpanded((prev) => (prev === cat.name ? null : cat.name))
                }
                style={
                  isExpanded
                    ? { borderColor: "var(--color-border)" }
                    : undefined
                }
              >
                <div className={styles.folderIconWrapper}>
                  {isExpanded ? (
                    <FolderOpen24Regular fontSize={28} />
                  ) : (
                    <Folder24Regular fontSize={28} />
                  )}
                </div>
                <div className={styles.catInfo}>
                  <Body1 className={styles.catName}>{cat.name}</Body1>
                  <div className={styles.catMeta}>
                    <TextBulletListLtr24Regular fontSize={14} />
                    <span>{cat.count} 篇文章</span>
                  </div>
                </div>
                <ChevronRight20Regular
                  className={styles.chevronIcon}
                  style={{
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              <div className={`cat-fold${isExpanded ? " is-open" : ""}`}>
                <div className="cat-fold-inner">
                  <div className={styles.articleList}>
                    {cat.posts.map((post) => (
                      <Link
                        prefetch={false}
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        className={styles.link}
                        data-page-title={post.title}
                      >
                        <div className={`${styles.articleItem} soft-hover`}>
                          {post.image ? (
                            <Image
                              src={post.image}
                              alt={post.title}
                              width={40}
                              height={40}
                              className={styles.articleThumb}
                            />
                          ) : (
                            <div
                              className={styles.articleThumb}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DocumentText24Regular
                                style={{
                                  color: tokens.colorBrandForeground2,
                                  fontSize: "20px",
                                }}
                              />
                            </div>
                          )}
                          <Body1 className={styles.articleTitle}>
                            {post.title}
                          </Body1>
                          <Caption1
                            style={{
                              color: tokens.colorNeutralForeground3,
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {formatDateCompact(post.published)}
                          </Caption1>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
