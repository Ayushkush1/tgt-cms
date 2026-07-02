import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

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

async function deleteFromSupabase(url: string) {
  const path = extractFilePath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.warn("Prisma Hook: Failed to delete old file:", error.message);
  } else {
    console.log(`Prisma Hook: Successfully deleted orphaned file: ${path}`);
  }
}

function findSupabaseUrls(obj: unknown): string[] {
  const urls: string[] = [];
  if (typeof obj === "string") {
    if (obj.includes(`/object/public/${BUCKET}/`)) {
      urls.push(obj);
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      urls.push(...findSupabaseUrls(item));
    }
  } else if (obj && typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      urls.push(...findSupabaseUrls(record[key]));
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

  return rawPrisma.$extends({
    query: {
      page: {
        async update({ args, query }) {
          const oldPage = await rawPrisma.page.findUnique({
            where: args.where,
            select: { featuredImage: true, ogImage: true },
          });

          const result = await query(args);

          if (oldPage) {
            const newFeatured = (result as { featuredImage?: string | null }).featuredImage;
            const oldFeatured = oldPage.featuredImage;
            if (oldFeatured && oldFeatured !== newFeatured) {
              await deleteFromSupabase(oldFeatured);
            }

            const newOg = (result as { ogImage?: string | null }).ogImage;
            const oldOg = oldPage.ogImage;
            if (oldOg && oldOg !== newOg) {
              await deleteFromSupabase(oldOg);
            }
          }
          return result;
        },
        async upsert({ args, query }) {
          const oldPage = await rawPrisma.page.findUnique({
            where: args.where,
            select: { featuredImage: true, ogImage: true },
          });

          const result = await query(args);

          if (oldPage) {
            const newFeatured = (result as { featuredImage?: string | null }).featuredImage;
            const oldFeatured = oldPage.featuredImage;
            if (oldFeatured && oldFeatured !== newFeatured) {
              await deleteFromSupabase(oldFeatured);
            }

            const newOg = (result as { ogImage?: string | null }).ogImage;
            const oldOg = oldPage.ogImage;
            if (oldOg && oldOg !== newOg) {
              await deleteFromSupabase(oldOg);
            }
          }
          return result;
        },
        async delete({ args, query }) {
          const oldPage = await rawPrisma.page.findUnique({
            where: args.where,
            select: { featuredImage: true, ogImage: true, sections: { select: { content: true } } },
          });

          const result = await query(args);

          if (oldPage) {
            if (oldPage.featuredImage) await deleteFromSupabase(oldPage.featuredImage);
            if (oldPage.ogImage) await deleteFromSupabase(oldPage.ogImage);
            if (oldPage.sections) {
              for (const section of oldPage.sections) {
                const urls = findSupabaseUrls(section.content);
                for (const url of urls) {
                  await deleteFromSupabase(url);
                }
              }
            }
          }
          return result;
        }
      },
      globalConfig: {
        async update({ args, query }) {
          const oldConfig = await rawPrisma.globalConfig.findUnique({
            where: args.where,
            select: { favicon: true },
          });

          const result = await query(args);

          if (oldConfig) {
            const newFavicon = (result as { favicon?: string | null }).favicon;
            const oldFavicon = oldConfig.favicon;
            if (oldFavicon && oldFavicon !== newFavicon) {
              await deleteFromSupabase(oldFavicon);
            }
          }
          return result;
        },
        async upsert({ args, query }) {
          const oldConfig = await rawPrisma.globalConfig.findUnique({
            where: args.where,
            select: { favicon: true },
          });

          const result = await query(args);

          if (oldConfig) {
            const newFavicon = (result as { favicon?: string | null }).favicon;
            const oldFavicon = oldConfig.favicon;
            if (oldFavicon && oldFavicon !== newFavicon) {
              await deleteFromSupabase(oldFavicon);
            }
          }
          return result;
        }
      },
      user: {
        async update({ args, query }) {
          const oldUser = await rawPrisma.user.findUnique({
            where: args.where,
            select: { image: true },
          });

          const result = await query(args);

          if (oldUser) {
            const newImg = (result as { image?: string | null }).image;
            const oldImg = oldUser.image;
            if (oldImg && oldImg !== newImg) {
              await deleteFromSupabase(oldImg);
            }
          }
          return result;
        }
      },
      section: {
        async update({ args, query }) {
          const oldSection = await rawPrisma.section.findUnique({
            where: args.where,
            select: { content: true },
          });

          const result = await query(args);

          if (oldSection && args.data.content !== undefined) {
            const oldUrls = findSupabaseUrls(oldSection.content);
            const newUrls = findSupabaseUrls((result as { content?: unknown }).content);
            const orphanedUrls = oldUrls.filter(url => !newUrls.includes(url));

            for (const url of orphanedUrls) {
              await deleteFromSupabase(url);
            }
          }
          return result;
        },
        async upsert({ args, query }) {
          const oldSection = await rawPrisma.section.findUnique({
            where: args.where,
            select: { content: true },
          });

          const result = await query(args);

          if (oldSection && (args.update.content !== undefined || args.create.content !== undefined)) {
            const oldUrls = findSupabaseUrls(oldSection.content);
            const newUrls = findSupabaseUrls((result as { content?: unknown }).content);
            const orphanedUrls = oldUrls.filter(url => !newUrls.includes(url));

            for (const url of orphanedUrls) {
              await deleteFromSupabase(url);
            }
          }
          return result;
        },
        async delete({ args, query }) {
          const oldSection = await rawPrisma.section.findUnique({
            where: args.where,
            select: { content: true },
          });

          const result = await query(args);

          if (oldSection) {
            const urls = findSupabaseUrls(oldSection.content);
            for (const url of urls) {
              await deleteFromSupabase(url);
            }
          }
          return result;
        }
      },
      banner: {
        async update({ args, query }) {
          const oldBanner = await rawPrisma.banner.findUnique({
            where: args.where,
            select: { imageUrl: true },
          });

          const result = await query(args);

          if (oldBanner) {
            const newImg = (result as { imageUrl?: string }).imageUrl;
            const oldImg = oldBanner.imageUrl;
            if (oldImg && oldImg !== newImg) {
              await deleteFromSupabase(oldImg);
            }
          }
          return result;
        },
        async delete({ args, query }) {
          const oldBanner = await rawPrisma.banner.findUnique({
            where: args.where,
            select: { imageUrl: true },
          });

          const result = await query(args);

          if (oldBanner && oldBanner.imageUrl) {
            await deleteFromSupabase(oldBanner.imageUrl);
          }
          return result;
        }
      },
      product: {
        async update({ args, query }) {
          const oldProduct = await rawPrisma.product.findUnique({
            where: args.where,
            select: { images: true },
          });

          const result = await query(args);

          if (oldProduct && args.data.images !== undefined) {
            const oldImages = oldProduct.images || [];
            const newImages = (result as { images?: string[] }).images || [];
            const orphanedImages = oldImages.filter(img => !newImages.includes(img));

            for (const img of orphanedImages) {
              await deleteFromSupabase(img);
            }
          }
          return result;
        },
        async delete({ args, query }) {
          const oldProduct = await rawPrisma.product.findUnique({
            where: args.where,
            select: { images: true },
          });

          const result = await query(args);

          if (oldProduct && oldProduct.images) {
            for (const img of oldProduct.images) {
              await deleteFromSupabase(img);
            }
          }
          return result;
        }
      }
    }
  });
}

export const prisma = (globalForPrisma.prisma as PrismaClient) ?? (createPrismaClient() as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
