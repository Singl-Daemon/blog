import { getAllTags, getPostsByTag } from "@/lib/posts";
import TagPostsClient from "./TagPostsClient";

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.flatMap((t) => {
    const encoded = encodeURIComponent(t.name);
    return encoded === t.name
      ? [{ tag: t.name }]
      : [{ tag: t.name }, { tag: encoded }];
  });
}

export default async function TagPage(props: {
  params: Promise<{ tag: string }>;
}) {
  const params = await props.params;
  const tag = decodeURIComponent(params.tag);
  const posts = getPostsByTag(tag);
  return <TagPostsClient tag={tag} posts={posts} />;
}
