"use client";

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import { cx, type DirectiveProps, reactText } from "./mdx-utils";

type PropsWithChildren = { children?: ReactNode };

function isTag(
  node: ReactNode,
  tag: string,
): node is ReactElement<PropsWithChildren> {
  return isValidElement(node) && node.type === tag;
}

function containsTag(nodes: ReactNode, tag: string): boolean {
  return Children.toArray(nodes).some((node) => {
    if (isTag(node, tag)) return true;
    return isValidElement(node)
      ? containsTag(
          (node as ReactElement<PropsWithChildren>).props.children,
          tag,
        )
      : false;
  });
}

function isPlaceholder(name: string): boolean {
  return name === "…" || name === "..." || name === "⋯";
}

function TreeList({ children }: { children?: ReactNode }) {
  return (
    <ul className="mdx-filetree-list">
      {Children.map(children, (child) => {
        if (!isTag(child, "li")) return child;
        const key = reactText(child.props.children);
        return <TreeItem key={key}>{child.props.children}</TreeItem>;
      })}
    </ul>
  );
}

function TreeItem({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children);
  const nested = items.find((node) => isTag(node, "ul"));
  const labelNodes = items.filter((node) => !isTag(node, "ul"));
  const name = reactText(labelNodes).trim();
  const folder = Boolean(nested) || name.endsWith("/");
  const placeholder = isPlaceholder(name);
  const highlight =
    containsTag(labelNodes, "strong") || containsTag(labelNodes, "b");
  const [open, setOpen] = useState(true);

  return (
    <li
      className={cx(
        "mdx-filetree-item",
        folder && "mdx-filetree-folder",
        placeholder && "mdx-filetree-placeholder",
        highlight && "mdx-filetree-highlight",
      )}
    >
      {folder && nested ? (
        <button
          type="button"
          className="mdx-filetree-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="mdx-filetree-chevron" aria-hidden="true" />
          <span className="mdx-filetree-name">{labelNodes}</span>
        </button>
      ) : (
        <span className="mdx-filetree-name">
          {folder ? (
            <span
              className="mdx-filetree-chevron mdx-filetree-chevron-static"
              aria-hidden="true"
            />
          ) : null}
          {labelNodes}
        </span>
      )}
      {nested && open ? (
        <TreeList>
          {(nested as ReactElement<PropsWithChildren>).props.children}
        </TreeList>
      ) : null}
    </li>
  );
}

export function FileTree({ children, className }: DirectiveProps) {
  const items = Children.toArray(children);
  const list = items.find((node) => isTag(node, "ul"));

  return (
    <div className={cx("mdx-filetree", className)}>
      {list ? (
        <TreeList>
          {(list as ReactElement<PropsWithChildren>).props.children}
        </TreeList>
      ) : (
        children
      )}
    </div>
  );
}
