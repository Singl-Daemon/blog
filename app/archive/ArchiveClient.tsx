"use client";

import React from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Body1,
  Caption1,
  Divider,
  Badge,
} from "@fluentui/react-components";
import {
  Calendar24Regular,
  DocumentText24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, staggerContainer, staggerItem } from "../components/FadeIn";

const useStyles = makeStyles({
  container: {
    display: "flex",
    maxWidth: "840px",
    margin: "0 auto",
    flexDirection: "column",
    gap: "36px",
    width: "100%",
  },
  yearGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
    paddingLeft: "32px",
  },
  yearLine: {
    position: "absolute",
    left: "11px",
    top: "32px",
    bottom: "-16px",
    width: "2px",
    backgroundColor: tokens.colorNeutralStroke2,
    zIndex: 0,
  },
  yearDot: {
    position: "absolute",
    left: "6px",
    top: "10px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground,
    border: `2px solid ${tokens.colorNeutralBackground1}`,
    zIndex: 1,
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
    transitionProperty: "background-color, border-color",
    transitionDuration: "0.15s",
    transitionTimingFunction: "ease",
    border: `1px solid transparent`,
    cursor: "pointer",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      borderTopColor: tokens.colorNeutralStroke2,
      borderRightColor: tokens.colorNeutralStroke2,
      borderBottomColor: tokens.colorNeutralStroke2,
      borderLeftColor: tokens.colorNeutralStroke2,
    },
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
  count: {
    color: tokens.colorNeutralForeground3,
    fontSize: "16px",
    fontWeight: 500,
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
  headerArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-start",
    textAlign: "left" as const,
    marginBottom: "20px",
  },
});

export default function ArchiveClient({ posts, pageTitle, pageDescription }: { posts: any[]; pageTitle: string; pageDescription: string }) {
  const styles = useStyles();

  // Group by year
  const grouped = posts.reduce((acc: Record<string, any[]>, post) => {
    const year = new Date(post.published).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className={styles.container}>
      <FadeIn yOffset={30}>
        <div className={styles.headerArea}>
          <Title1 style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>
            {pageTitle}
          </Title1>
          <Caption1 className={styles.count}>
            {pageDescription}
          </Caption1>
        </div>
        <Divider style={{ opacity: 0.6 }} />
      </FadeIn>

      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        {years.map((year, index) => (
          <motion.div
            key={year}
            variants={staggerItem}
            className={styles.yearGroup}
          >
            <div className={styles.yearDot} />
            {index !== years.length - 1 && <div className={styles.yearLine} />}
            <Title3
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: tokens.colorBrandForeground1,
              }}
            >
              {year}
            </Title3>
            <div className={styles.postList}>
              {grouped[year].map((post: any) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className={styles.link}
                >
                  <div className={styles.postItem}>
                    <div className={styles.date}>
                      <Calendar24Regular style={{ fontSize: 16 }} />
                      <Caption1
                        style={{
                          fontSize: "14px",
                          fontFamily: "Cascadia Code, Consolas, monospace",
                        }}
                      >
                        {new Date(post.published).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </Caption1>
                    </div>
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
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
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
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
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
