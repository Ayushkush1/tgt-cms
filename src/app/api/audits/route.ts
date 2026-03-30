import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as any } },
            { email: { contains: search, mode: "insensitive" as any } },
            { webUrl: { contains: search, mode: "insensitive" as any } },
          ],
        }
      : {};

    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.audit.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: audits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Audits fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, webUrl, improve } = body;

    if (!name || !email || !webUrl) {
      return NextResponse.json(
        { success: false, error: "Name, email, and website url are required" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
      );
    }

    const audit = await prisma.audit.create({
      data: {
        name,
        email,
        webUrl,
        improve,
      },
    });

    return NextResponse.json(
      { success: true, data: audit },
      {
        status: 201,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  } catch (error) {
    console.error("Audit submission error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
}
