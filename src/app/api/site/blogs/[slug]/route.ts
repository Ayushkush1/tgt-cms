import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findBlogPost } from "@/lib/blogPosts";
import { rejectUnlessWebsite } from "@/lib/siteContent";

/**
 * GET /api/site/blogs/[slug] (website only: x-cms-secret)
 * One blog post's title and body (contentHtml), by its URL slug. The post list (without
 * bodies) is in /api/site/global → sections.BlogSection. Website cache tag "page:blog".
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = rejectUnlessWebsite(request);
  if (denied) return denied;

  try {
    const { slug } = await params;
    const section = await prisma.section.findFirst({
      where: { type: "BlogSection", page: { slug: "home" } },
      select: { content: true },
    });
    const post = section ? findBlogPost(section.content, decodeURIComponent(slug)) : undefined;
    if (!post) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: { title: post.title ?? "", contentHtml: post.contentHtml ?? "" },
    });
  } catch (error) {
    console.error("[site] blog post:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
