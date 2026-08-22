import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Wraps images that have a title (`![alt](src "caption")`) in <figure>.
 * Skips images already inside a figure (directive or pretty-code).
 */
export function rehypeImageFigure() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "img" || index == null || !parent) return;
      if (parent.type !== "element") return;
      if (parent.tagName === "figure") return;

      const title = node.properties?.title;
      if (typeof title !== "string" || !title.trim()) return;

      const caption = title.trim();
      node.properties.title = undefined;

      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: { className: ["mdx-figure"] },
        children: [
          node,
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: caption }],
          },
        ],
      };

      parent.children[index] = figure;
    });
  };
}
