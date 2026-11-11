import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toHeadingTag } from "@/lib/headingTags";
import { rejectUnlessWebsite } from "@/lib/siteContent";

/**
 * GET /api/site/global (website only: x-cms-secret)
 * Everything every website page needs, in one response (website cache tag "site"):
 * settings, footer (logo, badges, contact), socialLinks, siteImages (background, hero photo,
 * tech logos), navLinks and active banners. Page content comes from /api/site/pages/[slug].
 */
export async function GET(request: Request) {
  const denied = rejectUnlessWebsite(request);
  if (denied) return denied;

  try {
    const [config, navLinks, banners] = await Promise.all([
      prisma.globalConfig.findUnique({
        where: { id: "global" },
        select: {
          siteTitle: true,
          siteDescription: true,
          favicon: true,
          googleAnalyticsId: true,
          gtmId: true,
          searchConsoleId: true,
          schema: true,
          headingOptions: true,
          footer: true,
          socialLinks: true,
          siteImages: true,
        },
      }),
      prisma.navLink.findMany({
        orderBy: [{ order: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          url: true,
          type: true,
          parent: true,
          order: true,
          description: true,
          title: true,
          placement: true,
        },
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, title: true, subtitle: true, imageUrl: true, link: true },
      }),
    ]);

    const { footer, socialLinks, siteImages, headingOptions, ...settings } = config ?? {};
    return NextResponse.json({
      success: true,
      data: {
        settings: { ...settings, headingOptions: toHeadingTag(headingOptions ?? null) },
        footer: footer ?? null,
        socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
        siteImages: siteImages ?? null,
        navLinks,
        banners,
      },
    });
  } catch (error) {
    console.error("[site] global:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
