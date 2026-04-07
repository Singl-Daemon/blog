import { getPostsByTag, getAllTags } from "../../../lib/posts";
import TagPostsClient from "./TagPostsClient";

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((t) => ({ tag: t.name }));
}

export default async function TagPage(props: {
  params: Promise<{ tag: string }>;
}) {
  const params = await props.params;
  const tag = decodeURIComponent(params.tag);
  const posts = getPostsByTag(tag);
  return <TagPostsClient tag={tag} posts={posts} />;
}
