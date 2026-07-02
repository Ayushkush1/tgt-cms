const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx !== -1) {
        const key = trimmed.slice(0, equalsIdx).trim();
        let val = trimmed.slice(equalsIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!dbUrl || !supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Missing database or Supabase configuration in .env");
  process.exit(1);
}

const BUCKET = 'uploadsFiles';

async function main() {
  console.log("Initializing database and Supabase client...");
  console.log("Database URL:", dbUrl.split('@')[1] || "configured");
  console.log("Supabase URL:", supabaseUrl);
  console.log("Bucket Name:", BUCKET);

  const pgClient = new Client({ connectionString: dbUrl });
  await pgClient.connect();

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch all objects in the bucket
  console.log("Fetching storage objects from metadata database...");
  const objectsRes = await pgClient.query(`
    SELECT id, name, (metadata->>'size')::bigint AS size, metadata->>'mimetype' AS mimetype 
    FROM storage.objects 
    WHERE bucket_id = $1
  `, [BUCKET]);
  
  const objects = objectsRes.rows;
  console.log(`Found ${objects.length} total objects in "${BUCKET}".`);

  let processedCount = 0;
  let totalSavedBytes = 0n;

  for (const obj of objects) {
    const oldName = obj.name;
    const isImage = obj.mimetype && obj.mimetype.startsWith('image/') && !obj.mimetype.includes('gif');
    
    // Only process images
    if (!isImage) {
      console.log(`Skipping non-image: ${oldName}`);
      continue;
    }

    const ext = path.extname(oldName).toLowerCase();
    const isWebp = ext === '.webp';
    const oldSize = BigInt(obj.size || 0);

    // If it's WebP and already small (e.g. < 300 KB), skip it
    if (isWebp && oldSize < 300n * 1024n) {
      console.log(`Skipping already optimized WebP: ${oldName} (${(Number(oldSize)/1024).toFixed(2)} KB)`);
      continue;
    }

    // Skip if it's small jpeg/png (< 150 KB) unless it's not webp
    if (!isWebp && oldSize < 150n * 1024n) {
      console.log(`Skipping small image: ${oldName} (${(Number(oldSize)/1024).toFixed(2)} KB)`);
      continue;
    }

    console.log(`\n----------------------------------------`);
    console.log(`Processing: ${oldName} (${(Number(oldSize) / (1024 * 1024)).toFixed(2)} MB)`);

    try {
      // 1. Download original file using public URL fetch
      const fileUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(oldName)}`;
      const response = await fetch(fileUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`  Failed to download ${oldName}: HTTP ${response.status} - ${errorText}`);
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 2. Compress/Convert to WebP using sharp
      const image = sharp(buffer);
      const metadata = await image.metadata();

      let pipeline = image;
      // Resize if wider than 1920px
      if (metadata.width && metadata.width > 1920) {
        pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true });
      }

      const compressedBuffer = await pipeline
        .webp({ quality: 80 })
        .toBuffer();

      const newSize = BigInt(compressedBuffer.length);
      const savedBytes = oldSize - newSize;
      totalSavedBytes += savedBytes;

      const baseNameWithoutExt = oldName.slice(0, oldName.length - ext.length);
      const newName = `${baseNameWithoutExt}.webp`;

      console.log(`  Compressed size: ${(Number(newSize) / 1024).toFixed(2)} KB (Reduced by ${((Number(savedBytes) / Number(oldSize)) * 100).toFixed(1)}%)`);

      // 3. Upload new WebP file
      console.log(`  Uploading compressed file as: ${newName}`);
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(newName, compressedBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

      if (uploadError) {
        console.error(`  Upload failed for ${newName}:`, uploadError.message);
        continue;
      }

      // 4. Update database references
      if (newName !== oldName) {
        console.log(`  Updating database references from "${oldName}" to "${newName}"...`);
        
        // Update Page model
        await pgClient.query('UPDATE "Page" SET "featuredImage" = REPLACE("featuredImage", $1, $2) WHERE "featuredImage" LIKE $3', [oldName, newName, `%${oldName}%`]);
        await pgClient.query('UPDATE "Page" SET "ogImage" = REPLACE("ogImage", $1, $2) WHERE "ogImage" LIKE $3', [oldName, newName, `%${oldName}%`]);
        
        // Update GlobalConfig
        await pgClient.query('UPDATE "GlobalConfig" SET "favicon" = REPLACE("favicon", $1, $2) WHERE "favicon" LIKE $3', [oldName, newName, `%${oldName}%`]);
        
        // Update User
        await pgClient.query('UPDATE "User" SET "image" = REPLACE("image", $1, $2) WHERE "image" LIKE $3', [oldName, newName, `%${oldName}%`]);

        // Update Banner
        await pgClient.query('UPDATE "Banner" SET "imageUrl" = REPLACE("imageUrl", $1, $2) WHERE "imageUrl" LIKE $3', [oldName, newName, `%${oldName}%`]);

        // Update Product (Postgres string array using array_replace)
        await pgClient.query('UPDATE "Product" SET "images" = array_replace("images", $1, $2) WHERE $1 = ANY("images")', [
          `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${oldName}`,
          `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${newName}`
        ]);

        // Update Section (JSON content)
        const sectionsRes = await pgClient.query('SELECT id, content FROM "Section"');
        for (const sec of sectionsRes.rows) {
          const contentStr = JSON.stringify(sec.content);
          if (contentStr.includes(oldName)) {
            const updatedContentStr = contentStr.split(oldName).join(newName);
            const updatedContent = JSON.parse(updatedContentStr);
            await pgClient.query('UPDATE "Section" SET content = $1 WHERE id = $2', [updatedContent, sec.id]);
          }
        }
      }

      // 5. Delete old file from storage
      if (newName !== oldName) {
        console.log(`  Deleting original file: ${oldName}`);
        const { error: removeError } = await supabase.storage.from(BUCKET).remove([oldName]);
        if (removeError) {
          console.warn(`  Warning: Failed to delete old file: ${removeError.message}`);
        }
      }

      processedCount++;
      console.log(`  Successfully optimized ${oldName}!`);

    } catch (err) {
      console.error(`  Error processing ${oldName}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`Optimization Completed:`);
  console.log(`Successfully processed: ${processedCount} images`);
  console.log(`Total storage saved:   ${(Number(totalSavedBytes) / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`========================================`);

  await pgClient.end();
}

main().catch(err => {
  console.error("Migration script crashed:", err);
  process.exit(1);
});
