/**
 * One-off: fills the live GlobalConfig with the brand assets added in this migration.
 *   node scripts/sync-brand-assets.mjs           preview
 *   node scripts/sync-brand-assets.mjs --write   apply (backup saved first)
 *
 * - GlobalConfig.footer & .socialLinks: built from the live home "FooterCMS" section (so newer
 *   edits there are kept) plus the logo and badges from seed-data/global-config.json; only
 *   when footer is still empty (never overwrites what was saved on Social Media & Footer).
 * - GlobalConfig.siteImages: keys from the seed that are missing in the database.
 * - FooterCMS section: logo & badges, if it has none.
 * - TrustedBySection: the named client logos list (`logos`), if it has none. Its `images`
 *   (the hero pill the website reads) is left as it is.
 * - Drops GlobalConfig.siteImages.clientLogos (client logos moved to TrustedBySection).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(ROOT, ".env") });
const WRITE = process.argv.includes("--write");

const seed = JSON.parse(fs.readFileSync(path.join(ROOT, "prisma/seed-data/global-config.json"), "utf8"))[0];
const seedTrusted = JSON.parse(fs.readFileSync(path.join(ROOT, "prisma/seed-data/sections.json"), "utf8"))
  .find((sec) => sec.type === "TrustedBySection").content;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const s = (v) => (typeof v === "string" ? v.trim() : "");

try {
  const { rows: [config] } = await pool.query(`SELECT * FROM "GlobalConfig" WHERE id = 'global'`);
  const { rows: [footerSection] } = await pool.query(
    `SELECT s.* FROM "Section" s JOIN "Page" p ON p.id = s."pageId" WHERE p.slug = 'home' AND s.type = 'FooterCMS'`,
  );
  const { rows: [trustedSection] } = await pool.query(
    `SELECT s.* FROM "Section" s JOIN "Page" p ON p.id = s."pageId" WHERE p.slug = 'home' AND s.type = 'TrustedBySection'`,
  );
  if (!config) throw new Error("No GlobalConfig row");
  const fc = footerSection?.content ?? {};

  const updates = {};
  if (!config.footer) {
    updates.footer = {
      ...seed.footer,
      companyName: s(fc.companyName) || seed.footer.companyName,
      tagline: s(fc.companyInitials) || seed.footer.tagline,
      description: s(fc.footerDescription) || seed.footer.description,
      email: s(fc.emailAddress) || seed.footer.email,
      phone: s(fc.phoneNumber) || seed.footer.phone,
      offices: [1, 2]
        .map((n) => ({ country: s(fc[`loc${n}Country`]), address: s(fc[`loc${n}Address`]) }))
        .filter((o) => o.country || o.address),
      wordmark: {
        left: s(fc.leftText) || seed.footer.wordmark.left,
        center: s(fc.centerText) || seed.footer.wordmark.center,
        right: s(fc.rightText) || seed.footer.wordmark.right,
      },
    };
    if (!Array.isArray(config.socialLinks) || config.socialLinks.length === 0) {
      updates.socialLinks = [
        ["linkedin", "linkedinUrl"],
        ["instagram", "instagramUrl"],
        ["facebook", "facebookUrl"],
        ["twitter", "twitterUrl"],
      ]
        .map(([platform, key]) => ({ platform, url: s(fc[key]) }))
        .filter((l) => l.url);
    }
  }
  const { clientLogos: _moved, ...storedImages } = config.siteImages ?? {};
  const droppedClientLogos = _moved !== undefined;
  const missingImages = Object.fromEntries(
    Object.entries(seed.siteImages).filter(([k]) => storedImages[k] === undefined || storedImages[k] === ""),
  );
  if (Object.keys(missingImages).length || droppedClientLogos)
    updates.siteImages = { ...storedImages, ...missingImages };
  const trustedPatch =
    trustedSection && !Array.isArray(trustedSection.content?.logos)
      ? { ...trustedSection.content, logos: seedTrusted.logos }
      : null;

  const sectionPatch =
    footerSection && !fc.logo ? { ...fc, logo: seed.footer.logo, badges: fc.badges?.length ? fc.badges : seed.footer.badges } : null;

  console.log("GlobalConfig:", Object.keys(updates).length ? Object.keys(updates).join(", ") : "nothing to change");
  if (updates.siteImages) console.log("  siteImages keys added:", Object.keys(missingImages).join(", "));
  if (droppedClientLogos) console.log("  siteImages.clientLogos removed");
  console.log("FooterCMS section:", sectionPatch ? "logo, badges" : "nothing to change");
  console.log("TrustedBySection:", trustedPatch ? `logos (${trustedPatch.logos.length})` : "nothing to change");

  if (WRITE && (Object.keys(updates).length || sectionPatch || trustedPatch)) {
    const backupFile = path.join(ROOT, `scripts/db-backup-brand-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({ GlobalConfig: config, FooterCMS: footerSection ?? null, TrustedBySection: trustedSection ?? null }));
    console.log(`💾 Backup: ${path.relative(ROOT, backupFile)}`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [col, value] of Object.entries(updates)) {
        await client.query(`UPDATE "GlobalConfig" SET "${col}" = $1::jsonb, "updatedAt" = now() WHERE id = 'global'`, [JSON.stringify(value)]);
      }
      if (sectionPatch) {
        await client.query(`UPDATE "Section" SET content = $1::jsonb, "updatedAt" = now() WHERE id = $2`, [JSON.stringify(sectionPatch), footerSection.id]);
      }
      if (trustedPatch) {
        await client.query(`UPDATE "Section" SET content = $1::jsonb, "updatedAt" = now() WHERE id = $2`, [JSON.stringify(trustedPatch), trustedSection.id]);
      }
      await client.query("COMMIT");
      console.log("✅ Written");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } else if (!WRITE) {
    console.log("\nPreview only. Add --write to apply.");
  }
} finally {
  await pool.end();
}
