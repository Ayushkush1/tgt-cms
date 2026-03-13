import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
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
