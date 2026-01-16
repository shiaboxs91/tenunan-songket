/**
 * Audit Frontend Database Usage
 * Memeriksa apakah komponen frontend menggunakan data dari database atau masih dummy/hardcoded
 */

const fs = require('fs');
const path = require('path');

const results = {
  usingDatabase: [],
  usingDummy: [],
  mixed: [],
  needsReview: []
};

// Pattern untuk mendeteksi penggunaan database
const databasePatterns = [
  /from ['"]@\/lib\/supabase/,
  /createClient\(/,
  /supabase\./,
  /getProducts\(/,
  /getCategories\(/,
  /getOrders\(/,
  /useCart\(/,
  /useRealtime/
];

// Pattern untuk mendeteksi data dummy/hardcoded
const dummyPatterns = [
  /const\s+\w+\s*=\s*\[[\s\S]*?\{[\s\S]*?name:/,
  /products\.snapshot\.json/,
  /category-images\.json/,
  /DUMMY|MOCK|PLACEHOLDER/i,
  /hardcoded/i
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '');
  
  const hasDatabase = databasePatterns.some(pattern => pattern.test(content));
  const hasDummy = dummyPatterns.some(pattern => pattern.test(content));
  
  const fileInfo = {
    path: relativePath,
    hasDatabase,
    hasDummy,
    lines: content.split('\n').length
  };
  
  // Cari contoh spesifik
  const examples = [];
  
  // Cek import dari supabase
  const supabaseImports = content.match(/import.*from ['"]@\/lib\/supabase['"]/g);
  if (supabaseImports) {
    examples.push(`✓ Supabase imports: ${supabaseImports.length}`);
  }
  
  // Cek hardcoded arrays
  const hardcodedArrays = content.match(/const\s+\w+\s*=\s*\[\s*\{/g);
  if (hardcodedArrays) {
    examples.push(`⚠ Hardcoded arrays: ${hardcodedArrays.length}`);
  }
  
  // Cek penggunaan snapshot files
  if (content.includes('products.snapshot.json')) {
    examples.push('⚠ Uses products.snapshot.json');
  }
  if (content.includes('category-images.json')) {
    examples.push('⚠ Uses category-images.json');
  }
  
  fileInfo.examples = examples;
  
  if (hasDatabase && hasDummy) {
    results.mixed.push(fileInfo);
  } else if (hasDatabase) {
    results.usingDatabase.push(fileInfo);
  } else if (hasDummy) {
    results.usingDummy.push(fileInfo);
  } else {
    results.needsReview.push(fileInfo);
  }
}

function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, dll
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath, extensions);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      scanFile(filePath);
    }
  }
}

// Scan directories
console.log('🔍 Scanning frontend files...\n');

scanDirectory(path.join(process.cwd(), 'src/app'));
scanDirectory(path.join(process.cwd(), 'src/components'));
scanDirectory(path.join(process.cwd(), 'src/lib'));
scanDirectory(path.join(process.cwd(), 'src/hooks'));

// Generate report
console.log('📊 AUDIT REPORT: Frontend Database Usage\n');
console.log('='.repeat(80));

console.log('\n✅ FILES USING DATABASE (' + results.usingDatabase.length + ')');
console.log('-'.repeat(80));
results.usingDatabase.forEach(file => {
  console.log(`\n${file.path}`);
  if (file.examples.length > 0) {
    file.examples.forEach(ex => console.log(`  ${ex}`));
  }
});

console.log('\n\n⚠️  FILES USING DUMMY/HARDCODED DATA (' + results.usingDummy.length + ')');
console.log('-'.repeat(80));
results.usingDummy.forEach(file => {
  console.log(`\n${file.path}`);
  if (file.examples.length > 0) {
    file.examples.forEach(ex => console.log(`  ${ex}`));
  }
});

console.log('\n\n🔀 FILES WITH MIXED USAGE (' + results.mixed.length + ')');
console.log('-'.repeat(80));
results.mixed.forEach(file => {
  console.log(`\n${file.path}`);
  if (file.examples.length > 0) {
    file.examples.forEach(ex => console.log(`  ${ex}`));
  }
});

console.log('\n\n❓ FILES NEEDING REVIEW (' + results.needsReview.length + ')');
console.log('-'.repeat(80));
results.needsReview.forEach(file => {
  console.log(`\n${file.path} (${file.lines} lines)`);
});

// Summary
console.log('\n\n📈 SUMMARY');
console.log('='.repeat(80));
console.log(`Total files scanned: ${results.usingDatabase.length + results.usingDummy.length + results.mixed.length + results.needsReview.length}`);
console.log(`✅ Using database: ${results.usingDatabase.length}`);
console.log(`⚠️  Using dummy data: ${results.usingDummy.length}`);
console.log(`🔀 Mixed usage: ${results.mixed.length}`);
console.log(`❓ Needs review: ${results.needsReview.length}`);

const percentageDatabase = Math.round(
  (results.usingDatabase.length / 
  (results.usingDatabase.length + results.usingDummy.length + results.mixed.length)) * 100
);

console.log(`\n📊 Database adoption: ${percentageDatabase}%`);

// Save detailed report
const detailedReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: results.usingDatabase.length + results.usingDummy.length + results.mixed.length + results.needsReview.length,
    usingDatabase: results.usingDatabase.length,
    usingDummy: results.usingDummy.length,
    mixed: results.mixed.length,
    needsReview: results.needsReview.length,
    databaseAdoption: percentageDatabase
  },
  details: results
};

fs.writeFileSync(
  'audit-frontend-database-report.json',
  JSON.stringify(detailedReport, null, 2)
);

console.log('\n💾 Detailed report saved to: audit-frontend-database-report.json');

// Priority actions
console.log('\n\n🎯 PRIORITY ACTIONS');
console.log('='.repeat(80));

if (results.usingDummy.length > 0) {
  console.log('\n1. Replace dummy data in these files:');
  results.usingDummy.slice(0, 5).forEach(file => {
    console.log(`   - ${file.path}`);
  });
  if (results.usingDummy.length > 5) {
    console.log(`   ... and ${results.usingDummy.length - 5} more`);
  }
}

if (results.mixed.length > 0) {
  console.log('\n2. Remove dummy data from mixed files:');
  results.mixed.slice(0, 5).forEach(file => {
    console.log(`   - ${file.path}`);
  });
  if (results.mixed.length > 5) {
    console.log(`   ... and ${results.mixed.length - 5} more`);
  }
}

console.log('\n');
