import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

export interface RehypeImagePathsOptions {
  slug?: string;
  basePath?: string;
}

/**
 * Rehype plugin that rewrites relative image paths to include the post slug.
 * e.g. "assets/foo.png" → "/post-assets/my-post/assets/foo.png"
 * When basePath is set (e.g. "/blog"), the prefix becomes "/blog/post-assets/..."
 */
export function rehypeImagePaths(options: RehypeImagePathsOptions = {}) {
  const { slug, basePath = "" } = options;
  if (!slug) return (tree: Root) => tree;

  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img" || !node.properties?.src) return;

      const src = String(node.properties.src).replace(/^\.\//, "");
      if (
        src.startsWith("/") ||
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("data:")
      ) {
        return;
      }

      node.properties.src = `${basePath}/post-assets/${slug}/${src}`;
    });
  };
}
