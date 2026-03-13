import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();

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
