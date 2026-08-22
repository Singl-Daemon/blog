"use client";

import { Button } from "@fluentui/react-components";
import { Navigation24Regular } from "@fluentui/react-icons";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { setClientSiteTitle } from "@/lib/site-title";
import ReadingProgress from "./components/ReadingProgress";
import Sidebar from "./components/Sidebar";
import CardMorphHost from "./CardMorphHost";
import NavigationEffects from "./NavigationEffects";

export default function ClientLayout({
  children,
  siteTitle,
  authorName,
  authorAvatar,
}: {
  children: ReactNode;
  siteTitle: string;
  authorName: string;
  authorAvatar: string;
}) {
  setClientSiteTitle(siteTitle);
  const pathname = usePathname();
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);

  useLayoutEffect(() => {
    const saved = localStorage.getItem("blog-sidebar-expanded");
    if (saved !== null) setIsDesktopExpanded(saved === "true");
    setHydrated(true);
  }, []);

  useLayoutEffect(() => {
    if (!hydrated) return;
    document.documentElement.removeAttribute("data-sidebar");
    document.documentElement.removeAttribute("data-sidebar-mobile");
    document.getElementById("sidebar-boot-css")?.remove();
    const id = requestAnimationFrame(() => setAllowMotion(true));
    return () => cancelAnimationFrame(id);
  }, [hydrated]);

  useEffect(() => {
    if (!pathname) return;
    setIsSidebarOpenMobile(false);
  }, [pathname]);

  const closeMobileSidebar = useCallback(() => {
    setIsSidebarOpenMobile(false);
  }, []);

  const toggleDesktopSidebar = useCallback(() => {
    setIsDesktopExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("blog-sidebar-expanded", String(next));
      return next;
    });
  }, []);

  return (
    <>
      <NavigationEffects siteTitle={siteTitle} />
      <CardMorphHost />
      <div className="fluent-bg" aria-hidden="true">
        <span className="fluent-orb fluent-wash fluent-wash-1" />
        <span className="fluent-orb fluent-wash fluent-wash-2" />
        <span className="fluent-orb fluent-orb-1" />
        <span className="fluent-orb fluent-orb-2" />
        <span className="fluent-orb fluent-orb-3" />
        <span className="fluent-orb fluent-orb-4" />
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Sidebar
          isOpen={isSidebarOpenMobile}
          onClose={closeMobileSidebar}
          onToggleDesktop={toggleDesktopSidebar}
          isDesktopExpanded={isDesktopExpanded}
          allowMotion={allowMotion}
          siteTitle={siteTitle}
          authorName={authorName}
          authorAvatar={authorAvatar}
        />

        <main
          className="site-main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            transition: allowMotion
              ? "padding 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
              : "none",
          }}
        >
          <ReadingProgress />
          <div className="mobile-only-header">
            <Button
              appearance="subtle"
              icon={<Navigation24Regular />}
              aria-label="打开菜单"
              onClick={() => setIsSidebarOpenMobile(true)}
            />
            <span
              style={{ marginLeft: "8px", fontWeight: 600, fontSize: "14px" }}
            >
              {siteTitle}
            </span>
          </div>

          <div className="content-area">{children}</div>
        </main>

        <button
          type="button"
          aria-label="关闭侧边栏"
          aria-hidden={!isSidebarOpenMobile}
          tabIndex={isSidebarOpenMobile ? 0 : -1}
          onClick={closeMobileSidebar}
          className={`mobile-overlay${isSidebarOpenMobile ? " is-open" : ""}`}
        />
      </div>
    </>
  );
}
