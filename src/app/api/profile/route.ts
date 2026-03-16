import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: { name: updatedUser.name, email: updatedUser.email },
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
