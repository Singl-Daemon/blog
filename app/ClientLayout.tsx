"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { Button } from "@fluentui/react-components";
import { Navigation24Regular } from "@fluentui/react-icons";

export default function ClientLayout({
  children,
  siteTitle,
  authorName,
  authorAvatar,
}: {
  children: React.ReactNode;
  siteTitle: string;
  authorName: string;
  authorAvatar: string;
}) {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  // Restore sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("blog-sidebar-expanded");
    if (saved !== null) setIsDesktopExpanded(saved === "true");
  }, []);

  return (
    <>
      {/* Fluent gradient background — rendered inside FluentProvider */}
      <div className="fluent-bg" aria-hidden="true">
        <div className="fluent-orb fluent-orb-1" />
        <div className="fluent-orb fluent-orb-2" />
        <div className="fluent-orb fluent-orb-3" />
        <div className="fluent-orb fluent-orb-4" />
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
          onClose={() => setIsSidebarOpenMobile(false)}
          onToggleDesktop={() => setIsDesktopExpanded((prev) => {
            const next = !prev;
            localStorage.setItem("blog-sidebar-expanded", String(next));
            return next;
          })}
          isDesktopExpanded={isDesktopExpanded}
          siteTitle={siteTitle}
          authorName={authorName}
          authorAvatar={authorAvatar}
        />

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Mobile-only top bar */}
          <div
            className="mobile-only-header"
            style={{
              display: "flex",
              padding: "8px 12px",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: "var(--color-surface)",
              backdropFilter: "saturate(180%) blur(20px)",
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
              zIndex: 100,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <Button
              appearance="subtle"
              icon={<Navigation24Regular />}
              onClick={() => setIsSidebarOpenMobile(true)}
            />
            <span
              style={{ marginLeft: "8px", fontWeight: 600, fontSize: "14px" }}
            >
              {siteTitle}
            </span>
          </div>

          <div
            className="content-area"
            style={{ padding: "32px 48px", flex: 1 }}
          >
            {children}
          </div>
        </main>

        {/* Mobile overlay */}
        {isSidebarOpenMobile && (
          <div
            onClick={() => setIsSidebarOpenMobile(false)}
            className="mobile-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 999,
              animation: "fadeIn 0.2s ease",
            }}
          />
        )}
      </div>
    </>
  );
}
