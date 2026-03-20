import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const PAGE_SLUG = "services";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("id");

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
        return NextResponse.json({ success: true, data: [] });
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

      return NextResponse.json({ success: true, data: services });
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
      return NextResponse.json({ success: true, data: null });
    }

    const section = page.sections[0];
    const content = section.content as any;
    return NextResponse.json({
      success: true,
      data: {
        ...content,
        seo: content.seo || null,
      },
    });
  } catch (error) {
    console.error("Error fetching service content:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving service content:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
