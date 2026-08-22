import { compileAboutMdx } from "@/lib/mdx-post";
import { pageMetadata } from "@/lib/metadata";
import { getAboutPageData, getSiteConfig } from "@/lib/site";
import AboutClient from "./AboutClient";

export function generateMetadata() {
  const site = getSiteConfig();
  return pageMetadata(site.pages.about.title, site.pages.about.description);
}

export default async function AboutPage() {
  const site = getSiteConfig();
  const about = getAboutPageData();
  const mdxContent = about.content.trim()
    ? await compileAboutMdx(about.content)
    : null;

  return (
    <AboutClient
      pageTitle={site.pages.about.title}
      pageDescription={site.pages.about.description}
      authorName={site.author.name}
      authorBio={site.author.bio}
      authorAvatar={site.avatar}
      authorLinks={site.author.links}
      mdxContent={mdxContent}
    />
  );
}
