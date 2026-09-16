import { getBlogPosts } from "../lib/blog";
import { GITHUB_REPO_URL } from "../lib/github";
import { SITE_URL } from "../lib/site";

export function GET() {
  const posts = getBlogPosts()
    .map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`)
    .join("\n");

  const body = `# Voltius

> A blazing fast, local-first SSH & SFTP client built with Rust and Tauri. Free forever, no account required. E2EE sync, SFTP drag & drop, Docker, plugins, and more.

- Platforms: Windows, macOS, Linux, Android
- Source: ${GITHUB_REPO_URL}
- Pricing: ${SITE_URL}/#pricing
- Docs & changelog: ${SITE_URL}/blog

## Blog
${posts}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
