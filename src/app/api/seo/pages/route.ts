import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toInternalPath } from "@/lib/siteLinks";
import { toBlogSlug } from "@/lib/blogSlug";

interface SEOFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
}

interface BlogEntry {
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  seo?: SEOFields;
}

interface ServiceOrBlogSectionContent {
  seo?: SEOFields;
  blogs?: BlogEntry[];
}

export async function GET() {
  try {
    // Pages listed in SEO even without a navigation link. Home is not one: it uses Global SEO.
    const knownStaticSlugs = ["blog", "media", "ceo"];

    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        type: true,
        visibility: true,
      },
    });

    const allLinks = await prisma.navLink.findMany({
      orderBy: { order: "asc" },
    });

    // Only links to pages on this website get SEO. External links (e.g. product demos on
    // other domains) are dropped; a URL-less dropdown is kept only to group website links.
    const internalLinks = allLinks
      .map((link) => ({ ...link, url: toInternalPath(link.url) }))
      .filter((link): link is typeof link & { url: string } => link.url !== null);
    const groupingLinks = allLinks
      .filter(
        (link) => !link.url?.trim() && internalLinks.some((child) => child.parent === link.id),
      )
      .map((link) => ({ ...link, url: "" }));
    const links = [...internalLinks, ...groupingLinks].sort((a, b) => a.order - b.order);

    const [servicesPage, homePage] = await Promise.all([
      prisma.page.findUnique({
        where: { slug: "services" },
        include: { sections: true },
      }),
      prisma.page.findUnique({
        where: { slug: "home" },
        include: {
          sections: {
            where: { type: "BlogSection" },
          },
        },
      }),
    ]);

    const mergedData = links.map((link) => {
      const urlMatchesSlug = (url: string, slug: string) => {
        if (url === "/" && slug === "home") return true;
        return url === `/${slug}`;
      };

      // 1. Try to match with a regular page
      const matchedPage = pages.find((p) => urlMatchesSlug(link.url, p.slug));

      if (matchedPage) {
        return {
          id: link.id,
          pageId: matchedPage.id,
          title: link.label,
          slug: matchedPage.slug,
          metaTitle: matchedPage.metaTitle,
          metaDescription: matchedPage.metaDescription,
          type: link.type || matchedPage.type,
          visibility: matchedPage.visibility,
          parent: link.parent,
          order: link.order,
          description: link.description,
          navTitle: link.title,
          isStatic: link.isStatic,
        };
      }

      // 2. Try to match with a service sub-page
      if (link.url.startsWith("/service/") && servicesPage) {
        const serviceId = link.url.split("/service/")[1];
        const section = servicesPage.sections.find((s) => s.type === serviceId);
        if (section) {
          const content = (section.content as ServiceOrBlogSectionContent | null) || {};
          return {
            id: link.id,
            pageId: `${servicesPage.id}-${serviceId}`,
            title: link.label,
            slug: link.url.replace(/^\//, ""),
            metaTitle: content.seo?.metaTitle || null,
            metaDescription: content.seo?.metaDescription || null,
            type: link.type || "sub-link",
            visibility: "published",
            parent: link.parent,
            order: link.order,
            description: link.description,
            navTitle: link.title,
            isStatic: link.isStatic,
          };
        }
      }

      // 3. Fallback for static/missing links
      return {
        id: link.id,
        pageId: null as string | null,
        title: link.label,
        slug: link.url === "/" ? "home" : link.url.replace(/^\//, ""),
        metaTitle: null as string | null,
        metaDescription: null as string | null,
        type: link.type || "static",
        visibility: "published",
        parent: link.parent,
        order: link.order,
        description: link.description,
        navTitle: link.title,
        isStatic: link.isStatic,
      };
    });

    // 4. Find pages that are not linked in NavLinks (only the always-listed static pages)
    const unmatchedPages = pages.filter((page) => {
      if (!knownStaticSlugs.includes(page.slug)) return false;
      const isMatched = links.some((link) => {
        if (link.url === "/" && page.slug === "home") return true;
        return link.url === `/${page.slug}`;
      });
      return !isMatched;
    });

    const unmatchedData = unmatchedPages.map((page) => ({
      id: page.id,
      pageId: page.id as string | null,
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      type: page.type || "static",
      visibility: page.visibility,
      parent: "-",
      order: 100,
      description: null as string | null,
      navTitle: page.title,
      isStatic: true,
    }));

    // 5. Ensure the known static pages are included even if not in Page table yet
    knownStaticSlugs.forEach((slug) => {
      const isRepresented = [...mergedData, ...unmatchedData].some((item) => item.slug === slug);
      if (!isRepresented) {
        unmatchedData.push({
          id: `static-${slug}`,
          pageId: null,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug: slug,
          metaTitle: null,
          metaDescription: null,
          type: "static",
          visibility: "published",
          parent: "-",
          order: 101,
          description: null,
          navTitle: slug.charAt(0).toUpperCase() + slug.slice(1),
          isStatic: true,
        });
      }
    });

    // 6. Include individual blog article pages (/blog/[slug]) nested under the Blog entry
    const blogEntries: typeof mergedData = [];
    const blogRoot = [...mergedData, ...unmatchedData].find((item) => item.slug === "blog");
    const blogSection = homePage?.sections?.[0];
    const blogSectionContent = (blogSection?.content as ServiceOrBlogSectionContent | null) || {};
    const blogs = Array.isArray(blogSectionContent.blogs) ? blogSectionContent.blogs : [];

    if (blogRoot) {
      blogs.forEach((blog, idx) => {
        if (!blog?.title || typeof blog.title !== "string") return;
        const postSlug =
          typeof blog.slug === "string" && blog.slug.trim()
            ? blog.slug.trim()
            : toBlogSlug(blog.title);
        blogEntries.push({
          id: `blog-post-${idx}`,
          pageId: `${homePage?.id || "home"}-blog-${idx}`,
          title: blog.title,
          slug: `blog/${postSlug}`,
          metaTitle: blog.seo?.metaTitle || null,
          metaDescription: blog.seo?.metaDescription || null,
          type: "Blog Post",
          visibility: "published",
          parent: blogRoot.id,
          order: idx + 1,
          description: blog.excerpt || null,
          navTitle: blog.category || null,
          isStatic: false,
        });
      });
    }

    // The home page's SEO lives in Global SEO, not in Page Settings
    const finalData = [...mergedData, ...unmatchedData, ...blogEntries].filter(
      (item) => item.slug !== "home",
    );

    return NextResponse.json({ success: true, data: finalData });
  } catch (error) {
    console.error("Error fetching pages for SEO:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
