import { writeFileSync, mkdirSync } from 'fs';

const url = 'https://unpkg.com/geist@1.7.0/dist/fonts/geist-pixel/GeistPixel-Square.woff2';

async function main() {
  console.log('Downloading GeistPixel-Square.woff2...');
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync('public/fonts', { recursive: true });
  writeFileSync('public/fonts/GeistPixel-Square.woff2', buffer);
  console.log(`Downloaded ${buffer.length} bytes to public/fonts/GeistPixel-Square.woff2`);
}

main();
