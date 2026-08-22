import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site";

export function homeMetadata(): Metadata {
  const site = getSiteConfig();
  return {
    title: { absolute: site.title },
    description: site.pages.home.description,
  };
}

export function pageMetadata(
  title: string,
  description?: string,
): Metadata {
  const site = getSiteConfig();
  return {
    title,
    description: description ?? site.author.bio,
  };
}
