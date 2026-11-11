import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateWebsite, WebsiteTag } from "@/lib/revalidateWebsite";
import { pageResponse } from "@/lib/siteContent";

const PAGE_SLUG = "blog";

/**
 * GET /api/blog
 * { success, data: { [sectionType]: content }, seo }: the Blog page's editable sections
 * (see PAGE_SECTIONS in src/lib/websiteSections.ts) and its SEO.
 */
export async function GET() {
  try {
    return NextResponse.json(await pageResponse(PAGE_SLUG, { blogBodies: true }));
  } catch (error) {
    console.error("Error fetching blog page content:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/blog
 * Body: { section: string, content: object }
 * Upserts a section on the Blog static page.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { section, content } = body;

    if (!section || typeof section !== "string") {
      return NextResponse.json(
        { success: false, error: "'section' (string) is required" },
        { status: 400 },
      );
    }

    if (!content || typeof content !== "object") {
      return NextResponse.json(
        { success: false, error: "'content' (object) is required" },
        { status: 400 },
      );
    }

    const page = await prisma.page.upsert({
      where: { slug: PAGE_SLUG },
      create: {
        title: "Blog",
        slug: PAGE_SLUG,
        type: "static",
        visibility: "published",
      },
      update: {},
    });

    const existingSection = await prisma.section.findFirst({
      where: { pageId: page.id, type: section },
    });

    let savedSection;
    if (existingSection) {
      savedSection = await prisma.section.update({
        where: { id: existingSection.id },
        data: { content },
      });
    } else {
      const sectionCount = await prisma.section.count({
        where: { pageId: page.id },
      });
      savedSection = await prisma.section.create({
        data: {
          pageId: page.id,
          type: section,
          content,
          order: sectionCount,
        },
      });
    }

    revalidateWebsite(WebsiteTag.page(PAGE_SLUG));
    return NextResponse.json({ success: true, data: savedSection });
  } catch (error) {
    console.error("Error saving blog page section:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
