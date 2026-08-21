"use client";

import {
  Button,
  Caption1,
  Input,
  makeStyles,
} from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons";
import { useState } from "react";
import { FadeIn } from "@/app/components/FadeIn";
import { PageHeader } from "@/app/components/PageHeader";
import { PostGrid } from "@/app/components/PostGrid";
import type { PostMeta } from "@/lib/posts";

const PAGE_SIZE = 6;

const useStyles = makeStyles({
  searchBar: {
    width: "100%",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
  },
});

export default function HomeClient({
  articles,
  heroTitle,
  heroDescription,
}: {
  articles: PostMeta[];
  heroTitle: string;
  heroDescription: string;
}) {
  const styles = useStyles();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.tags?.some((t) => t.toLowerCase().includes(q)) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedArticles = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="page-shell page-shell-grid">
      <PageHeader title={heroTitle} description={heroDescription} />

      <div className={`home-search ${styles.searchBar}`}>
        <Input
          contentBefore={<Search24Regular />}
          placeholder="搜索文章..."
          value={search}
          onChange={(_, d) => {
            setSearch(d.value);
            setPage(1);
          }}
          appearance="outline"
          size="large"
          style={{ width: "100%", borderRadius: "12px" }}
        />
      </div>

      <PostGrid
        posts={pagedArticles}
        emptyTitle="没有找到匹配的文章"
        emptyDescription="试试其他关键词？"
      />

      {totalPages > 1 ? (
        <FadeIn delay={0.3}>
          <div className={styles.pagination}>
            <Button
              appearance="subtle"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              上一页
            </Button>
            <Caption1 style={{ fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </Caption1>
            <Button
              appearance="subtle"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </FadeIn>
      ) : null}
    </div>
  );
}
