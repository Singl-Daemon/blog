import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteConfig } from "@/lib/site";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import FluentRegistry from "./FluentRegistry";
import Providers from "./providers";

const THEME_BOOTSTRAP = `(function(){try{var d=document.documentElement;var override=localStorage.getItem('blog-theme-override');var dark=override?override==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;d.setAttribute('data-theme',dark?'dark':'light');d.style.colorScheme=dark?'dark':'light';var mobile=window.matchMedia('(max-width: 768px)').matches;var expanded=localStorage.getItem('blog-sidebar-expanded');if(mobile){d.setAttribute('data-sidebar-mobile','1')}else if(expanded==='false'){d.setAttribute('data-sidebar','collapsed')}else{d.setAttribute('data-sidebar','expanded')}d.setAttribute('data-sidebar-boot','1');if(!mobile&&expanded==='false'){var s=document.createElement('style');s.id='sidebar-boot-css';s.textContent='aside.blog-sidebar{width:72px!important;max-width:72px!important;min-width:0!important;padding-left:14px!important;padding-right:14px!important;transition:none!important}aside.blog-sidebar .sidebar-profile{max-height:0!important;opacity:0!important;margin-top:0!important;overflow:hidden!important}aside.blog-sidebar .sidebar-nav-text{max-width:0!important;width:0!important;opacity:0!important;overflow:hidden!important}';document.documentElement.appendChild(s)}}catch(e){}})();`;

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  return {
    title: {
      default: site.title,
      template: `%s · ${site.title}`,
    },
    description: site.author.bio,
    icons: {
      icon: [
        {
          url: site.favicon.light32,
          sizes: "32x32",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: site.favicon.dark32,
          sizes: "32x32",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      apple: [
        {
          url: site.favicon.light180,
          media: "(prefers-color-scheme: light)",
        },
        {
          url: site.favicon.dark180,
          media: "(prefers-color-scheme: dark)",
        },
      ],
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const site = getSiteConfig();

  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Blocking FOUC bootstrap: must run before body so collapsed sidebar is painted narrow. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme/sidebar bootstrap, no user input */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <noscript>
          <style>{`html:not([data-sidebar-boot]) .blog-sidebar{visibility:visible!important}`}</style>
        </noscript>
        <link
          rel="preconnect"
          href="https://cdn-font.hyperos.mi.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify"
        />
      </head>
      <body>
        <FluentRegistry>
          <Providers>
            <ClientLayout
              siteTitle={site.title}
              authorName={site.author.name}
              authorAvatar={site.avatar}
            >
              {children}
            </ClientLayout>
          </Providers>
        </FluentRegistry>
      </body>
    </html>
  );
}
