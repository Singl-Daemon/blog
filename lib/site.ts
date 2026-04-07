import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

export interface SiteConfig {
  title: string;
  avatar: string;
  favicon: {
    light32: string;
    dark32: string;
    light180: string;
    dark180: string;
    light192: string;
    dark192: string;
  };
  author: {
    name: string;
    bio: string;
    links: { type: string; label: string; url: string }[];
  };
  pages: {
    home: { title: string; description: string };
    archive: { title: string; descriptionTemplate: string };
    tags: { title: string; descriptionTemplate: string };
    categories: { title: string; descriptionTemplate: string };
    about: { title: string; description: string };
  };
  giscus: {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
    strict: string;
    reactionsEnabled: string;
    emitMetadata: string;
    inputPosition: string;
    lang: string;
  };
}

export function getSiteConfig(): SiteConfig {
  const filePath = path.join(contentDir, "site.json");
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as SiteConfig;
}

export interface AboutPageData {
  content: string;
}

export function getAboutPageData(): AboutPageData {
  const filePath = path.join(contentDir, "pages", "about.md");
  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw);
  return { content };
}
