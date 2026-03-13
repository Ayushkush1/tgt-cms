import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

        const { error } = await supabase.storage
          .from("uploadsFiles")
          .upload(fileName, buffer, {
            contentType: file.type,
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
        } = supabase.storage.from("uploadsFiles").getPublicUrl(fileName);
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
