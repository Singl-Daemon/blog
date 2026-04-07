"use client";

import React from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Caption1,
  Divider,
} from "@fluentui/react-components";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, staggerContainer, staggerItem } from "../components/FadeIn";
import { Tag24Regular } from "@fluentui/react-icons";

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
  tagCloud: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
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
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow8,
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
    padding: "2px 8px",
    borderRadius: "100px",
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    fontSize: "12px",
    fontWeight: 700,
  },
});

export default function TagsClient({
  tags,
  pageTitle,
  pageDescription,
}: {
  tags: { name: string; count: number }[];
  pageTitle: string;
  pageDescription: string;
}) {
  const styles = useStyles();

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
        className={styles.tagCloud}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {tags.map((tag) => {
          // Calculate font size logically. Start at 14, max 20 based on count.
          const calculatedFontSize = Math.max(
            14,
            Math.min(20, 14 + (tag.count - 1) * 1.5),
          );

          return (
            <motion.div
              key={tag.name}
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className={styles.tagLink}
              >
                <Tag24Regular
                  style={{
                    color: tokens.colorBrandForeground1,
                    fontSize: "16px",
                  }}
                />
                <span
                  className={styles.tagName}
                  style={{ fontSize: `${calculatedFontSize}px` }}
                >
                  {tag.name}
                </span>
                <span className={styles.tagCount}>{tag.count}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
