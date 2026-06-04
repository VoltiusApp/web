import { getBlogPosts } from "../../lib/blog";
import { SITE_NAME, SITE_URL } from "../../lib/site";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getBlogPosts();
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <description>${escapeXml(post.description)}</description>
          <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
          <category>${escapeXml(post.category)}</category>
        </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${SITE_NAME} Blog</title>
        <link>${SITE_URL}/blog</link>
        <description>Product updates, engineering notes, and guides from ${SITE_NAME}.</description>
        <language>en</language>${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
