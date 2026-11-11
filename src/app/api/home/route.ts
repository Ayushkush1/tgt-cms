import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { revalidateWebsite, WebsiteTag } from "@/lib/revalidateWebsite";
import { pageResponse } from "@/lib/siteContent";

const HOME_SLUG = "home";

/**
 * GET /api/home
 * { success, data: { [sectionType]: content }, seo }: the Home page's editable sections
 * (see PAGE_SECTIONS in src/lib/websiteSections.ts) and its SEO.
 */
export async function GET() {
  try {
    return NextResponse.json(await pageResponse(HOME_SLUG, { blogBodies: true }));
  } catch (error) {
    console.error("Error fetching home page content:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/home
 * Body: { section: string, content: object }
 * Upserts (creates or updates) a single section on the Home page.
 * Creates the Home page row automatically if it doesn't exist yet.
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

    // Ensure the Home page row exists
    const page = await prisma.page.upsert({
      where: { slug: HOME_SLUG },
      create: {
        title: "Home",
        slug: HOME_SLUG,
        type: "static",
        visibility: "published",
      },
      update: {},
    });

    // Find the existing section for this type (if any)
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
      // Determine order by counting existing sections
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

    if (section === "BlogSection" || section === "Insights") {
      revalidateWebsite(WebsiteTag.page(HOME_SLUG), WebsiteTag.page("blog"));
    } else {
      revalidateWebsite(WebsiteTag.page(HOME_SLUG));
    }
    return NextResponse.json({ success: true, data: savedSection });
  } catch (error) {
    console.error("Error saving home page section:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
