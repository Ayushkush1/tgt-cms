import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Pages listed in SEO even without a navigation link. Home is not one: it uses Global SEO.
    const knownStaticSlugs = ["ceo"];

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

    const links = await prisma.navLink.findMany({
      orderBy: { order: "asc" },
    });

    const servicesPage = await prisma.page.findUnique({
      where: { slug: "services" },
      include: {
        sections: true,
      },
    });

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
          const content = section.content as any;
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
        pageId: null,
        title: link.label,
        slug: link.url === "/" ? "home" : link.url.replace(/^\//, ""),
        metaTitle: null,
        metaDescription: null,
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

    const unmatchedData = unmatchedPages.map((page) => {
      return {
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
      };
    });

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

    // The home page's SEO lives in Global SEO, not in Page Settings
    const finalData = [...mergedData, ...unmatchedData].filter((item) => item.slug !== "home");

    return NextResponse.json({ success: true, data: finalData });
  } catch (error) {
    console.error("Error fetching pages for SEO:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
