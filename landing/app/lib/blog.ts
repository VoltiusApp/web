import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
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

const blogContentDir = path.join(process.cwd(), "content", "blog");

function readPost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.mdx$/, "");
  const fullPath = path.join(blogContentDir, fileName);
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
    .readdirSync(blogContentDir)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(readPost);
}

export function getBlogPosts() {
  return readPosts()
    .filter((post) => !post.draft)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getBlogPost(slug: string) {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}
