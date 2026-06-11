import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import {
  formatBlogDate,
  getAdjacentBlogPosts,
  getBlogPost,
  getBlogPosts,
} from "../../lib/blog";
import { SITE_NAME, SITE_URL } from "../../lib/site";
import { mdxComponents } from "../../../mdx-components";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      site: "@VoltiusApp",
      creator: "@VoltiusApp",
      title: post.title,
      description: post.description,
      images: ["/twitter-image"],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const { previousPost, nextPost } = getAdjacentBlogPosts(post.slug);
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="page-enter relative isolate mx-auto max-w-5xl overflow-hidden px-6 pb-20 pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] [background-image:repeating-linear-gradient(to_right,rgb(9,38,44)_0_1px,transparent_1px_72px),repeating-linear-gradient(to_bottom,rgb(9,38,44)_0_1px,transparent_1px_72px)] [mask-image:radial-gradient(ellipse_at_top,black_14%,transparent_68%)]" />
        <div className="pointer-events-none absolute left-1/2 top-16 -z-10 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <span>&lt;-</span>
          Back to all posts
        </Link>

        <header className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/20 sm:p-10">
          <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
              {post.category}
            </span>
            {post.version && <span className="font-mono text-zinc-400">{post.version}</span>}
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            <span>{post.readingTime}</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">{post.description}</p>

          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <article className="mx-auto mt-12 max-w-3xl border-t border-white/10 pt-10">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>

        <section className="mx-auto mt-16 max-w-3xl rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-7 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
            Try Voltius
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Bring the workflow into the app.
          </h2>
          <p className="mt-3 leading-7 text-zinc-400">
            Voltius is open source, local-first, and available without creating an account.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#download"
              className="rounded-xl bg-cyan-500 px-5 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
            >
              Download Voltius
            </Link>
            <Link
              href="/blog"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              More posts
            </Link>
          </div>
        </section>

        {(previousPost || nextPost) && (
          <nav className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            {previousPost ? (
              <Link
                href={`/blog/${previousPost.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-cyan-400/35 hover:bg-white/[0.05]"
              >
                <p className="text-sm text-zinc-500">Previous</p>
                <p className="mt-2 font-medium text-white transition-colors group-hover:text-cyan-100">
                  {previousPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-cyan-400/35 hover:bg-white/[0.05] sm:text-right"
              >
                <p className="text-sm text-zinc-500">Next</p>
                <p className="mt-2 font-medium text-white transition-colors group-hover:text-cyan-100">
                  {nextPost.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </main>

      <Footer />
    </div>
  );
}
