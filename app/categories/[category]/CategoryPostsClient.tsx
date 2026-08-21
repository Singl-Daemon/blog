"use client";

import { PageHeader } from "@/app/components/PageHeader";
import { PostGrid } from "@/app/components/PostGrid";
import type { PostMeta } from "@/lib/posts";

export default function CategoryPostsClient({
  category,
  posts,
}: {
  category: string;
  posts: PostMeta[];
}) {
  return (
    <div className="page-shell page-shell-grid">
      <PageHeader
        title={`分类: ${category}`}
        description={`共 ${posts.length} 篇文章`}
        back={{ href: "/categories", label: "所有分类" }}
      />
      <PostGrid posts={posts} />
    </div>
  );
}
