import fs from "fs";
import path from "path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const postsDirectory = path.join(process.cwd(), "content", "posts");

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
  toc?: { id: string; text: string; level: number }[];
}

function findPostFile(dir: string): string | null {
  // Support both flat files (post-name.md) and directory-based (post-name/index.md)
  if (
    fs.statSync(dir).isFile() &&
    (dir.endsWith(".md") || dir.endsWith(".mdx"))
  ) {
    return dir;
  }
  if (fs.statSync(dir).isDirectory()) {
    const indexMdx = path.join(dir, "index.mdx");
    const indexMd = path.join(dir, "index.md");
    if (fs.existsSync(indexMdx)) return indexMdx;
    if (fs.existsSync(indexMd)) return indexMd;
  }
  return null;
}

export function getSortedPostsData(): PostMeta[] {
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

    const fileContents = fs.readFileSync(filePath, "utf8");
    const matterResult = matter(fileContents);

    // Skip drafts
    if (matterResult.data.draft) continue;

    allPostsData.push({
      slug,
      ...(matterResult.data as Omit<PostMeta, "slug">),
    });
  }

  return allPostsData.sort((a, b) => {
    if (a.published < b.published) return 1;
    return -1;
  });
}

export function getPostData(slug: string) {
  const dirPath = path.join(postsDirectory, slug);
  const flatMd = path.join(postsDirectory, `${slug}.md`);
  const flatMdx = path.join(postsDirectory, `${slug}.mdx`);

  let filePath: string;
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const indexMdx = path.join(dirPath, "index.mdx");
    const indexMd = path.join(dirPath, "index.md");
    filePath = fs.existsSync(indexMdx) ? indexMdx : indexMd;
  } else if (fs.existsSync(flatMdx)) {
    filePath = flatMdx;
  } else {
    filePath = flatMd;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const matterResult = matter(fileContents);

  const slugger = new GithubSlugger();
  const toc: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(matterResult.content)) !== null) {
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

  return {
    slug,
    content: matterResult.content,
    toc,
    ...(matterResult.data as Omit<PostMeta, "slug">),
  };
}

export function getAllTags(): { name: string; count: number }[] {
  const posts = getSortedPostsData();
  const tagMap = new Map<string, number>();
  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllCategories(): { name: string; count: number }[] {
  const posts = getSortedPostsData();
  const catMap = new Map<string, number>();
  posts.forEach((post) => {
    const cat = post.category || "未分类";
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
  return Array.from(catMap.entries())
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
