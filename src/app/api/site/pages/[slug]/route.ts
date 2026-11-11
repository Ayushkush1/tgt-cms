import { NextResponse } from "next/server";
import { pageResponse, rejectUnlessWebsite } from "@/lib/siteContent";
import { isWebsitePage } from "@/lib/websiteSections";

/**
 * GET /api/site/pages/[slug] (website only: x-cms-secret)
 * { success, data: { [sectionType]: content }, seo } for one page (home, about, services,
 * products, portfolio, contactUs, blog, media): only its sections in use (PAGE_SECTIONS in
 * src/lib/websiteSections.ts), blog post bodies left out. Website cache tag "page:<slug>".
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = rejectUnlessWebsite(request);
  if (denied) return denied;

  const { slug } = await params;
  if (!isWebsitePage(slug)) {
    return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
  }

  try {
    const page = await pageResponse(slug, { blogBodies: false });
    if (!page.seo) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error(`[site] page ${slug}:`, error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
