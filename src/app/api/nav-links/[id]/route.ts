import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Fetch the existing link to check for changes
    const oldLink = await prisma.navLink.findUnique({
      where: { id },
    });

    const updatedLink = await prisma.navLink.update({
      where: { id },
      data: {
        label: data.label,
        url: data.url,
        type: data.type,
        parent: data.parent,
        order: data.order,
        description: data.description,
        title: data.title,
        isStatic: data.isStatic,
      },
    });

    // Synchronize with Page table for dynamic Main/Sub links
    if (
      (data.type === "Main Link" || data.type === "Sub-link") &&
      !data.isStatic &&
      data.url?.startsWith("/") &&
      !data.url.startsWith("/service/") &&
      data.url !== "/" &&
      oldLink
    ) {
      const oldSlug = oldLink.url.startsWith("/")
        ? oldLink.url.substring(1).split("?")[0].split("#")[0]
        : null;
      const newSlug = data.url.substring(1).split("?")[0].split("#")[0];

      if (newSlug) {
        try {
          if (oldSlug && oldSlug !== newSlug) {
            // URL changed: try to rename existing page
            await prisma.page.update({
              where: { slug: oldSlug },
              data: { slug: newSlug, title: data.label },
            });
          } else {
            // URL same or no old slug: upsert based on current newSlug
            await prisma.page.upsert({
              where: { slug: newSlug },
              update: { title: data.label },
              create: {
                slug: newSlug,
                title: data.label,
                type: "standard",
                visibility: "draft",
              },
            });
          }
        } catch (pageError) {
          console.error("Failed to sync page on link update:", pageError);
        }
      }
    }

    return NextResponse.json({ success: true, data: updatedLink });
  } catch (error) {
    console.error("Update nav link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update link" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch the link to get the URL for page deletion
    const link = await prisma.navLink.findUnique({
      where: { id },
    });

    if (link) {
      // If it's a dynamic Main/Sub link, delete the corresponding Page
      if (
        (link.type === "Main Link" || link.type === "Sub-link") &&
        !link.isStatic &&
        link.url?.startsWith("/") &&
        !link.url.startsWith("/service/") &&
        link.url !== "/"
      ) {
        const slug = link.url.substring(1).split("?")[0].split("#")[0];
        if (slug) {
          try {
            await prisma.page.deleteMany({
              where: { slug },
            });
          } catch (pageError) {
            console.error("Failed to delete associated page:", pageError);
          }
        }
      }
    }

    await prisma.navLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Link deleted" });
  } catch (error) {
    console.error("Delete nav link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete link" },
      { status: 500 },
    );
  }
}
