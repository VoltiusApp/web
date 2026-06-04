import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-14 mb-4 scroll-mt-24 text-3xl font-semibold tracking-tight text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-9 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight text-white">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="my-5 text-[1.03rem] leading-8 text-zinc-300">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} className="font-medium text-cyan-300 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-200">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-7 list-disc space-y-3 pl-6 text-zinc-300 marker:text-cyan-300/70">{children}</ul>,
  ol: ({ children }) => <ol className="my-7 list-decimal space-y-3 pl-6 text-zinc-300 marker:text-cyan-300/70">{children}</ol>,
  li: ({ children }) => <li className="leading-8">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-sm text-cyan-100">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-8 overflow-x-auto rounded-2xl border border-cyan-400/15 bg-[#05080a] p-5 text-sm leading-7 text-zinc-200 shadow-2xl shadow-black/20">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.045] px-5 py-1 text-zinc-300">
      {children}
    </blockquote>
  ),
  // MDX content images do not always have known dimensions at authoring time.
  img: ({ alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      className="my-10 w-full rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20"
    />
  ),
  video: ({ children, ...props }) => (
    <video
      {...props}
      controls
      playsInline
      preload="metadata"
      className="my-10 aspect-video w-full rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/20"
    >
      {children}
    </video>
  ),
  iframe: (props) => (
    <iframe
      {...props}
      className="my-10 aspect-video w-full rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/20"
    />
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
