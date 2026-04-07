import { getSortedPostsData } from "../lib/posts";
import { getSiteConfig } from "../lib/site";
import HomeClient from "./HomeClient";

export default function Home() {
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
