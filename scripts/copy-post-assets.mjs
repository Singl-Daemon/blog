/**
 * Copy non-markdown files from content/posts/<slug>/ → public/post-assets/<slug>/
 * Runs as a prebuild step so Next.js static export can serve post images.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const postsDir = join(process.cwd(), "content", "posts");
const outDir = join(process.cwd(), "public", "post-assets");

if (!existsSync(postsDir)) process.exit(0);

function copyPostFiles(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isFile() && /\.mdx?$/i.test(entry.name)) continue;
    const from = join(src, entry.name);
    const to = join(dest, entry.name);
    if (entry.isDirectory()) {
      cpSync(from, to, { recursive: true });
    } else {
      cpSync(from, to);
    }
  }
}

for (const slug of readdirSync(postsDir, { withFileTypes: true })) {
  if (!slug.isDirectory()) continue;
  const srcDir = join(postsDir, slug.name);
  const dest = join(outDir, slug.name);
  copyPostFiles(srcDir, dest);
  console.log(`  copied ${slug.name} → public/post-assets/${slug.name}`);
}
