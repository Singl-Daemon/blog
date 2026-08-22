/**
 * Next.js 16 static export stores segmented RSC payloads as nested folders:
 *   posts/slug/__next.posts/$d$slug/__PAGE__.txt
 * The client fetches them as a dotted filename:
 *   posts/slug/__next.posts.$d$slug.__PAGE__.txt
 * GitHub Pages / `serve` look for the literal filename and 404.
 * Copy every nested payload to the dotted name the router requests.
 */
import { copyFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const outDir = join(process.cwd(), "out");
const files = readdirSync(outDir, { recursive: true, withFileTypes: true });
let copied = 0;

for (const entry of files) {
  if (!entry.isFile()) continue;
  const dir = entry.parentPath ?? entry.path;
  const from = join(dir, entry.name);
  const rel = relative(outDir, from).split(sep);
  const start = rel.findIndex((part) => part.startsWith("__next."));
  if (start < 0 || rel.length - start <= 1) continue;
  const alias = rel.slice(start).join(".");
  const dest = join(outDir, ...rel.slice(0, start), alias);
  if (dest === from) continue;
  copyFileSync(from, dest);
  copied += 1;
}

console.log(`flatten-next-rsc: copied ${copied} RSC aliases`);
