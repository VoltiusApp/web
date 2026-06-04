import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import { formatBlogDate, getBlogPosts } from "../lib/blog";

type BlogPageProps = {
  searchParams: Promise<{ topic?: string }>;
};

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Product updates, engineering notes, and guides from Voltius, the open-source SSH, SFTP, and serial client.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog - Voltius",
    description:
      "Product updates, engineering notes, and guides from Voltius, the open-source SSH, SFTP, and serial client.",
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@VoltiusApp",
    creator: "@VoltiusApp",
    title: "Blog - Voltius",
    description:
      "Product updates, engineering notes, and guides from Voltius, the open-source SSH, SFTP, and serial client.",
  },
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const posts = getBlogPosts();
  const { topic } = await searchParams;
  const topics = Array.from(
    new Set(posts.flatMap((post) => [post.category, ...post.tags]).filter(Boolean))
  ).slice(0, 8);
  const activeTopic = topics.find((item) => item.toLowerCase() === topic?.toLowerCase());
  const visiblePosts = activeTopic
    ? posts.filter((post) => post.category === activeTopic || post.tags.includes(activeTopic))
    : posts;
  const [featuredPost, ...archivePosts] = visiblePosts;
  const postsToShow = archivePosts.length > 0 ? archivePosts : visiblePosts;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="px-4 pt-3">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-6 shadow-[0_14px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
            <Image src="/logo.png" alt="Voltius" width={28} height={28} />
            Voltius
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] leading-none text-amber-400">
              Beta
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="hidden text-zinc-400 transition-colors hover:text-white sm:inline">
              Home
            </Link>
            <Link
              href="/#download"
              className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-black transition-colors hover:bg-cyan-400"
            >
              Download
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative isolate mx-auto max-w-6xl overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
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

          {topics.length > 0 && (
            <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
              <p className="text-sm font-medium text-cyan-200">Browse by topic</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/blog"
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    activeTopic
                      ? "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-400/35 hover:text-cyan-100"
                      : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                  }`}
                >
                  All
                </Link>
                {topics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/blog?topic=${encodeURIComponent(topic)}`}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      activeTopic === topic
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                        : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-cyan-400/35 hover:text-cyan-100"
                    }`}
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {featuredPost && (
          <section className="mt-16">
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
                  <time dateTime={featuredPost.date}>{formatBlogDate(featuredPost.date)}</time>
                  <span>{featuredPost.readingTime}</span>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-100 sm:text-4xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                  {featuredPost.description}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition-colors group-hover:text-cyan-200">
                  Read the latest
                  <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
                </div>
              </article>
            </Link>
          </section>
        )}

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
                Archive
              </p>
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
                    <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
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
      </main>

      <Footer />
    </div>
  );
}
