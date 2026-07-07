const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Setting dynamic schemas for all database pages based on their content...");

  // 1. Update GlobalConfig
  const globalSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Gold Technologies",
    "url": "https://thegoldtechnologies.com",
    "logo": "https://thegoldtechnologies.com/logo.png",
    "sameAs": [
      "https://www.facebook.com/thegoldtechnologies",
      "https://twitter.com/thegoldtech",
      "https://www.linkedin.com/company/thegoldtechnologies"
    ]
  };

  await prisma.globalConfig.upsert({
    where: { id: "global" },
    update: { schema: JSON.stringify(globalSchema, null, 2) },
    create: {
      id: "global",
      siteTitle: "The Gold Technologies",
      siteDescription: "Premium Web Development and Dynamic Software Solutions",
      schema: JSON.stringify(globalSchema, null, 2)
    }
  });
  console.log("Global SEO Config schema updated.");

  // 2. Fetch and update every page dynamically
  const pages = await prisma.page.findMany();
  console.log(`Found ${pages.length} pages in the database.`);

  for (const page of pages) {
    const slug = page.slug;
    let schemaType = "WebPage";
    let additionalProps = {};

    // Determine type and additional properties based on slug and type
    if (slug === "home" || slug === "index") {
      schemaType = "WebSite";
    } else if (slug === "about") {
      schemaType = "AboutPage";
    } else if (slug === "services") {
      schemaType = "Service";
      additionalProps = {
        "serviceType": "Software Development & Web Solutions",
        "provider": {
          "@type": "Organization",
          "name": "The Gold Technologies"
        }
      };
    } else if (slug === "portfolio" || slug === "products") {
      schemaType = "CollectionPage";
    } else if (slug === "contactUs" || slug === "contact-us" || slug === "contact") {
      schemaType = "ContactPage";
    } else if (slug.startsWith("blog/") || page.type === "blog") {
      schemaType = "BlogPosting";
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "name": page.metaTitle || page.title || "The Gold Technologies",
      "description": page.metaDescription || "Premium software development and digital solutions.",
      "url": `https://thegoldtechnologies.com/${slug === "home" ? "" : slug}`,
      ...additionalProps
    };

    await prisma.page.update({
      where: { id: page.id },
      data: { schema: JSON.stringify(schemaData, null, 2) }
    });

    console.log(`Successfully generated schema for page: ${slug} (${schemaType})`);
  }

  console.log("All page schemas have been successfully updated based on their content!");
}

main()
  .catch((e) => {
    console.error("Error setting schemas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
