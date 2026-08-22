import { compilePostMdx, postHasMath } from "@/lib/mdx-post";
import { pageMetadata } from "@/lib/metadata";
import { getPostData, getSortedPostsData } from "@/lib/posts";
import { getSiteConfig } from "@/lib/site";
import KatexStyles from "./KatexStyles";
import PostClient from "./PostClient";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = getPostData(params.slug);
  return pageMetadata(post.title, post.description);
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const postData = getPostData(params.slug);
  const site = getSiteConfig();
  const content = await compilePostMdx(params.slug, postData.content);
  const hasMath = postHasMath(postData.content);

  return (
    <PostClient
      slug={params.slug}
      title={postData.title}
      date={postData.published}
      category={postData.category}
      tags={postData.tags}
      toc={postData.toc}
      giscus={site.giscus}
    >
      {hasMath ? <KatexStyles /> : null}
      {content}
    </PostClient>
  );
}
