/**
 * Points CMS content at the Cloudinary copies made by scripts/migrate-images.mjs.
 *
 *   node scripts/apply-image-map.mjs          rewrite prisma/seed-data/*.json
 *   node scripts/apply-image-map.mjs --db     also preview the live database changes
 *   node scripts/apply-image-map.mjs --db --write
 *                                             update the live database in place (no reseed);
 *                                             a backup of every changed row is saved first
 *
 * Replaced: website paths ("/images/…", exact values only), Supabase Storage URLs and base64
 * data URIs (also inside blog HTML), each by its URL in scripts/image-map.json.
 * Run --write only once the website allows res.cloudinary.com images (next.config.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const DB = process.argv.includes("--db");
const WRITE = process.argv.includes("--write");
const SEED_DIR = path.join(ROOT, "prisma/seed-data");
const map = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/image-map.json"), "utf8"));

const SUPABASE_URL = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^"'\s)\\]+/gi;
const DATA_URI = /data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/gi;
const dataUriKey = (uri) => `sha256:${crypto.createHash("sha256").update(uri).digest("hex")}`;

let replaced = 0;
const missing = new Set();
const lookup = (key, original) => {
  if (map[key]) {
    replaced++;
    return map[key];
  }
  if (/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(key.split("?")[0]) || key.startsWith("sha256:"))
    missing.add(key.slice(0, 120));
  return original;
};

function replaceString(s) {
  if (s.startsWith("/") && map[s]) return lookup(s, s);
  return s
    .replace(SUPABASE_URL, (url) => lookup(url, url))
    .replace(DATA_URI, (uri) => lookup(dataUriKey(uri), uri));
}

/** Returns a copy of any JSON value with every string passed through replaceString. */
function walk(value) {
  if (typeof value === "string") return replaceString(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
  return value;
}

// Seed data
for (const f of fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".json"))) {
  const file = path.join(SEED_DIR, f);
  const text = fs.readFileSync(file, "utf8");
  const before = replaced;
  const out = JSON.stringify(walk(JSON.parse(text)), null, 2) + "\n";
  if (out !== text) {
    fs.writeFileSync(file, out);
    console.log(`📝 seed-data/${f}: ${replaced - before} image references updated`);
  }
}

// Live database
if (DB) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const backup = {};
  const updates = [];
  try {
    for (const table of ["Page", "Section", "Banner", "Product", "GlobalConfig", "NavLink"]) {
      const { rows: cols } = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`,
        [table],
      );
      const types = Object.fromEntries(cols.map((c) => [c.column_name, c.data_type]));
      const { rows } = await pool.query(`SELECT * FROM "${table}"`);
      for (const row of rows) {
        const changed = {};
        for (const [col, value] of Object.entries(row)) {
          if (value === null || value instanceof Date || typeof value !== "object" && typeof value !== "string") continue;
          const next = walk(value);
          if (JSON.stringify(next) !== JSON.stringify(value)) changed[col] = next;
        }
        if (Object.keys(changed).length) {
          (backup[table] ??= []).push(row);
          updates.push({ table, id: row.id, changed, types });
          console.log(`🗄️  ${table} ${row.id}${row.type ? ` (${row.type})` : row.slug ? ` (${row.slug})` : ""}: ${Object.keys(changed).join(", ")}`);
        }
      }
    }

    if (WRITE && updates.length) {
      const backupFile = path.join(ROOT, `scripts/db-backup-${Date.now()}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(backup));
      console.log(`💾 Backup of ${updates.length} rows: ${path.relative(ROOT, backupFile)}`);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const { table, id, changed, types } of updates) {
          const cols = Object.keys(changed);
          const sets = cols.map((c, i) => {
            const t = types[c];
            const cast = t === "jsonb" ? "::jsonb" : t === "json" ? "::json" : t === "ARRAY" ? "::text[]" : "";
            return `"${c}" = $${i + 1}${cast}`;
          });
          const values = cols.map((c) =>
            types[c] === "jsonb" || types[c] === "json" ? JSON.stringify(changed[c]) : changed[c],
          );
          await client.query(`UPDATE "${table}" SET ${sets.join(", ")} WHERE id = $${cols.length + 1}`, [...values, id]);
        }
        await client.query("COMMIT");
        console.log(`✅ Database: ${updates.length} rows updated`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else if (updates.length) {
      console.log(`\nPreview only: ${updates.length} rows would change. Add --write to apply.`);
    } else {
      console.log("Database already points at Cloudinary.");
    }
  } finally {
    await pool.end();
  }
}

console.log(`\n${replaced} references replaced.`);
if (missing.size) {
  console.warn(`⚠️  ${missing.size} image references have no Cloudinary copy (run migrate-images.mjs):`);
  missing.forEach((m) => console.warn(`   ${m}`));
}
