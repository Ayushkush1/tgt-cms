/**
 * Copies the website's built-in Tech Stack icons into GlobalConfig.siteImages.techLogos, so the
 * CMS shows (and can change) the icon each technology already has on the site.
 *
 *   node prisma/migrate-tech-icons.mjs           dry run: prints what would change, writes nothing
 *   node prisma/migrate-tech-icons.mjs --apply   saves a backup to prisma/techLogos-backup-<time>.json,
 *                                                updates the database and prisma/seed-data/global-config.json
 *
 * Never touches an entry that already has an uploaded logo or a picked icon. Safe to run again.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import * as L from "lucide-react";
import { iconNames } from "lucide-react/dynamic.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const APPLY = process.argv.includes("--apply");

// Same as `stackIcons` in TGT-LandingPage src/app/service/ServicePage.tsx
const builtIn = {
  "Brand strategy": L.Compass, "Logo & visual identity": L.PenTool, "Personal branding": L.UserRound,
  "Company branding": L.Building2, "Brand voice": L.MessageSquareQuote, "Social creatives": L.Images,
  Wireframing: L.LayoutTemplate, Prototyping: L.MousePointerClick, "Website UI": L.Monitor,
  "App UI": L.Smartphone, "Software UI": L.AppWindow, "Accessibility design": L.Accessibility,
  "Cross-platform": L.Layers, "App testing & QA": L.Bug, ERP: L.Boxes, CRM: L.Users,
  "Inventory management": L.Package, "HR & payroll": L.Wallet, "Workflow automation": L.Workflow,
  "Document management": L.FileText, SEO: L.Search, "AEO, AIO & GEO": L.Sparkles,
  "Technical SEO": L.Code2, "Content marketing": L.PenLine, "Email automation": L.Mail,
  Klaviyo: L.MailCheck, "Podcast management": L.Mic, "Social media management": L.Share2,
  "Performance marketing": L.TrendingUp, "Influencer marketing": L.Megaphone, "Video marketing": L.Video,
  Retargeting: L.Repeat, "AI & machine learning": L.Brain, "AI chatbots": L.Bot,
  Recommendations: L.Lightbulb, "Power BI": L.BarChart3, "Data warehousing": L.Database,
  "Data engineering": L.Cable, "Data visualisation": L.PieChart, "Advanced analytics": L.LineChart,
};

const toPascal = (n) => n.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
/** The icon's kebab name as the CMS picker lists it (its canonical name, not an alias). */
const nameOf = (C) => iconNames.find((n) => L.icons[toPascal(n)] === C);

const prisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: process.env.DATABASE_URL })),
});

try {
  const row = await prisma.globalConfig.findUnique({ where: { id: "global" }, select: { siteImages: true } });
  if (!row) throw new Error("No GlobalConfig row with id 'global'.");
  const siteImages = row.siteImages && typeof row.siteImages === "object" ? row.siteImages : {};
  const list = Array.isArray(siteImages.techLogos) ? siteImages.techLogos : [];

  let next = [...list];
  let added = 0;
  for (const [label, C] of Object.entries(builtIn)) {
    const icon = nameOf(C);
    if (!icon) throw new Error(`No lucide icon name found for "${label}".`);
    const key = label.toLowerCase();
    const existing = next.find((t) => t.name === key || t.matches?.includes(key));
    if (existing?.image) console.log(`  keep logo   ${label}`);
    else if (existing?.icon) console.log(`  keep icon   ${label} (${existing.icon})`);
    else {
      next = existing
        ? next.map((t) => (t === existing ? { ...t, icon } : t))
        : [...next, { name: key, image: "", icon, matches: [key] }];
      added++;
      console.log(`  add icon    ${label} -> ${icon}`);
    }
  }
  console.log(`\n${added} icon(s) to add; techLogos ${list.length} -> ${next.length} entries.`);

  if (!APPLY) {
    console.log("Dry run: nothing written. Re-run with --apply to save.");
  } else if (added > 0) {
    const backup = path.resolve(__dirname, `techLogos-backup-${Date.now()}.json`);
    fs.writeFileSync(backup, JSON.stringify(siteImages, null, 2));
    console.log(`Backup of current siteImages: ${backup}`);

    await prisma.globalConfig.update({
      where: { id: "global" },
      data: { siteImages: { ...siteImages, techLogos: next } },
    });

    const seedPath = path.resolve(__dirname, "seed-data/global-config.json");
    const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    seed[0].siteImages = { ...(seed[0].siteImages ?? {}), techLogos: next };
    fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
    console.log("✅ Database and seed-data/global-config.json updated.");
  }
} finally {
  await prisma.$disconnect();
}
