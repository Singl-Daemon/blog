"use client";

import { Body1, makeStyles, Title3, tokens } from "@fluentui/react-components";
import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/app/components/FadeIn";
import { PostCard } from "@/app/components/PostCard";
import type { PostMeta } from "@/lib/posts";

const MIN_COL = 320;
const GAP = 28;

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gap: `${GAP}px`,
  },
  empty: {
    textAlign: "center",
    padding: "48px 20px",
    color: tokens.colorNeutralForeground3,
  },
  item: {
    width: "100%",
    minWidth: 0,
  },
});

function colsForWidth(width: number) {
  return Math.max(1, Math.floor((width + GAP) / (MIN_COL + GAP)));
}

export function PostGrid({
  posts,
  emptyTitle = "暂无文章",
  emptyDescription,
  fromHome = false,
}: {
  posts: PostMeta[];
  emptyTitle?: string;
  emptyDescription?: string;
  fromHome?: boolean;
}) {
  const styles = useStyles();
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const oldRectsRef = useRef<DOMRect[] | null>(null);
  const [cols, setCols] = useState<number | null>(null);

  const slugs = posts.map((post) => post.slug).join("\0");
  useLayoutEffect(() => {
    for (const slug of slugs.split("\0")) {
      if (slug) router.prefetch(`/posts/${slug}`);
    }
  }, [slugs, router]);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el || posts.length === 0) return;

    const read = () => {
      const next = colsForWidth(el.clientWidth);
      setCols((prev) => {
        if (prev === next) return prev;
        if (prev !== null) {
          oldRectsRef.current = [...el.children].map((child) =>
            (child as HTMLElement).getBoundingClientRect(),
          );
        }
        return next;
      });
    };

    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [posts.length]);

  useLayoutEffect(() => {
    const el = gridRef.current;
    const oldRects = oldRectsRef.current;
    if (cols === null || !el || !oldRects) return;
    oldRectsRef.current = null;

    const items = [...el.children] as HTMLElement[];
    const running: Animation[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const old = oldRects[i];
      if (!old) continue;
      const now = item.getBoundingClientRect();
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      const sx = now.width === 0 ? 1 : old.width / now.width;
      const sy = now.height === 0 ? 1 : old.height / now.height;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01) {
        continue;
      }
      running.push(
        item.animate(
          [
            {
              transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
              transformOrigin: "0 0",
            },
            { transform: "none", transformOrigin: "0 0" },
          ],
          { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
        ),
      );
    }

    return () => {
      for (const animation of running) animation.cancel();
    };
  }, [cols]);

  if (posts.length === 0) {
    return (
      <FadeIn>
        <div className={styles.empty}>
          <Title3>{emptyTitle}</Title3>
          {emptyDescription ? (
            <Body1 style={{ marginTop: 8 }}>{emptyDescription}</Body1>
          ) : null}
        </div>
      </FadeIn>
    );
  }

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      style={{
        gridTemplateColumns:
          cols === null
            ? `repeat(auto-fill, minmax(${MIN_COL}px, 1fr))`
            : `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {posts.map((post, index) => (
        <div
          key={post.slug}
          className={`${styles.item} stagger-in-item`}
          style={{ ["--i" as string]: index }}
        >
          <PostCard post={post} fromHome={fromHome} />
        </div>
      ))}
    </div>
  );
}
