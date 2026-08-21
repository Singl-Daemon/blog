"use client";

import {
  Badge,
  Body1,
  Caption1,
  makeStyles,
  Title3,
  tokens,
} from "@fluentui/react-components";
import { ArrowRight24Regular } from "@fluentui/react-icons";
import Link from "next/link";
import { formatDateLong } from "@/lib/date";
import type { PostMeta } from "@/lib/posts";

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px",
    position: "relative",
    overflow: "hidden",
    minHeight: "280px",
    height: "100%",
    textDecoration: "none",
    color: "inherit",
    boxShadow: tokens.shadow8,
    transitionProperty: "transform, box-shadow",
    transitionDuration: "0.22s",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    ":hover": {
      boxShadow: tokens.shadow16,
      transform: "translateY(-4px)",
    },
    ":hover .bg-zoom": {
      transform: "scale(1.08)",
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
    background: "var(--glass-card)",
    backdropFilter: "blur(24px) saturate(160%)",
    WebkitBackdropFilter: "blur(24px) saturate(160%)",
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
  content: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "100%",
    justifyContent: "flex-start",
    padding: "24px",
    color: "#ffffff",
  },
  title: {
    fontSize: "22px",
    lineHeight: 1.3,
    marginBottom: "4px",
    fontWeight: 700,
  },
  meta: {
    marginBottom: "2px",
  },
  body: {
    flex: "0 0 auto",
    marginTop: "6px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "12px",
    gap: "8px",
  },
  tags: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  arrow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    flexShrink: 0,
  },
});

export function PostCard({ post }: { post: PostMeta }) {
  const styles = useStyles();
  const hasCover = Boolean(post.image);
  const titleColor = hasCover ? "#ffffff" : "var(--color-text)";
  const mutedColor = hasCover
    ? "rgba(255,255,255,0.8)"
    : "var(--color-text-secondary)";
  const bodyColor = hasCover
    ? "rgba(255,255,255,0.9)"
    : "var(--color-text-secondary)";

  return (
    <Link href={`/posts/${post.slug}`} className={`${styles.card} post-card`}>
      {hasCover ? (
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
        className={styles.content}
        style={hasCover ? undefined : { color: "var(--color-text)" }}
      >
        <Title3 className={styles.title} style={{ color: titleColor }}>
          {post.title}
        </Title3>
        <Caption1 className={styles.meta} style={{ color: mutedColor }}>
          {formatDateLong(post.published)}
          {post.category ? ` · ${post.category}` : ""}
        </Caption1>
        <div className={styles.body}>
          <Body1
            style={{ color: bodyColor, lineHeight: 1.5, fontSize: "14px" }}
          >
            {post.description || "点击阅读全文以了解更多详细内容..."}
          </Body1>
        </div>
        <div className={styles.footer}>
          <div className={styles.tags}>
            {post.tags?.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                appearance="tint"
                color="brand"
                shape="rounded"
                style={
                  hasCover
                    ? {
                        padding: "0 6px",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        borderColor: "rgba(255,255,255,0.2)",
                      }
                    : { padding: "0 6px" }
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
          <span
            className={styles.arrow}
            style={{ color: mutedColor }}
            aria-hidden
          >
            <ArrowRight24Regular />
          </span>
        </div>
      </div>
    </Link>
  );
}
