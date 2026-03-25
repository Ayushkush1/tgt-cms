import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { banners } = body; // Array of banners for bulk update/reorder

    if (!Array.isArray(banners)) {
      return NextResponse.json(
        { success: false, error: "Banners array is required" },
        { status: 400 },
      );
    }

    // For now, let's allow creating a single one too if it's not a bulk update.
    if (banners.length === 0)
      return NextResponse.json({ success: true, data: [] });

    const results = await Promise.all(
      banners.map((b: any, index: number) => {
        const data = {
          title: b.title,
          subtitle: b.subtitle,
          imageUrl: b.imageUrl,
          link: b.link,
          order: b.order ?? index,
          isActive: b.isActive ?? true,
        };
        if (b.id) {
          return prisma.banner.update({
            where: { id: b.id },
            data,
          });
        } else {
          return prisma.banner.create({
            data,
          });
        }
      }),
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error updating banners:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 },
      );

    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
