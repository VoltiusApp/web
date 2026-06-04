import type { ComponentType } from "react";
import VoltiusBetaLaunch, {
  changelog as voltiusBetaLaunch,
} from "@/content/changelog/voltius-beta-launch.mdx";
import ImportingTermiusHosts, {
  changelog as importingTermiusHosts,
} from "@/content/changelog/importing-termius-hosts.mdx";
import LocalFirstE2eeSync, {
  changelog as localFirstE2eeSync,
} from "@/content/changelog/local-first-e2ee-sync.mdx";
import SftpHostToHostWorkflows, {
  changelog as sftpHostToHostWorkflows,
} from "@/content/changelog/sftp-host-to-host-workflows.mdx";
import SftpTarAcceleration, {
  changelog as sftpTarAcceleration,
} from "@/content/changelog/sftp-tar-acceleration.mdx";

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
  {
    slug: "importing-termius-hosts",
    ...importingTermiusHosts,
    tags: importingTermiusHosts.tags ?? [],
    Component: ImportingTermiusHosts,
  },
  {
    slug: "local-first-e2ee-sync",
    ...localFirstE2eeSync,
    tags: localFirstE2eeSync.tags ?? [],
    Component: LocalFirstE2eeSync,
  },
  {
    slug: "sftp-host-to-host-workflows",
    ...sftpHostToHostWorkflows,
    tags: sftpHostToHostWorkflows.tags ?? [],
    Component: SftpHostToHostWorkflows,
  },
  {
    slug: "sftp-tar-acceleration",
    ...sftpTarAcceleration,
    tags: sftpTarAcceleration.tags ?? [],
    Component: SftpTarAcceleration,
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
