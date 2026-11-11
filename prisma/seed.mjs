/**
 * TGT CMS seed: `npm run seed`
 *
 * 1. DELETES every row in the database DATABASE_URL points to (content, submissions and users).
 * 2. Re-creates the website content from prisma/seed-data/*.json (exported from the live CMS).
 * 3. Creates one admin login from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 *
 * For a brand-new database, create the tables first: `npx prisma db push`
 * Images are not copied: the seeded content points at the Cloudinary copies (scripts/migrate-images.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
const missing = Object.entries({ DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD })
  .filter(([, value]) => !value)
  .map(([name]) => name);
if (missing.length) {
  console.error(`❌ Missing in .env: ${missing.join(", ")}. Nothing was deleted.`);
  process.exit(1);
}

// A plain client on purpose: the app's client (src/lib/prisma.ts) deletes Supabase files on delete
const prisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: DATABASE_URL })),
});

const DATA_DIR = path.join(__dirname, "seed-data");
const read = (name) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf8"));

// Optional Json columns can't take a plain null in createMany
const jsonOrDbNull = (value) => (value === null ? Prisma.DbNull : value);

async function wipe() {
  // Children before parents (Section → Page, Product → Category, Account/Session → User)
  const tables = [
    ["Section", prisma.section],
    ["Page", prisma.page],
    ["Product", prisma.product],
    ["Category", prisma.category],
    ["Banner", prisma.banner],
    ["NavLink", prisma.navLink],
    ["GlobalConfig", prisma.globalConfig],
    ["Enquiry", prisma.enquiry],
    ["Audit", prisma.audit],
    ["Session", prisma.session],
    ["Account", prisma.account],
    ["VerificationToken", prisma.verificationToken],
    ["User", prisma.user],
  ];
  const results = await prisma.$transaction(tables.map(([, model]) => model.deleteMany()));
  tables.forEach(([name], i) =>
    console.log(`   🗑  ${name.padEnd(17)} ${results[i].count} deleted`),
  );
}

async function seedContent() {
  const globalConfig = read("global-config").map((row) => ({
    ...row,
    socialLinks: jsonOrDbNull(row.socialLinks),
    footer: jsonOrDbNull(row.footer ?? null),
    siteImages: jsonOrDbNull(row.siteImages ?? null),
  }));
  const pages = read("pages").map((row) => ({
    ...row,
    headingOptions: jsonOrDbNull(row.headingOptions),
  }));
  const sections = read("sections");
  const navLinks = read("nav-links");
  const banners = read("banners");
  const categories = read("categories");
  const products = read("products");

  await prisma.globalConfig.createMany({ data: globalConfig });
  await prisma.page.createMany({ data: pages });
  // One at a time: the BlogSection rows are several MB each
  for (const section of sections) await prisma.section.create({ data: section });
  await prisma.navLink.createMany({ data: navLinks });
  await prisma.banner.createMany({ data: banners });
  await prisma.category.createMany({ data: categories });
  await prisma.product.createMany({ data: products });

  console.log(
    `   ✅ GlobalConfig ${globalConfig.length}, Page ${pages.length}, Section ${sections.length}, NavLink ${navLinks.length}`,
  );
  console.log(
    `   ✅ Banner ${banners.length}, Category ${categories.length}, Product ${products.length}`,
  );
}

async function seedAdmin() {
  await prisma.user.create({
    data: {
      name: "Admin",
      email: SEED_ADMIN_EMAIL,
      password: await bcrypt.hash(SEED_ADMIN_PASSWORD, 10),
    },
  });
  console.log(`   ✅ Admin login: ${SEED_ADMIN_EMAIL}`);
}

async function main() {
  console.log(`🌱 Seeding ${new URL(DATABASE_URL).host}`);
  console.log("1/3 Deleting existing data");
  await wipe();
  console.log("2/3 Seeding website content");
  await seedContent();
  console.log("3/3 Creating admin user");
  await seedAdmin();
  console.log("🎉 Done");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
