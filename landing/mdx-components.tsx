import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 text-2xl font-semibold tracking-tight text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight text-white">
        {children}
      </h3>
    ),
    p: ({ children }) => <p className="my-5 leading-8 text-zinc-300">{children}</p>,
    a: ({ children, href }) => (
      <a href={href} className="text-cyan-300 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-200">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="my-6 list-disc space-y-2 pl-6 text-zinc-300">{children}</ul>,
    ol: ({ children }) => <ol className="my-6 list-decimal space-y-2 pl-6 text-zinc-300">{children}</ol>,
    li: ({ children }) => <li className="leading-7">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    code: ({ children }) => (
      <code className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-sm text-cyan-100">
        {children}
      </code>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-cyan-400/60 pl-5 text-zinc-300">
        {children}
      </blockquote>
    ),
    ...components,
  };
}
