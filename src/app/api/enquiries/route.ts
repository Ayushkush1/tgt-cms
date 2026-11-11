import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isWebsiteRequest } from "@/lib/revalidateWebsite";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEnquiryNotification } from "@/lib/mailer";

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
            { sourcePage: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.enquiry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: enquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Enquiries fetch error:", error);
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
    if (!rateLimit(`enquiry_${getClientIp(request)}`, 10, 15 * 60 * 1000).success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { name, email, interestedIn, budget, projectGoals, sourcePage } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 },
      );
    }

    const normalizedSourcePage =
      typeof sourcePage === "string" && sourcePage.trim() ? sourcePage.trim().slice(0, 500) : null;

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        interestedIn,
        budget,
        projectGoals,
        sourcePage: normalizedSourcePage,
      },
    });

    await sendEnquiryNotification(enquiry);

    return NextResponse.json({ success: true, data: enquiry }, { status: 201 });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
