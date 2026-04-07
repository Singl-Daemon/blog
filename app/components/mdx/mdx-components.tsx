import { Note, Tip, Important, Warning, Caution } from "./Admonition";
import { GithubCard } from "./GithubCard";
import { Pre } from "./CodeBlock";

/**
 * MDX component map for next-mdx-remote.
 * Maps directive tag names and HTML elements to React components.
 */
export const mdxComponents = {
  // Admonition directives (:::note, :::tip, :::warning, :::important, :::caution)
  note: Note,
  tip: Tip,
  important: Important,
  warning: Warning,
  caution: Caution,

  // GitHub card directive (::github{repo="owner/repo"})
  github: GithubCard,

  // Code block wrapper with copy button + language badge
  pre: Pre,
};
