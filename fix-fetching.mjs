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
      
      // Replace React state fetching
      const homeFetchRegex = /fetch\("\/api\/home"\)\s*\.then\(\(r\)\s*=>\s*r\.json\(\)\)/g;
      if (homeFetchRegex.test(content)) {
        content = content.replace(homeFetchRegex, 'fetchWithCache("/api/home")');
        modified = true;
      }
      
      const aboutFetchRegex = /fetch\("\/api\/about"\)\s*\.then\(\(r\)\s*=>\s*r\.json\(\)\)/g;
      if (aboutFetchRegex.test(content)) {
        content = content.replace(aboutFetchRegex, 'fetchWithCache("/api/about")');
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

processDir('src/app/static-pages/home/components');
processDir('src/app/static-pages/about/components');
processDir('src/app/static-pages/components');
console.log("Done checking fetch replacements");
