"use client";

import { useState } from "react";
import { cx } from "./mdx-utils";

type YouTubeProps = {
  id?: string;
  className?: string;
  title?: string;
  node?: unknown;
};

function normalizeYouTubeId(value: string): string | null {
  const trimmed = value.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
      const id = url.pathname.replace(/^\//, "").split("/")[0] ?? "";
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v") ?? "";
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export function YouTube({ id, className, title }: YouTubeProps) {
  const [active, setActive] = useState(false);
  const videoId = id ? normalizeYouTubeId(id) : null;
  if (!videoId) return null;

  const label = title || "YouTube";

  return (
    <div className={cx("mdx-youtube", className)}>
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="mdx-youtube-poster"
          onClick={() => setActive(true)}
          aria-label={`播放 ${label}`}
        >
          {/* biome-ignore lint/performance/noImgElement: YouTube thumbnail is a remote poster */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            data-no-zoom=""
          />
          <span className="mdx-youtube-play" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
