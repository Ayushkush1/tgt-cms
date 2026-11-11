import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isWebsiteRequest } from "@/lib/revalidateWebsite";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendAuditNotification } from "@/lib/mailer";

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
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { webUrl: { contains: search, mode: "insensitive" as const } },
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
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Submissions come only from the website's server, which passes on the visitor's IP
    if (!isWebsiteRequest(request)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // 10 submissions per 15 minutes per visitor
    if (!rateLimit(`audit_${getClientIp(request)}`, 10, 15 * 60 * 1000).success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { name, email, webUrl, improve } = body;

    if (!name || !email || !webUrl) {
      return NextResponse.json(
        { success: false, error: "Name, email, and website url are required" },
        { status: 400 },
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

    await sendAuditNotification(audit);

    return NextResponse.json({ success: true, data: audit }, { status: 201 });
  } catch (error) {
    console.error("Audit submission error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
