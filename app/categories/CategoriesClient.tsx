"use client";

import React, { useState } from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Body1,
  Caption1,
  Divider,
} from "@fluentui/react-components";
import {
  Folder24Regular,
  FolderOpen24Regular,
  TextBulletListLtr24Regular,
  DocumentText24Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  headerArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-start",
    textAlign: "left" as const,
    marginBottom: "20px",
  },
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
    position: "relative",
    cursor: "pointer",
    borderRadius: "12px",
    backgroundColor: "transparent",
    border: `1px solid transparent`,
    transitionProperty: "all",
    transitionDuration: "0.2s",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow4,
      borderTopColor: tokens.colorNeutralStroke1Hover,
      borderRightColor: tokens.colorNeutralStroke1Hover,
      borderBottomColor: tokens.colorNeutralStroke1Hover,
      borderLeftColor: tokens.colorNeutralStroke1Hover,
    },
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
  },
  catInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
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
    padding: "0 0 16px 64px",
  },
  articleItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "8px",
    transitionProperty: "background-color",
    transitionDuration: "0.15s",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  articleThumb: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    objectFit: "cover",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke3}`,
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
  categories: any[];
  pageTitle: string;
  pageDescription: string;
}) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  return (
    <div className={styles.container}>
      <FadeIn yOffset={30}>
        <div className={styles.headerArea}>
          <Title1 style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>
            {pageTitle}
          </Title1>
          <Caption1
            style={{ fontSize: "16px", color: tokens.colorNeutralForeground3 }}
          >
            {pageDescription}
          </Caption1>
        </div>
        <Divider style={{ opacity: 0.6 }} />
      </FadeIn>

      <motion.div
        className={styles.listContainer}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {categories.map((cat) => {
          const isExpanded = expanded === cat.name;

          return (
            <motion.div key={cat.name} variants={staggerItem}>
              <div
                className={styles.cardInner}
                onClick={() => toggleExpand(cat.name)}
                style={{
                  backgroundColor: isExpanded
                    ? tokens.colorNeutralBackground1
                    : "transparent",
                  borderColor: isExpanded
                    ? tokens.colorNeutralStroke1
                    : "transparent",
                  boxShadow: isExpanded ? tokens.shadow4 : "none",
                }}
              >
                <div className={styles.folderIconWrapper}>
                  {isExpanded ? (
                    <FolderOpen24Regular style={{ fontSize: "28px" }} />
                  ) : (
                    <Folder24Regular style={{ fontSize: "28px" }} />
                  )}
                </div>
                <div className={styles.catInfo}>
                  <Body1 style={{ fontSize: "18px", fontWeight: 600 }}>
                    {cat.name}
                  </Body1>
                  <div className={styles.catMeta}>
                    <TextBulletListLtr24Regular style={{ fontSize: "14px" }} />
                    <span>{cat.count} 篇文章</span>
                  </div>
                </div>
                <ChevronRight20Regular
                  className={styles.chevronIcon}
                  style={{
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className={styles.articleList}>
                      {cat.posts?.map((post: any) => (
                        <Link
                          key={post.slug}
                          href={`/posts/${post.slug}`}
                          className={styles.link}
                        >
                          <div className={styles.articleItem}>
                            {post.image ? (
                              <img
                                src={post.image}
                                alt={post.title}
                                className={styles.articleThumb}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor:
                                    tokens.colorNeutralBackground3,
                                  border: `1px solid ${tokens.colorNeutralStroke3}`,
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
                                fontFamily:
                                  "Cascadia Code, Consolas, monospace",
                              }}
                            >
                              {new Date(post.published).toLocaleDateString(
                                "zh-CN",
                              )}
                            </Caption1>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
