import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: {
        sections: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, type = "standard" } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }

    // Simple slugify function
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    let finalSlug = slug;
    if (existingPage) {
      finalSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const newPage = await prisma.page.create({
      data: {
        title,
        slug: finalSlug,
        type,
        visibility: "draft",
      },
    });

    return NextResponse.json({ success: true, data: newPage }, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
