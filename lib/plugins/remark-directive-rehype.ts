import type { Properties } from "hast";
import { h } from "hastscript";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";

interface DirectiveNode extends Parent {
  type: "containerDirective" | "leafDirective" | "textDirective";
  name: string;
  attributes?: Properties;
  data?: {
    hName?: string;
    hProperties?: Properties;
  };
}

interface DirectiveLabelChild extends Node {
  data?: { directiveLabel?: boolean };
}

function nodeText(node: Node): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  const parent = node as Parent;
  if (!Array.isArray(parent.children)) return "";
  return parent.children.map(nodeText).join("");
}

/**
 * Converts remark-directive nodes to rehype-compatible hast nodes.
 * This allows :::note, ::github{repo="..."} etc. to become
 * <note>, <github repo="..."> elements that MDXRemote maps to React components.
 */
export function parseDirectiveNode() {
  return (tree: Node) => {
    visit(tree, (node) => {
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }

      const directive = node as DirectiveNode;
      if (!directive.data) directive.data = {};
      const data = directive.data;
      directive.attributes ??= {};

      const firstChild = directive.children[0] as
        | DirectiveLabelChild
        | undefined;
      if (firstChild?.data?.directiveLabel) {
        directive.attributes["has-directive-label"] = true;
        if (directive.attributes.label == null) {
          const label = nodeText(firstChild).trim();
          if (label) directive.attributes.label = label;
        }
      } else if (
        (directive.type === "textDirective" ||
          directive.type === "leafDirective") &&
        directive.children.length > 0 &&
        directive.attributes.label == null
      ) {
        const label = nodeText(directive).trim();
        if (label) directive.attributes.label = label;
      }

      const hast = h(directive.name, directive.attributes ?? {});
      data.hName = hast.tagName;
      data.hProperties = hast.properties;
    });
  };
}
