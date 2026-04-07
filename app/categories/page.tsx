import { getAllCategories, getSortedPostsData } from "../../lib/posts";
import { getSiteConfig } from "../../lib/site";
import CategoriesClient from "./CategoriesClient";

export default function CategoriesPage() {
  const categories = getAllCategories();
  const allPosts = getSortedPostsData();
  const site = getSiteConfig();
  const categoryData = categories.map((cat) => {
    return {
      ...cat,
      posts: allPosts.filter(
        (post) => (post.category || "未分类") === cat.name,
      ),
    };
  });

  return (
    <CategoriesClient
      categories={categoryData}
      pageTitle={site.pages.categories.title}
      pageDescription={site.pages.categories.descriptionTemplate.replace("{count}", String(categories.length))}
    />
  );
}
