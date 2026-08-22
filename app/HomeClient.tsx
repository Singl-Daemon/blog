"use client";

import {
  Button,
  Caption1,
  Input,
  makeStyles,
} from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { FadeIn } from "@/app/components/FadeIn";
import { PageHeader } from "@/app/components/PageHeader";
import { PostGrid } from "@/app/components/PostGrid";
import { replaceUrlPreservingHistory } from "@/lib/motion";
import type { PostMeta } from "@/lib/posts";
import { getClientSiteTitle } from "@/lib/site-title";

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

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    const p = Math.max(1, Number.parseInt(params.get("p") ?? "1", 10) || 1);
    setSearch(q);
    setPage(p);
  }, []);

  const commitQuery = useCallback((nextSearch: string, nextPage: number) => {
    setSearch(nextSearch);
    setPage(nextPage);
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("q", nextSearch.trim());
    if (nextPage > 1) params.set("p", String(nextPage));
    const qs = params.toString();
    const href = qs ? `/?${qs}` : "/";
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const next = `${base}${href}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      replaceUrlPreservingHistory(next);
    }
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return articles;
    return articles.filter(
      (article) =>
        article.title?.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        article.category?.toLowerCase().includes(query),
    );
  }, [articles, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) commitQuery(search, currentPage);
  }, [page, currentPage, search, commitQuery]);

  const pagedArticles = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="page-shell page-shell-grid">
      <PageHeader
        title={heroTitle}
        description={heroDescription}
        documentTitle={getClientSiteTitle()}
      />

      <div className={`home-search ${styles.searchBar}`}>
        <Input
          contentBefore={<Search24Regular />}
          placeholder="搜索文章..."
          value={search}
          onChange={(_, d) => {
            commitQuery(d.value, 1);
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
        fromHome
      />

      {totalPages > 1 ? (
        <FadeIn delay={0.3}>
          <div className={styles.pagination}>
            <Button
              appearance="subtle"
              disabled={currentPage <= 1}
              onClick={() => commitQuery(search, currentPage - 1)}
            >
              上一页
            </Button>
            <Caption1 style={{ fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </Caption1>
            <Button
              appearance="subtle"
              disabled={currentPage >= totalPages}
              onClick={() => commitQuery(search, currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </FadeIn>
      ) : null}
    </div>
  );
}
