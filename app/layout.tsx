import "./globals.css";
import Providers from "./providers";
import ClientLayout from "./ClientLayout";
import FluentRegistry from "./FluentRegistry";
import { getSiteConfig } from "../lib/site";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  return {
    title: site.title,
    description: site.author.bio,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = getSiteConfig();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement;var override=localStorage.getItem('blog-theme-override');var dark=override?override==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;d.setAttribute('data-theme',dark?'dark':'light');d.style.colorScheme=dark?'dark':'light';}catch(e){}})();` }} />
        <link rel="icon" href="/favicon/favicon-light-32.png" sizes="32x32" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon/favicon-dark-32.png" sizes="32x32" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/favicon/favicon-light-180.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/favicon/favicon-dark-180.png" media="(prefers-color-scheme: dark)" />
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
