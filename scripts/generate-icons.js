/**
 * PWA Icon Generator Script
 *
 * This script generates placeholder SVG icons for PWA.
 * In production, replace these with actual brand icons.
 *
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Generate SVG for each size
SIZES.forEach(size => {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#gradient)"/>

  <!-- Gradient -->
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="${size}" y2="${size}">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>

  <!-- Letter S -->
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    fill="white"
    font-family="Arial, sans-serif"
    font-weight="bold"
    font-size="${size * 0.5}"
  >S</text>
</svg>
  `.trim();

  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(ICONS_DIR, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

// Also create PNG placeholders info
const readmePath = path.join(ICONS_DIR, 'GENERATE_PNG.md');
const readmeContent = `
# Converting SVG to PNG

The SVG icons have been generated. To convert them to PNG format (required for PWA):

## Option 1: Using ImageMagick
\`\`\`bash
for file in *.svg; do
  convert -background none "$file" "\${file%.svg}.png"
done
\`\`\`

## Option 2: Using Inkscape
\`\`\`bash
for file in *.svg; do
  inkscape --export-type=png --export-filename="\${file%.svg}.png" "$file"
done
\`\`\`

## Option 3: Using sharp (Node.js)
\`\`\`bash
npm install sharp
node convert-to-png.js
\`\`\`

## Option 4: Online Tools
- Upload SVGs to https://cloudconvert.com/svg-to-png
- Download PNG versions
- Place in this directory

## Option 5: Design Tools
Use Figma, Sketch, or Photoshop to:
1. Import the SVG
2. Export as PNG at each required size
3. Ensure proper transparency

## Optimization
After conversion, optimize PNGs:
\`\`\`bash
# Using pngquant
pngquant --quality=85-95 *.png --ext .png --force

# Using optipng
optipng -o7 *.png
\`\`\`
`;

fs.writeFileSync(readmePath, readmeContent.trim());
console.log('✓ Generated conversion instructions');

console.log('\n✨ All icon templates generated successfully!');
console.log('\nNext steps:');
console.log('1. Convert SVG icons to PNG format (see public/icons/GENERATE_PNG.md)');
console.log('2. Or replace with your actual brand icons');
console.log('3. Optimize PNG files for web');
