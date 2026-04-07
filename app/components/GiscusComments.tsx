"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import GiscusComponent from "@giscus/react";
import type { Mapping, InputPosition, BooleanString } from "@giscus/react";
import { useTheme } from "../providers";
import {
  makeStyles,
  tokens,
  Subtitle1,
  Caption1,
  CounterBadge,
} from "@fluentui/react-components";
import {
  CommentMultiple24Regular,
  ArrowSync16Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  root: {
    marginTop: "56px",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    transitionProperty: "background, border-color, box-shadow",
    transitionDuration: "0.3s",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 24px 0",
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "var(--bq-bg)",
    color: "var(--fluent-primary)",
    flexShrink: 0,
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    fontSize: "12px",
    lineHeight: "16px",
  },
  divider: {
    height: "1px",
    margin: "16px 24px 0",
    backgroundColor: "var(--color-border)",
    opacity: 0.6,
  },
  body: {
    padding: "20px 24px 24px",
  },
  /* loading placeholder */
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "48px 0",
    color: tokens.colorNeutralForeground3,
    fontSize: "14px",
  },
  spinner: {
    animationName: {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
    animationDuration: "1s",
    animationIterationFunction: "linear",
    animationIterationCount: "infinite",
  },
});

interface GiscusCommentsProps {
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
}

export default function GiscusComments({
  repo,
  repoId,
  category,
  categoryId,
  mapping,
  strict,
  reactionsEnabled,
  emitMetadata,
  inputPosition,
  lang,
}: GiscusCommentsProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const [origin, setOrigin] = useState("");
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Listen for giscus discussion metadata to get comment count
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== "https://giscus.app") return;
    if (!event.data || !event.data.giscus) return;
    const data = event.data.giscus;
    if (data.discussion) {
      setCommentCount(data.discussion.totalCommentCount ?? 0);
      setLoaded(true);
    }
    if (data.resizeHeight && containerRef.current) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const giscusTheme = origin
    ? `${origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/giscus-winui-${theme === "dark" ? "dark" : "light"}.css`
    : theme === "dark"
      ? "dark"
      : "light";

  if (!repo || !repoId) return null;

  return (
    <section className={styles.root}>
      <div className={`${styles.card} acrylic-card`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <CommentMultiple24Regular />
          </div>
          <div className={styles.titleGroup}>
            <div className={styles.titleRow}>
              <Subtitle1>评论</Subtitle1>
              {commentCount !== null && (
                <CounterBadge
                  count={commentCount}
                  appearance="filled"
                  color="brand"
                  size="small"
                  overflowCount={99}
                />
              )}
            </div>
            <Caption1 className={styles.subtitle}>
              由 GitHub Discussions 驱动
            </Caption1>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Giscus body */}
        <div className={styles.body}>
          {!loaded && (
            <div className={styles.loading}>
              <ArrowSync16Regular className={styles.spinner} />
              <span>正在加载评论…</span>
            </div>
          )}
          <div
            ref={containerRef}
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
          >
            <GiscusComponent
              id="comments"
              repo={repo as `${string}/${string}`}
              repoId={repoId}
              category={category}
              categoryId={categoryId}
              mapping={mapping as Mapping}
              strict={strict as BooleanString}
              reactionsEnabled={reactionsEnabled as BooleanString}
              emitMetadata={"1" as BooleanString}
              inputPosition={inputPosition as InputPosition}
              theme={giscusTheme}
              lang={lang}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
