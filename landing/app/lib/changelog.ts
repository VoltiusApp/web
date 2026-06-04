import type { ComponentType } from "react";
import VoltiusBetaLaunch, {
  changelog as voltiusBetaLaunch,
} from "@/content/changelog/voltius-beta-launch.mdx";

export type ChangelogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  version?: string;
  tags: string[];
  draft?: boolean;
  Component: ComponentType;
};

const posts: ChangelogPost[] = [
  {
    slug: "voltius-beta-launch",
    ...voltiusBetaLaunch,
    tags: voltiusBetaLaunch.tags ?? [],
    Component: VoltiusBetaLaunch,
  },
];

export function getChangelogPosts() {
  return posts
    .filter((post) => !post.draft)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getChangelogPost(slug: string) {
  return getChangelogPosts().find((post) => post.slug === slug);
}

export function formatChangelogDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}
