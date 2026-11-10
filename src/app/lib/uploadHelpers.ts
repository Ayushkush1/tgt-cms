import { supabase } from "@/lib/supabase";

const BUCKET = "uploadsFiles";

/**
 * Extracts the storage file path from a Supabase public URL.
 * e.g. "https://<project>.supabase.co/storage/v1/object/public/uploadsFiles/1234-image.jpg"
 *      → "1234-image.jpg"
 */
function extractFilePath(publicUrl: string): string | null {
  try {
    const marker = `/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
}

/**
 * Deletes a file from Supabase storage given its public URL.
 * Silently ignores errors so it never blocks an upload.
 */
export async function deleteFileFromSupabase(publicUrl: string): Promise<void> {
  const path = extractFilePath(publicUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.warn("Failed to delete old file from Supabase:", error.message);
  }
}

/**
 * Compresses an image file on the client side using HTML5 Canvas
 * and outputs a WebP file.
 */
async function compressImageToWebP(file: File, maxWidth = 2000, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    // Only compress raster images: GIFs would lose animation, SVGs would stop being vectors
    if (!file.type.startsWith("image/") || file.type.includes("gif") || file.type.includes("svg")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if width exceeds maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Fallback to original
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original
            }
            const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const compressedFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Uploads new File objects through /api/upload (compressed, then stored on Cloudinary).
 *
 * @param files    Array of File objects (new upload) or existing string URLs / null (kept as-is).
 * @param oldUrls  Optional array of old public URLs to delete before uploading.
 */
export async function uploadFiles(
  files: (File | string | null)[],
  oldUrls?: (string | null | undefined)[],
): Promise<(string | null)[]> {
  const fileIndices: number[] = [];
  const filesToUpload: File[] = [];

  files.forEach((file, index) => {
    if (file instanceof File) {
      filesToUpload.push(file);
      fileIndices.push(index);
    }
  });

  // Delete old files from Supabase before uploading replacements
  if (oldUrls && oldUrls.length > 0) {
    await Promise.all(
      oldUrls.map((url) => {
        if (url && typeof url === "string") {
          return deleteFileFromSupabase(url);
        }
        return Promise.resolve();
      }),
    );
  }

  if (fileIndices.length === 0) {
    // No new files to upload — return existing strings/nulls as-is
    return files.map((f) => (typeof f === "string" ? f : null));
  }

  try {
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      // Compress file on client side first (reduces bandwidth & server load)
      const processedFile = await compressImageToWebP(file);

      const formData = new FormData();
      formData.append("file", processedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.statusText}`);
      }

      const json = await res.json();
      if (!json.success || !json.files || json.files.length === 0) {
        throw new Error(json.error || "Invalid response from upload API");
      }

      uploadedUrls.push(json.files[0]);
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

// ---------- Images inside rich text (blog posts) ----------
//
// While editing, an inserted image lives inside the post as a compressed data: URL, so
// nothing reaches Cloudinary unless the post is saved. On save, uploadInlineImages()
// uploads each one and swaps it for its Cloudinary URL.

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** A picked image, compressed to WebP in the browser, as a data: URL for the editor. */
export async function imageFileToDataUrl(file: File): Promise<string> {
  return readAsDataUrl(await compressImageToWebP(file));
}

const INLINE_IMAGE = /<img\b[^>]*?\bsrc=(["'])(data:image\/[a-z0-9.+-]+;base64,[^"']+)\1/gi;

/** True if the HTML has images that haven't been uploaded yet. */
export const hasInlineImages = (html: string) => new RegExp(INLINE_IMAGE.source, "i").test(html);

/**
 * Uploads every data: URL image in the HTML (compressed, then stored on Cloudinary) and
 * returns the HTML pointing at the uploaded URLs. HTML without such images is returned as is.
 */
export async function uploadInlineImages(html: string): Promise<string> {
  const dataUrls = [...new Set([...html.matchAll(INLINE_IMAGE)].map((match) => match[2]))];
  if (dataUrls.length === 0) return html;

  let result = html;
  for (const [i, dataUrl] of dataUrls.entries()) {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = blob.type.split("/")[1]?.replace("svg+xml", "svg") ?? "png";
    const [url] = await uploadFiles([
      new File([blob], `blog-image-${i + 1}.${ext}`, { type: blob.type }),
    ]);
    if (!url) throw new Error("Image upload failed");
    result = result.split(dataUrl).join(url);
  }
  return result;
}
