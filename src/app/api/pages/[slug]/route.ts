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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const data = await request.json();

    const updatedPage = await prisma.page.update({
      where: { slug },
      data: {
        title: data.title,
        visibility: data.visibility,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        targetKeywords: data.targetKeywords,
        canonicalUrl: data.canonicalUrl,
        noIndex: data.noIndex,
        featuredImage: data.featuredImage,
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
    const urlToDelete = `/custom-pages/${slug}`;

    // Delete the NavLink first if it exists
    try {
      // @ts-ignore - resolve type mismatch if any
      if (prisma.navLink) {
        // @ts-ignore
        await prisma.navLink.deleteMany({
          where: { url: urlToDelete },
        });
      }
    } catch (linkError) {
      console.error("Error deleting NavLink:", linkError);
    }

    // Delete the Page
    await prisma.page.delete({
      where: { slug },
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
