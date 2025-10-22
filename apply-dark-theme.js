#!/usr/bin/env node

/**
 * Dark Theme Application Script
 * Applies dark theme design system to all dashboard pages
 *
 * Design System:
 * - Blue #0077FF, Orange #FF8800-#FF6600
 * - Glass morphism: bg-slate-800/50 backdrop-blur-xl border border-slate-700/50
 * - Dark inputs, orange/blue buttons, Navy table headers
 */

const fs = require('fs');
const path = require('path');

// Files to process
const files = [
  'app/(dashboard)/payment-links/page.tsx',
  'app/(dashboard)/payment-links/[id]/page.tsx',
  'app/(dashboard)/payment-links/save-charges/page.tsx',
  'app/(dashboard)/payment-links/all-charges/page.tsx',
  'app/(dashboard)/payment-links/generate-bill/page.tsx',
  'app/(dashboard)/payment-links/analytics/page.tsx',
  'app/(dashboard)/payment-links/templates/page.tsx',
  'app/(dashboard)/payment-links/create/page.tsx',
  'app/(dashboard)/chargebacks/page.tsx',
  'app/(dashboard)/chargebacks/[id]/page.tsx',
  'app/(dashboard)/chargebacks/workflow/page.tsx',
  'app/(dashboard)/chargebacks/analytics/page.tsx',
  'app/(dashboard)/settlements/page.tsx',
  'app/(dashboard)/settlements/disbursement/page.tsx',
  'app/(dashboard)/clients/page.tsx',
  'app/(dashboard)/clients/[id]/page.tsx',
  'app/(dashboard)/clients/merchants/page.tsx',
  'app/(dashboard)/clients/merchants/[id]/page.tsx',
  'app/(dashboard)/clients/merchants/[id]/documents/page.tsx',
  'app/(dashboard)/clients/approvals/page.tsx',
  'app/(dashboard)/clients/onboard/page.tsx',
  'app/(dashboard)/qr-codes/page.tsx',
  'app/(dashboard)/import/page.tsx',
  'app/(dashboard)/export/page.tsx',
  'app/(dashboard)/export/scheduled/page.tsx',
  'app/(dashboard)/tools/migration/page.tsx',
];

// Color transformations
const transformations = [
  // Remove container padding (layout provides it)
  { from: /className="container mx-auto px-4 py-6 space-y-6"/g, to: 'className="space-y-6"' },
  { from: /className="container mx-auto px-4 py-6 max-w-\w+"/g, to: (match) => match.replace('container mx-auto px-4 py-6 ', '') },
  { from: /className="container mx-auto px-4 py-6"/g, to: 'className="space-y-6"' },

  // Page headers - Dark theme
  { from: /text-3xl font-bold text-gray-900/g, to: 'text-3xl font-bold text-white' },
  { from: /text-2xl font-bold text-gray-900/g, to: 'text-2xl font-bold text-white' },
  { from: /text-xl font-bold text-gray-900/g, to: 'text-xl font-bold text-white' },
  { from: /text-lg font-bold text-gray-900/g, to: 'text-lg font-bold text-white' },
  { from: /text-lg font-semibold text-gray-900/g, to: 'text-lg font-semibold text-white' },

  // Text colors - Gray to Slate
  { from: /text-gray-900(?!\/)/g, to: 'text-slate-200' },
  { from: /text-gray-800/g, to: 'text-slate-300' },
  { from: /text-gray-700/g, to: 'text-slate-400' },
  { from: /text-gray-600/g, to: 'text-slate-400' },
  { from: /text-gray-500/g, to: 'text-slate-500' },
  { from: /text-gray-400/g, to: 'text-slate-500' },

  // Card backgrounds - Glass morphism
  { from: /className="p-6">/g, to: 'className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">' },
  { from: /className="p-4">/g, to: 'className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">' },
  { from: /<Card className="p-6 space-y-6">/g, to: '<Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 space-y-6 hover:shadow-orange-500/5 transition-shadow duration-300">' },
  { from: /<Card className="p-6 space-y-4">/g, to: '<Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 space-y-4 hover:shadow-orange-500/5 transition-shadow duration-300">' },
  { from: /<Card className="p-4 space-y-4">/g, to: '<Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-4 space-y-4 hover:shadow-orange-500/5 transition-shadow duration-300">' },

  // Borders
  { from: /border-gray-200/g, to: 'border-slate-700/50' },
  { from: /border-gray-300/g, to: 'border-slate-600/50' },
  { from: /border-b border-gray-200/g, to: 'border-b border-slate-700/50' },

  // Backgrounds
  { from: /bg-gray-50(?!\/)/g, to: 'bg-slate-900/60' },
  { from: /bg-gray-100(?!\/)/g, to: 'bg-slate-800/40' },
  { from: /bg-gray-200/g, to: 'bg-slate-700/30' },

  // Hover states
  { from: /hover:bg-gray-50/g, to: 'hover:bg-slate-700/30' },
  { from: /hover:bg-gray-100/g, to: 'hover:bg-slate-700/50' },

  // Table headers - Navy gradient
  { from: /<TableHeader>/g, to: '<TableHeader className="bg-gradient-to-r from-[#003366] to-[#002347]">' },
  { from: /<TableHead>/g, to: '<TableHead className="text-white">' },
  { from: /<TableHead className="/g, to: '<TableHead className="text-white ' },
  { from: /<TableRow className="hover:bg-gray-50/g, to: '<TableRow className="hover:bg-slate-700/30' },

  // Labels and small text
  { from: /text-sm text-gray-600/g, to: 'text-sm text-slate-400' },
  { from: /text-xs text-gray-600/g, to: 'text-xs text-slate-500' },
  { from: /text-xs text-gray-500/g, to: 'text-xs text-slate-600' },

  // Status badges
  { from: /bg-blue-100 text-blue-700/g, to: 'bg-[#0077FF]/20 text-[#0077FF] border border-[#0077FF]/40' },
  { from: /bg-green-100 text-green-700/g, to: 'bg-green-500/20 text-green-400 border border-green-500/40' },
  { from: /bg-yellow-100 text-yellow-700/g, to: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' },
  { from: /bg-red-100 text-red-700/g, to: 'bg-red-500/20 text-red-400 border border-red-500/40' },
  { from: /bg-amber-100 text-amber-700/g, to: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },

  // Input fields
  { from: /placeholder-gray-400/g, to: 'placeholder-slate-500' },

  // Stat card color variations
  { from: /border-green-200 bg-green-50/g, to: 'border-green-500/30 bg-green-500/10' },
  { from: /border-blue-200 bg-blue-50/g, to: 'border-[#0077FF]/30 bg-[#0077FF]/10' },
  { from: /border-amber-200 bg-amber-50/g, to: 'border-amber-500/30 bg-amber-500/10' },
  { from: /border-yellow-200 bg-yellow-50/g, to: 'border-yellow-500/30 bg-yellow-500/10' },
  { from: /border-red-200 bg-red-50/g, to: 'border-red-500/30 bg-red-500/10' },
];

let processedCount = 0;
let errorCount = 0;

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    errorCount++;
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Apply all transformations
    transformations.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });

    // Only write if content changed
    if (content !== originalContent) {
      // Create backup
      fs.writeFileSync(`${fullPath}.backup`, originalContent);

      // Write transformed content
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Processed: ${filePath}`);
      processedCount++;
    } else {
      console.log(`⏭️  No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n🎨 Dark Theme Application Complete!`);
console.log(`✅ Successfully processed: ${processedCount} files`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📦 Backups created with .backup extension`);
console.log(`\nTo restore backups:`);
console.log(`  find app/(dashboard) -name '*.backup' -type f -exec sh -c 'mv "$0" "$\{0%.backup\}"' {} \\;`);
