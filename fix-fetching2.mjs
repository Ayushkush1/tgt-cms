import fs from 'fs';
import path from 'path';

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      
      // Match fetch("/api/home") or fetch("/api/about") or fetch("/api/contact")
      // but not followed by a comma (which would mean options are passed, like for PUT)
      const fetchRegex = /fetch\("(\/api\/(home|about|contact))"\)(?!\s*,)/g;
      
      if (fetchRegex.test(content)) {
        content = content.replace(fetchRegex, 'fetchWithCache("$1")');
        modified = true;
      }
      
      if (modified) {
        if (!content.includes('fetchWithCache')) {
          // Add import statement near react imports
          content = content.replace(/(import .*? from 'react';?|import .*? from "react";?)/, '$1\nimport { fetchWithCache } from "@/lib/apiCache";');
        } else if (!content.includes('@/lib/apiCache')) {
          content = content.replace(/(import .*? from 'react';?|import .*? from "react";?)/, '$1\nimport { fetchWithCache } from "@/lib/apiCache";');
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

// target all the CMS component directories
processDir('src/app/static-pages/home/components');
processDir('src/app/static-pages/about/components');
processDir('src/app/static-pages/contact/components');
processDir('src/app/static-pages/components');
console.log("Done running fetch replacement script");
