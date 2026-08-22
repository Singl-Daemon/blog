"use client";

import {
  Badge,
  Body1,
  Caption1,
  makeStyles,
  Title3,
  tokens,
} from "@fluentui/react-components";
import {
  Calendar24Regular,
  DocumentText24Regular,
} from "@fluentui/react-icons";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { formatDateCompact } from "@/lib/date";
import type { PostMeta } from "@/lib/posts";

const useStyles = makeStyles({
  yearGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  yearTitle: {
    display: "block",
    margin: 0,
    padding: 0,
    fontSize: "24px",
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  postList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  postItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "14px 16px",
    borderRadius: "8px",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    cursor: "pointer",
  },
  date: {
    minWidth: "70px",
    color: tokens.colorNeutralForeground3,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    outline: "none",
  },
  postTitle: {
    fontWeight: 500,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  postThumb: {
    width: "48px",
    height: "48px",
    flexShrink: 0,
    borderRadius: "8px",
    objectFit: "cover",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke3}`,
  },
});

export default function ArchiveClient({
  posts,
  pageTitle,
  pageDescription,
}: {
  posts: PostMeta[];
  pageTitle: string;
  pageDescription: string;
}) {
  const styles = useStyles();

  const grouped = posts.reduce<Record<string, PostMeta[]>>((acc, post) => {
    const year = new Date(post.published).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="page-shell">
      <PageHeader title={pageTitle} description={pageDescription} />

      <div>
        {years.map((year, index) => (
          <div
            key={year}
            className={`${styles.yearGroup} stagger-in-item`}
            style={{ ["--i" as string]: index } as CSSProperties}
          >
            <Title3 className={styles.yearTitle}>{year}</Title3>
            <div className={styles.postList}>
              {grouped[year].map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className={styles.link}
                  data-page-title={post.title}
                >
                  <div className={`${styles.postItem} soft-hover`}>
                    <div className={styles.date}>
                      <Calendar24Regular fontSize={16} />
                      <Caption1
                        style={{
                          fontSize: "14px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatDateCompact(post.published)}
                      </Caption1>
                    </div>
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={48}
                        height={48}
                        className={styles.postThumb}
                      />
                    ) : (
                      <div
                        className={styles.postThumb}
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
                    <Body1 className={styles.postTitle}>{post.title}</Body1>
                    <div className="archive-post-tags">
                      {post.tags?.slice(0, 2).map((tag: string) => (
                        <Badge
                          key={tag}
                          appearance="tint"
                          color="brand"
                          shape="rounded"
                          size="medium"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
