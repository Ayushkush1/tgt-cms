import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateWebsite, WebsiteTag } from "@/lib/revalidateWebsite";
import { toHeadingTag } from "@/lib/headingTags";

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

    // headingOptions: the home page's main heading tag, always a string ("h1" … "h6", or "")
    return NextResponse.json({
      success: true,
      data: { ...config, headingOptions: toHeadingTag(config.headingOptions) },
    });
  } catch (error) {
    console.error("Error fetching global SEO config:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Config data is required" },
        { status: 400 },
      );
    }

    // Fields left out of `config` are not changed (Prisma skips undefined), so the
    // SEO page and the Social Media & Footer page each save only their own settings.
    if (config.socialLinks !== undefined && !Array.isArray(config.socialLinks)) {
      return NextResponse.json(
        { success: false, error: "socialLinks must be an array" },
        { status: 400 },
      );
    }
    if (
      config.footer !== undefined &&
      (typeof config.footer !== "object" || config.footer === null || Array.isArray(config.footer))
    ) {
      return NextResponse.json(
        { success: false, error: "footer must be an object" },
        { status: 400 },
      );
    }

    const headingTag =
      config.headingOptions === undefined ? undefined : toHeadingTag(config.headingOptions);

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
        footer: config.footer,
        headingOptions: headingTag,
        canonicalOrdering: config.canonicalOrdering,
        sitemapEnabled: config.sitemapEnabled,
        sitemapCustomContent: config.sitemapCustomContent,
        robotsTxt: config.robotsTxt,
        schema: config.schema,
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
        footer: config.footer,
        headingOptions: headingTag,
        canonicalOrdering: config.canonicalOrdering,
        sitemapEnabled: config.sitemapEnabled !== undefined ? config.sitemapEnabled : true,
        sitemapCustomContent: config.sitemapCustomContent,
        robotsTxt: config.robotsTxt,
        schema: config.schema,
      },
    });

    revalidateWebsite(WebsiteTag.site);
    return NextResponse.json({ success: true, data: updatedConfig });
  } catch (error: any) {
    console.error("Error updating global SEO config:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
