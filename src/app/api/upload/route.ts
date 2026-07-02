import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadedFiles: string[] = [];

    for (const [, value] of formData.entries()) {
      const file = value as File;
      if (file && typeof file === "object" && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;

        let uploadBuffer: Buffer = buffer;
        let mimeType = file.type;
        let finalFileName = fileName;

        // Automatically optimize images (excluding GIFs)
        if (file.type.startsWith("image/") && !file.type.includes("gif")) {
          try {
            uploadBuffer = await sharp(buffer)
              .resize({ width: 1920, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            mimeType = "image/webp";
            const ext = path.extname(fileName);
            const baseName = fileName.slice(0, fileName.length - ext.length);
            finalFileName = `${baseName}.webp`;
          } catch (sharpError) {
            console.error(
              "Image compression failed, uploading original:",
              sharpError,
            );
          }
        }

        const { error } = await supabase.storage
          .from("uploadsFiles")
          .upload(finalFileName, uploadBuffer, {
            contentType: mimeType,
            cacheControl: "31536000",
            upsert: false,
          });

        if (error) {
          console.error("Supabase Storage Error:", error);
          return NextResponse.json(
            {
              success: false,
              error: `Supabase Storage Error: ${error.message}`,
            },
            { status: 500 },
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("uploadsFiles").getPublicUrl(finalFileName);
        uploadedFiles.push(publicUrl);
      }
    }

    return NextResponse.json({ success: true, files: uploadedFiles });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Critical Upload Error:", error);
    return NextResponse.json(
      { success: false, error: `Server Error: ${error.message}` },
      { status: 500 },
    );
  }
}
