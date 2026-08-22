"use client";

import { type ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx, omitNodeProp } from "./mdx-utils";

type ImageZoomProps = ImgHTMLAttributes<HTMLImageElement> & {
  node?: unknown;
  "data-no-zoom"?: string | boolean;
};

export function ImageZoom(rawProps: ImageZoomProps) {
  const props = omitNodeProp(rawProps);
  const { className, alt, src, ...rest } = props;
  const noZoom =
    rest["data-no-zoom"] !== undefined && rest["data-no-zoom"] !== false;
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (noZoom || !src) {
    // MDX images stay <img>; next/image layout is intentionally unused.
    // biome-ignore lint/performance/noImgElement: post assets are static/unoptimized
    return <img className={className} alt={alt ?? ""} src={src} {...rest} />;
  }

  return (
    <>
      <button
        type="button"
        className="mdx-image-zoom-trigger"
        onClick={() => setOpen(true)}
        aria-label={alt ? `放大图片：${alt}` : "放大图片"}
      >
        {/* biome-ignore lint/performance/noImgElement: post assets are static/unoptimized */}
        <img
          className={cx("mdx-zoomable", className)}
          alt={alt ?? ""}
          src={src}
          {...rest}
        />
      </button>
      {open
        ? createPortal(
            <div
              ref={overlayRef}
              className="mdx-image-zoom-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={alt ? `图片预览：${alt}` : "图片预览"}
              tabIndex={-1}
              onClick={() => setOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: lightbox uses the same static src */}
              <img src={src} alt={alt ?? ""} className="mdx-image-zoom-img" />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
