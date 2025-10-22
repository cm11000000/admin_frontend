# Converting SVG to PNG

The SVG icons have been generated. To convert them to PNG format (required for PWA):

## Option 1: Using ImageMagick
```bash
for file in *.svg; do
  convert -background none "$file" "${file%.svg}.png"
done
```

## Option 2: Using Inkscape
```bash
for file in *.svg; do
  inkscape --export-type=png --export-filename="${file%.svg}.png" "$file"
done
```

## Option 3: Using sharp (Node.js)
```bash
npm install sharp
node convert-to-png.js
```

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
```bash
# Using pngquant
pngquant --quality=85-95 *.png --ext .png --force

# Using optipng
optipng -o7 *.png
```