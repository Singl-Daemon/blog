import { Caution, Important, Note, Tip, Warning } from "./Admonition";
import { Badge } from "./Badge";
import { Card, Cards } from "./Cards";
import { Pre } from "./CodeBlock";
import { Details } from "./Details";
import { Figure } from "./Figure";
import { FileTree } from "./FileTree";
import { Gallery } from "./Gallery";
import { GithubCard } from "./GithubCard";
import { ImageZoom } from "./ImageZoom";
import { LinkCard } from "./LinkCard";
import { Mermaid } from "./Mermaid";
import { PostLink } from "./PostLink";
import { Quote } from "./Quote";
import { Steps } from "./Steps";
import { Tab, Tabs } from "./Tabs";
import { YouTube } from "./YouTube";

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

  // Structure
  tabs: Tabs,
  tab: Tab,
  details: Details,
  steps: Steps,
  filetree: FileTree,

  // Media
  figure: Figure,
  gallery: Gallery,
  img: ImageZoom,
  youtube: YouTube,
  mermaid: Mermaid,

  // Cards & meta
  link: LinkCard,
  cards: Cards,
  card: Card,
  badge: Badge,
  quote: Quote,
  post: PostLink,
};
