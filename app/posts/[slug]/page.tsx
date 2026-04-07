import { getPostData, getSortedPostsData } from "../../../lib/posts";
import { getSiteConfig } from "../../../lib/site";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import { parseDirectiveNode } from "../../../lib/plugins/remark-directive-rehype.mjs";
import {
  remarkPreserveMeta,
  rehypeCodeMeta,
} from "../../../lib/plugins/rehype-code-meta.mjs";
import { rehypeImagePaths } from "../../../lib/plugins/rehype-image-paths.mjs";
import { mdxComponents } from "../../components/mdx/mdx-components";
import PostClient from "./PostClient";
import "katex/dist/katex.min.css";

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

  return (
    <PostClient
      title={postData.title}
      date={postData.published}
      category={postData.category}
      tags={postData.tags}
      toc={postData.toc}
      giscus={site.giscus}
    >
      <MDXRemote
        source={postData.content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkMath,
              remarkGfm,
              remarkGithubAdmonitionsToDirectives,
              remarkDirective,
              parseDirectiveNode,
              remarkPreserveMeta,
            ],
            rehypePlugins: [
              rehypeKatex,
              rehypeSlug,
              [
                rehypePrettyCode,
                {
                  theme: {
                    dark: "github-dark",
                    light: "github-light",
                  },
                  keepBackground: false,
                  defaultLang: "plaintext",
                  filterMetaString: (meta: string) => {
                    // Remove step annotation objects from meta so rehype-pretty-code
                    // doesn't choke on them, but preserve word highlight strings
                    return meta
                      .replace(/\{"[^"]+?":\s*\d+-\d+\}/g, "")
                      .replace(/wrap=\w+/g, "");
                  },
                },
              ],
              rehypeCodeMeta,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "append",
                  properties: { className: ["anchor"] },
                  content: {
                    type: "element",
                    tagName: "span",
                    properties: { className: ["anchor-icon"] },
                    children: [{ type: "text", value: "#" }],
                  },
                },
              ],
              [rehypeImagePaths, { slug: params.slug, basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "" }],
            ],
          },
        }}
      />
    </PostClient>
  );
}
