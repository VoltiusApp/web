"use client";

import Link from "next/link";
import { useState } from "react";

export type BlogIndexPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  version?: string;
  tags: string[];
  readingTime: string;
};

type BlogIndexProps = {
  posts: BlogIndexPost[];
  topics: string[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function BlogIndex({ posts, topics }: BlogIndexProps) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const visiblePosts = activeTopic
    ? posts.filter((post) => post.category === activeTopic || post.tags.includes(activeTopic))
    : posts;
  const [featuredPost, ...archivePosts] = visiblePosts;
  const postsToShow = archivePosts.length > 0 ? archivePosts : visiblePosts;

  return (
    <>
      {topics.length > 0 && (
        <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-cyan-200">Browse by topic</p>
            <Link
              href="/blog/rss.xml"
              className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1.5 text-xs font-medium text-orange-200 transition-colors hover:border-orange-300/45 hover:bg-orange-400/15 hover:text-orange-100"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                <path d="M6.18 17.82a2.18 2.18 0 1 1-4.36 0 2.18 2.18 0 0 1 4.36 0ZM2 8.36v3.12c5.8 0 10.52 4.72 10.52 10.52h3.12C15.64 14.48 9.52 8.36 2 8.36ZM2 2v3.12c9.31 0 16.88 7.57 16.88 16.88H22C22 10.97 13.03 2 2 2Z" />
              </svg>
              RSS
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTopic(null)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                activeTopic
                  ? "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-400/35 hover:text-cyan-100"
                  : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
              }`}
            >
              All
            </button>
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setActiveTopic(topic)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  activeTopic === topic
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-400/35 hover:text-cyan-100"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {featuredPost && (
        <section className="mt-16 lg:col-span-2">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 transition-all hover:border-cyan-400/40 hover:bg-white/[0.055] lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="relative min-h-64 border-b border-white/10 bg-[#071216] p-8 lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 [background-image:linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(circle_at_30%_20%,black,transparent_70%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                  Latest post
                </span>
                <div>
                  <p className="font-mono text-sm text-cyan-300">
                    {featuredPost.version ?? featuredPost.category}
                  </p>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">
                    Product context and practical notes from the Voltius beta cycle.
                  </p>
                </div>
              </div>
            </div>

            <article className="p-7 sm:p-10">
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                  {featuredPost.category}
                </span>
                <time dateTime={featuredPost.date}>{formatDate(featuredPost.date)}</time>
                <span>{featuredPost.readingTime}</span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-100 sm:text-4xl">
                {featuredPost.title}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-zinc-400">{featuredPost.description}</p>
              <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition-colors group-hover:text-cyan-200">
                Read the latest
                <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
              </div>
            </article>
          </Link>
        </section>
      )}

      <section className="mt-14 lg:col-span-2">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">Archive</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {activeTopic ? `${activeTopic} posts` : "All posts"}
            </h2>
          </div>
          <p className="text-sm text-zinc-500">{visiblePosts.length} posts</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {postsToShow.map((post) => (
            <article
              key={post.slug}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-white/[0.05] hover:shadow-[0_18px_60px_rgba(34,211,238,0.08)] sm:p-7"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                    {post.category}
                  </span>
                  {post.version && <span className="font-mono text-zinc-400">{post.version}</span>}
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>{post.readingTime}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-100">
                  {post.title}
                </h3>
                <p className="mt-3 max-w-3xl leading-7 text-zinc-400">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-300 opacity-80 transition-opacity group-hover:opacity-100">
                  Read post
                  <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
