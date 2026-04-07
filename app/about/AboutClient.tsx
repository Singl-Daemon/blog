"use client";

import React from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Caption1,
  Body1,
  Avatar,
  Divider,
} from "@fluentui/react-components";
import {
  Open24Regular,
  Mail24Regular,
  People24Regular,
  Globe24Regular,
  Chat24Regular,
  VideoClip24Regular,
} from "@fluentui/react-icons";
import { FadeIn, staggerContainer, staggerItem } from "../components/FadeIn";
import { motion } from "framer-motion";

function GitHubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function QQIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673" />
    </svg>
  );
}

function BilibiliIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.124.929.373.249.249.373.551.373.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
    </svg>
  );
}

const linkIconMap: Record<string, React.ReactElement> = {
  github: <GitHubIcon />,
  qq: <QQIcon />,
  email: <Mail24Regular />,
  twitter: <Globe24Regular />,
  telegram: <Chat24Regular />,
  discord: <Chat24Regular />,
  bilibili: <BilibiliIcon />,
  website: <Globe24Regular />,
  wechat: <People24Regular />,
  youtube: <VideoClip24Regular />,
};

const useStyles = makeStyles({
  container: {
    display: "flex",
    maxWidth: "840px",
    margin: "0 auto",
    flexDirection: "column",
    gap: "36px",
    width: "100%",
  },
  headerArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-start",
    textAlign: "left" as const,
    marginBottom: "20px",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "32px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
  profileCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "48px 32px",
    position: "relative",
    overflow: "hidden",
    height: "100%",
  },
  profileBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "120px",
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground2}, ${tokens.colorPaletteBlueBackground2})`,
    opacity: 0.5,
    zIndex: 0,
  },
  avatarWrapper: {
    position: "relative",
    zIndex: 1,
    padding: "4px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "50%",
    boxShadow: tokens.shadow8,
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    zIndex: 1,
  },
  links: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
    zIndex: 1,
    marginTop: "8px",
  },
  linkItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    color: tokens.colorNeutralForeground2,
    transitionProperty: "color, transform",
    transitionDuration: "0.2s",
    ":hover": {
      color: tokens.colorBrandForeground1,
      transform: "translateY(-2px)",
    },
  },
  linkIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: tokens.colorNeutralBackground3,
    color: "inherit",
    transitionProperty: "background-color, box-shadow",
    transitionDuration: "0.2s",
    ":hover": {
      backgroundColor: tokens.colorBrandBackground2,
      boxShadow: tokens.shadow4,
    },
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "32px",
    height: "100%",
  },
});

interface AboutClientProps {
  pageTitle: string;
  pageDescription: string;
  authorName: string;
  authorBio: string;
  authorAvatar: string;
  authorLinks: { type: string; label: string; url: string }[];
  mdxContent: React.ReactNode;
}

export default function AboutClient({
  pageTitle,
  pageDescription,
  authorName,
  authorBio,
  authorAvatar,
  authorLinks,
  mdxContent,
}: AboutClientProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <FadeIn yOffset={30}>
        <div className={styles.headerArea}>
          <Title1 style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>
            {pageTitle}
          </Title1>
          <Caption1
            style={{ fontSize: "16px", color: tokens.colorNeutralForeground3 }}
          >
            {pageDescription}
          </Caption1>
        </div>
        <Divider style={{ opacity: 0.6 }} />
      </FadeIn>

      <motion.div
        className={styles.contentGrid}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem} style={{ height: "100%" }}>
          <div className={`${styles.profileCard} acrylic-card`}>
            <div className={styles.profileBg} />
            <div className={styles.avatarWrapper}>
              <Avatar
                name={authorName}
                image={{ src: authorAvatar }}
                size={128}
                color="brand"
              />
            </div>
            <div className={styles.profileInfo}>
              <Title3 style={{ fontSize: "24px", fontWeight: 700 }}>
                {authorName}
              </Title3>
              <Body1
                style={{
                  textAlign: "center",
                  color: tokens.colorNeutralForeground2,
                  lineHeight: 1.6,
                  fontSize: "15px",
                }}
              >
                {authorBio}
              </Body1>
            </div>
            <div className={styles.links}>
              {authorLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkItem}
                >
                  <div className={styles.linkIcon}>
                    {linkIconMap[link.type] || <Open24Regular />}
                  </div>
                  <Caption1 style={{ fontSize: "12px", color: "inherit" }}>
                    {link.label}
                  </Caption1>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} style={{ height: "100%" }}>
          <div className={`${styles.section} acrylic-card`}>
            {mdxContent ?? (
              <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
                在 <code>content/pages/about.md</code> 中添加内容
              </Body1>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
