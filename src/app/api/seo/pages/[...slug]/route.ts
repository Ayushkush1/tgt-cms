import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string | string[] }> },
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = Array.isArray(rawSlug) ? rawSlug.join("/") : rawSlug;

    // Handle service sub-pages
    if (slug.startsWith("service/")) {
      const serviceId = slug.split("service/")[1];
      const servicesPage = await prisma.page.findUnique({
        where: { slug: "services" },
        include: {
          sections: {
            where: { type: serviceId },
          },
        },
      });

      if (!servicesPage || servicesPage.sections.length === 0) {
        return NextResponse.json(
          { success: false, error: "Service not found" },
          { status: 404 },
        );
      }

      const section = servicesPage.sections[0];
      const content = section.content as any;

      return NextResponse.json({
        success: true,
        data: {
          id: `${servicesPage.id}-${serviceId}`,
          title: content.title || serviceId,
          slug: slug,
          metaTitle: content.seo?.metaTitle || "",
          metaDescription: content.seo?.metaDescription || "",
          targetKeywords: content.seo?.targetKeywords || "",
          canonicalUrl: content.seo?.canonicalUrl || "",
          noIndex: content.seo?.noIndex || false,
        },
      });
    }

    const page = await prisma.page.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        targetKeywords: true,
        canonicalUrl: true,
        noIndex: true,
        featuredImage: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        headingOptions: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("Error fetching page SEO data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string | string[] }> },
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = Array.isArray(rawSlug) ? rawSlug.join("/") : rawSlug;

    const body = await request.json();
    const { seo } = body;

    if (!seo) {
      return NextResponse.json(
        { success: false, error: "SEO data is required" },
        { status: 400 },
      );
    }

    // Handle service sub-pages
    if (slug.startsWith("service/")) {
      const serviceId = slug.split("service/")[1];
      const servicesPage = await prisma.page.findUnique({
        where: { slug: "services" },
        include: {
          sections: {
            where: { type: serviceId },
          },
        },
      });

      if (!servicesPage || servicesPage.sections.length === 0) {
        return NextResponse.json(
          { success: false, error: "Service not found" },
          { status: 404 },
        );
      }

      const section = servicesPage.sections[0];
      const content = section.content as any;

      const updatedContent = {
        ...content,
        seo: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          targetKeywords: seo.targetKeywords,
          canonicalUrl: seo.canonicalUrl,
          noIndex: seo.noIndex,
          featuredImage: seo.featuredImage,
          ogTitle: seo.ogTitle,
          ogDescription: seo.ogDescription,
          ogImage: seo.ogImage,
          headingOptions: seo.headingOptions,
        },
      };

      await prisma.section.update({
        where: { id: section.id },
        data: { content: updatedContent },
      });

      return NextResponse.json({ success: true, data: updatedContent });
    }

    const updatedPage = await prisma.page.upsert({
      where: { slug },
      update: {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        targetKeywords: seo.targetKeywords,
        canonicalUrl: seo.canonicalUrl,
        noIndex: seo.noIndex,
        featuredImage: seo.featuredImage,
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        ogImage: seo.ogImage,
        headingOptions: seo.headingOptions,
      },
      create: {
        slug,
        title: seo.metaTitle || slug.charAt(0).toUpperCase() + slug.slice(1),
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        targetKeywords: seo.targetKeywords,
        canonicalUrl: seo.canonicalUrl,
        noIndex: seo.noIndex || false,
        featuredImage: seo.featuredImage,
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        ogImage: seo.ogImage,
        headingOptions: seo.headingOptions || {},
        visibility: "published",
      },
    });

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error("Error updating page SEO data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
