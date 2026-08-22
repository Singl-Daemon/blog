"use client";

import { makeStyles, tokens } from "@fluentui/react-components";
import { Tag24Regular } from "@fluentui/react-icons";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import type { NamedCount } from "@/lib/posts";

const useStyles = makeStyles({
  tagCloud: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: "16px",
  },
  tagLink: {
    textDecoration: "none",
    color: tokens.colorNeutralForeground1,
    padding: "10px 16px",
    borderRadius: "100px",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transitionProperty: "all",
    transitionDuration: "0.2s",
    boxShadow: tokens.shadow2,
    cursor: "pointer",
    ":hover": {
      backgroundColor: "var(--hover-fill)",
      boxShadow: tokens.shadow4,
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
    },
  },
  tagName: {
    fontWeight: 600,
  },
  tagCount: {
    minWidth: "22px",
    height: "22px",
    padding: "0 7px",
    borderRadius: "100px",
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: "22px",
    textAlign: "center",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function TagsClient({
  tags,
  pageTitle,
  pageDescription,
}: {
  tags: NamedCount[];
  pageTitle: string;
  pageDescription: string;
}) {
  const styles = useStyles();

  return (
    <div className="page-shell">
      <PageHeader title={pageTitle} description={pageDescription} />

      <div className={styles.tagCloud}>
        {tags.map((tag, index) => {
          // Calculate font size logically. Start at 14, max 20 based on count.
          const calculatedFontSize = Math.max(
            14,
            Math.min(20, 14 + (tag.count - 1) * 1.5),
          );

          return (
            <div
              key={tag.name}
              className="stagger-in-item"
              style={{ ["--i" as string]: index } as CSSProperties}
            >
              <Link
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className={styles.tagLink}
                data-page-title={`标签: ${tag.name}`}
              >
                <Tag24Regular
                  fontSize={16}
                  style={{ color: tokens.colorBrandForeground1 }}
                />
                <span
                  className={styles.tagName}
                  style={{ fontSize: `${calculatedFontSize}px` }}
                >
                  {tag.name}
                </span>
                <span className={styles.tagCount}>{tag.count}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
