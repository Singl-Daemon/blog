"use client";

import React from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Body2,
  Caption1,
  Button,
  Divider,
} from "@fluentui/react-components";
import { ArrowLeft24Regular } from "@fluentui/react-icons";
import Link from "next/link";

const useStyles = makeStyles({
  container: {
    display: "flex",
    maxWidth: "780px",
    margin: "0 auto",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "14px",
  },
  cardInner: {
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    gap: "6px",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
  },
});

export default function CategoryPostsClient({
  category,
  posts,
}: {
  category: string;
  posts: any[];
}) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Link href="/categories">
        <Button icon={<ArrowLeft24Regular />} appearance="subtle" size="small">
          所有分类
        </Button>
      </Link>
      <Title1 style={{ fontSize: "28px" }}>分类: {category}</Title1>
      <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
        共 {posts.length} 篇文章
      </Caption1>
      <Divider />
      <div className={styles.grid}>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className={`${styles.link} acrylic-card acrylic-card-interactive`}
          >
            <div className={styles.cardInner}>
              <Body1 style={{ fontWeight: 600 }}>{post.title}</Body1>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                {new Date(post.published).toLocaleDateString("zh-CN")}
              </Caption1>
              <Body2
                style={{
                  color: tokens.colorNeutralForeground2,
                  fontSize: "13px",
                }}
              >
                {post.description || ""}
              </Body2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
