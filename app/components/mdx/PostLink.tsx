import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { cx } from "./mdx-utils";

type PostLinkProps = {
  slug?: string;
  className?: string;
  node?: unknown;
};

export function PostLink({ slug, className }: PostLinkProps) {
  if (!slug) return null;
  const post = getSortedPostsData().find((item) => item.slug === slug);
  if (!post) return null;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cx("mdx-post-link", className)}
    >
      {post.title}
    </Link>
  );
}
