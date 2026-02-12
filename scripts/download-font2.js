import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const url = 'https://unpkg.com/geist@1.7.0/dist/fonts/geist-pixel/GeistPixel-Square.woff2';

async function main() {
  console.log('CWD:', process.cwd());
  
  // Try multiple possible project paths
  const paths = [
    '/vercel/share/v0-project/public/fonts',
    './public/fonts',
    '../public/fonts',
  ];
  
  console.log('Downloading GeistPixel-Square.woff2...');
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  console.log(`Downloaded ${buffer.length} bytes`);
  
  for (const p of paths) {
    try {
      const resolved = resolve(p);
      mkdirSync(resolved, { recursive: true });
      const filePath = resolve(p, 'GeistPixel-Square.woff2');
      writeFileSync(filePath, buffer);
      console.log(`Written to: ${filePath}`);
      if (existsSync(filePath)) {
        console.log(`Verified file exists at: ${filePath}`);
      }
    } catch (e) {
      console.log(`Failed for ${p}: ${e.message}`);
    }
  }
}

main();
