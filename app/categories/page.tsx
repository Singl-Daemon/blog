import { pageMetadata } from "@/lib/metadata";
import { getCategoriesWithPosts } from "@/lib/posts";
import { getSiteConfig } from "@/lib/site";
import CategoriesClient from "./CategoriesClient";

export function generateMetadata() {
  const categoryData = getCategoriesWithPosts();
  const site = getSiteConfig();
  return pageMetadata(
    site.pages.categories.title,
    site.pages.categories.descriptionTemplate.replace(
      "{count}",
      String(categoryData.length),
    ),
  );
}

export default function CategoriesPage() {
  const categoryData = getCategoriesWithPosts();
  const site = getSiteConfig();

  return (
    <CategoriesClient
      categories={categoryData}
      pageTitle={site.pages.categories.title}
      pageDescription={site.pages.categories.descriptionTemplate.replace(
        "{count}",
        String(categoryData.length),
      )}
    />
  );
}
