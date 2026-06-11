import type { Metadata } from "next";
import BlogIndex, { type BlogIndexPost } from "./BlogIndex";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { getBlogPosts } from "../lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Product updates, engineering notes, and guides from Voltius, the open-source SSH, SFTP, and serial client.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/blog/rss.xml",
    },
  },
  openGraph: {
    title: "Blog - Voltius",
    description:
      "Product updates, engineering notes, and guides from Voltius, the open-source SSH, SFTP, and serial client.",
    url: "/blog",
    images: ["/opengraph-image"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@VoltiusApp",
    creator: "@VoltiusApp",
    title: "Blog - Voltius",
    description:
      "Product updates, engineering notes, and guides from Voltius, the open-source SSH, SFTP, and serial client.",
    images: ["/twitter-image"],
  },
};

export default function BlogPage() {
  const posts: BlogIndexPost[] = getBlogPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    version: post.version,
    tags: post.tags,
    readingTime: post.readingTime,
  }));
  const topics = Array.from(
    new Set(posts.flatMap((post) => [post.category, ...post.tags]).filter(Boolean))
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <Navbar />

      <main className="page-enter relative isolate mx-auto max-w-6xl overflow-hidden px-6 pb-20 pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] [background-image:repeating-linear-gradient(to_right,rgb(9,38,44)_0_1px,transparent_1px_72px),repeating-linear-gradient(to_bottom,rgb(9,38,44)_0_1px,transparent_1px_72px)] [mask-image:radial-gradient(ellipse_at_top,black_18%,transparent_66%)]" />
        <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
              Voltius Blog
            </p>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Field notes for fast, private infrastructure work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Release notes, SFTP workflows, sync architecture, and engineering decisions behind
              the open-source SSH, SFTP, and serial client built with Rust and Tauri.
            </p>
          </div>

          <BlogIndex posts={posts} topics={topics} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
