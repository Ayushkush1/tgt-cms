import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    // A simple query to verify database connection works
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "online",
      message: "TGT CMS Backend is running and connected to database!",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Backend is running, but database connection failed.",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
