import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  formatBlogDate,
  getBlogPost,
  getBlogPosts,
} from "../../lib/blog";
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
      title: "Blog — Voltius",
    };
  }

  return {
    title: `${post.title} — Voltius`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-[#1e1e2e] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/blog" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
            ← Blog
          </Link>
          <Link href="/" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">
            Voltius
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="mb-10 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
            {post.category}
          </span>
          {post.version && <span className="font-mono text-zinc-400">{post.version}</span>}
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-400">{post.description}</p>

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        <article className="mt-14 border-t border-white/10 pt-10">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>
      </main>
    </div>
  );
}
