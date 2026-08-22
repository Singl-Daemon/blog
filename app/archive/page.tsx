import { pageMetadata } from "@/lib/metadata";
import { getSortedPostsData } from "@/lib/posts";
import { getSiteConfig } from "@/lib/site";
import ArchiveClient from "./ArchiveClient";

export function generateMetadata() {
  const posts = getSortedPostsData();
  const site = getSiteConfig();
  return pageMetadata(
    site.pages.archive.title,
    site.pages.archive.descriptionTemplate.replace(
      "{count}",
      String(posts.length),
    ),
  );
}

export default function ArchivePage() {
  const posts = getSortedPostsData();
  const site = getSiteConfig();
  return (
    <ArchiveClient
      posts={posts}
      pageTitle={site.pages.archive.title}
      pageDescription={site.pages.archive.descriptionTemplate.replace(
        "{count}",
        String(posts.length),
      )}
    />
  );
}
