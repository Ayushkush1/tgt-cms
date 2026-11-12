import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { revalidateWebsite, WebsiteTag } from "@/lib/revalidateWebsite";
import { loadPageSeo } from "@/lib/siteContent";

const PAGE_SLUG = "products";

type MenuProduct = { id: string; title: string; shortDesc: string; link: string };

const productList = (value: unknown): MenuProduct[] =>
  (Array.isArray(value) ? value : [])
    .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === "object"))
    .map((p) => ({
      id: typeof p.id === "string" ? p.id : "",
      title: typeof p.title === "string" ? p.title.trim() : "",
      shortDesc: typeof p.shortDesc === "string" ? p.shortDesc : "",
      link: typeof p.link === "string" ? p.link.trim() : "",
    }))
    .filter((p) => p.title);

/**
 * Keeps the Products menu dropdown in step with the product list: one link per product, in the
 * same order, with its title, short description and link. A renamed product keeps its menu link
 * (and the placement chosen in Menu Links); removed products lose theirs.
 */
async function syncProductMenu(
  products: MenuProduct[],
  previousTitles: Map<string, string>,
): Promise<string[]> {
  const parent =
    (await prisma.navLink.findFirst({ where: { type: "Dropdown", url: "/products" } })) ??
    (await prisma.navLink.findFirst({
      where: { type: "Dropdown", label: { contains: "Product", mode: "insensitive" } },
    }));
  if (!parent) return ["No Products menu dropdown was found, so the menu wasn't updated."];

  const links = await prisma.navLink.findMany({ where: { parent: parent.id, type: "Sub-link" } });
  const used = new Set<string>();
  const ops = products.map((product, i) => {
    const oldTitle = previousTitles.get(product.id);
    const existing =
      links.find((l) => !used.has(l.id) && l.label === product.title) ??
      links.find((l) => !used.has(l.id) && oldTitle !== undefined && l.label === oldTitle);
    const data = {
      label: product.title,
      url: product.link || "/products",
      description: product.shortDesc,
      order: i + 1,
    };
    if (existing) {
      used.add(existing.id);
      return prisma.navLink.update({ where: { id: existing.id }, data });
    }
    return prisma.navLink.create({
      data: { ...data, type: "Sub-link", parent: parent.id, isStatic: false, placement: "both" },
    });
  });
  const removed = links.filter((l) => !used.has(l.id)).map((l) => l.id);
  await prisma.$transaction([
    ...ops,
    prisma.navLink.deleteMany({ where: { id: { in: removed } } }),
  ]);
  return [];
}

/** GET /api/products: { success, data: <main section content>, seo } */
export async function GET() {
  try {
    const seo = await loadPageSeo(PAGE_SLUG);
    const page = await prisma.page.findUnique({
      where: { slug: PAGE_SLUG },
      include: {
        sections: {
          where: { type: "main" },
        },
      },
    });

    if (!page || page.sections.length === 0) {
      return NextResponse.json({ success: true, data: null, seo });
    }

    return NextResponse.json({ success: true, data: page.sections[0].content, seo });
  } catch (error) {
    console.error("Error fetching product content:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    // Ensure parent page exists
    const page = await prisma.page.upsert({
      where: { slug: PAGE_SLUG },
      create: {
        title: "Products",
        slug: PAGE_SLUG,
        type: "static",
        visibility: "published",
      },
      update: {},
    });

    const existingSection = await prisma.section.findFirst({
      where: { pageId: page.id, type: "main" },
    });
    // Titles before this save, by product id, so a renamed product keeps its menu link
    const previousTitles = new Map(
      productList((existingSection?.content as { products?: unknown } | null)?.products).map(
        (p) => [p.id, p.title],
      ),
    );

    if (existingSection) {
      await prisma.section.update({
        where: { id: existingSection.id },
        data: { content },
      });
    } else {
      await prisma.section.create({
        data: {
          pageId: page.id,
          type: "main",
          content,
        },
      });
    }

    let notes: string[];
    try {
      notes = await syncProductMenu(productList(content.products), previousTitles);
    } catch (syncError) {
      console.error("Error synchronizing the Products menu:", syncError);
      notes = ["Products saved, but the Products menu couldn't be updated. Try saving again."];
    }

    // The menu is part of the site-wide data, so refresh it along with the Products page
    revalidateWebsite(WebsiteTag.page(PAGE_SLUG), WebsiteTag.site);
    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error("Error saving product content:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
