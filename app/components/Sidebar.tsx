"use client";

import { Avatar, Button, makeStyles, Title3 } from "@fluentui/react-components";
import {
  Checkmark16Regular,
  Desktop24Regular,
  Folder24Regular,
  Home24Regular,
  Library24Regular,
  Navigation24Regular,
  Person24Regular,
  Tag24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";
import {
  type CSSProperties,
  memo,
  type ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/app/providers";

const useStyles = makeStyles({
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "24px",
    width: "100%",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
    width: "100%",
    overflow: "hidden",
  },
  navButton: {
    justifyContent: "flex-start",
    minWidth: "0px",
    paddingLeft: "10px",
    paddingRight: "10px",
    columnGap: "0px",
    height: "44px",
    width: "100%",
    overflow: "hidden",
    flexWrap: "nowrap",
    boxSizing: "border-box",
    transitionProperty: "transform",
    transitionDuration: "0.3s",
    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    ":active": {
      transform: "scale(0.93)",
      transitionDuration: "0.07s",
      transitionTimingFunction: "ease-in",
    },
  },
  toggleBtn: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    paddingTop: "0px",
    paddingRight: "0px",
    paddingBottom: "0px",
    paddingLeft: "0px",
    transitionProperty: "transform",
    transitionDuration: "0.3s",
    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    ":active": {
      transform: "scaleX(0.75) scaleY(0.9)",
      transitionDuration: "0.07s",
      transitionTimingFunction: "ease-in",
    },
  },
});

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleDesktop: () => void;
  isDesktopExpanded: boolean;
  allowMotion: boolean;
  siteTitle: string;
  authorName: string;
  authorAvatar: string;
}

function Sidebar({
  isOpen,
  onClose,
  onToggleDesktop,
  isDesktopExpanded,
  allowMotion,
  siteTitle,
  authorName,
  authorAvatar,
}: SidebarProps) {
  const styles = useStyles();
  const { theme, isOverride, setTheme, resetTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [skipWidth, setSkipWidth] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [themePos, setThemePos] = useState({ top: 0, left: 0 });
  const themeBtnRef = useRef<HTMLDivElement>(null);
  const themePopoverRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const isMobileRef = useRef(false);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    isMobileRef.current = mq.matches;
    setIsMobile(mq.matches);

    const onChange = () => {
      const mobile = mq.matches;
      if (mobile === isMobileRef.current) return;
      isMobileRef.current = mobile;
      setSkipWidth(true);
      setIsMobile(mobile);
      if (!mobile) onCloseRef.current();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSkipWidth(false));
      });
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const showText = isDesktopExpanded || isMobile;
  const skipMotion = !allowMotion;
  const fluentEase = "0.4s cubic-bezier(0.16, 1, 0.3, 1)";
  const offScreen = isMobile && !isOpen;
  const themeLabel = !isOverride
    ? "跟随系统"
    : theme === "dark"
      ? "暗色模式"
      : "亮色模式";
  const themeValue = !isOverride ? "system" : theme;

  useLayoutEffect(() => {
    if (!themeOpen) return;

    const place = () => {
      const anchorEl = themeBtnRef.current;
      const menuEl = themePopoverRef.current;
      if (!anchorEl || !menuEl) return;
      const anchor = anchorEl.getBoundingClientRect();
      const mw = menuEl.offsetWidth;
      const mh = menuEl.offsetHeight;
      const pad = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = anchor.right + 8;
      let top = anchor.top;
      if (left + mw > vw - pad) left = anchor.left - mw - 8;
      if (left < pad) left = pad;
      if (top + mh > vh - pad) top = anchor.bottom - mh;
      if (top < pad) top = pad;
      if (top + mh > vh - pad) top = Math.max(pad, vh - mh - pad);
      setThemePos((prev) =>
        prev.top === top && prev.left === left ? prev : { top, left },
      );
    };

    place();
    const raf = window.requestAnimationFrame(place);
    window.addEventListener("resize", place);
    document.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      document.removeEventListener("scroll", place, true);
    };
  }, [themeOpen]);

  useEffect(() => {
    if (!themeOpen) return;
    const onDown = (event: PointerEvent) => {
      const node = event.target as Node;
      if (
        themeBtnRef.current?.contains(node) ||
        themePopoverRef.current?.contains(node)
      ) {
        return;
      }
      setThemeOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setThemeOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [themeOpen]);

  const sidebarStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    paddingTop: isMobile ? "32px" : "24px",
    paddingRight: showText ? "18px" : "14px",
    paddingBottom: "32px",
    paddingLeft: showText ? "18px" : "14px",
    background: "var(--color-surface)",
    backdropFilter: "blur(20px) saturate(150%)",
    WebkitBackdropFilter: "blur(20px) saturate(150%)",
    height: "100vh",
    position: isMobile ? "fixed" : "sticky",
    left: 0,
    top: 0,
    gap: "24px",
    transition: skipMotion
      ? "none"
      : [
          skipWidth ? null : `width ${fluentEase}`,
          skipWidth ? null : `padding ${fluentEase}`,
          "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          "box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          "background 0.35s ease",
          "border-color 0.35s ease",
        ]
          .filter(Boolean)
          .join(", "),
    borderRight: "1px solid var(--color-border)",
    zIndex: 1000,
    boxSizing: "border-box",
    overflowY: "auto",
    overflowX: "hidden",
    width: isMobile ? "280px" : isDesktopExpanded ? "300px" : "72px",
    transform: offScreen ? "translateX(-100%)" : "none",
    boxShadow:
      isMobile && isOpen
        ? "4px 0 24px rgba(0,0,0,0.15)"
        : "0 0 0 0 rgba(0,0,0,0)",
  };

  const textClipStyle: CSSProperties = {
    display: "inline-block",
    overflow: "hidden",
    minWidth: 0,
    maxWidth: showText ? "220px" : "0px",
    opacity: showText ? 1 : 0,
    flexShrink: 1,
    transition: skipMotion
      ? "none"
      : `max-width ${fluentEase}, opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1)`,
  };

  const renderNavButton = (
    icon: ReactElement,
    text: string,
    {
      onClick,
      asSpan = false,
    }: { onClick?: () => void; asSpan?: boolean } = {},
  ) => (
    <Button
      as={(asSpan ? "span" : "button") as "button"}
      icon={icon}
      appearance="subtle"
      className={`${styles.navButton} sidebar-nav-btn${showText ? "" : " is-icon-only"}`}
      onClick={onClick}
      aria-label={text}
      role={asSpan ? "presentation" : undefined}
      tabIndex={asSpan ? -1 : undefined}
    >
      <span className="sidebar-nav-text" style={textClipStyle}>
        <span
          style={{
            display: "block",
            paddingLeft: "12px",
            whiteSpace: "nowrap",
            fontSize: "15px",
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      </span>
    </Button>
  );

  const applyTheme = (value: "light" | "dark" | "system") => {
    if (value === "system") resetTheme();
    else setTheme(value);
    setThemeOpen(false);
    if (isMobile) onClose();
  };

  const themeItems = [
    { value: "light" as const, label: "亮色", icon: <WeatherSunny24Regular /> },
    { value: "dark" as const, label: "暗色", icon: <WeatherMoon24Regular /> },
    {
      value: "system" as const,
      label: "跟随系统",
      icon: <Desktop24Regular />,
    },
  ];

  return (
    <aside
      ref={asideRef}
      className={`blog-sidebar${isOpen ? " is-open" : ""}${skipMotion ? " no-motion" : ""}${showText ? "" : " is-collapsed"}`}
      style={sidebarStyle}
      aria-hidden={isMobile && !isOpen}
      inert={isMobile && !isOpen ? true : undefined}
    >
      {!isMobile ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "44px",
            marginBottom: "8px",
            flexShrink: 0,
            width: "100%",
          }}
        >
          <Button
            appearance="subtle"
            icon={<Navigation24Regular fontSize={28} />}
            className={`${styles.toggleBtn}${showText ? "" : " is-icon-only"}`}
            onClick={onToggleDesktop}
            aria-label={isDesktopExpanded ? "折叠侧边栏" : "展开侧边栏"}
          />
        </div>
      ) : null}

      <div
        className="sidebar-profile"
        aria-hidden={!showText}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
          maxHeight: showText ? "220px" : "0px",
          opacity: showText ? 1 : 0,
          overflow: "hidden",
          pointerEvents: showText ? "auto" : "none",
          marginTop: showText ? "16px" : "0px",
          transition: skipMotion
            ? "none"
            : `max-height ${fluentEase}, opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), margin-top ${fluentEase}`,
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            flexShrink: 0,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <Avatar name={authorName} image={{ src: authorAvatar }} size={120} />
        </div>
        <Title3
          style={{ whiteSpace: "nowrap", fontSize: "18px", fontWeight: 700 }}
        >
          {siteTitle}
        </Title3>
      </div>

      <nav className={styles.nav}>
        <Link
          href="/"
          className={styles.link}
          title={showText ? undefined : "主页"}
          data-page-title={siteTitle}
          onClick={isMobile ? onClose : undefined}
        >
          {renderNavButton(<Home24Regular />, "主页", { asSpan: true })}
        </Link>
        <Link
          href="/archive"
          className={styles.link}
          title={showText ? undefined : "归档"}
          data-page-title="归档"
          onClick={isMobile ? onClose : undefined}
        >
          {renderNavButton(<Library24Regular />, "归档", { asSpan: true })}
        </Link>
        <Link
          href="/tags"
          className={styles.link}
          title={showText ? undefined : "标签"}
          data-page-title="标签"
          onClick={isMobile ? onClose : undefined}
        >
          {renderNavButton(<Tag24Regular />, "标签", { asSpan: true })}
        </Link>
        <Link
          href="/categories"
          className={styles.link}
          title={showText ? undefined : "分类"}
          data-page-title="分类"
          onClick={isMobile ? onClose : undefined}
        >
          {renderNavButton(<Folder24Regular />, "分类", { asSpan: true })}
        </Link>
        <Link
          href="/about"
          className={styles.link}
          title={showText ? undefined : "关于"}
          data-page-title="关于"
          onClick={isMobile ? onClose : undefined}
        >
          {renderNavButton(<Person24Regular />, "关于", { asSpan: true })}
        </Link>
      </nav>

      <div
        style={{
          marginTop: "auto",
          width: "100%",
          flexShrink: 0,
        }}
      >
        <div
          ref={themeBtnRef}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: showText ? "stretch" : "center",
          }}
        >
          {renderNavButton(
            !isOverride ? (
              <Desktop24Regular />
            ) : theme === "dark" ? (
              <WeatherMoon24Regular />
            ) : (
              <WeatherSunny24Regular />
            ),
            themeLabel,
            { onClick: () => setThemeOpen((prev) => !prev) },
          )}
        </div>
      </div>

      {portalReady
        ? createPortal(
            <div
              ref={themePopoverRef}
              className={`theme-menu-popover${themeOpen ? " is-open" : ""}`}
              style={{ top: themePos.top, left: themePos.left }}
              role="menu"
              aria-hidden={!themeOpen}
            >
              {themeItems.map((item) => {
                const checked = themeValue === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={checked}
                    className="theme-menu-item"
                    tabIndex={themeOpen ? 0 : -1}
                    onClick={() => applyTheme(item.value)}
                  >
                    <span className="theme-menu-check" aria-hidden>
                      {checked ? <Checkmark16Regular /> : null}
                    </span>
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </aside>
  );
}

export default memo(Sidebar);
