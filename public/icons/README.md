# PWA Icons

This directory contains PWA icons for the SabPaisa Admin Portal.

## Required Icon Sizes

The following icon sizes are required for a complete PWA installation:

- 72x72 (Android)
- 96x96 (Android)
- 128x128 (Android)
- 144x144 (Android)
- 152x152 (iOS)
- 192x192 (Android, Chrome)
- 384x384 (Android)
- 512x512 (Android, Chrome, Splash screens)

## Icon Guidelines

1. **Format**: PNG with transparency
2. **Design**: Simple, recognizable logo or brand mark
3. **Safe Area**: Keep important content within 80% of the icon area
4. **Maskable Icons**: Ensure the icon works well with rounded corners (Android adaptive icons)
5. **Background**: Either transparent or a solid color that matches your brand

## Generating Icons

You can generate all required icon sizes from a single source image using tools like:

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)

### Using PWA Asset Generator (Recommended)

\`\`\`bash
npx pwa-asset-generator source-logo.svg ./public/icons --manifest ./public/manifest.json
\`\`\`

### Manual Creation

If creating manually, ensure each icon:
1. Is optimized for web (use tools like ImageOptim or TinyPNG)
2. Has proper dimensions (no stretching or distortion)
3. Follows the naming convention: icon-{width}x{height}.png

## Current Status

The icons in this directory are placeholders. Replace them with your actual brand icons before deploying to production.

For best results:
1. Create a high-resolution source image (at least 1024x1024px)
2. Use a tool to generate all sizes automatically
3. Test on multiple devices to ensure proper display
