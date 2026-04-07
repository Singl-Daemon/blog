import { visit } from "unist-util-visit";

/**
 * Remark plugin that saves the raw meta string from code fences
 * into node.data so it survives rehype-pretty-code's filterMetaString.
 * Must run BEFORE rehype-pretty-code.
 */
export function remarkPreserveMeta() {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (node.meta) {
        node.data = node.data || {};
        node.data.rawMeta = node.meta;
      }
    });
  };
}

/**
 * Rehype plugin that copies the preserved raw meta string
 * onto the <pre> element as a data-meta attribute.
 * Must run AFTER rehype-pretty-code.
 */
export function rehypeCodeMeta() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre") {
        const codeEl = node.children?.find(
          (child) => child.type === "element" && child.tagName === "code",
        );
        if (codeEl) {
          // Try to get the preserved raw meta
          const meta =
            codeEl.data?.rawMeta ||
            codeEl.properties?.metastring ||
            codeEl.data?.meta ||
            "";
          if (meta) {
            node.properties = node.properties || {};
            node.properties["dataMeta"] = meta;
          }
        }
      }
    });
  };
}
