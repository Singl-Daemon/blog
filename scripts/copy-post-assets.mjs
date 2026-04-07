/**
 * Copy content/posts/<slug>/assets/** → public/post-assets/<slug>/assets/**
 * Runs as a prebuild step so Next.js static export can serve post images.
 */
import { cpSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const postsDir = join(process.cwd(), "content", "posts");
const outDir = join(process.cwd(), "public", "post-assets");

if (!existsSync(postsDir)) process.exit(0);

for (const slug of readdirSync(postsDir, { withFileTypes: true })) {
  if (!slug.isDirectory()) continue;
  const assetsDir = join(postsDir, slug.name, "assets");
  if (!existsSync(assetsDir)) continue;
  const dest = join(outDir, slug.name, "assets");
  mkdirSync(dest, { recursive: true });
  cpSync(assetsDir, dest, { recursive: true });
  console.log(`  copied ${slug.name}/assets → public/post-assets/${slug.name}/assets`);
}
