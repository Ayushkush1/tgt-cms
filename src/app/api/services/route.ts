import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "../../../lib/prisma";
import { revalidateWebsite, WebsiteTag } from "@/lib/revalidateWebsite";
import { loadPageSeo } from "@/lib/siteContent";

const PAGE_SLUG = "services";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("id");
    // Services page SEO; with ?id, the service's own SEO instead (below)
    const seo = serviceId ? null : await loadPageSeo(PAGE_SLUG);

    if (!serviceId) {
      // Return all services as an array if no ID is provided
      const page = await prisma.page.findUnique({
        where: { slug: PAGE_SLUG },
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!page) {
        return NextResponse.json({ success: true, data: [], seo });
      }

      const services = page.sections.map((section) => {
        const content = section.content as any;
        return {
          id: section.type,
          ...content,
          // Explicitly ensure SEO is present if it exists in content
          seo: content.seo || null,
        };
      });

      return NextResponse.json({ success: true, data: services, seo });
    }

    const page = await prisma.page.findUnique({
      where: { slug: PAGE_SLUG },
      include: {
        sections: {
          where: { type: serviceId },
        },
      },
    });

    if (!page || page.sections.length === 0) {
      return NextResponse.json({ success: true, data: null, seo });
    }

    const section = page.sections[0];
    const content = section.content as any;
    return NextResponse.json({
      success: true,
      data: {
        ...content,
        seo: content.seo || null,
      },
      // A service page's SEO is its own (SEO → Page Settings → service/<slug>)
      seo: content.seo || null,
    });
  } catch (error) {
    console.error("Error fetching service content:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

const SERVICE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PILLARS = ["brand", "build", "grow", "scale"];

type PillarsContent = {
  pillars?: { id?: string; services?: { name: string; href: string; items: string[] }[] }[];
};

/**
 * POST /api/services
 * Body: { id, name, pillar, addToMenu?, addToPillars? }
 * Creates a new service page at /service/<id> and, by default, connects it everywhere a
 * service appears: a link in the Services menu (which also gives it a Page Settings SEO
 * entry and a sitemap URL) and a card under its stage in the home page Service Pillars
 * (which also groups it under that stage in the navbar and footer).
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = String(body?.id ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const pillar = String(body?.pillar ?? "");
    const addToMenu = body?.addToMenu !== false;
    const addToPillars = body?.addToPillars !== false;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Service name is required" },
        { status: 400 },
      );
    }
    if (!SERVICE_SLUG.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "URL slug may use only lowercase letters, numbers and single hyphens",
        },
        { status: 400 },
      );
    }
    if (!PILLARS.includes(pillar)) {
      return NextResponse.json(
        { success: false, error: "Choose a growth pillar" },
        { status: 400 },
      );
    }

    const page = await prisma.page.upsert({
      where: { slug: PAGE_SLUG },
      create: { title: "Services", slug: PAGE_SLUG, type: "static", visibility: "published" },
      update: {},
    });
    const url = `/service/${id}`;
    const [taken, linked] = await Promise.all([
      prisma.section.findFirst({ where: { pageId: page.id, type: id } }),
      prisma.navLink.findFirst({ where: { url } }),
    ]);
    if (taken || linked) {
      return NextResponse.json(
        { success: false, error: `A service at ${url} already exists` },
        { status: 409 },
      );
    }

    const notes: string[] = [];
    const sectionCount = await prisma.section.count({ where: { pageId: page.id } });
    await prisma.section.create({
      data: {
        pageId: page.id,
        type: id,
        order: sectionCount,
        content: {
          hero: {
            name,
            pillar,
            headingLine1: "",
            headingLine2: "",
            imageUrl: "",
            paragraphs: ["", ""],
            pillars: [],
          },
          services: [],
          proof: [],
          work: [],
          stack: [],
          related: [],
          seo: { metaTitle: name },
        },
      },
    });

    if (addToMenu) {
      // The Services menu is the dropdown whose links point at /service/…
      const siblings = await prisma.navLink.findMany({
        where: { url: { startsWith: "/service/" } },
        orderBy: { order: "desc" },
      });
      const parent = siblings[0]?.parent;
      if (parent && parent !== "-") {
        const inMenu = siblings.filter((l) => l.parent === parent);
        await prisma.navLink.create({
          data: {
            label: name,
            url,
            type: "Sub-link",
            parent,
            order: Math.max(0, ...inMenu.map((l) => l.order)) + 1,
            placement: inMenu[0]?.placement ?? "both",
          },
        });
      } else {
        notes.push(
          "No Services menu was found, so no menu link was added (add one in Menu Links).",
        );
      }
    }

    if (addToPillars) {
      const home = await prisma.page.findUnique({
        where: { slug: "home" },
        include: { sections: { where: { type: "ServicePillars" } } },
      });
      const section = home?.sections[0];
      const content = (section?.content ?? {}) as PillarsContent & Record<string, unknown>;
      const target = content.pillars?.find((p) => p.id === pillar);
      if (section && target) {
        const pillars = content.pillars!.map((p) =>
          p === target
            ? { ...p, services: [...(p.services ?? []), { name, href: url, items: [] }] }
            : p,
        );
        await prisma.section.update({
          where: { id: section.id },
          data: { content: { ...content, pillars } as Prisma.InputJsonObject },
        });
      } else {
        notes.push(
          `The home page Service Pillars has no "${pillar}" stage, so it wasn't added there.`,
        );
      }
    }

    revalidateWebsite(WebsiteTag.page(PAGE_SLUG), WebsiteTag.page("home"), WebsiteTag.site);
    return NextResponse.json({ success: true, data: { id, name, pillar }, notes });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/services?id=<slug>
 * Deletes a service (built-in or added with "Add service") and everything that points at it: its content and
 * SEO, its Services menu link(s) (so it also leaves SEO → Page Settings and the sitemap), its
 * card on the home page Service Pillars, and its slug in other services' "Pairs well with".
 * The website serves a built-in service only while the CMS has it, so its page then returns 404.
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!SERVICE_SLUG.test(id)) {
      return NextResponse.json(
        { success: false, error: "A valid service id is required" },
        { status: 400 },
      );
    }
    const url = `/service/${id}`;
    const isThisService = (href: unknown) =>
      typeof href === "string" &&
      href
        .replace(/^https?:\/\/[^/]+/, "")
        .replace(/[?#].*$/, "")
        .replace(/\/$/, "") === url;

    const page = await prisma.page.findUnique({
      where: { slug: PAGE_SLUG },
      include: { sections: true },
    });
    const section = page?.sections.find((s) => s.type === id);
    if (!page || !section) {
      return NextResponse.json({ success: false, error: `No service at ${url}` }, { status: 404 });
    }

    const links = (await prisma.navLink.findMany()).filter((l) => isThisService(l.url));
    const home = await prisma.page.findUnique({
      where: { slug: "home" },
      include: { sections: { where: { type: "ServicePillars" } } },
    });
    const pillarsSection = home?.sections[0];
    const pillarsContent = (pillarsSection?.content ?? {}) as PillarsContent &
      Record<string, unknown>;

    await prisma.$transaction([
      prisma.section.delete({ where: { id: section.id } }),
      prisma.navLink.deleteMany({ where: { id: { in: links.map((l) => l.id) } } }),
      // Other services that paired with this one
      ...page.sections
        .filter((s) => s.id !== section.id)
        .flatMap((s) => {
          const c = (s.content ?? {}) as { related?: unknown } & Record<string, unknown>;
          if (!Array.isArray(c.related) || !c.related.includes(id)) return [];
          const related = c.related.filter((r) => r !== id);
          return [
            prisma.section.update({
              where: { id: s.id },
              data: { content: { ...c, related } as Prisma.InputJsonObject },
            }),
          ];
        }),
      ...(pillarsSection && Array.isArray(pillarsContent.pillars)
        ? [
            prisma.section.update({
              where: { id: pillarsSection.id },
              data: {
                content: {
                  ...pillarsContent,
                  pillars: pillarsContent.pillars.map((p) => ({
                    ...p,
                    services: (p.services ?? []).filter((s) => !isThisService(s.href)),
                  })),
                } as Prisma.InputJsonObject,
              },
            }),
          ]
        : []),
    ]);

    revalidateWebsite(WebsiteTag.page(PAGE_SLUG), WebsiteTag.page("home"), WebsiteTag.site);
    return NextResponse.json({ success: true, data: { id, menuLinksRemoved: links.length } });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id: serviceId, content } = body;

    if (!serviceId || !content) {
      return NextResponse.json(
        { success: false, error: "ID and content are required" },
        { status: 400 },
      );
    }

    // Ensure parent page exists
    const page = await prisma.page.upsert({
      where: { slug: PAGE_SLUG },
      create: {
        title: "Services",
        slug: PAGE_SLUG,
        type: "static",
        visibility: "published",
      },
      update: {},
    });

    const existingSection = await prisma.section.findFirst({
      where: { pageId: page.id, type: serviceId },
    });

    if (existingSection) {
      await prisma.section.update({
        where: { id: existingSection.id },
        data: { content },
      });
    } else {
      await prisma.section.create({
        data: {
          pageId: page.id,
          type: serviceId,
          content,
        },
      });
    }

    revalidateWebsite(WebsiteTag.page(PAGE_SLUG));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving service content:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
