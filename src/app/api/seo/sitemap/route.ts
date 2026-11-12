import { prisma } from "@/lib/prisma";
import { toInternalPath } from "@/lib/siteLinks";

// Always read fresh: a CDN-cached copy would hide saves from the CMS for hours
export const dynamic = "force-dynamic";
const NO_STORE = "no-store, max-age=0";

const SITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "";

export async function GET() {
  try {
    const config = await prisma.globalConfig.findUnique({
      where: { id: "global" },
    });

    if (config && config.sitemapEnabled === false) {
      return new Response("Sitemap is disabled", {
        status: 404,
        headers: { "Cache-Control": NO_STORE },
      });
    }

    if (config && config.sitemapCustomContent) {
      return new Response(config.sitemapCustomContent, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": NO_STORE,
        },
      });
    }

    // Fetch published pages
    const pages = await prisma.page.findMany({
      where: { visibility: "published" },
      orderBy: { createdAt: "asc" },
    });

    // Fetch custom NavLinks
    const navLinks = await prisma.navLink.findMany({
      orderBy: { order: "asc" },
    });

    // Fetch active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const urls: {
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: string;
    }[] = [];

    // Add homepage
    urls.push({
      loc: `${SITE_URL}/`,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: "1.0",
    });

    // Add page URLs
    pages.forEach((page) => {
      let slug = page.slug === "home" ? "" : page.slug;

      // Prefix blog posts
      if (page.type === "blog") {
        slug = `blog/${slug}`;
      }

      const loc = `${SITE_URL}/${slug}`.replace(/\/$/, "");

      if (!urls.some((u) => u.loc === loc)) {
        urls.push({
          loc,
          lastmod: page.updatedAt.toISOString(),
          changefreq: page.type === "blog" ? "weekly" : "monthly",
          priority: page.type === "blog" ? "0.8" : "0.6",
        });
      }
    });

    // Add Product URLs
    products.forEach((prod) => {
      const loc = `${SITE_URL}/products/${prod.slug}`.replace(/\/$/, "");
      if (!urls.some((u) => u.loc === loc)) {
        urls.push({
          loc,
          lastmod: prod.updatedAt.toISOString(),
          changefreq: "weekly",
          priority: "0.7",
        });
      }
    });

    // Add NavLinks
    // Only links to this website; external links (other domains) are never listed
    navLinks.forEach((link) => {
      const path = toInternalPath(link.url);
      if (path) {
        const loc = `${SITE_URL}${path}`.replace(/\/$/, "");
        if (!urls.some((u) => u.loc === loc)) {
          urls.push({
            loc,
            lastmod: link.updatedAt.toISOString(),
            changefreq: "monthly",
            priority: "0.5",
          });
        }
      }
    });

    // Build standard XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join("")}
</urlset>`;

    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": NO_STORE,
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: { "Cache-Control": NO_STORE },
    });
  }
}
