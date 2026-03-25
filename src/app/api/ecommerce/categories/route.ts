import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and Slug are required" },
        { status: 400 },
      );
    }

    if (id) {
      const category = await prisma.category.update({
        where: { id },
        data: { name, slug },
      });
      return NextResponse.json({ success: true, data: category });
    } else {
      const category = await prisma.category.create({
        data: { name, slug },
      });
      return NextResponse.json({ success: true, data: category });
    }
  } catch (error: any) {
    console.error("Error saving category:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Category with this name or slug already exists" },
        { status: 400 },
      );
    }
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
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 },
      );
    }

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with associated products" },
        { status: 400 },
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
