import { getSiteConfig, getAboutPageData } from "../../lib/site";
import AboutClient from "./AboutClient";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export default function AboutPage() {
  const site = getSiteConfig();
  const about = getAboutPageData();

  const mdxContent = about.content.trim() ? (
    <MDXRemote
      source={about.content}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  ) : null;

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
