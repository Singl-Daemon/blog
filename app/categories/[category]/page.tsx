import { getAllCategories, getPostsByCategory } from "@/lib/posts";
import CategoryPostsClient from "./CategoryPostsClient";

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.flatMap((c) => {
    const encoded = encodeURIComponent(c.name);
    return encoded === c.name
      ? [{ category: c.name }]
      : [{ category: c.name }, { category: encoded }];
  });
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
}) {
  const params = await props.params;
  const category = decodeURIComponent(params.category);
  const posts = getPostsByCategory(category);
  return <CategoryPostsClient category={category} posts={posts} />;
}
