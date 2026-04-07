import { getAllTags } from "../../lib/posts";
import { getSiteConfig } from "../../lib/site";
import TagsClient from "./TagsClient";

export default function TagsPage() {
  const tags = getAllTags();
  const site = getSiteConfig();
  return (
    <TagsClient
      tags={tags}
      pageTitle={site.pages.tags.title}
      pageDescription={site.pages.tags.descriptionTemplate.replace("{count}", String(tags.length))}
    />
  );
}
