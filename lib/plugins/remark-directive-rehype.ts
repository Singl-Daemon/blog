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
      }

      const hast = h(directive.name, directive.attributes ?? {});
      data.hName = hast.tagName;
      data.hProperties = hast.properties;
    });
  };
}
