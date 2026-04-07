import { getPostsByCategory, getAllCategories } from "../../../lib/posts";
import CategoryPostsClient from "./CategoryPostsClient";

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((c) => ({ category: c.name }));
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
}) {
  const params = await props.params;
  const category = decodeURIComponent(params.category);
  const posts = getPostsByCategory(category);
  return <CategoryPostsClient category={category} posts={posts} />;
}
