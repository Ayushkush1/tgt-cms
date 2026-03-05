import fs from 'fs';

const path = 'src/app/components/ImageUploadField.tsx';
let content = fs.readFileSync(path, 'utf8');

// Change File[] to (File | string | null)[] interfaces
content = content.replace(/images\?: File\[\];/g, 'images?: (File | string | null)[];');
content = content.replace(/onImagesChange\?: \(images: File\[\]\) => void;/g, 'onImagesChange?: (images: (File | string | null)[]) => void;');

// Change internal state
content = content.replace(/useState<File\[\]>\(\[\]\);/g, 'useState<(File | string | null)[]>([])');

// Change handleUpdate
content = content.replace(/const handleUpdate = \(newImages: File\[\]\) => {/g, 'const handleUpdate = (newImages: (File | string | null)[]) => {');

// Fix the src in map
content = content.replace(
  'src={URL.createObjectURL(img)}',
  'src={typeof img === "string" ? img : URL.createObjectURL(img as Blob)}'
);

// Fix name and size display
content = content.replace(
  '{img.name}',
  '{typeof img === "string" ? "Uploaded Image" : (img as File).name}'
);
content = content.replace(
  '{(img.size / 1024 / 1024).toFixed(2)} MB',
  '{typeof img === "string" ? "Cloud / Remote" : ((img as File).size / 1024 / 1024).toFixed(2) + " MB"}'
);

fs.writeFileSync(path, content);
console.log('Fixed ImageUploadField');
