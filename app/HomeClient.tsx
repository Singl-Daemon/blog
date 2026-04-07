"use client";

import React, { useState } from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Body1,
  Caption1,
  Button,
  Divider,
  Badge,
  Input,
} from "@fluentui/react-components";
import { ArrowRight24Regular, Search24Regular } from "@fluentui/react-icons";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, staggerContainer, staggerItem } from "./components/FadeIn";

const PAGE_SIZE = 6;

const useStyles = makeStyles({
  container: {
    display: "flex",
    maxWidth: "960px",
    margin: "0 auto",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "20px 0 8px",
  },
  searchBar: {
    maxWidth: "360px",
    marginTop: "4px",
  },
  blogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "28px",
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
    }
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
    background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)",
    zIndex: 2,
  },
  noCoverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(0,120,212,0.08) 0%, rgba(96,205,255,0.06) 100%)",
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
    }
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    padding: "16px 0",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    color: tokens.colorNeutralForeground3,
  },
});

export default function HomeClient({ articles, heroTitle, heroDescription }: { articles: any[]; heroTitle: string; heroDescription: string }) {
  const styles = useStyles();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = articles.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedArticles = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={styles.container}>
      <FadeIn delay={0.1} yOffset={30}>
        <header className={styles.hero}>
          <Title1 style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>{heroTitle}</Title1>
          <Body1 style={{ color: tokens.colorNeutralForeground2, fontSize: "16px", lineHeight: 1.6 }}>
            {heroDescription}
          </Body1>
          <div className={styles.searchBar}>
            <Input
              contentBefore={<Search24Regular />}
              placeholder="搜索文章..."
              value={search}
              onChange={(_, d) => { setSearch(d.value); setPage(1); }}
              appearance="filled-darker"
              size="large"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        </header>

        <Divider style={{ margin: "12px 0 24px" }} />
      </FadeIn>

      {pagedArticles.length === 0 ? (
        <FadeIn delay={0.2}>
          <div className={styles.emptyState}>
            <Title3>没有找到匹配的文章</Title3>
            <Body1 style={{ marginTop: 8 }}>试试其他关键词？</Body1>
          </div>
        </FadeIn>
      ) : (
        <motion.main 
          className={styles.blogGrid}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {pagedArticles.map((article) => (
              <motion.div 
                key={article.slug} 
                variants={staggerItem}
                layout
                whileHover={{ scale: 1.015, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ height: "100%" }}
              >
                <Link href={`/posts/${article.slug}`} className={`${styles.link} ${styles.cardMain}`}>
  {article.image ? (
    <>
      <div
        className={`bg-zoom ${styles.coverImageBg}`}
        style={{ backgroundImage: `url(${article.image})` }}
      />
      <div className={styles.cardOverlay} />
    </>
  ) : (
    <>
      <div className={styles.noCoverBg} />
      <div className={styles.noCoverOverlay} />
    </>
  )}

  <div className={styles.cardContentCover} style={article.image ? undefined : { color: "var(--color-text)" }}>
    <Title3 style={{ fontSize: "22px", lineHeight: 1.3, marginBottom: "4px", color: article.image ? "#ffffff" : "var(--color-text)", fontWeight: 700 }}>
      {article.title}
    </Title3>
    <Caption1 style={{ color: article.image ? "rgba(255,255,255,0.8)" : "var(--color-text-secondary)", marginBottom: "8px" }}>
      {new Date(article.published).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
      {article.category && ` · ${article.category}`}
    </Caption1>
    <div className={styles.cardBody}>
      <Body1 style={{ color: article.image ? "rgba(255,255,255,0.9)" : "var(--color-text-secondary)", lineHeight: 1.5, fontSize: "14px" }}>
        {article.description || '点击阅读全文以了解更多详细内容...'}
      </Body1>
    </div>
    <div className={styles.cardFooterCover}>
      <div className={styles.tagContainer}>
        {article.tags?.slice(0, 3).map((tag: string) => (       
          <Badge 
            key={tag} 
            appearance="tint" 
            color="brand"
            shape="rounded" 
            style={article.image ? { 
              padding: "0 6px", 
              backgroundColor: "rgba(255,255,255,0.15)", 
              color: "#ffffff",
              borderColor: "rgba(255,255,255,0.2)"
            } : {
              padding: "0 6px",
            }}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <Button icon={<ArrowRight24Regular />} appearance="transparent" size="small" shape="circular" style={{ color: article.image ? "#ffffff" : "var(--color-text-secondary)", minWidth: 0 }} />
    </div>
  </div>
</Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.main>
      )}

      {totalPages > 1 && (
        <FadeIn delay={0.3}>
          <div className={styles.pagination}>
            <Button appearance="subtle" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              上一页
            </Button>
            <Caption1 style={{ fontWeight: 600 }}>{currentPage} / {totalPages}</Caption1>
            <Button appearance="subtle" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
              下一页
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}