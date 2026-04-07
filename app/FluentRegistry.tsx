"use client";

import React, { useRef, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  createDOMRenderer,
  RendererProvider,
  SSRProvider,
  GriffelRenderer,
  renderToStyleElements,
} from "@fluentui/react-components";

/**
 * FluentRegistry injects Griffel CSS into the <head> server-side via
 * useServerInsertedHTML, eliminating the flash of unstyled Fluent UI
 * components on first paint.
 */
export default function FluentRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [renderer] = useState<GriffelRenderer>(() => createDOMRenderer());
  const didInsertRef = useRef(false);

  useServerInsertedHTML(() => {
    if (didInsertRef.current) return;
    didInsertRef.current = true;
    return <>{renderToStyleElements(renderer)}</>;
  });

  return (
    <RendererProvider renderer={renderer}>
      <SSRProvider>{children}</SSRProvider>
    </RendererProvider>
  );
}
