import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { revalidateWebsite, WebsiteTag } from "@/lib/revalidateWebsite";

/** Tells the website to refetch the page a section belongs to. */
async function revalidateSectionPage(pageId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId }, select: { slug: true } });
  if (page) revalidateWebsite(WebsiteTag.page(page.slug));
}

export async function POST(request: Request) {
  try {
    const { pageId, type, content, order = 0 } = await request.json();

    if (!pageId || !type) {
      return NextResponse.json(
        { success: false, error: "pageId and type are required" },
        { status: 400 },
      );
    }

    const finalContent = content && typeof content === "object" ? content : {};

    const section = await prisma.section.create({
      data: {
        pageId,
        type,
        content: finalContent,
        order,
      },
    });

    await revalidateSectionPage(section.pageId);

    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, content, order } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Section id is required" },
        { status: 400 },
      );
    }

    const updatedSection = await prisma.section.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order }),
      },
    });

    await revalidateSectionPage(updatedSection.pageId);

    return NextResponse.json({ success: true, data: updatedSection });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Section id is required" },
        { status: 400 },
      );
    }

    const deletedSection = await prisma.section.delete({
      where: { id },
    });
    await revalidateSectionPage(deletedSection.pageId);

    return NextResponse.json({ success: true, message: "Section deleted" });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
