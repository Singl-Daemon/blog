import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface PostMeta {
  slug: string;
  title: string;
  published: string;
  updated?: string;
  description?: string;
  category?: string;
  tags?: string[];
  image?: string;
  draft?: boolean;
  toc?: TocItem[];
}

export interface PostData extends PostMeta {
  content: string;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface CategoryWithPosts extends NamedCount {
  posts: PostMeta[];
}

let cachedPosts: PostMeta[] | null = null;
const postDataCache = new Map<string, { mtime: number; data: PostData }>();

function yamlDate(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return /^\d{4}-\d{2}-\d{2}/.test(trimmed)
      ? trimmed.slice(0, 10)
      : trimmed;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return undefined;
}

export function resolvePostImage(
  slug: string,
  image?: string,
): string | undefined {
  if (typeof image !== "string") return undefined;
  const src = image.trim();
  if (!src) return undefined;
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("//")
  ) {
    return src;
  }
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (src.startsWith("/")) {
    if (base && (src === base || src.startsWith(`${base}/`))) return src;
    return `${base}${src}`;
  }
  return `${base}/post-assets/${slug}/${src}`;
}

function findPostFile(dir: string): string | null {
  const stat = fs.statSync(dir);
  if (stat.isFile() && (dir.endsWith(".md") || dir.endsWith(".mdx"))) {
    return dir;
  }
  if (stat.isDirectory()) {
    const indexMdx = path.join(dir, "index.mdx");
    const indexMd = path.join(dir, "index.md");
    if (fs.existsSync(indexMdx)) return indexMdx;
    if (fs.existsSync(indexMd)) return indexMd;
  }
  return null;
}

export function getSortedPostsData(): PostMeta[] {
  if (process.env.NODE_ENV !== "development" && cachedPosts) {
    return cachedPosts;
  }
  if (!fs.existsSync(postsDirectory)) return [];

  const entries = fs.readdirSync(postsDirectory);
  const allPostsData: PostMeta[] = [];

  for (const entry of entries) {
    const fullPath = path.join(postsDirectory, entry);
    let filePath: string | null = null;
    let slug = entry;

    if (fs.statSync(fullPath).isDirectory()) {
      filePath = findPostFile(fullPath);
      slug = entry;
    } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
      filePath = fullPath;
      slug = entry.replace(/\.mdx?$/, "");
    }

    if (!filePath) continue;

    const post = getPostData(slug);
    if (post.draft || !post.title?.trim() || !post.published) continue;

    allPostsData.push({
      slug: post.slug,
      title: post.title,
      published: post.published,
      updated: post.updated,
      description: post.description,
      category: post.category,
      tags: post.tags,
      image: post.image,
    });
  }

  allPostsData.sort((a, b) => (a.published < b.published ? 1 : -1));
  cachedPosts = allPostsData;
  return allPostsData;
}

export function getPostFilePath(slug: string): string {
  const dirPath = path.join(postsDirectory, slug);
  const flatMd = path.join(postsDirectory, `${slug}.md`);
  const flatMdx = path.join(postsDirectory, `${slug}.mdx`);

  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const indexMdx = path.join(dirPath, "index.mdx");
    const indexMd = path.join(dirPath, "index.md");
    return fs.existsSync(indexMdx) ? indexMdx : indexMd;
  }
  if (fs.existsSync(flatMdx)) return flatMdx;
  return flatMd;
}

export function getPostMtime(slug: string): number {
  return fs.statSync(getPostFilePath(slug)).mtimeMs;
}

export function getPostData(slug: string): PostData {
  const filePath = getPostFilePath(slug);
  const mtime = fs.statSync(filePath).mtimeMs;
  const hit = postDataCache.get(slug);
  if (hit && hit.mtime === mtime) return hit.data;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const matterResult = matter(fileContents);

  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  for (const match of matterResult.content.matchAll(headingRegex)) {
    const level = match[1].length;
    const textPath = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    if (level <= 3) {
      toc.push({
        level,
        text: textPath,
        id: slugger.slug(textPath),
      });
    }
  }

  const data = matterResult.data as Omit<PostMeta, "slug">;
  const post: PostData = {
    slug,
    content: matterResult.content,
    toc,
    ...data,
    published: yamlDate(data.published) ?? "",
    updated: yamlDate(data.updated),
    image: resolvePostImage(slug, data.image),
  };
  postDataCache.set(slug, { mtime, data: post });
  return post;
}

export function getAllTags(): NamedCount[] {
  const posts = getSortedPostsData();
  const tagMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }
  return [...tagMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllCategories(): NamedCount[] {
  const posts = getSortedPostsData();
  const catMap = new Map<string, number>();
  for (const post of posts) {
    const cat = post.category || "未分类";
    catMap.set(cat, (catMap.get(cat) ?? 0) + 1);
  }
  return [...catMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getSortedPostsData().filter((post) => post.tags?.includes(tag));
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getSortedPostsData().filter(
    (post) => (post.category || "未分类") === category,
  );
}

export function getCategoriesWithPosts(): CategoryWithPosts[] {
  const posts = getSortedPostsData();
  const map = new Map<string, PostMeta[]>();
  for (const post of posts) {
    const cat = post.category || "未分类";
    const list = map.get(cat);
    if (list) list.push(post);
    else map.set(cat, [post]);
  }
  return [...map.entries()]
    .map(([name, list]) => ({ name, count: list.length, posts: list }))
    .sort((a, b) => b.count - a.count);
}
