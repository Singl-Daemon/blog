"use client";

import {
  Children,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import {
  cx,
  type DirectiveProps,
  hasDirectiveLabel,
  reactText,
  splitDirectiveChildren,
} from "./mdx-utils";

const STORAGE_PREFIX = "blog-mdx-tab:";
const GROUP_EVENT = "blog-mdx-tab-group";

type TabGroupDetail = { group: string; label: string };

export type TabProps = DirectiveProps;

export function Tab({ children, "has-directive-label": labeled }: TabProps) {
  const { body } = splitDirectiveChildren(children, labeled);
  return <>{body}</>;
}

function tabLabel(child: ReactElement<TabProps>, fallback: string): string {
  if (typeof child.props.label === "string" && child.props.label.trim()) {
    return child.props.label.trim();
  }
  if (typeof child.props.title === "string" && child.props.title.trim()) {
    return child.props.title.trim();
  }
  if (hasDirectiveLabel(child.props["has-directive-label"])) {
    const items = Children.toArray(child.props.children);
    const fromLabel = reactText(items[0]).trim();
    if (fromLabel) return fromLabel;
  }
  return fallback;
}

function tabBody(child: ReactElement<TabProps>): ReactNode {
  return splitDirectiveChildren(
    child.props.children,
    child.props["has-directive-label"],
  ).body;
}

export function Tabs({
  children,
  group,
  className,
}: DirectiveProps & { group?: string }) {
  const baseId = useId();
  const panels = useMemo(() => {
    return Children.toArray(children)
      .filter(
        (child): child is ReactElement<TabProps> =>
          isValidElement(child) && child.type === Tab,
      )
      .map((child, index) => ({
        label: tabLabel(child, `Tab ${index + 1}`),
        content: tabBody(child),
      }));
  }, [children]);

  const [active, setActive] = useState(0);

  const select = useCallback(
    (index: number, persist = true) => {
      if (index < 0 || index >= panels.length) return;
      setActive(index);
      if (!persist || !group) return;
      const label = panels[index]?.label;
      if (!label) return;
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${group}`, label);
      } catch {
        /* private mode */
      }
      window.dispatchEvent(
        new CustomEvent<TabGroupDetail>(GROUP_EVENT, {
          detail: { group, label },
        }),
      );
    },
    [group, panels],
  );

  useEffect(() => {
    if (!group || panels.length === 0) return;

    const sync = (label: string) => {
      const index = panels.findIndex((panel) => panel.label === label);
      if (index >= 0) setActive(index);
    };

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${group}`);
      if (stored) sync(stored);
    } catch {
      /* private mode */
    }

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<TabGroupDetail>).detail;
      if (detail?.group === group && detail.label) sync(detail.label);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === `${STORAGE_PREFIX}${group}` && event.newValue) {
        sync(event.newValue);
      }
    };

    window.addEventListener(GROUP_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(GROUP_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [group, panels]);

  if (panels.length === 0) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = panels.length - 1;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      select((active + 1) % panels.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      select((active - 1 + panels.length) % panels.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(last);
    }
  };

  return (
    <div className={cx("mdx-tabs", className)}>
      <div
        className="mdx-tablist"
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
      >
        {panels.map((panel, index) => {
          const selected = index === active;
          return (
            <button
              key={panel.label}
              type="button"
              className="mdx-tab"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
            >
              {panel.label}
            </button>
          );
        })}
      </div>
      {panels.map((panel, index) => (
        <div
          key={panel.label}
          className="mdx-tabpanel"
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
