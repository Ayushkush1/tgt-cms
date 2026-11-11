/**
 * One-off image migration: `node scripts/migrate-images.mjs [--dry]`
 *
 * Collects every image the website uses and uploads it to Cloudinary (folder CLOUDINARY_FOLDER),
 * through the same pipeline as CMS uploads: src/lib/compressUpload.ts (sharp → WebP, max 2000px)
 * then src/lib/cloudinary.ts.
 *
 * Sources:
 *   1. Images the website ships in its public/ folder (WEBSITE_DIR, default ../TGT-LandingPage)
 *   2. Image references in prisma/seed-data/*.json and in the live database (read only):
 *      website paths ("/images/…"), Supabase Storage URLs and base64 data URIs in blog bodies
 *
 * Writes scripts/image-map.json: { "<old path | URL | sha256:hash>": "<Cloudinary URL>" }.
 * Already-mapped sources are skipped, so the script can be re-run safely.
 * Nothing in the database or seed data is changed here (see scripts/apply-image-map.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(ROOT, ".env") });

// Loaded after dotenv: cloudinary.ts reads its config from process.env on import
const { compressUpload } = await import("../src/lib/compressUpload.ts");
const { uploadToCloudinary, isCloudinaryConfigured } = await import("../src/lib/cloudinary.ts");

const DRY = process.argv.includes("--dry");
const WEBSITE_DIR = path.resolve(ROOT, process.env.WEBSITE_DIR || "../TGT-LandingPage");
const PUBLIC_DIR = path.join(WEBSITE_DIR, "public");
const MAP_FILE = path.join(ROOT, "scripts/image-map.json");
const SEED_DIR = path.join(ROOT, "prisma/seed-data");

const IMAGE_EXT = /\.(png|jpe?g|webp|svg|gif|avif)$/i;
const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
  avif: "image/avif",
};

// Website public files used by the site's own code (not only via CMS data)
const PUBLIC_DIRS = ["images/clients", "images/tech", "images/team", "images/founder", "images/hero"];
const PUBLIC_FILES = ["logo.jpeg", "bg-4.jpg", "images/women-owned-logo.webp"];

const LOCAL_PATH = /"(\/[A-Za-z0-9_\-./]+\.(?:png|jpe?g|webp|svg|gif|avif))"/gi;
const SUPABASE_URL = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^"'\s)\\]+/gi;
const DATA_URI = /data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/gi;

const dataUriKey = (uri) => `sha256:${crypto.createHash("sha256").update(uri).digest("hex")}`;

/** source = { key, name, load: () => Promise<{ buffer, type }> } */
const sources = new Map();

function addLocal(webPath) {
  const file = path.join(PUBLIC_DIR, webPath);
  if (sources.has(webPath)) return;
  if (!fs.existsSync(file)) return console.warn(`⚠️  Not found in website public/: ${webPath}`);
  sources.set(webPath, {
    key: webPath,
    name: path.basename(webPath),
    load: async () => ({
      buffer: fs.readFileSync(file),
      type: MIME[path.extname(file).slice(1).toLowerCase()],
    }),
  });
}

function addRemote(url) {
  if (sources.has(url)) return;
  const name = decodeURIComponent(url.split("/").pop().split("?")[0]).replace(/^\d{10,}-/, "");
  sources.set(url, {
    key: url,
    name,
    load: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ext = path.extname(name).slice(1).toLowerCase();
      const type = (res.headers.get("content-type") || "").split(";")[0] || MIME[ext];
      return { buffer: Buffer.from(await res.arrayBuffer()), type: MIME[ext] || type };
    },
  });
}

function addDataUri(uri) {
  const key = dataUriKey(uri);
  if (sources.has(key)) return;
  const [, type, b64] = uri.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  sources.set(key, {
    key,
    name: `blog-image-${key.slice(7, 15)}.${type.split("/")[1].replace("+xml", "")}`,
    load: async () => ({ buffer: Buffer.from(b64, "base64"), type }),
  });
}

function scanText(text) {
  for (const [, p] of text.matchAll(LOCAL_PATH)) if (!p.startsWith("//")) addLocal(p);
  for (const [url] of text.matchAll(SUPABASE_URL)) if (IMAGE_EXT.test(url.split("?")[0])) addRemote(url);
  for (const [uri] of text.matchAll(DATA_URI)) addDataUri(uri);
}

// 1. Website public files
for (const dir of PUBLIC_DIRS) {
  for (const f of fs.readdirSync(path.join(PUBLIC_DIR, dir))) {
    if (IMAGE_EXT.test(f)) addLocal(`/${dir}/${f}`);
  }
}
PUBLIC_FILES.forEach((f) => addLocal(`/${f}`));

// 2a. Seed data
for (const f of fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".json"))) {
  scanText(fs.readFileSync(path.join(SEED_DIR, f), "utf8"));
}

// 2b. Live database (read only)
if (process.env.DATABASE_URL) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    for (const table of ["Page", "Section", "Banner", "Product", "GlobalConfig", "NavLink"]) {
      const { rows } = await pool.query(`SELECT row_to_json(t)::text AS j FROM "${table}" t`);
      rows.forEach((r) => scanText(r.j));
    }
  } finally {
    await pool.end();
  }
}

// Upload whatever is not mapped yet
const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8")) : {};
const todo = [...sources.values()].filter((s) => !map[s.key]);
console.log(`Found ${sources.size} images, ${sources.size - todo.length} already on Cloudinary, ${todo.length} to upload.`);

if (DRY) {
  todo.forEach((s) => console.log(`  • ${s.key.length > 100 ? s.key.slice(0, 100) + "…" : s.key}`));
  process.exit(0);
}
if (!isCloudinaryConfigured()) {
  console.error("❌ Cloudinary is not configured (CLOUDINARY_* in .env)");
  process.exit(1);
}

const save = () => {
  const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(MAP_FILE, JSON.stringify(sorted, null, 2) + "\n");
};

let failed = 0;
let before = 0;
let after = 0;
const queue = [...todo];
async function worker() {
  for (let s = queue.shift(); s; s = queue.shift()) {
    try {
      const { buffer, type } = await s.load();
      const compressed = await compressUpload(new File([buffer], s.name, { type }));
      map[s.key] = await uploadToCloudinary(compressed);
      before += compressed.originalBytes;
      after += compressed.finalBytes;
      save();
      console.log(`✅ ${s.name} (${(compressed.originalBytes / 1024).toFixed(0)}KB → ${(compressed.finalBytes / 1024).toFixed(0)}KB)`);
    } catch (error) {
      failed++;
      console.error(`❌ ${s.key.slice(0, 120)}: ${error.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

console.log(
  `\nDone: ${todo.length - failed} uploaded, ${failed} failed. ` +
    `${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024 / 1024).toFixed(1)}MB. Map: scripts/image-map.json`,
);
process.exit(failed ? 1 : 0);
