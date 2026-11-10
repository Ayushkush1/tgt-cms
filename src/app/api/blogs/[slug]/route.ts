import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findBlogPost } from "@/lib/blogPosts";

/**
 * GET /api/blogs/[slug]
 * One blog post's title and body (contentHtml), looked up by its URL slug.
 * Pages are read with ?slim=1, which leaves these bodies out.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
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
    console.error("Error fetching blog post:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
