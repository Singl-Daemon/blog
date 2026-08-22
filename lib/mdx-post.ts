import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import { getSingletonHighlighter } from "shiki";
import type { PluggableList } from "unified";
import { mdxComponents } from "@/app/components/mdx/mdx-components";
import {
  rehypeCodeMeta,
  remarkPreserveMeta,
} from "@/lib/plugins/rehype-code-meta";
import { rehypeImageFigure } from "@/lib/plugins/rehype-image-figure";
import { rehypeImagePaths } from "@/lib/plugins/rehype-image-paths";
import { parseDirectiveNode } from "@/lib/plugins/remark-directive-rehype";
import { remarkMermaid } from "@/lib/plugins/remark-mermaid";
import { getPostData, getPostMtime, getSortedPostsData } from "@/lib/posts";
import { getAboutMtime } from "@/lib/site";

type CacheEntry = {
  mtime: number;
  content: Promise<ReactElement>;
};

const compiled = new Map<string, CacheEntry>();

export function postHasMath(source: string) {
  return /\$\$|\\begin\{|\\\(|\\\[/.test(source);
}

const prettyCode: PluggableList[number] = [
  rehypePrettyCode,
  {
    theme: {
      dark: "github-dark",
      light: "github-light",
    },
    keepBackground: false,
    defaultLang: "plaintext",
    filterMetaString: (meta: string) =>
      meta
        .replace(/\{"[^"]+?":\s*\d+-\d+\}/g, "")
        .replace(/wrap=\w+/g, "")
        .replace(/(?:^|\s)showLineNumbers(?:\{\d+\})?(?=\s|$)/g, ""),
    getHighlighter: (options: Parameters<typeof getSingletonHighlighter>[0]) =>
      getSingletonHighlighter({
        ...options,
        langs: [
          ...(options?.langs ?? []),
          "powershell",
          "shellscript",
          "bash",
          "javascript",
          "typescript",
          "json",
          "xml",
          "yaml",
          "markdown",
          "html",
          "css",
          "diff",
        ],
      }),
  },
];

function normalizeFenceLangs(source: string) {
  return source.replace(/^```log\b/gm, "```plaintext");
}

function compileSource(slug: string, source: string) {
  source = normalizeFenceLangs(source);
  const hasMath = postHasMath(source);
  return compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [
          ...(hasMath ? [remarkMath] : []),
          remarkGfm,
          remarkGithubAdmonitionsToDirectives,
          remarkDirective,
          parseDirectiveNode,
          remarkPreserveMeta,
          remarkMermaid,
        ],
        rehypePlugins: [
          ...(hasMath ? [rehypeKatex] : []),
          rehypeSlug,
          prettyCode,
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
          [
            rehypeImagePaths,
            {
              slug,
              basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
            },
          ],
          rehypeImageFigure,
        ] satisfies PluggableList,
      },
    },
  }).then((result) => result.content);
}

function cacheCompile(
  cache: Map<string, CacheEntry>,
  key: string,
  mtime: number,
  compile: () => Promise<ReactElement>,
) {
  const hit = cache.get(key);
  if (hit && hit.mtime === mtime) return hit.content;

  const content = compile().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { mtime, content });
  return content;
}

export function compilePostMdx(slug: string, source: string) {
  return cacheCompile(compiled, slug, getPostMtime(slug), () =>
    compileSource(slug, source),
  );
}

const aboutCompiled = new Map<string, CacheEntry>();

export function compileAboutMdx(source: string) {
  return cacheCompile(aboutCompiled, "about", getAboutMtime(), () =>
    compileMDX({
      source,
      options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
    }).then((result) => result.content),
  );
}

export function warmupAllPostsMdx() {
  if (process.env.NODE_ENV === "production") return;
  for (const post of getSortedPostsData()) {
    void compilePostMdx(post.slug, getPostData(post.slug).content).catch(
      (error) => {
        if (process.env.NODE_ENV === "development") {
          console.error(`[mdx] warmup failed for ${post.slug}`, error);
        }
      },
    );
  }
}
