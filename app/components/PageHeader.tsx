"use client";

import {
  Caption1,
  makeStyles,
  Title1,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeft24Regular } from "@fluentui/react-icons";
import Link from "next/link";
import type { ReactNode } from "react";
import { FadeIn } from "@/app/components/FadeIn";

const useStyles = makeStyles({
  title: {
    fontSize: "30px",
    lineHeight: "36px",
    letterSpacing: "-0.02em",
    marginTop: "0px",
    marginBottom: "0px",
    paddingTop: "0px",
    paddingBottom: "0px",
    "@media (max-width: 768px)": {
      fontSize: "26px",
      lineHeight: "32px",
    },
  },
  description: {
    fontSize: "15px",
    color: tokens.colorNeutralForeground3,
    lineHeight: "22px",
    marginTop: "0px",
    marginBottom: "0px",
  },
});

export function PageHeader({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  const styles = useStyles();

  return (
    <FadeIn yOffset={16} duration={0.5}>
      <header className="page-header">
        {back ? (
          <Link href={back.href} className="page-header-back">
            <ArrowLeft24Regular fontSize={20} />
            {back.label}
          </Link>
        ) : null}
        <Title1 as="h1" className={styles.title}>
          {title}
        </Title1>
        {description ? (
          <Caption1 className={styles.description}>{description}</Caption1>
        ) : null}
        {children}
      </header>
      <hr className="page-header-rule" />
    </FadeIn>
  );
}
