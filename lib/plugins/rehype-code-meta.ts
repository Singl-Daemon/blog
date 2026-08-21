import type { Element, Root } from "hast";
import type { Root as MdastRoot } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that saves the raw meta string from code fences
 * into node.data so it survives rehype-pretty-code's filterMetaString.
 * Must run BEFORE rehype-pretty-code.
 */
export function remarkPreserveMeta() {
  return (tree: MdastRoot) => {
    visit(tree, "code", (node) => {
      if (!node.meta) return;
      node.data ??= {};
      Object.assign(node.data, { rawMeta: node.meta });
    });
  };
}

/**
 * Rehype plugin that copies the preserved raw meta string
 * onto the <pre> element as a data-meta attribute.
 * Must run AFTER rehype-pretty-code.
 */
export function rehypeCodeMeta() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;

      const codeEl = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "code",
      );
      if (!codeEl) return;

      const meta =
        (codeEl.data as { rawMeta?: string } | undefined)?.rawMeta ||
        (codeEl.properties?.metastring as string | undefined) ||
        (codeEl.data as { meta?: string } | undefined)?.meta ||
        "";
      if (!meta) return;

      node.properties ??= {};
      node.properties.dataMeta = meta;
    });
  };
}
