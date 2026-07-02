import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.globalConfig.findUnique({
      where: { id: "global" },
    });

    const websiteUrl =
      process.env.NEXT_PUBLIC_WEBSITE_URL || "https://tgt-landing-page-jade.vercel.app";
    const robotsTxt =
      config?.robotsTxt ||
      `User-agent: *\nAllow: /\n\nSitemap: ${websiteUrl}/sitemap.xml`;

    return new Response(robotsTxt, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error generating robots:", error);
    return new Response("User-agent: *\nAllow: /", {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
