/**
 * Blog posts live on the home page's BlogSection. Their bodies (contentHtml) embed
 * base64 images, MBs each, so the website reads pages without them and fetches
 * one post body at a time.
 */

/** URL slug of a post, as used by the website: /blog/<slug> */
export const blogSlug = (title: string) => title.toLowerCase().replace(/\s+/g, "-");

type SectionLike = { type: string; content: unknown };
type BlogLike = { title?: string; contentHtml?: unknown };

/** The section unchanged, unless it is the BlogSection: then without the post bodies. */
export function withoutBlogBodies<T extends SectionLike>(section: T): T {
  const content = section.content as { blogs?: BlogLike[] } | null;
  if (section.type !== "BlogSection" || !Array.isArray(content?.blogs)) return section;
  return {
    ...section,
    content: {
      ...content,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      blogs: content.blogs.map(({ contentHtml, ...blog }) => blog),
    },
  };
}

/** The post in a BlogSection's content whose title matches the URL slug. */
export function findBlogPost(content: unknown, slug: string): BlogLike | undefined {
  const blogs = (content as { blogs?: BlogLike[] } | null)?.blogs;
  return Array.isArray(blogs)
    ? blogs.find((blog) => blogSlug(blog.title ?? "") === slug)
    : undefined;
}
