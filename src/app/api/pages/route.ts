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
    const body = await request.json();
    const { title, slug } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 },
      );
    }

    const newPage = await prisma.page.create({
      data: {
        title,
        slug,
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
