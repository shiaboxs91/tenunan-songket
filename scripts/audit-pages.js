#!/usr/bin/env node

/**
 * Script Audit Halaman - TenunanSongket Store
 * 
 * Mengecek:
 * - Performa halaman (Lighthouse metrics)
 * - SEO (meta tags, headings, accessibility)
 * - Error halaman (console errors, broken links)
 * 
 * Jalankan: node scripts/audit-pages.js
 * Pastikan dev server berjalan: npm run dev
 */

const http = require('http');
const https = require('https');

// Konfigurasi
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/products', name: 'Products Listing' },
  { path: '/products/songket-palembang-merah', name: 'Product Detail (sample)' },
  { path: '/cart', name: 'Cart' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/account', name: 'Account' },
];

// Warna untuk output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

// Fetch halaman
async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now() - startTime,
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}


// Analisis SEO
function analyzeSEO(html, pageName) {
  const issues = [];
  const warnings = [];
  const passed = [];

  // Check title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!titleMatch) {
    issues.push('❌ Missing <title> tag');
  } else if (titleMatch[1].length < 30) {
    warnings.push(`⚠️ Title too short (${titleMatch[1].length} chars): "${titleMatch[1]}"`);
  } else if (titleMatch[1].length > 60) {
    warnings.push(`⚠️ Title too long (${titleMatch[1].length} chars)`);
  } else {
    passed.push(`✅ Title OK: "${titleMatch[1].substring(0, 50)}..."`);
  }

  // Check meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (!descMatch) {
    issues.push('❌ Missing meta description');
  } else if (descMatch[1].length < 120) {
    warnings.push(`⚠️ Meta description too short (${descMatch[1].length} chars)`);
  } else if (descMatch[1].length > 160) {
    warnings.push(`⚠️ Meta description too long (${descMatch[1].length} chars)`);
  } else {
    passed.push('✅ Meta description OK');
  }

  // Check viewport
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["']/i);
  if (!viewportMatch) {
    issues.push('❌ Missing viewport meta tag');
  } else {
    passed.push('✅ Viewport meta tag present');
  }

  // Check H1
  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  if (h1Matches.length === 0) {
    warnings.push('⚠️ No H1 tag found');
  } else if (h1Matches.length > 1) {
    warnings.push(`⚠️ Multiple H1 tags found (${h1Matches.length})`);
  } else {
    passed.push('✅ Single H1 tag present');
  }

  // Check images alt
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imgWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length;
  if (imgWithoutAlt > 0) {
    warnings.push(`⚠️ ${imgWithoutAlt} images without alt attribute`);
  } else if (imgMatches.length > 0) {
    passed.push(`✅ All ${imgMatches.length} images have alt attributes`);
  }

  // Check canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["']/i);
  if (!canonicalMatch) {
    warnings.push('⚠️ Missing canonical link');
  } else {
    passed.push('✅ Canonical link present');
  }

  // Check Open Graph
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["']/i);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["']/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["']/i);
  
  if (!ogTitle || !ogDesc || !ogImage) {
    warnings.push('⚠️ Incomplete Open Graph tags');
  } else {
    passed.push('✅ Open Graph tags present');
  }

  // Check lang attribute
  const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
  if (!langMatch) {
    warnings.push('⚠️ Missing lang attribute on <html>');
  } else {
    passed.push(`✅ Language set: ${langMatch[1]}`);
  }

  return { issues, warnings, passed };
}


// Analisis Performa
function analyzePerformance(response, html) {
  const metrics = {
    responseTime: response.responseTime,
    htmlSize: Buffer.byteLength(html, 'utf8'),
    issues: [],
    warnings: [],
    passed: [],
  };

  // Response time
  if (response.responseTime > 3000) {
    metrics.issues.push(`❌ Very slow response: ${response.responseTime}ms`);
  } else if (response.responseTime > 1000) {
    metrics.warnings.push(`⚠️ Slow response: ${response.responseTime}ms`);
  } else {
    metrics.passed.push(`✅ Fast response: ${response.responseTime}ms`);
  }

  // HTML size
  const sizeKB = (metrics.htmlSize / 1024).toFixed(2);
  if (metrics.htmlSize > 500000) {
    metrics.issues.push(`❌ HTML too large: ${sizeKB}KB`);
  } else if (metrics.htmlSize > 200000) {
    metrics.warnings.push(`⚠️ Large HTML: ${sizeKB}KB`);
  } else {
    metrics.passed.push(`✅ HTML size OK: ${sizeKB}KB`);
  }

  // Check for render-blocking resources
  const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
  const inlineScripts = (html.match(/<script[^>]*>[^<]+<\/script>/gi) || []).length;
  
  if (inlineScripts > 5) {
    metrics.warnings.push(`⚠️ Many inline scripts: ${inlineScripts}`);
  }

  // Check compression header
  if (response.headers['content-encoding']) {
    metrics.passed.push(`✅ Compression: ${response.headers['content-encoding']}`);
  } else {
    metrics.warnings.push('⚠️ No compression detected');
  }

  // Check caching headers
  if (response.headers['cache-control']) {
    metrics.passed.push('✅ Cache-Control header present');
  } else {
    metrics.warnings.push('⚠️ No Cache-Control header');
  }

  return metrics;
}

// Analisis Error
function analyzeErrors(html, statusCode) {
  const errors = [];
  const warnings = [];

  // HTTP Status
  if (statusCode >= 500) {
    errors.push(`❌ Server Error: HTTP ${statusCode}`);
  } else if (statusCode >= 400) {
    errors.push(`❌ Client Error: HTTP ${statusCode}`);
  } else if (statusCode >= 300 && statusCode < 400) {
    warnings.push(`⚠️ Redirect: HTTP ${statusCode}`);
  }

  // Check for error messages in HTML
  const errorPatterns = [
    /error/i,
    /exception/i,
    /failed to/i,
    /cannot read/i,
    /undefined/i,
    /null/i,
  ];

  // Check for Next.js error page indicators
  if (html.includes('Application error') || html.includes('__NEXT_DATA__') && html.includes('"err"')) {
    errors.push('❌ Next.js application error detected');
  }

  // Check for broken image references
  const brokenImgPatterns = html.match(/src=["'][^"']*undefined[^"']*["']/gi) || [];
  if (brokenImgPatterns.length > 0) {
    errors.push(`❌ ${brokenImgPatterns.length} potentially broken image sources`);
  }

  // Check for empty links
  const emptyLinks = (html.match(/href=["']\s*["']/gi) || []).length;
  if (emptyLinks > 0) {
    warnings.push(`⚠️ ${emptyLinks} empty href attributes`);
  }

  // Check for console.log in production
  if (html.includes('console.log')) {
    warnings.push('⚠️ console.log found in HTML (check for debug code)');
  }

  return { errors, warnings };
}


// Analisis Accessibility
function analyzeAccessibility(html) {
  const issues = [];
  const warnings = [];
  const passed = [];

  // Check for skip link
  if (html.includes('skip') && html.includes('main')) {
    passed.push('✅ Skip to main content link likely present');
  } else {
    warnings.push('⚠️ No skip link detected');
  }

  // Check for ARIA landmarks
  const hasMain = html.includes('role="main"') || html.includes('<main');
  const hasNav = html.includes('role="navigation"') || html.includes('<nav');
  
  if (hasMain) {
    passed.push('✅ Main landmark present');
  } else {
    warnings.push('⚠️ No main landmark');
  }

  if (hasNav) {
    passed.push('✅ Navigation landmark present');
  } else {
    warnings.push('⚠️ No navigation landmark');
  }

  // Check for form labels
  const inputs = (html.match(/<input[^>]*>/gi) || []);
  const inputsWithoutLabel = inputs.filter(input => 
    !input.includes('aria-label') && 
    !input.includes('aria-labelledby') &&
    !input.includes('type="hidden"') &&
    !input.includes('type="submit"')
  ).length;

  if (inputsWithoutLabel > 0) {
    warnings.push(`⚠️ ${inputsWithoutLabel} inputs may lack proper labels`);
  }

  // Check for button accessibility
  const buttons = (html.match(/<button[^>]*>/gi) || []);
  const emptyButtons = buttons.filter(btn => 
    !btn.includes('aria-label') && 
    btn.match(/<button[^>]*>\s*</)
  ).length;

  if (emptyButtons > 0) {
    warnings.push(`⚠️ ${emptyButtons} buttons may lack accessible text`);
  }

  // Check color contrast (basic check for text colors)
  if (html.includes('text-gray-300') || html.includes('text-gray-400')) {
    warnings.push('⚠️ Light gray text detected - verify contrast ratio');
  }

  return { issues, warnings, passed };
}

// Main audit function
async function auditPage(page) {
  const url = `${BASE_URL}${page.path}`;
  
  log(`\n📄 ${page.name}`, 'cyan');
  log(`   URL: ${url}`, 'blue');
  
  try {
    const response = await fetchPage(url);
    
    if (response.statusCode !== 200) {
      log(`   ❌ HTTP Status: ${response.statusCode}`, 'red');
      return {
        page: page.name,
        url,
        status: 'error',
        statusCode: response.statusCode,
      };
    }

    log(`   ✅ HTTP Status: ${response.statusCode}`, 'green');

    const seo = analyzeSEO(response.body, page.name);
    const perf = analyzePerformance(response, response.body);
    const errors = analyzeErrors(response.body, response.statusCode);
    const a11y = analyzeAccessibility(response.body);

    // Print results
    console.log('\n   📊 Performance:');
    perf.passed.forEach(p => log(`      ${p}`, 'green'));
    perf.warnings.forEach(w => log(`      ${w}`, 'yellow'));
    perf.issues.forEach(i => log(`      ${i}`, 'red'));

    console.log('\n   🔍 SEO:');
    seo.passed.forEach(p => log(`      ${p}`, 'green'));
    seo.warnings.forEach(w => log(`      ${w}`, 'yellow'));
    seo.issues.forEach(i => log(`      ${i}`, 'red'));

    console.log('\n   ♿ Accessibility:');
    a11y.passed.forEach(p => log(`      ${p}`, 'green'));
    a11y.warnings.forEach(w => log(`      ${w}`, 'yellow'));
    a11y.issues.forEach(i => log(`      ${i}`, 'red'));

    if (errors.errors.length > 0 || errors.warnings.length > 0) {
      console.log('\n   🐛 Errors:');
      errors.errors.forEach(e => log(`      ${e}`, 'red'));
      errors.warnings.forEach(w => log(`      ${w}`, 'yellow'));
    }

    return {
      page: page.name,
      url,
      status: 'ok',
      statusCode: response.statusCode,
      responseTime: response.responseTime,
      seo: { issues: seo.issues.length, warnings: seo.warnings.length },
      perf: { issues: perf.issues.length, warnings: perf.warnings.length },
      a11y: { issues: a11y.issues.length, warnings: a11y.warnings.length },
      errors: { issues: errors.errors.length, warnings: errors.warnings.length },
    };

  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return {
      page: page.name,
      url,
      status: 'failed',
      error: error.message,
    };
  }
}


// Generate summary report
function generateSummary(results) {
  logSection('📋 RINGKASAN AUDIT');

  const successful = results.filter(r => r.status === 'ok');
  const failed = results.filter(r => r.status !== 'ok');

  log(`\nTotal halaman: ${results.length}`, 'bold');
  log(`✅ Berhasil: ${successful.length}`, 'green');
  if (failed.length > 0) {
    log(`❌ Gagal: ${failed.length}`, 'red');
  }

  // Performance summary
  if (successful.length > 0) {
    const avgResponseTime = successful.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful.length;
    console.log(`\n⚡ Rata-rata response time: ${avgResponseTime.toFixed(0)}ms`);
  }

  // Issues summary
  const totalSEOIssues = successful.reduce((sum, r) => sum + (r.seo?.issues || 0), 0);
  const totalSEOWarnings = successful.reduce((sum, r) => sum + (r.seo?.warnings || 0), 0);
  const totalPerfIssues = successful.reduce((sum, r) => sum + (r.perf?.issues || 0), 0);
  const totalA11yIssues = successful.reduce((sum, r) => sum + (r.a11y?.issues || 0), 0);
  const totalErrors = successful.reduce((sum, r) => sum + (r.errors?.issues || 0), 0);

  console.log('\n📊 Total Issues:');
  console.log(`   SEO: ${totalSEOIssues} issues, ${totalSEOWarnings} warnings`);
  console.log(`   Performance: ${totalPerfIssues} issues`);
  console.log(`   Accessibility: ${totalA11yIssues} issues`);
  console.log(`   Errors: ${totalErrors} issues`);

  // Failed pages
  if (failed.length > 0) {
    console.log('\n❌ Halaman Gagal:');
    failed.forEach(f => {
      log(`   - ${f.page}: ${f.error || `HTTP ${f.statusCode}`}`, 'red');
    });
  }

  // Score calculation
  const maxScore = results.length * 4; // 4 categories
  const deductions = totalSEOIssues * 2 + totalPerfIssues * 2 + totalA11yIssues + totalErrors * 3 + failed.length * 4;
  const score = Math.max(0, Math.round(((maxScore - deductions) / maxScore) * 100));

  console.log('\n' + '─'.repeat(40));
  if (score >= 80) {
    log(`🏆 SKOR KESELURUHAN: ${score}/100`, 'green');
  } else if (score >= 60) {
    log(`📊 SKOR KESELURUHAN: ${score}/100`, 'yellow');
  } else {
    log(`⚠️ SKOR KESELURUHAN: ${score}/100`, 'red');
  }
  console.log('─'.repeat(40));
}

// Main execution
async function main() {
  logSection('🔍 AUDIT HALAMAN - TenunanSongket Store');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Waktu: ${new Date().toLocaleString('id-ID')}`, 'blue');

  console.log('\nMengecek koneksi ke server...');
  
  try {
    await fetchPage(BASE_URL);
    log('✅ Server dapat diakses\n', 'green');
  } catch (error) {
    log('❌ Server tidak dapat diakses!', 'red');
    log(`   Pastikan dev server berjalan: npm run dev`, 'yellow');
    log(`   Error: ${error.message}`, 'red');
    process.exit(1);
  }

  const results = [];
  
  for (const page of PAGES) {
    const result = await auditPage(page);
    results.push(result);
  }

  generateSummary(results);

  // Save report to file
  const reportPath = 'audit-report.json';
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
  };
  
  require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📁 Report disimpan ke: ${reportPath}`, 'cyan');
}

main().catch(console.error);
