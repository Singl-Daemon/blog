import fs from "node:fs";
import path from "node:path";
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

let cachedSite: SiteConfig | null = null;

export function getSiteConfig(): SiteConfig {
  if (process.env.NODE_ENV !== "development" && cachedSite) {
    return cachedSite;
  }
  const filePath = path.join(contentDir, "site.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const config = JSON.parse(raw) as SiteConfig;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  config.avatar = `${base}${config.avatar}`;
  for (const key of Object.keys(
    config.favicon,
  ) as (keyof SiteConfig["favicon"])[]) {
    config.favicon[key] = `${base}${config.favicon[key]}`;
  }
  cachedSite = config;
  return config;
}

export interface AboutPageData {
  content: string;
}

let aboutCache: { mtime: number; data: AboutPageData } | null = null;

export function getAboutMtime() {
  return fs.statSync(path.join(contentDir, "pages", "about.md")).mtimeMs;
}

export function getAboutPageData(): AboutPageData {
  const filePath = path.join(contentDir, "pages", "about.md");
  const mtime = getAboutMtime();
  if (aboutCache && aboutCache.mtime === mtime) return aboutCache.data;
  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw);
  aboutCache = { mtime, data: { content } };
  return aboutCache.data;
}
