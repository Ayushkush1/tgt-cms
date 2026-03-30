import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const PAGE_SLUG = "products";

export async function GET() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: PAGE_SLUG },
      include: {
        sections: {
          where: { type: "main" },
        },
      },
    });

    if (!page || page.sections.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: page.sections[0].content });
  } catch (error) {
    console.error("Error fetching product content:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 },
      );
    }

    // Ensure parent page exists
    const page = await prisma.page.upsert({
      where: { slug: PAGE_SLUG },
      create: {
        title: "Products",
        slug: PAGE_SLUG,
        type: "static",
        visibility: "published",
      },
      update: {},
    });

    const existingSection = await prisma.section.findFirst({
      where: { pageId: page.id, type: "main" },
    });

    if (existingSection) {
      await prisma.section.update({
        where: { id: existingSection.id },
        data: { content },
      });
    } else {
      await prisma.section.create({
        data: {
          pageId: page.id,
          type: "main",
          content,
        },
      });
    }

    // --- AUTOMATION: Sync NavLinks ---
    try {
      // Get the Products dropdown to use as parent
      const parentNav = await prisma.navLink.findFirst({
        where: { label: "Products", type: "Dropdown" },
      });

      if (parentNav && content.products && Array.isArray(content.products)) {
        // Current product links in NavLink
        const existingLinks = await prisma.navLink.findMany({
          where: { parent: parentNav.id, type: "Sub-link" },
        });

        const productTitles = content.products.map((p: any) => p.title);

        // Create or Update links for each product in the content
        for (let i = 0; i < content.products.length; i++) {
          const product = content.products[i];
          const existing = existingLinks.find((l) => l.label === product.title);

          if (existing) {
            await prisma.navLink.update({
              where: { id: existing.id },
              data: {
                description: product.shortDesc || "",
                order: i + 1,
              },
            });
          } else {
            await prisma.navLink.create({
              data: {
                label: product.title,
                url: "/products",
                type: "Sub-link",
                parent: parentNav.id,
                description: product.shortDesc || "",
                order: i + 1,
                isStatic: false,
              },
            });
          }
        }

        // Delete links for products that were removed from the content
        const linksToDelete = existingLinks.filter(
          (l) => !productTitles.includes(l.label),
        );
        for (const link of linksToDelete) {
          await prisma.navLink.delete({ where: { id: link.id } });
        }
      }
    } catch (syncError) {
      console.error("Error synchronizing NavLinks:", syncError);
      // We don't fail the entire request if sync fails, but we log it
    }
    // ---------------------------------

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving product content:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
