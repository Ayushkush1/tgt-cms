import { prisma } from "@/lib/prisma";

// Always read fresh: a CDN-cached copy would hide saves from the CMS
export const dynamic = "force-dynamic";
const HEADERS = { "Content-Type": "text/plain", "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  try {
    const config = await prisma.globalConfig.findUnique({
      where: { id: "global" },
    });

    const websiteUrl =
      process.env.NEXT_PUBLIC_WEBSITE_URL || "";
    const robotsTxt =
      config?.robotsTxt || `User-agent: *\nAllow: /\n\nSitemap: ${websiteUrl}/sitemap.xml`;

    return new Response(robotsTxt, {
      headers: HEADERS,
    });
  } catch (error) {
    console.error("Error generating robots:", error);
    return new Response("User-agent: *\nAllow: /", {
      headers: HEADERS,
    });
  }
}
