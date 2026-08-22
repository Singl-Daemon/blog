import { pageMetadata } from "@/lib/metadata";
import { getAllTags } from "@/lib/posts";
import { getSiteConfig } from "@/lib/site";
import TagsClient from "./TagsClient";

export function generateMetadata() {
  const tags = getAllTags();
  const site = getSiteConfig();
  return pageMetadata(
    site.pages.tags.title,
    site.pages.tags.descriptionTemplate.replace("{count}", String(tags.length)),
  );
}

export default function TagsPage() {
  const tags = getAllTags();
  const site = getSiteConfig();
  return (
    <TagsClient
      tags={tags}
      pageTitle={site.pages.tags.title}
      pageDescription={site.pages.tags.descriptionTemplate.replace(
        "{count}",
        String(tags.length),
      )}
    />
  );
}
