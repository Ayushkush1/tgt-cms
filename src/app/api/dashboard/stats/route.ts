import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Count Enquiries from the Enquiry table
    const enquiryCount = await prisma.enquiry.count();

    // 2. Count Blogs from home page BlogSection JSON
    let blogCount = 0;
    try {
      const homePage = await prisma.page.findUnique({
        where: { slug: "home" },
        include: { sections: { where: { type: "BlogSection" } } },
      });
      if (homePage?.sections[0]) {
        const content = homePage.sections[0].content as any;
        if (content?.blogs && Array.isArray(content.blogs)) {
          blogCount = content.blogs.length;
        }
      }
    } catch (e) {
      console.error("Error fetching blog count:", e);
    }

    // 3. Count Audits from the Audit table
    const auditCount = await prisma.audit.count();

    return NextResponse.json({
      success: true,
      data: {
        enquiries: enquiryCount,
        blogs: blogCount,
        audits: auditCount,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
