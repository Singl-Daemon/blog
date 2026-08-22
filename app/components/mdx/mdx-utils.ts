import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function isExternalHref(href: string): boolean {
  return (
    /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(href) || href.startsWith("mailto:")
  );
}

export type DirectiveProps = {
  children?: ReactNode;
  label?: string;
  title?: string;
  className?: string;
  "has-directive-label"?: boolean | string;
  node?: unknown;
};

export function hasDirectiveLabel(
  value: boolean | string | undefined,
): boolean {
  return value !== undefined && value !== false && value !== "false";
}

export function splitDirectiveChildren(
  children: ReactNode,
  labeled?: boolean | string,
): { labelNode?: ReactNode; body: ReactNode } {
  if (!hasDirectiveLabel(labeled)) {
    return { body: children };
  }
  const items = Children.toArray(children);
  return { labelNode: items[0], body: items.slice(1) };
}

export function reactText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactText).join("");
  if (isValidElement(node)) {
    return reactText(
      (node as ReactElement<{ children?: ReactNode }>).props.children,
    );
  }
  return "";
}

export function omitNodeProp<T extends { node?: unknown }>(
  props: T,
): Omit<T, "node"> {
  const { node: _node, ...rest } = props;
  return rest;
}
