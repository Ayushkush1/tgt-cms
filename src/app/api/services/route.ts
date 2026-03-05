import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const PAGE_SLUG = "services";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("id");

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: "Service ID is required" },
        { status: 400 },
      );
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

    return NextResponse.json({ success: true, data: page.sections[0].content });
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
