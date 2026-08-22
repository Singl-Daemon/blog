import { warmupAllPostsMdx } from "@/lib/mdx-post";
import { homeMetadata } from "@/lib/metadata";
import { getSortedPostsData } from "@/lib/posts";
import { getSiteConfig } from "@/lib/site";
import HomeClient from "./HomeClient";

export function generateMetadata() {
  return homeMetadata();
}

export default function Home() {
  warmupAllPostsMdx();
  const articles = getSortedPostsData();
  const site = getSiteConfig();
  return (
    <HomeClient
      articles={articles}
      heroTitle={site.pages.home.title}
      heroDescription={site.pages.home.description}
    />
  );
}
