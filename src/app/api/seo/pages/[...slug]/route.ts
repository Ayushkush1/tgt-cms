import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toHeadingTag } from "@/lib/headingTags";
import { toBlogSlug } from "@/lib/blogSlug";
import { revalidateWebsite, WebsiteTag } from "@/lib/revalidateWebsite";

interface StoredSEO {
  metaTitle?: string | null;
  metaDescription?: string | null;
  targetKeywords?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  featuredImage?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  schema?: string | null;
  headingOptions?: string | null;
}

interface StoredBlogItem {
  slug?: string;
  title?: string;
  seo?: StoredSEO;
  [key: string]: unknown;
}

interface StoredSectionContent {
  title?: string;
  seo?: StoredSEO;
  blogs?: StoredBlogItem[];
  [key: string]: unknown;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string | string[] }> },
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = (Array.isArray(rawSlug) ? rawSlug : [rawSlug]).map(decodeURIComponent).join("/");

    // Handle individual blog post pages (/blog/[slug])
    if (slug.startsWith("blog/")) {
      const postSlug = slug.slice("blog/".length);
      const homePage = await prisma.page.findUnique({
        where: { slug: "home" },
        include: {
          sections: {
            where: { type: "BlogSection" },
          },
        },
      });

      const section = homePage?.sections?.[0];
      const content = (section?.content as StoredSectionContent | null) || {};
      const blogs: StoredBlogItem[] = Array.isArray(content.blogs) ? content.blogs : [];
      const blog = blogs.find(
        (b) =>
          (typeof b?.slug === "string" && b.slug.trim() === postSlug) ||
          (typeof b?.title === "string" && toBlogSlug(b.title) === postSlug),
      );

      if (!blog) {
        return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: `${homePage?.id}-blog-${postSlug}`,
          title: blog.title || postSlug,
          slug,
          metaTitle: blog.seo?.metaTitle || "",
          metaDescription: blog.seo?.metaDescription || "",
          targetKeywords: blog.seo?.targetKeywords || "",
          canonicalUrl: blog.seo?.canonicalUrl || "",
          noIndex: blog.seo?.noIndex || false,
          schema: blog.seo?.schema || "",
          headingOptions: toHeadingTag(blog.seo?.headingOptions),
        },
      });
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
        return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
      }

      const section = servicesPage.sections[0];
      const content = (section.content as StoredSectionContent | null) || {};

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
          schema: content.seo?.schema || "",
          headingOptions: toHeadingTag(content.seo?.headingOptions),
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
        schema: true,
        headingOptions: true,
      },
    });

    if (!page) {
      if (slug === "ceo") {
        return NextResponse.json({
          success: true,
          data: {
            id: null,
            title: "CEO",
            slug: slug,
            metaTitle: "",
            metaDescription: "",
            targetKeywords: "",
            canonicalUrl: "",
            noIndex: false,
            schema: "",
          },
        });
      }
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    // The page's main heading tag, always a string: "h1" … "h6", or ""
    return NextResponse.json({
      success: true,
      data: { ...page, headingOptions: toHeadingTag(page.headingOptions) },
    });
  } catch (error) {
    console.error("Error fetching page SEO data:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string | string[] }> },
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = (Array.isArray(rawSlug) ? rawSlug : [rawSlug]).map(decodeURIComponent).join("/");

    const body = await request.json();
    const { seo } = body;

    if (!seo) {
      return NextResponse.json({ success: false, error: "SEO data is required" }, { status: 400 });
    }

    // Handle individual blog post pages (/blog/[slug])
    if (slug.startsWith("blog/")) {
      const postSlug = slug.slice("blog/".length);
      const homePage = await prisma.page.findUnique({
        where: { slug: "home" },
        include: {
          sections: {
            where: { type: "BlogSection" },
          },
        },
      });

      const section = homePage?.sections?.[0];
      const content = (section?.content as StoredSectionContent | null) || {};
      const blogs: StoredBlogItem[] = Array.isArray(content.blogs) ? [...content.blogs] : [];
      const blogIdx = blogs.findIndex(
        (b) =>
          (typeof b?.slug === "string" && b.slug.trim() === postSlug) ||
          (typeof b?.title === "string" && toBlogSlug(b.title) === postSlug),
      );

      if (!section || blogIdx === -1) {
        return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
      }

      blogs[blogIdx] = {
        ...blogs[blogIdx],
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
          headingOptions: toHeadingTag(seo.headingOptions),
          schema: seo.schema,
        },
      };

      const updatedContent: StoredSectionContent = { ...content, blogs };
      await prisma.section.update({
        where: { id: section.id },
        data: { content: updatedContent as Prisma.InputJsonValue },
      });

      revalidateWebsite(WebsiteTag.page("blog"));
      revalidateWebsite(WebsiteTag.page("home"));
      return NextResponse.json({ success: true, data: blogs[blogIdx] });
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
        return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
      }

      const section = servicesPage.sections[0];
      const content = (section.content as StoredSectionContent | null) || {};

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
          headingOptions: toHeadingTag(seo.headingOptions),
          schema: seo.schema,
        },
      };

      await prisma.section.update({
        where: { id: section.id },
        data: { content: updatedContent as Prisma.InputJsonValue },
      });

      revalidateWebsite(WebsiteTag.page(slug.startsWith("service/") ? "services" : slug));
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
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        ogImage: seo.ogImage,
        schema: seo.schema,
        headingOptions: toHeadingTag(seo.headingOptions),
      },
      create: {
        slug,
        title: seo.metaTitle || slug.charAt(0).toUpperCase() + slug.slice(1),
        type: slug === "ceo" ? "static" : "standard",
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        targetKeywords: seo.targetKeywords,
        canonicalUrl: seo.canonicalUrl,
        noIndex: seo.noIndex || false,
        featuredImage: seo.featuredImage,
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        ogImage: seo.ogImage,
        schema: seo.schema,
        headingOptions: toHeadingTag(seo.headingOptions),
        visibility: "published",
      },
    });

    revalidateWebsite(WebsiteTag.page(slug.startsWith("service/") ? "services" : slug));
    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error("Error updating page SEO data:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
