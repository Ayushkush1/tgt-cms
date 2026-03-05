import fs from 'fs';

const files = [
  { path: 'src/app/static-pages/home/components/HeroSection.tsx', name: 'projects', imgs: 'projectImages', imgSetter: 'setProjectImages' },
  { path: 'src/app/static-pages/home/components/WhatWeDo.tsx', name: 'services', imgs: 'serviceImages', imgSetter: 'setServiceImages' },
  { path: 'src/app/static-pages/components/BlogSection.tsx', name: 'blogs', imgs: 'blogImages', imgSetter: 'setBlogImages' },
  { path: 'src/app/static-pages/home/components/OurReputation.tsx', name: 'testimonials', imgs: 'avatarImages', imgSetter: 'setAvatarImages' },
];

for (const { path, name, imgs, imgSetter } of files) {
  let content = fs.readFileSync(path, 'utf8');

  // Inject helper import
  if (!content.includes('uploadFiles')) {
    content = content.replace(
      'import { TextAreaField } from "@/components/TextAreaField";',
      'import { TextAreaField } from "@/components/TextAreaField";\nimport { uploadFiles } from "@/app/lib/uploadHelpers";'
    );
  }

  // Allow (File | string | null)[]
  content = content.replace(/<(File \| null)\[\]>/g, '<(File | string | null)[]>');

  // Fix object URL strings showing up as files
  content = content.replace(
    'src={URL.createObjectURL(',
    'src={typeof ' + imgs + '[index] === "string" ? ' + imgs + '[index] : URL.createObjectURL('
  );
  content = content.replace(new RegExp(`\\(${imgs}\\[index\\]!\\)`), `(${imgs}[index] as Blob)`);
  
  // Update state initialisation logic
  content = content.replace(
    new RegExp(`set${imgs.charAt(0).toUpperCase() + imgs.slice(1)}\\(Array\\(data\\.${name}\\?\\.length \\|\\| 0\\)\\.fill\\(null\\)\\);`),
    `${imgSetter}(data.${name}.map((item: any) => item.image || null));`
  );

  // Update handleSave to weave image uploads before fetch
  const saveStart = content.indexOf('const toastId = toast.loading("Saving...");');
  if (saveStart !== -1) {
    const tryBlockStart = content.indexOf('try {', saveStart);
    if (tryBlockStart !== -1) {
      const fetchStart = content.indexOf('const res = await fetch', tryBlockStart);
      if (!content.includes(`uploadedUrls`)) {
        const replacement = `
      const uploadedUrls = await uploadFiles(${imgs});
      const payload = {
        ...formData,
        ${name}: formData.${name}.map((item, idx) => ({ ...item, image: uploadedUrls[idx] }))
      };
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
        `.trim();
        content = content.replace(
          /const res = await fetch\("\/api\/home", \{\s*method: "PUT",\s*headers: \{ "Content-Type": "application\/json" \},\s*body: JSON\.stringify\(\{ section: SECTION_KEY, content: [a-zA-Z0-9_]+ \}\),\s*\}\);/g,
          replacement
        );
      }
    }
  }

  // Displaying name fallback when it's a string URL
  content = content.replace(
    new RegExp(`{${imgs}\\[index\\]!\\.name}`),
    `{typeof ${imgs}[index] === "string" ? "Uploaded Image" : (${imgs}[index] as File).name}`
  );
  // Displaying size fallback when it's a string URL
  content = content.replace(
    new RegExp(`{\\(${imgs}\\[index\\]!\\.size \\/ 1024 \\/ 1024\\)\\.toFixed\\(2\\)} MB`),
    `{typeof ${imgs}[index] === "string" ? "Cloud / Remote" : ((${imgs}[index] as File).size / 1024 / 1024).toFixed(2) + " MB"}`
  );

  fs.writeFileSync(path, content);
}
console.log('Finished upload integrations script');
