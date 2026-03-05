import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import * as path from "path";
import * as fs from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadedFiles: string[] = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    for (const [key, value] of formData.entries()) {
      const file = value as File;
      if (file && typeof file === "object" && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize file name
        const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const fileName = `${Date.now()}-${originalName}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        uploadedFiles.push(`/uploads/${fileName}`);
      }
    }

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 },
    );
  }
}
