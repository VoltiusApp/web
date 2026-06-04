import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ChangelogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  version?: string;
  tags: string[];
  draft?: boolean;
  content: string;
};

const changelogDir = path.join(process.cwd(), "content", "changelog");

function readPost(fileName: string): ChangelogPost {
  const slug = fileName.replace(/\.mdx$/, "");
  const fullPath = path.join(changelogDir, fileName);
  const file = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(file);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    category: String(data.category ?? "Update"),
    version: data.version ? String(data.version) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: Boolean(data.draft),
    content,
  };
}

function readPosts() {
  return fs
    .readdirSync(changelogDir)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(readPost);
}

export function getChangelogPosts() {
  return readPosts()
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
