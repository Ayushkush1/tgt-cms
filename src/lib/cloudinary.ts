import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { CompressedUpload } from "@/lib/compressUpload";

/**
 * Cloudinary storage for CMS uploads (server only). Files go into CLOUDINARY_FOLDER,
 * and only files inside that folder are ever deleted: the Cloudinary account is shared.
 */

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER } =
  process.env;

export const isCloudinaryConfigured = () =>
  !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET && CLOUDINARY_FOLDER);

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Uploads an already-compressed file and returns its public HTTPS URL. */
export function uploadToCloudinary(file: CompressedUpload): Promise<string> {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new Error("Cloudinary is not configured (CLOUDINARY_* in .env)"));
  }

  const name = file.fileName.replace(/\.[^.]+$/, "");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        // Images are already WebP/SVG/GIF; PDFs are stored byte-for-byte as raw files
        resource_type: file.kind === "pdf" ? "raw" : "image",
        public_id: `${name}-${Date.now()}${file.kind === "pdf" ? ".pdf" : ""}`,
        overwrite: false,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result?.secure_url) reject(error ?? new Error("Cloudinary returned no URL"));
        else resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
}

const CLOUDINARY_URL_PATTERN =
  /^https:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/;

/** True for a URL of a file this CMS uploaded to Cloudinary (our cloud, our folder). */
export function isOwnCloudinaryUrl(url: string): boolean {
  const match = url.match(CLOUDINARY_URL_PATTERN);
  return (
    !!match && match[1] === CLOUDINARY_CLOUD_NAME && match[3].startsWith(`${CLOUDINARY_FOLDER}/`)
  );
}

/** Deletes a file this CMS uploaded, given its URL. Never throws; other URLs are ignored. */
export async function deleteFromCloudinary(url: string): Promise<void> {
  if (!isCloudinaryConfigured() || !isOwnCloudinaryUrl(url)) return;
  const [, , resourceType, rest] = url.match(CLOUDINARY_URL_PATTERN)!;
  const path = decodeURIComponent(rest.split("?")[0]);
  // Image public ids have no extension; raw ones keep it
  const publicId = resourceType === "raw" ? path : path.replace(/\.[^./]+$/, "");
  try {
    // invalidate: also purge the CDN copy, so the old URL stops working too
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.warn(`[cloudinary] Could not delete ${publicId}:`, result.result);
    }
  } catch (error) {
    console.warn(`[cloudinary] Could not delete ${publicId}:`, error);
  }
}
