import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, slug } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Page id is required" },
        { status: 400 },
      );
    }

    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
      },
    });

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 },
      );
    }

    // Delete associated NavLink if it exists
    await prisma.navLink.deleteMany({
      where: { url: `/${slug}` },
    });

    await prisma.page.delete({
      where: { id: page.id },
    });

    return NextResponse.json({ success: true, message: "Page deleted" });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
