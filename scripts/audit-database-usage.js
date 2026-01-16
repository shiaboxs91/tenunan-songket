/**
 * Audit script to check if frontend pages are using database data instead of dummy/demo data
 * 
 * This script searches for:
 * 1. Import statements from Supabase services
 * 2. Usage of dummy/demo data
 * 3. Hardcoded data arrays
 * 4. Mock data imports
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Patterns to check
const patterns = {
  supabaseImports: [
    /from ['"]@\/lib\/supabase\/products['"]/,
    /from ['"]@\/lib\/supabase\/categories['"]/,
    /from ['"]@\/lib\/supabase\/orders['"]/,
    /from ['"]@\/lib\/supabase\/cart['"]/,
    /from ['"]@\/lib\/supabase\/reviews['"]/,
    /from ['"]@\/lib\/supabase\/wishlist['"]/,
    /from ['"]@\/lib\/supabase\/auth['"]/,
    /from ['"]@\/lib\/supabase\/profiles['"]/,
    /from ['"]@\/lib\/supabase\/addresses['"]/,
    /from ['"]@\/lib\/supabase\/admin['"]/,
  ],
  dummyDataIndicators: [
    /const\s+\w+\s*=\s*\[[\s\S]*?\{[\s\S]*?id:\s*['"][\w-]+['"]/,  // Array of objects with id
    /MOCK_/i,
    /DUMMY_/i,
    /DEMO_/i,
    /fake\w+Data/i,
    /sample\w+Data/i,
  ],
  apiCalls: [
    /fetch\(['"`]\/api\//,
    /axios\./,
  ],
};

// Pages to audit
const pagesToAudit = [
  // Store pages
  'src/app/(store)/page.tsx',
  'src/app/(store)/products/page.tsx',
  'src/app/(store)/products/[slug]/page.tsx',
  'src/app/(store)/cart/page.tsx',
  'src/app/(store)/checkout/page.tsx',
  'src/app/(store)/account/page.tsx',
  'src/app/(store)/account/orders/page.tsx',
  'src/app/(store)/account/orders/[id]/page.tsx',
  'src/app/(store)/account/addresses/page.tsx',
  'src/app/(store)/account/wishlist/page.tsx',
  
  // Admin pages
  'src/app/admin/page.tsx',
  'src/app/admin/products/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/admin/orders/[id]/page.tsx',
  'src/app/admin/categories/page.tsx',
  'src/app/admin/coupons/page.tsx',
  'src/app/admin/users/page.tsx',
  
  // Components
  'src/components/cart/CartProvider.tsx',
  'src/components/product/ProductGrid.tsx',
  'src/components/product/ProductCard.tsx',
  'src/components/home/HeroSlider.tsx',
  'src/components/layout/Header.tsx',
];

// Results
const results = {
  total: 0,
  usingDatabase: 0,
  usingDummyData: 0,
  notFound: 0,
  details: [],
};

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    results.notFound++;
    results.details.push({
      file: filePath,
      status: 'not_found',
      message: 'File not found',
    });
    return;
  }

  results.total++;
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  // Check for Supabase imports
  const hasSupabaseImports = patterns.supabaseImports.some(pattern => pattern.test(content));
  
  // Check for API calls
  const hasApiCalls = patterns.apiCalls.some(pattern => pattern.test(content));
  
  // Check for dummy data indicators
  const dummyDataMatches = patterns.dummyDataIndicators
    .map(pattern => {
      const matches = content.match(pattern);
      return matches ? matches[0].substring(0, 100) : null;
    })
    .filter(Boolean);
  
  const hasDummyData = dummyDataMatches.length > 0;
  
  // Determine status
  let status = 'unknown';
  let message = '';
  
  if (hasSupabaseImports || hasApiCalls) {
    status = 'using_database';
    results.usingDatabase++;
    message = hasSupabaseImports 
      ? '✓ Using Supabase services' 
      : '✓ Using API calls (likely database-backed)';
  } else if (hasDummyData) {
    status = 'using_dummy_data';
    results.usingDummyData++;
    message = `⚠ Potential dummy data found: ${dummyDataMatches.length} instances`;
  } else {
    status = 'no_data_source';
    message = '? No clear data source detected';
  }
  
  results.details.push({
    file: filePath,
    status,
    message,
    hasSupabaseImports,
    hasApiCalls,
    dummyDataCount: dummyDataMatches.length,
    dummyDataSamples: dummyDataMatches.slice(0, 2),
  });
}

// Run audit
console.log(`${colors.cyan}=== Frontend Database Usage Audit ===${colors.reset}\n`);

pagesToAudit.forEach(checkFile);

// Print results
console.log(`${colors.blue}Summary:${colors.reset}`);
console.log(`Total files checked: ${results.total}`);
console.log(`${colors.green}✓ Using database: ${results.usingDatabase}${colors.reset}`);
console.log(`${colors.yellow}⚠ Using dummy data: ${results.usingDummyData}${colors.reset}`);
console.log(`${colors.red}✗ Not found: ${results.notFound}${colors.reset}\n`);

// Print details
console.log(`${colors.blue}Details:${colors.reset}\n`);

results.details.forEach(detail => {
  let color = colors.reset;
  let icon = '?';
  
  if (detail.status === 'using_database') {
    color = colors.green;
    icon = '✓';
  } else if (detail.status === 'using_dummy_data') {
    color = colors.yellow;
    icon = '⚠';
  } else if (detail.status === 'not_found') {
    color = colors.red;
    icon = '✗';
  }
  
  console.log(`${color}${icon} ${detail.file}${colors.reset}`);
  console.log(`  ${detail.message}`);
  
  if (detail.dummyDataSamples && detail.dummyDataSamples.length > 0) {
    console.log(`  Samples:`);
    detail.dummyDataSamples.forEach(sample => {
      console.log(`    - ${sample}...`);
    });
  }
  
  console.log('');
});

// Calculate percentage
const percentage = results.total > 0 
  ? Math.round((results.usingDatabase / results.total) * 100) 
  : 0;

console.log(`${colors.cyan}=== Audit Complete ===${colors.reset}`);
console.log(`Database usage: ${percentage}% of checked files\n`);

// Exit with appropriate code
if (results.usingDummyData > 0) {
  console.log(`${colors.yellow}⚠ Warning: Some files may still be using dummy data${colors.reset}`);
  process.exit(0); // Don't fail, just warn
} else if (percentage >= 80) {
  console.log(`${colors.green}✓ Good! Most files are using database data${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.yellow}⚠ Some files need review${colors.reset}`);
  process.exit(0);
}
