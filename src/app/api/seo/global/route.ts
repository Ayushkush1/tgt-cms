import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.globalConfig.findUnique({
      where: { id: "global" },
    });

    if (!config) {
      // Create default config if it doesn't exist
      config = await prisma.globalConfig.create({
        data: {
          id: "global",
          siteTitle: "My Website",
          siteDescription: "A professional service website.",
          canonicalOrdering: "default",
        },
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Error fetching global SEO config:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { config } = body;

    console.log("PUT /api/seo/global - config received:", JSON.stringify(config, null, 2));

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Config data is required" },
        { status: 400 },
      );
    }

    const updatedConfig = await prisma.globalConfig.upsert({
      where: { id: "global" },
      update: {
        siteTitle: config.siteTitle,
        siteDescription: config.siteDescription,
        favicon: config.favicon,
        googleAnalyticsId: config.googleAnalyticsId,
        gtmId: config.gtmId,
        searchConsoleId: config.searchConsoleId,
        customHeaderScripts: config.customHeaderScripts,
        customFooterScripts: config.customFooterScripts,
        socialLinks: config.socialLinks,
        canonicalOrdering: config.canonicalOrdering,
      },
      create: {
        id: "global",
        siteTitle: config.siteTitle,
        siteDescription: config.siteDescription,
        favicon: config.favicon,
        googleAnalyticsId: config.googleAnalyticsId,
        gtmId: config.gtmId,
        searchConsoleId: config.searchConsoleId,
        customHeaderScripts: config.customHeaderScripts,
        customFooterScripts: config.customFooterScripts,
        socialLinks: config.socialLinks,
        canonicalOrdering: config.canonicalOrdering,
      },
    });

    return NextResponse.json({ success: true, data: updatedConfig });
  } catch (error: any) {
    console.error("Error updating global SEO config:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
