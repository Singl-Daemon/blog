import type { Code, Root } from "mdast";
import { SKIP, visit } from "unist-util-visit";

/**
 * Turns ```mermaid fences into <mermaid> nodes before rehype-pretty-code
 * so Shiki does not highlight them as source.
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (!parent || index == null) return;
      if ((node.lang ?? "").toLowerCase() !== "mermaid") return;
      if (!node.value.trim()) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }

      parent.children[index] = {
        type: "paragraph",
        data: {
          hName: "mermaid",
          hProperties: {},
        },
        children: [{ type: "text", value: node.value }],
      };
    });
  };
}
