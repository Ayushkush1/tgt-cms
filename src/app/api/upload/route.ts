import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * POST /api/upload (multipart form data, one or more files) — signed-in CMS users only.
 *
 * Every file is compressed first (images → WebP, max 2000px; PDFs repacked), then
 * uploaded to Cloudinary. Response: { success, files: [url, …], details: [...] }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Loaded here, not at the top of the file: sharp is a native module, and if it can't
  // load on the server the error is returned as JSON instead of crashing the whole route.
  let compression: typeof import("@/lib/compressUpload");
  try {
    compression = await import("@/lib/compressUpload");
  } catch (error) {
    console.error("[upload] Could not load image compression (sharp):", error);
    return NextResponse.json(
      {
        success: false,
        error: `Image compression is unavailable on the server: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
  const { compressUpload, UnsupportedUploadError } = compression;

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
