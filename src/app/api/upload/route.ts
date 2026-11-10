import { NextResponse } from "next/server";
import { compressUpload, UnsupportedUploadError } from "@/lib/compressUpload";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * POST /api/upload (multipart form data, one or more files)
 *
 * Every file is compressed first (images → WebP, max 2000px; PDFs repacked), then
 * uploaded to Cloudinary. Response: { success, files: [url, …], details: [...] }
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = [...formData.values()].filter(
      (value): value is File => typeof value === "object" && !!value && "arrayBuffer" in value,
    );

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No file received" }, { status: 400 });
    }

    const details = [];
    for (const file of files) {
      const compressed = await compressUpload(file);
      const url = await uploadToCloudinary(compressed);
      details.push({
        name: file.name,
        url,
        originalKB: Math.round(compressed.originalBytes / 1024),
        finalKB: Math.round(compressed.finalBytes / 1024),
      });
      console.log(
        `[upload] ${file.name}: ${Math.round(compressed.originalBytes / 1024)}KB → ${Math.round(compressed.finalBytes / 1024)}KB`,
      );
    }

    return NextResponse.json({ success: true, files: details.map((d) => d.url), details });
  } catch (error) {
    if (error instanceof UnsupportedUploadError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 415 });
    }
    console.error("[upload] Failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
