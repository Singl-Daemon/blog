import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path;

  // Validate: no traversal
  if (segments.some((s) => s === ".." || s.includes("\\"))) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "content", "posts", ...segments);
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext];

  if (!mime) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
