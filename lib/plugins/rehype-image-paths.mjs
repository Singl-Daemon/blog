import { visit } from "unist-util-visit";

/**
 * Rehype plugin that rewrites relative image paths to include the post slug.
 * e.g. "assets/foo.png" → "/post-assets/my-post/assets/foo.png"
 */
export function rehypeImagePaths(options = {}) {
  const { slug } = options;
  if (!slug) return (tree) => tree;

  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img" && node.properties?.src) {
        const src = String(node.properties.src);
        // Only rewrite relative paths (not absolute, not URLs)
        if (
          !src.startsWith("/") &&
          !src.startsWith("http://") &&
          !src.startsWith("https://") &&
          !src.startsWith("data:")
        ) {
          node.properties.src = `/post-assets/${slug}/${src}`;
        }
      }
    });
  };
}
