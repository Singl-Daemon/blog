"use client";

import { PageHeader } from "@/app/components/PageHeader";
import { PostGrid } from "@/app/components/PostGrid";
import type { PostMeta } from "@/lib/posts";

export default function TagPostsClient({
  tag,
  posts,
}: {
  tag: string;
  posts: PostMeta[];
}) {
  return (
    <div className="page-shell page-shell-grid">
      <PageHeader
        title={`标签: ${tag}`}
        description={`共 ${posts.length} 篇文章`}
        back={{ href: "/tags", label: "所有标签" }}
      />
      <PostGrid posts={posts} />
    </div>
  );
}
