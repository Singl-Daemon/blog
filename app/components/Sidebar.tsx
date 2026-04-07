"use client";

import React, { useState, useEffect } from "react";
import {
  makeStyles,
  tokens,
  Button,
  Avatar,
  Title3,
  Tooltip,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemRadio,
} from "@fluentui/react-components";
import {
  Home24Regular,
  Library24Regular,
  Person24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Navigation24Regular,
  Tag24Regular,
  Folder24Regular,
  Dismiss24Regular,
  Desktop24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";
import { useTheme } from "../providers";

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
  },
  // Single unified nav button — icon position is always identical.
  // Text visibility is controlled purely via inline CSS transitions.
  navButton: {
    justifyContent: "flex-start",
    // minWidth:0 overrides Fluent UI's default 96px so the button respects width:100%
    // in collapsed mode (content area = 44px). paddingLeft:10px centers a 24px icon
    // symmetrically: 10px gap left + 24px icon + 10px gap right = 44px.
    minWidth: "0px",
    paddingLeft: "10px",
    height: "44px",
    width: "100%",
    transitionProperty: "transform",
    transitionDuration: "0.3s",
    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    ":active": {
      transform: "scale(0.93)",
      transitionDuration: "0.07s",
      transitionTimingFunction: "ease-in",
    },
  },
  // Toggle / close button with WinUI horizontal-squish on press.
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
  siteTitle: string;
  authorName: string;
  authorAvatar: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  onToggleDesktop,
  isDesktopExpanded,
  siteTitle,
  authorName,
  authorAvatar,
}: SidebarProps) {
  const styles = useStyles();
  const { theme, isOverride, setTheme, resetTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const showText = isDesktopExpanded || isMobile;

  // Always 18px horizontal padding so the icon button never shifts position.
  // Collapsed: 80px − 18px×2 = 44px content area = exact icon button size.
  // Expanded:  300px − 18px×2 = 264px content area.
  const sidebarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    paddingTop: "24px",
    paddingRight: "18px",
    paddingBottom: "32px",
    paddingLeft: "18px",
    background: "var(--color-surface)",
    backdropFilter: "blur(20px) saturate(150%)",
    WebkitBackdropFilter: "blur(20px) saturate(150%)",
    height: "100vh",
    position: isMobile ? "fixed" : "sticky",
    top: 0,
    gap: "24px",
    transition:
      "width 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
    borderRight: "1px solid var(--color-border)",
    zIndex: 1000,
    boxSizing: "border-box",
    overflowY: "auto",
    overflowX: "hidden",
    width: isMobile ? "280px" : isDesktopExpanded ? "300px" : "80px",
    transform: isMobile
      ? isOpen
        ? "translateX(0)"
        : "translateX(-100%)"
      : "none",
    boxShadow: isMobile && isOpen ? "4px 0 24px rgba(0,0,0,0.15)" : "none",
  };

  // Text clip wrapper: collapses to 0 on sidebar close, expands with a slight delay on open.
  // Using two nested spans so the paddingLeft for spacing is clipped along with the content.
  const textClipStyle: React.CSSProperties = {
    display: "inline-block",
    overflow: "hidden",
    maxWidth: showText ? "220px" : "0px",
    opacity: showText ? 1 : 0,
    transition: showText
      ? "max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, opacity 0.25s ease 0.12s"
      : "max-width 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.12s ease",
  };

  const renderNavButton = (
    icon: React.ReactElement,
    text: string,
    onClick?: () => void,
  ) => {
    const button = (
      <Button
        icon={icon}
        appearance="subtle"
        className={styles.navButton}
        onClick={onClick}
        aria-label={text}
      >
        {/* Outer span clips; inner span carries spacing so margin is also clipped to 0 */}
        <span style={textClipStyle}>
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

    if (!showText) {
      return (
        <Tooltip content={text} relationship="label" positioning="after">
          {button}
        </Tooltip>
      );
    }
    return button;
  };

  return (
    <aside style={sidebarStyle}>
      {/* Toggle button — anchored to the left edge, never participates in the width animation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "44px",
          marginBottom: "8px",
          flexShrink: 0,
        }}
      >
        {isMobile ? (
          <Button
            appearance="subtle"
            icon={<Dismiss24Regular style={{ fontSize: "28px" }} />}
            className={styles.toggleBtn}
            onClick={onClose}
            aria-label="Close menu"
          />
        ) : (
          <Button
            appearance="subtle"
            icon={<Navigation24Regular style={{ fontSize: "28px" }} />}
            className={styles.toggleBtn}
            onClick={onToggleDesktop}
            aria-label="Toggle sidebar"
          />
        )}
      </div>

      {showText && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            transition: "opacity 0.3s",
            marginTop: "16px",
            flexShrink: 0,
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
      )}

      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>
          {renderNavButton(
            <Home24Regular />,
            "主页 / Home",
            isMobile ? onClose : undefined,
          )}
        </Link>
        <Link href="/archive" className={styles.link}>
          {renderNavButton(
            <Library24Regular />,
            "归档 / Archive",
            isMobile ? onClose : undefined,
          )}
        </Link>
        <Link href="/tags" className={styles.link}>
          {renderNavButton(
            <Tag24Regular />,
            "标签 / Tags",
            isMobile ? onClose : undefined,
          )}
        </Link>
        <Link href="/categories" className={styles.link}>
          {renderNavButton(
            <Folder24Regular />,
            "分类 / Categories",
            isMobile ? onClose : undefined,
          )}
        </Link>
        <Link href="/about" className={styles.link}>
          {renderNavButton(
            <Person24Regular />,
            "关于 / About",
            isMobile ? onClose : undefined,
          )}
        </Link>
      </nav>

      <div style={{ marginTop: "auto" }}>
        <Menu
          checkedValues={{ theme: [!isOverride ? "system" : theme] }}
          onCheckedValueChange={(_, { checkedItems }) => {
            const val = checkedItems[0] as "light" | "dark" | "system";
            if (val === "system") resetTheme();
            else setTheme(val);
            if (isMobile) onClose();
          }}
          positioning="after-top"
        >
          <MenuTrigger disableButtonEnhancement>
            {renderNavButton(
              !isOverride
                ? <Desktop24Regular />
                : theme === "dark"
                  ? <WeatherMoon24Regular />
                  : <WeatherSunny24Regular />,
              !isOverride ? "跟随系统" : theme === "dark" ? "暗色模式" : "亮色模式",
            )}
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItemRadio name="theme" value="light" icon={<WeatherSunny24Regular />}>
                亮色
              </MenuItemRadio>
              <MenuItemRadio name="theme" value="dark" icon={<WeatherMoon24Regular />}>
                暗色
              </MenuItemRadio>
              <MenuItemRadio name="theme" value="system" icon={<Desktop24Regular />}>
                跟随系统
              </MenuItemRadio>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </aside>
  );
}
