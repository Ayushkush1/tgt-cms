import { supabase } from "@/lib/supabase";

export async function uploadFiles(
  files: (File | string | null)[],
): Promise<(string | null)[]> {
  const fileIndices: number[] = [];
  const filesToUpload: File[] = [];

  files.forEach((file, index) => {
    if (file instanceof File) {
      filesToUpload.push(file);
      fileIndices.push(index);
    }
  });

  if (fileIndices.length === 0) {
    // If there are no new files, just return the strings/nulls that already exist
    return files.map((f) => (typeof f === "string" ? f : null));
  }

  try {
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;

      const { error } = await supabase.storage
        .from("uploadsFiles")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Supabase Storage Error:", error);
        throw new Error(`Supabase Storage Error: ${error.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploadsFiles").getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    const result = [...files];
    let uploadIdx = 0;
    files.forEach((file, index) => {
      if (file instanceof File) {
        result[index] = uploadedUrls[uploadIdx++];
      } else if (typeof file === "string") {
        result[index] = file;
      } else {
        result[index] = null;
      }
    });

    return result as (string | null)[];
  } catch (err) {
    console.error("Upload error", err);
    throw err;
  }
}
