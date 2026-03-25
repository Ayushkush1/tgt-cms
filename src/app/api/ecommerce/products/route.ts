import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const categoryId = searchParams.get("categoryId");

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
      return NextResponse.json({ success: true, data: product });
    }

    const where = categoryId ? { categoryId } : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      slug,
      shortDesc,
      description,
      price,
      images,
      categoryId,
      isActive,
      order,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and Slug are required" },
        { status: 400 },
      );
    }

    const data = {
      title,
      slug,
      shortDesc,
      description,
      price: price ? parseFloat(price) : null,
      images: Array.isArray(images) ? images : [],
      categoryId,
      isActive: isActive ?? true,
      order: order ?? 0,
    };

    if (id) {
      const product = await prisma.product.update({
        where: { id },
        data,
      });
      return NextResponse.json({ success: true, data: product });
    } else {
      const product = await prisma.product.create({
        data,
      });
      return NextResponse.json({ success: true, data: product });
    }
  } catch (error: any) {
    console.error("Error saving product:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Product with this slug already exists" },
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

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
