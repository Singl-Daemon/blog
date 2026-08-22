import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  cx,
  type DirectiveProps,
  omitNodeProp,
  splitDirectiveChildren,
} from "./mdx-utils";

type FigureProps = DirectiveProps & {
  "data-rehype-pretty-code-figure"?: string;
  dataRehypePrettyCodeFigure?: string;
};

function isFigcaption(node: ReactNode): node is ReactElement {
  return isValidElement(node) && node.type === "figcaption";
}

export function Figure(rawProps: FigureProps) {
  const {
    children,
    label,
    title,
    className,
    "has-directive-label": labeled,
    ...props
  } = omitNodeProp(rawProps);

  const prettyCode =
    props["data-rehype-pretty-code-figure"] !== undefined ||
    props.dataRehypePrettyCodeFigure !== undefined;

  if (prettyCode) {
    const { dataRehypePrettyCodeFigure: _pretty, ...figureProps } = props;
    return (
      <figure className={className} {...figureProps}>
        {children}
      </figure>
    );
  }

  const { body } = splitDirectiveChildren(children, labeled);
  const bodyItems = Children.toArray(body);
  const caption = label || title;
  const alreadyCaptioned = bodyItems.some(isFigcaption);

  return (
    <figure className={cx("mdx-figure", className)} {...props}>
      {body}
      {caption && !alreadyCaptioned ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
