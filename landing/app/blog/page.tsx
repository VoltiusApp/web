import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import { formatBlogDate, getBlogPosts } from "../lib/blog";

export const metadata: Metadata = {
  title: "Blog — Voltius",
  description:
    "Product updates, engineering notes, and guides from Voltius, the open-source SSH, SFTP, and serial client.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-[#1e1e2e] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
            ← Voltius
          </Link>
          <Link href="/#download" className="text-sm text-cyan-300 transition-colors hover:text-cyan-200">
            Download
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
            Blog
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Notes from Voltius
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Product updates, engineering notes, release news, and guides for the open-source
            SSH, SFTP, and serial client built with Rust and Tauri.
          </p>
        </div>

        <div className="mt-14 space-y-5">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-cyan-400/40 hover:bg-white/[0.05] sm:p-8"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                    {post.category}
                  </span>
                  {post.version && <span className="font-mono text-zinc-400">{post.version}</span>}
                  <span>{formatBlogDate(post.date)}</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-100">
                  {post.title}
                </h2>
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
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
