"use client";

import {
  createDOMRenderer,
  type GriffelRenderer,
  RendererProvider,
  renderToStyleElements,
  SSRProvider,
} from "@fluentui/react-components";
import { useServerInsertedHTML } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";

/**
 * FluentRegistry injects Griffel CSS into the <head> server-side via
 * useServerInsertedHTML, eliminating the flash of unstyled Fluent UI
 * components on first paint.
 */
export default function FluentRegistry({ children }: { children: ReactNode }) {
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
