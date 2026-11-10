import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { deleteFromCloudinary, isOwnCloudinaryUrl } from "./cloudinary";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const BUCKET = "uploadsFiles";

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

/** Deletes a file this CMS stored: on Cloudinary (current) or Supabase Storage (older uploads). */
async function deleteStoredFile(url: string) {
  if (isOwnCloudinaryUrl(url)) return deleteFromCloudinary(url);
  const path = extractFilePath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.warn("[cleanup] Failed to delete old file:", error.message);
  } else {
    console.log(`[cleanup] Deleted unused file: ${path}`);
  }
}

/** Every stored-file URL anywhere inside a record (fields, JSON content, arrays, rich-text HTML). */
function findStoredUrls(obj: unknown): string[] {
  const urls: string[] = [];
  if (typeof obj === "string") {
    if (obj.includes(`/object/public/${BUCKET}/`) || isOwnCloudinaryUrl(obj)) {
      urls.push(obj);
    } else if (obj.includes("res.cloudinary.com/")) {
      // Rich text (e.g. a blog body): pick out the Cloudinary images inside the HTML
      for (const match of obj.matchAll(/https:\/\/res\.cloudinary\.com\/[^\s"'<>)]+/g)) {
        if (isOwnCloudinaryUrl(match[0])) urls.push(match[0]);
      }
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      urls.push(...findStoredUrls(item));
    }
  } else if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      urls.push(...findStoredUrls(record[key]));
    }
  }
  return urls;
}

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const rawPrisma = new PrismaClient({
    adapter,
    log: ["query"],
  });

  // ---------- Cleanup of replaced / removed files ----------
  //
  // After a save or delete succeeds, every file URL the old record had that the new one no
  // longer has is deleted from storage, unless some other record still uses it (the same
  // image can be shared, e.g. the logo is in the global footer and the old home footer).

  const likePattern = (url: string) => `%${url.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  /** True if any row in the database still refers to this file. Errs on the side of "yes". */
  async function isStillUsed(url: string): Promise<boolean> {
    try {
      const rows = await rawPrisma.$queryRawUnsafe<{ used: boolean }[]>(
        `SELECT EXISTS (
           SELECT 1 FROM "Section" WHERE content::text LIKE $1
           UNION ALL SELECT 1 FROM "Page"
             WHERE concat_ws(' ', "featuredImage", "ogImage", content) LIKE $1
           UNION ALL SELECT 1 FROM "GlobalConfig"
             WHERE concat_ws(' ', favicon, footer::text, "socialLinks"::text) LIKE $1
           UNION ALL SELECT 1 FROM "Banner" WHERE "imageUrl" LIKE $1
           UNION ALL SELECT 1 FROM "Product" WHERE array_to_string(images, ' ') LIKE $1
           UNION ALL SELECT 1 FROM "User" WHERE image LIKE $1
         ) AS used`,
        likePattern(url),
      );
      return rows[0]?.used !== false;
    } catch (error) {
      console.warn("[cleanup] Could not check whether a file is still used; keeping it:", error);
      return true;
    }
  }

  async function deleteIfUnused(urls: Iterable<string>) {
    for (const url of new Set(urls)) {
      if (!(await isStillUsed(url))) await deleteStoredFile(url);
    }
  }

  /** Files the old record(s) had that the new record(s) no longer have. */
  async function cleanupReplaced(before: unknown, after: unknown) {
    const kept = new Set(findStoredUrls(after));
    await deleteIfUnused(findStoredUrls(before).filter((url) => !kept.has(url)));
  }

  /* eslint-disable @typescript-eslint/no-explicit-any -- Prisma's query-extension types don't generalise across models */
  // update/upsert/delete hooks for a model: read the old row, run the query, then clean up.
  // `include` adds related rows whose files go away with the record (a page's sections).
  function cleanupHooks<Model extends { findUnique: any; findMany: any }>(
    model: Model,
    include?: Record<string, unknown>,
  ) {
    return {
      async update({ args, query }: any) {
        const before = await model.findUnique({ where: args.where });
        const result = await query(args);
        await cleanupReplaced(before, result);
        return result;
      },
      async upsert({ args, query }: any) {
        const before = await model.findUnique({ where: args.where });
        const result = await query(args);
        await cleanupReplaced(before, result);
        return result;
      },
      async delete({ args, query }: any) {
        const before = await model.findUnique({ where: args.where, ...(include && { include }) });
        const result = await query(args);
        await cleanupReplaced(before, null);
        return result;
      },
      async deleteMany({ args, query }: any) {
        const before = await model.findMany({ where: args?.where, ...(include && { include }) });
        const result = await query(args);
        await cleanupReplaced(before, null);
        return result;
      },
    };
  }

  /* eslint-enable @typescript-eslint/no-explicit-any */

  return rawPrisma.$extends({
    query: {
      page: cleanupHooks(rawPrisma.page, { sections: { select: { content: true } } }),
      section: cleanupHooks(rawPrisma.section),
      globalConfig: cleanupHooks(rawPrisma.globalConfig),
      banner: cleanupHooks(rawPrisma.banner),
      product: cleanupHooks(rawPrisma.product),
      user: cleanupHooks(rawPrisma.user),
    },
  });
}

export const prisma =
  (globalForPrisma.prisma as PrismaClient) ?? (createPrismaClient() as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
