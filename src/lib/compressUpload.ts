import path from "node:path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

/**
 * Compresses every uploaded file before it is sent to storage (server only).
 *
 * - Raster images (JPEG, PNG, WebP, AVIF, TIFF, BMP): auto-rotated, downscaled to at most
 *   MAX_IMAGE_SIZE px on either side, converted to WebP.
 * - SVG and GIF: kept as they are (converting would rasterise vectors / drop animation).
 * - PDF: re-saved with object streams, kept only if that is smaller. Images inside a PDF
 *   can't be recompressed without Ghostscript, which isn't available on Vercel.
 * - Anything else is rejected.
 */

export const MAX_IMAGE_SIZE = 2000;
const WEBP_QUALITY = 80;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const RASTER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/bmp",
];
const PASSTHROUGH_IMAGE_TYPES = ["image/svg+xml", "image/gif"];
const PDF_TYPE = "application/pdf";

/** Accepted upload types, also usable in an <input accept="…">. */
export const ACCEPTED_UPLOAD_TYPES = [...RASTER_TYPES, ...PASSTHROUGH_IMAGE_TYPES, PDF_TYPE];

export type UploadKind = "image" | "pdf";

export interface CompressedUpload {
  buffer: Buffer;
  fileName: string; // safe name with the final extension
  mimeType: string;
  kind: UploadKind;
  originalBytes: number;
  finalBytes: number;
}

export class UnsupportedUploadError extends Error {}

const safeBaseName = (name: string) =>
  path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";

export async function compressUpload(file: File): Promise<CompressedUpload> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UnsupportedUploadError(
      `"${file.name}" is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`,
    );
  }

  const original = Buffer.from(await file.arrayBuffer());
  const base = safeBaseName(file.name);
  const type = file.type.toLowerCase();

  if (RASTER_TYPES.includes(type)) {
    const resized = () =>
      sharp(original)
        .rotate() // apply EXIF orientation before the metadata is dropped
        .resize({
          width: MAX_IMAGE_SIZE,
          height: MAX_IMAGE_SIZE,
          fit: "inside",
          withoutEnlargement: true,
        });

    // Photos shrink most with lossy WebP; logos, screenshots and other graphics (usually
    // PNG) often come out smaller lossless. Encode both where it matters and keep the smaller.
    const candidates = [await resized().webp({ quality: WEBP_QUALITY }).toBuffer()];
    if (type === "image/png") candidates.push(await resized().webp({ lossless: true }).toBuffer());

    // An already-WebP file that needed no resizing is kept if re-encoding would grow it
    const { width = 0, height = 0 } = await sharp(original).metadata();
    if (type === "image/webp" && Math.max(width, height) <= MAX_IMAGE_SIZE)
      candidates.push(original);

    const webp = candidates.reduce((smallest, next) =>
      next.length < smallest.length ? next : smallest,
    );
    return {
      buffer: webp,
      fileName: `${base}.webp`,
      mimeType: "image/webp",
      kind: "image",
      originalBytes: original.length,
      finalBytes: webp.length,
    };
  }

  if (PASSTHROUGH_IMAGE_TYPES.includes(type)) {
    const ext = type === "image/gif" ? "gif" : "svg";
    return {
      buffer: original,
      fileName: `${base}.${ext}`,
      mimeType: type,
      kind: "image",
      originalBytes: original.length,
      finalBytes: original.length,
    };
  }

  if (type === PDF_TYPE) {
    let buffer = original;
    try {
      const pdf = await PDFDocument.load(original, { updateMetadata: false });
      const repacked = Buffer.from(await pdf.save({ useObjectStreams: true }));
      if (repacked.length < original.length) buffer = repacked;
    } catch (error) {
      // Encrypted or unusual PDFs can't be repacked; upload them as they are
      console.warn(`[upload] Could not compress PDF "${file.name}":`, error);
    }
    return {
      buffer,
      fileName: `${base}.pdf`,
      mimeType: PDF_TYPE,
      kind: "pdf",
      originalBytes: original.length,
      finalBytes: buffer.length,
    };
  }

  throw new UnsupportedUploadError(
    `"${file.name}" is not a supported file type. Upload an image (JPG, PNG, WebP, SVG, GIF) or a PDF.`,
  );
}
