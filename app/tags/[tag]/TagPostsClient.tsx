"use client";

import React from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Body1,
  Caption1,
  Badge,
  Button,
  Divider,
} from "@fluentui/react-components";
import {
  ArrowLeft24Regular,
  ArrowRight24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, staggerContainer, staggerItem } from "../../components/FadeIn";

const useStyles = makeStyles({
  container: {
    display: "flex",
    maxWidth: "960px",
    margin: "0 auto",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },
  headerArea: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "8px",
  },
  blogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  cardMain: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px",
    position: "relative",
    overflow: "hidden",
    boxShadow: tokens.shadow8,
    transitionProperty: "transform, box-shadow",
    transitionDuration: "0.3s",
    ":hover": {
      boxShadow: tokens.shadow16,
    },
  },
  coverImageBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transitionProperty: "transform",
    transitionDuration: "0.4s",
    zIndex: 1,
  },
  noCoverBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "var(--color-surface)",
    backdropFilter: "blur(20px) saturate(150%)",
    zIndex: 1,
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)",
    zIndex: 2,
  },
  noCoverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(0,120,212,0.08) 0%, rgba(96,205,255,0.06) 100%)",
    zIndex: 2,
  },
  cardContentCover: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    padding: "24px",
    color: "#ffffff",
  },
  cardFooterCover: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    gap: "8px",
  },
  cardBody: {
    flex: 1,
    marginTop: "8px",
  },
  tagContainer: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRadius: "16px",
    ":hover .bg-zoom": {
      transform: "scale(1.08)",
    },
  },
});

export default function TagPostsClient({
  tag,
  posts,
}: {
  tag: string;
  posts: any[];
}) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <FadeIn yOffset={30}>
        <div className={styles.headerArea}>
          <Link href="/tags" style={{ textDecoration: "none" }}>
            <Button
              icon={<ArrowLeft24Regular />}
              appearance="subtle"
              size="medium"
            >
              所有标签
            </Button>
          </Link>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Title1 style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>
              标签: {tag}
            </Title1>
            <Caption1
              style={{
                color: tokens.colorNeutralForeground3,
                fontSize: "15px",
              }}
            >
              共 {posts.length} 篇文章
            </Caption1>
          </div>
        </div>
        <Divider style={{ margin: "16px 0" }} />
      </FadeIn>

      <motion.div
        className={styles.blogGrid}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {posts.map((post) => (
            <motion.div
              key={post.slug}
              variants={staggerItem}
              layout
              whileHover={{ scale: 1.015, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{ height: "100%" }}
            >
              <Link
                href={`/posts/${post.slug}`}
                className={`${styles.link} ${styles.cardMain}`}
              >
                {post.image ? (
                  <>
                    <div
                      className={`bg-zoom ${styles.coverImageBg}`}
                      style={{ backgroundImage: `url(${post.image})` }}
                    />
                    <div className={styles.cardOverlay} />
                  </>
                ) : (
                  <>
                    <div className={styles.noCoverBg} />
                    <div className={styles.noCoverOverlay} />
                  </>
                )}

                <div
                  className={styles.cardContentCover}
                  style={
                    post.image
                      ? undefined
                      : { color: "var(--color-text)" }
                  }
                >
                  <Title3
                    style={{
                      fontSize: "22px",
                      lineHeight: 1.3,
                      marginBottom: "4px",
                      color: post.image
                        ? "#ffffff"
                        : "var(--color-text)",
                      fontWeight: 700,
                    }}
                  >
                    {post.title}
                  </Title3>
                  <Caption1
                    style={{
                      color: post.image
                        ? "rgba(255,255,255,0.8)"
                        : "var(--color-text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    {new Date(post.published).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {post.category && ` · ${post.category}`}
                  </Caption1>
                  <div
                    className={styles.cardBody}
                  >
                    <Body1
                      style={{
                        color: post.image
                          ? "rgba(255,255,255,0.9)"
                          : "var(--color-text-secondary)",
                        lineHeight: 1.5,
                        fontSize: "14px",
                      }}
                    >
                      {post.description ||
                        "点击阅读全文以了解更多详细内容..."}
                    </Body1>
                  </div>
                  <div className={styles.cardFooterCover}>
                    <div className={styles.tagContainer}>
                      {post.tags?.slice(0, 3).map((t: string) => (
                        <Badge
                          key={t}
                          appearance="tint"
                          color="brand"
                          shape="rounded"
                          style={
                            post.image
                              ? {
                                  padding: "0 6px",
                                  backgroundColor:
                                    "rgba(255,255,255,0.15)",
                                  color: "#ffffff",
                                  borderColor:
                                    "rgba(255,255,255,0.2)",
                                }
                              : {
                                  padding: "0 6px",
                                }
                          }
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      icon={<ArrowRight24Regular />}
                      appearance="transparent"
                      size="small"
                      shape="circular"
                      style={{
                        color: post.image
                          ? "#ffffff"
                          : "var(--color-text-secondary)",
                        minWidth: 0,
                      }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
