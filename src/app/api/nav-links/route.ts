import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Bypass Vercel cached schema issues if Prisma client is not fresh
    const links = await prisma.navLink.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: links });
  } catch (error) {
    console.error("Fetch nav links error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch links" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newLink = await prisma.navLink.create({
      data: {
        label: data.label,
        url: data.url,
        type: data.type || "Main Link",
        parent: data.parent || "-",
        order: data.order || 0,
        description: data.description,
        title: data.title,
        isStatic: data.isStatic || false,
      },
    });
    return NextResponse.json({ success: true, data: newLink }, { status: 201 });
  } catch (error) {
    console.error("Create nav link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create link" },
      { status: 500 },
    );
  }
}
