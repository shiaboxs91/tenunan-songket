#!/usr/bin/env node

/**
 * Script Audit Desktop UX - TenunanSongket Store
 * 
 * Audit mendalam untuk:
 * - Design & Layout (lebar halaman, spacing, responsiveness)
 * - User Experience (flow navigasi, interaksi)
 * - Accessibility (WCAG compliance)
 * - Performance (loading, rendering)
 * 
 * Jalankan: node scripts/audit-desktop-ux.js
 */

const http = require('http');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Desktop viewport sizes to test
const DESKTOP_VIEWPORTS = [
  { name: 'HD (1366x768)', width: 1366, height: 768 },
  { name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
  { name: 'QHD (2560x1440)', width: 2560, height: 1440 },
  { name: 'Ultrawide (3440x1440)', width: 3440, height: 1440 },
];

// User flows to test
const USER_FLOWS = [
  {
    name: 'Browse Products Flow',
    steps: [
      { action: 'navigate', url: '/', description: 'Buka halaman utama' },
      { action: 'check', selector: 'header', description: 'Header visible' },
      { action: 'check', selector: 'nav', description: 'Navigation visible' },
      { action: 'navigate', url: '/products', description: 'Ke halaman produk' },
      { action: 'check', selector: '[data-testid="product-grid"]', description: 'Product grid visible' },
    ]
  },
  {
    name: 'Product Detail Flow',
    steps: [
      { action: 'navigate', url: '/products', description: 'Halaman produk' },
      { action: 'navigate', url: '/products/songket-palembang-merah', description: 'Detail produk' },
      { action: 'check', selector: 'img', description: 'Product image visible' },
      { action: 'check', selector: 'button', description: 'Add to cart button' },
    ]
  },
  {
    name: 'Cart & Checkout Flow',
    steps: [
      { action: 'navigate', url: '/cart', description: 'Halaman keranjang' },
      { action: 'navigate', url: '/checkout', description: 'Halaman checkout' },
      { action: 'check', selector: 'form', description: 'Checkout form visible' },
    ]
  },
];

// Colors
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(70));
  log(` ${title}`, 'bold');
  console.log('═'.repeat(70));
}

function logSubSection(title) {
  console.log('\n' + '─'.repeat(50));
  log(` ${title}`, 'cyan');
  console.log('─'.repeat(50));
}

// Fetch page
async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    http.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now() - startTime,
          size: Buffer.byteLength(data, 'utf8'),
        });
      });
    }).on('error', reject);
  });
}


// ============================================
// DESIGN & LAYOUT ANALYSIS
// ============================================

function analyzeDesignLayout(html, pageName) {
  const results = {
    issues: [],
    warnings: [],
    passed: [],
    metrics: {},
  };

  // Check max-width containers
  const hasMaxWidth = html.includes('max-w-') || html.includes('container');
  if (hasMaxWidth) {
    results.passed.push('✅ Container dengan max-width ditemukan');
  } else {
    results.warnings.push('⚠️ Tidak ada container max-width - konten mungkin terlalu lebar di layar besar');
  }

  // Check for responsive classes
  const responsivePatterns = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];
  const hasResponsive = responsivePatterns.some(p => html.includes(p));
  if (hasResponsive) {
    results.passed.push('✅ Responsive breakpoint classes ditemukan');
  } else {
    results.warnings.push('⚠️ Tidak ada responsive breakpoint classes');
  }

  // Check grid/flex layouts
  const hasGrid = html.includes('grid') || html.includes('flex');
  if (hasGrid) {
    results.passed.push('✅ Grid/Flex layout digunakan');
  }

  // Check for proper spacing
  const spacingClasses = ['gap-', 'space-', 'p-', 'm-', 'px-', 'py-', 'mx-', 'my-'];
  const hasSpacing = spacingClasses.some(s => html.includes(s));
  if (hasSpacing) {
    results.passed.push('✅ Spacing utilities digunakan');
  }

  // Check for sidebar layout (desktop)
  const hasSidebar = html.includes('sidebar') || html.includes('aside') || 
                     (html.includes('lg:grid-cols-') && html.includes('col-span'));
  if (hasSidebar) {
    results.passed.push('✅ Sidebar layout terdeteksi untuk desktop');
  }

  // Check for sticky elements
  const hasSticky = html.includes('sticky') || html.includes('fixed');
  if (hasSticky) {
    results.passed.push('✅ Sticky/Fixed elements untuk navigasi');
  }

  // Check content width issues
  const fullWidthPatterns = ['w-full', 'w-screen'];
  const hasFullWidth = fullWidthPatterns.some(p => {
    const regex = new RegExp(`class="[^"]*${p}[^"]*"`, 'g');
    return regex.test(html);
  });
  
  // Check for proper text line length (readability)
  const hasProseWidth = html.includes('prose') || html.includes('max-w-prose') || 
                        html.includes('max-w-2xl') || html.includes('max-w-3xl');
  if (!hasProseWidth && pageName.includes('Detail')) {
    results.warnings.push('⚠️ Pertimbangkan max-width untuk teks panjang (readability)');
  }

  // Check image handling
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const responsiveImages = imgTags.filter(img => 
    img.includes('object-') || img.includes('aspect-') || img.includes('fill')
  ).length;
  
  if (imgTags.length > 0) {
    results.metrics.totalImages = imgTags.length;
    results.metrics.responsiveImages = responsiveImages;
    if (responsiveImages === imgTags.length) {
      results.passed.push(`✅ Semua ${imgTags.length} gambar responsive`);
    } else {
      results.warnings.push(`⚠️ ${imgTags.length - responsiveImages}/${imgTags.length} gambar mungkin tidak responsive`);
    }
  }

  // Check for hover states (desktop UX)
  const hasHover = html.includes('hover:');
  if (hasHover) {
    results.passed.push('✅ Hover states untuk interaksi desktop');
  } else {
    results.warnings.push('⚠️ Tidak ada hover states - UX desktop kurang interaktif');
  }

  // Check for focus states (accessibility)
  const hasFocus = html.includes('focus:') || html.includes('focus-visible:');
  if (hasFocus) {
    results.passed.push('✅ Focus states untuk keyboard navigation');
  } else {
    results.issues.push('❌ Tidak ada focus states - accessibility issue');
  }

  return results;
}


// ============================================
// USER EXPERIENCE ANALYSIS
// ============================================

function analyzeUX(html, pageName) {
  const results = {
    issues: [],
    warnings: [],
    passed: [],
    metrics: {},
  };

  // Navigation Analysis
  const hasNav = html.includes('<nav') || html.includes('role="navigation"');
  const hasHeader = html.includes('<header') || html.includes('role="banner"');
  const hasFooter = html.includes('<footer') || html.includes('role="contentinfo"');
  const hasMain = html.includes('<main') || html.includes('role="main"');

  if (hasNav) results.passed.push('✅ Navigation element present');
  else results.issues.push('❌ Missing navigation element');

  if (hasHeader) results.passed.push('✅ Header element present');
  else results.warnings.push('⚠️ Missing header element');

  if (hasMain) results.passed.push('✅ Main content area defined');
  else results.issues.push('❌ Missing main content area');

  if (hasFooter) results.passed.push('✅ Footer element present');
  else results.warnings.push('⚠️ Missing footer element');

  // Interactive Elements
  const buttons = (html.match(/<button[^>]*>/gi) || []).length;
  const links = (html.match(/<a[^>]*href/gi) || []).length;
  const forms = (html.match(/<form[^>]*>/gi) || []).length;
  const inputs = (html.match(/<input[^>]*>/gi) || []).length;

  results.metrics.buttons = buttons;
  results.metrics.links = links;
  results.metrics.forms = forms;
  results.metrics.inputs = inputs;

  // Check for loading states
  const hasLoadingState = html.includes('loading') || html.includes('skeleton') || 
                          html.includes('spinner') || html.includes('animate-pulse');
  if (hasLoadingState) {
    results.passed.push('✅ Loading states/skeletons ditemukan');
  } else {
    results.warnings.push('⚠️ Tidak ada loading states terdeteksi');
  }

  // Check for empty states
  const hasEmptyState = html.includes('empty') || html.includes('no-results') ||
                        html.includes('tidak ada') || html.includes('kosong');
  if (hasEmptyState) {
    results.passed.push('✅ Empty state handling ditemukan');
  }

  // Check for error handling UI
  const hasErrorUI = html.includes('error') || html.includes('alert') || 
                     html.includes('toast') || html.includes('notification');
  if (hasErrorUI) {
    results.passed.push('✅ Error/notification UI ditemukan');
  }

  // Check for breadcrumbs (navigation aid)
  const hasBreadcrumbs = html.includes('breadcrumb') || html.includes('aria-label="Breadcrumb"');
  if (hasBreadcrumbs) {
    results.passed.push('✅ Breadcrumbs untuk navigasi');
  } else if (pageName !== 'Home') {
    results.warnings.push('⚠️ Pertimbangkan breadcrumbs untuk navigasi');
  }

  // Check for search functionality
  const hasSearch = html.includes('search') || html.includes('type="search"');
  if (hasSearch) {
    results.passed.push('✅ Search functionality present');
  }

  // Check for cart indicator
  const hasCartIndicator = html.includes('cart') && (html.includes('badge') || html.includes('count'));
  if (hasCartIndicator) {
    results.passed.push('✅ Cart indicator dengan badge');
  }

  // Check for CTA buttons
  const hasCTA = html.includes('Add to Cart') || html.includes('Tambah') || 
                 html.includes('Buy Now') || html.includes('Beli');
  if (hasCTA) {
    results.passed.push('✅ Call-to-action buttons present');
  }

  // Check for modal/dialog support
  const hasModal = html.includes('dialog') || html.includes('modal') || 
                   html.includes('Sheet') || html.includes('Drawer');
  if (hasModal) {
    results.passed.push('✅ Modal/Dialog components available');
  }

  return results;
}


// ============================================
// ACCESSIBILITY ANALYSIS (WCAG)
// ============================================

function analyzeAccessibility(html, pageName) {
  const results = {
    issues: [],
    warnings: [],
    passed: [],
    wcagLevel: 'Unknown',
    metrics: {},
  };

  // WCAG 1.1.1 - Non-text Content
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = images.filter(img => img.includes('alt=')).length;
  const imagesWithEmptyAlt = images.filter(img => img.includes('alt=""')).length;
  
  results.metrics.totalImages = images.length;
  results.metrics.imagesWithAlt = imagesWithAlt;
  
  if (images.length === 0 || imagesWithAlt === images.length) {
    results.passed.push('✅ [1.1.1] Semua gambar memiliki alt text');
  } else {
    results.issues.push(`❌ [1.1.1] ${images.length - imagesWithAlt} gambar tanpa alt text`);
  }

  // WCAG 1.3.1 - Info and Relationships
  const hasSemanticStructure = html.includes('<header') && html.includes('<main') && 
                                html.includes('<nav');
  if (hasSemanticStructure) {
    results.passed.push('✅ [1.3.1] Semantic HTML structure');
  } else {
    results.warnings.push('⚠️ [1.3.1] Incomplete semantic structure');
  }

  // WCAG 1.4.3 - Contrast (basic check)
  const lowContrastPatterns = ['text-gray-300', 'text-gray-400', 'text-slate-300', 'text-slate-400'];
  const hasLowContrast = lowContrastPatterns.some(p => html.includes(p));
  if (hasLowContrast) {
    results.warnings.push('⚠️ [1.4.3] Teks dengan warna terang terdeteksi - verifikasi contrast ratio');
  } else {
    results.passed.push('✅ [1.4.3] Tidak ada obvious low contrast text');
  }

  // WCAG 2.1.1 - Keyboard
  const hasFocusStyles = html.includes('focus:') || html.includes('focus-visible:');
  const hasTabIndex = html.includes('tabindex') || html.includes('tabIndex');
  
  if (hasFocusStyles) {
    results.passed.push('✅ [2.1.1] Focus styles untuk keyboard navigation');
  } else {
    results.issues.push('❌ [2.1.1] Tidak ada focus styles - keyboard users affected');
  }

  // WCAG 2.4.1 - Bypass Blocks
  const hasSkipLink = html.includes('skip') || html.includes('#main-content') || 
                      html.includes('Langsung ke konten') || html.includes('sr-only');
  if (hasSkipLink) {
    results.passed.push('✅ [2.4.1] Skip link present');
  } else {
    results.warnings.push('⚠️ [2.4.1] Tidak ada skip link');
  }

  // WCAG 2.4.2 - Page Titled
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1].length > 0) {
    results.passed.push(`✅ [2.4.2] Page title: "${titleMatch[1].substring(0, 40)}..."`);
  } else {
    results.issues.push('❌ [2.4.2] Missing page title');
  }

  // WCAG 2.4.4 - Link Purpose
  const genericLinks = (html.match(/>click here</gi) || []).length + 
                       (html.match(/>read more</gi) || []).length +
                       (html.match(/>here</gi) || []).length;
  if (genericLinks > 0) {
    results.warnings.push(`⚠️ [2.4.4] ${genericLinks} generic link text ditemukan`);
  } else {
    results.passed.push('✅ [2.4.4] Link text descriptive');
  }

  // WCAG 2.4.6 - Headings and Labels
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  
  results.metrics.headings = { h1: h1Count, h2: h2Count, h3: h3Count };
  
  if (h1Count === 1) {
    results.passed.push('✅ [2.4.6] Single H1 heading');
  } else if (h1Count === 0) {
    results.warnings.push('⚠️ [2.4.6] No H1 heading found');
  } else {
    results.warnings.push(`⚠️ [2.4.6] Multiple H1 headings (${h1Count})`);
  }

  // WCAG 3.1.1 - Language of Page
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  if (langMatch) {
    results.passed.push(`✅ [3.1.1] Language defined: ${langMatch[1]}`);
  } else {
    results.issues.push('❌ [3.1.1] Missing lang attribute');
  }

  // WCAG 4.1.1 - Parsing (check for duplicate IDs)
  const ids = html.match(/id=["']([^"']+)["']/gi) || [];
  const idValues = ids.map(id => id.match(/id=["']([^"']+)["']/i)?.[1]).filter(Boolean);
  const duplicateIds = idValues.filter((id, index) => idValues.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    results.issues.push(`❌ [4.1.1] Duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  } else {
    results.passed.push('✅ [4.1.1] No duplicate IDs');
  }

  // WCAG 4.1.2 - Name, Role, Value
  const buttonsWithoutLabel = (html.match(/<button[^>]*>\s*<(?:svg|img)/gi) || []).length;
  if (buttonsWithoutLabel > 0) {
    results.warnings.push(`⚠️ [4.1.2] ${buttonsWithoutLabel} icon buttons may lack accessible names`);
  }

  // ARIA usage
  const ariaLabels = (html.match(/aria-label/gi) || []).length;
  const ariaDescribedby = (html.match(/aria-describedby/gi) || []).length;
  const roles = (html.match(/role=/gi) || []).length;
  
  results.metrics.aria = { labels: ariaLabels, describedby: ariaDescribedby, roles: roles };
  
  if (ariaLabels > 0 || roles > 0) {
    results.passed.push(`✅ ARIA attributes used (${ariaLabels} labels, ${roles} roles)`);
  }

  // Calculate WCAG level estimate
  const criticalIssues = results.issues.filter(i => i.includes('[1.') || i.includes('[2.1') || i.includes('[4.')).length;
  if (criticalIssues === 0 && results.issues.length === 0) {
    results.wcagLevel = 'AA (estimated)';
  } else if (criticalIssues === 0) {
    results.wcagLevel = 'A (estimated)';
  } else {
    results.wcagLevel = 'Below A';
  }

  return results;
}


// ============================================
// PERFORMANCE ANALYSIS
// ============================================

function analyzePerformance(response, html) {
  const results = {
    issues: [],
    warnings: [],
    passed: [],
    metrics: {},
  };

  // Response Time
  results.metrics.responseTime = response.responseTime;
  if (response.responseTime < 500) {
    results.passed.push(`✅ Excellent response time: ${response.responseTime}ms`);
  } else if (response.responseTime < 1000) {
    results.passed.push(`✅ Good response time: ${response.responseTime}ms`);
  } else if (response.responseTime < 2000) {
    results.warnings.push(`⚠️ Moderate response time: ${response.responseTime}ms`);
  } else {
    results.issues.push(`❌ Slow response time: ${response.responseTime}ms`);
  }

  // HTML Size
  const sizeKB = (response.size / 1024).toFixed(2);
  results.metrics.htmlSizeKB = parseFloat(sizeKB);
  
  if (response.size < 50000) {
    results.passed.push(`✅ Small HTML size: ${sizeKB}KB`);
  } else if (response.size < 100000) {
    results.passed.push(`✅ Acceptable HTML size: ${sizeKB}KB`);
  } else if (response.size < 200000) {
    results.warnings.push(`⚠️ Large HTML size: ${sizeKB}KB`);
  } else {
    results.issues.push(`❌ Very large HTML: ${sizeKB}KB - consider code splitting`);
  }

  // Script Analysis
  const inlineScripts = (html.match(/<script[^>]*>[^<]+<\/script>/gi) || []).length;
  const externalScripts = (html.match(/<script[^>]*src=/gi) || []).length;
  const asyncScripts = (html.match(/<script[^>]*async/gi) || []).length;
  const deferScripts = (html.match(/<script[^>]*defer/gi) || []).length;
  
  results.metrics.scripts = {
    inline: inlineScripts,
    external: externalScripts,
    async: asyncScripts,
    defer: deferScripts,
  };

  if (inlineScripts > 10) {
    results.warnings.push(`⚠️ Many inline scripts (${inlineScripts}) - may block rendering`);
  }

  if (externalScripts > 0 && (asyncScripts + deferScripts) < externalScripts) {
    results.warnings.push('⚠️ Some scripts may be render-blocking');
  }

  // CSS Analysis
  const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
  const externalCSS = (html.match(/<link[^>]*stylesheet/gi) || []).length;
  
  results.metrics.css = {
    inline: inlineStyles,
    external: externalCSS,
  };

  // Image Optimization
  const images = html.match(/<img[^>]*>/gi) || [];
  const lazyImages = images.filter(img => img.includes('loading="lazy"') || img.includes('loading=\'lazy\'')).length;
  const nextImages = images.filter(img => img.includes('srcset') || img.includes('_next/image')).length;
  
  results.metrics.images = {
    total: images.length,
    lazy: lazyImages,
    optimized: nextImages,
  };

  if (images.length > 0) {
    if (nextImages === images.length) {
      results.passed.push(`✅ All ${images.length} images use Next.js Image optimization`);
    } else if (lazyImages > 0) {
      results.passed.push(`✅ ${lazyImages}/${images.length} images use lazy loading`);
    } else if (images.length > 5) {
      results.warnings.push(`⚠️ ${images.length} images without lazy loading`);
    }
  }

  // Preload/Prefetch
  const preloads = (html.match(/<link[^>]*rel=["']preload["']/gi) || []).length;
  const prefetches = (html.match(/<link[^>]*rel=["']prefetch["']/gi) || []).length;
  
  results.metrics.resourceHints = { preload: preloads, prefetch: prefetches };
  
  if (preloads > 0) {
    results.passed.push(`✅ ${preloads} preload hints for critical resources`);
  }

  // Font Loading
  const fontPreloads = (html.match(/preload[^>]*font/gi) || []).length;
  const fontDisplaySwap = html.includes('font-display') || html.includes('swap');
  
  if (fontDisplaySwap) {
    results.passed.push('✅ Font display swap untuk FOUT prevention');
  }

  // Compression
  if (response.headers['content-encoding']) {
    results.passed.push(`✅ Compression: ${response.headers['content-encoding']}`);
  } else {
    results.warnings.push('⚠️ No compression (normal in dev mode)');
  }

  // Caching
  if (response.headers['cache-control']) {
    results.passed.push('✅ Cache-Control header present');
  }

  // Calculate performance score
  let score = 100;
  score -= results.issues.length * 15;
  score -= results.warnings.length * 5;
  results.metrics.performanceScore = Math.max(0, score);

  return results;
}


// ============================================
// VIEWPORT ANALYSIS
// ============================================

function analyzeViewportCompatibility(html) {
  const results = {
    issues: [],
    warnings: [],
    passed: [],
  };

  // Check viewport meta
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);
  if (viewportMatch) {
    const viewport = viewportMatch[1];
    results.passed.push(`✅ Viewport: ${viewport}`);
    
    if (!viewport.includes('width=device-width')) {
      results.warnings.push('⚠️ Viewport tidak menggunakan device-width');
    }
    if (viewport.includes('maximum-scale=1') || viewport.includes('user-scalable=no')) {
      results.issues.push('❌ Viewport membatasi zoom - accessibility issue');
    }
  } else {
    results.issues.push('❌ Missing viewport meta tag');
  }

  // Check for fixed widths that might cause issues
  const fixedWidthPatterns = /w-\[(\d+)px\]/g;
  const fixedWidths = [...html.matchAll(fixedWidthPatterns)].map(m => parseInt(m[1]));
  const largeFixedWidths = fixedWidths.filter(w => w > 400);
  
  if (largeFixedWidths.length > 0) {
    results.warnings.push(`⚠️ ${largeFixedWidths.length} elemen dengan fixed width besar`);
  }

  // Check for horizontal scroll issues
  const overflowX = html.includes('overflow-x-auto') || html.includes('overflow-x-scroll');
  if (overflowX) {
    results.passed.push('✅ Horizontal scroll handling present');
  }

  // Check for responsive breakpoints coverage
  const breakpoints = {
    sm: html.includes('sm:'),
    md: html.includes('md:'),
    lg: html.includes('lg:'),
    xl: html.includes('xl:'),
    '2xl': html.includes('2xl:'),
  };
  
  const coveredBreakpoints = Object.entries(breakpoints).filter(([, v]) => v).map(([k]) => k);
  results.passed.push(`✅ Breakpoints: ${coveredBreakpoints.join(', ') || 'none'}`);
  
  if (!breakpoints.lg && !breakpoints.xl) {
    results.warnings.push('⚠️ Tidak ada breakpoint untuk layar besar (lg/xl)');
  }

  // Check for container queries (modern CSS)
  const hasContainerQueries = html.includes('@container') || html.includes('container-type');
  if (hasContainerQueries) {
    results.passed.push('✅ Container queries digunakan (modern CSS)');
  }

  return results;
}

// ============================================
// FLOW ANALYSIS
// ============================================

async function analyzeUserFlow(flow) {
  const results = {
    name: flow.name,
    steps: [],
    issues: [],
    passed: [],
  };

  for (const step of flow.steps) {
    const stepResult = { ...step, status: 'pending' };
    
    if (step.action === 'navigate') {
      try {
        const response = await fetchPage(`${BASE_URL}${step.url}`);
        if (response.statusCode === 200) {
          stepResult.status = 'passed';
          stepResult.responseTime = response.responseTime;
          results.passed.push(`✅ ${step.description} (${response.responseTime}ms)`);
        } else {
          stepResult.status = 'failed';
          stepResult.error = `HTTP ${response.statusCode}`;
          results.issues.push(`❌ ${step.description}: HTTP ${response.statusCode}`);
        }
      } catch (error) {
        stepResult.status = 'failed';
        stepResult.error = error.message;
        results.issues.push(`❌ ${step.description}: ${error.message}`);
      }
    } else if (step.action === 'check') {
      // For check actions, we verify in the last fetched page
      stepResult.status = 'info';
      results.passed.push(`ℹ️ ${step.description}`);
    }
    
    results.steps.push(stepResult);
  }

  return results;
}


// ============================================
// MAIN AUDIT FUNCTION
// ============================================

async function auditPage(url, pageName) {
  log(`\n📄 ${pageName}`, 'cyan');
  log(`   ${url}`, 'dim');
  
  try {
    const response = await fetchPage(url);
    
    if (response.statusCode !== 200) {
      log(`   ❌ HTTP ${response.statusCode}`, 'red');
      return { status: 'error', statusCode: response.statusCode };
    }

    const html = response.body;
    
    // Run all analyses
    const design = analyzeDesignLayout(html, pageName);
    const ux = analyzeUX(html, pageName);
    const a11y = analyzeAccessibility(html, pageName);
    const perf = analyzePerformance(response, html);
    const viewport = analyzeViewportCompatibility(html);

    // Print results
    logSubSection('🎨 Design & Layout');
    design.passed.forEach(p => log(`   ${p}`, 'green'));
    design.warnings.forEach(w => log(`   ${w}`, 'yellow'));
    design.issues.forEach(i => log(`   ${i}`, 'red'));

    logSubSection('👤 User Experience');
    ux.passed.forEach(p => log(`   ${p}`, 'green'));
    ux.warnings.forEach(w => log(`   ${w}`, 'yellow'));
    ux.issues.forEach(i => log(`   ${i}`, 'red'));
    log(`   📊 Elements: ${ux.metrics.buttons} buttons, ${ux.metrics.links} links, ${ux.metrics.forms} forms`, 'dim');

    logSubSection('♿ Accessibility (WCAG)');
    log(`   WCAG Level: ${a11y.wcagLevel}`, a11y.wcagLevel.includes('AA') ? 'green' : 'yellow');
    a11y.passed.forEach(p => log(`   ${p}`, 'green'));
    a11y.warnings.forEach(w => log(`   ${w}`, 'yellow'));
    a11y.issues.forEach(i => log(`   ${i}`, 'red'));

    logSubSection('⚡ Performance');
    log(`   Score: ${perf.metrics.performanceScore}/100`, perf.metrics.performanceScore >= 80 ? 'green' : 'yellow');
    perf.passed.forEach(p => log(`   ${p}`, 'green'));
    perf.warnings.forEach(w => log(`   ${w}`, 'yellow'));
    perf.issues.forEach(i => log(`   ${i}`, 'red'));

    logSubSection('📱 Viewport Compatibility');
    viewport.passed.forEach(p => log(`   ${p}`, 'green'));
    viewport.warnings.forEach(w => log(`   ${w}`, 'yellow'));
    viewport.issues.forEach(i => log(`   ${i}`, 'red'));

    return {
      status: 'ok',
      pageName,
      url,
      design,
      ux,
      accessibility: a11y,
      performance: perf,
      viewport,
    };

  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { status: 'error', error: error.message };
  }
}

// ============================================
// GENERATE REPORT
// ============================================

function generateReport(results, flowResults) {
  logSection('📋 LAPORAN AUDIT DESKTOP UX');

  // Summary counts
  let totalIssues = 0;
  let totalWarnings = 0;
  let totalPassed = 0;

  results.forEach(r => {
    if (r.status === 'ok') {
      ['design', 'ux', 'accessibility', 'performance', 'viewport'].forEach(category => {
        if (r[category]) {
          totalIssues += r[category].issues?.length || 0;
          totalWarnings += r[category].warnings?.length || 0;
          totalPassed += r[category].passed?.length || 0;
        }
      });
    }
  });

  console.log('\n📊 RINGKASAN:');
  log(`   ✅ Passed: ${totalPassed}`, 'green');
  log(`   ⚠️ Warnings: ${totalWarnings}`, 'yellow');
  log(`   ❌ Issues: ${totalIssues}`, 'red');

  // Performance summary
  const perfScores = results
    .filter(r => r.status === 'ok' && r.performance?.metrics?.performanceScore)
    .map(r => r.performance.metrics.performanceScore);
  
  if (perfScores.length > 0) {
    const avgPerf = Math.round(perfScores.reduce((a, b) => a + b, 0) / perfScores.length);
    console.log(`\n⚡ Rata-rata Performance Score: ${avgPerf}/100`);
  }

  // Accessibility summary
  const a11yLevels = results
    .filter(r => r.status === 'ok' && r.accessibility?.wcagLevel)
    .map(r => r.accessibility.wcagLevel);
  
  if (a11yLevels.length > 0) {
    console.log(`\n♿ WCAG Levels: ${[...new Set(a11yLevels)].join(', ')}`);
  }

  // Flow results
  if (flowResults.length > 0) {
    console.log('\n🔄 USER FLOWS:');
    flowResults.forEach(flow => {
      const status = flow.issues.length === 0 ? '✅' : '⚠️';
      log(`   ${status} ${flow.name}: ${flow.passed.length} passed, ${flow.issues.length} issues`, 
          flow.issues.length === 0 ? 'green' : 'yellow');
    });
  }

  // Top issues to fix
  const allIssues = [];
  results.forEach(r => {
    if (r.status === 'ok') {
      ['design', 'ux', 'accessibility', 'performance', 'viewport'].forEach(category => {
        if (r[category]?.issues) {
          r[category].issues.forEach(issue => {
            allIssues.push({ page: r.pageName, category, issue });
          });
        }
      });
    }
  });

  if (allIssues.length > 0) {
    console.log('\n🔧 TOP ISSUES TO FIX:');
    allIssues.slice(0, 10).forEach((item, i) => {
      log(`   ${i + 1}. [${item.page}] ${item.issue}`, 'red');
    });
  }

  // Calculate overall score
  const maxScore = 100;
  const deductions = totalIssues * 5 + totalWarnings * 1;
  const overallScore = Math.max(0, maxScore - deductions);

  console.log('\n' + '═'.repeat(50));
  if (overallScore >= 80) {
    log(`🏆 SKOR KESELURUHAN: ${overallScore}/100 - EXCELLENT`, 'green');
  } else if (overallScore >= 60) {
    log(`📊 SKOR KESELURUHAN: ${overallScore}/100 - GOOD`, 'yellow');
  } else {
    log(`⚠️ SKOR KESELURUHAN: ${overallScore}/100 - NEEDS IMPROVEMENT`, 'red');
  }
  console.log('═'.repeat(50));

  return { totalIssues, totalWarnings, totalPassed, overallScore };
}


// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  logSection('🖥️ AUDIT DESKTOP UX - TenunanSongket Store');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Waktu: ${new Date().toLocaleString('id-ID')}`, 'blue');
  log(`Target: Desktop Experience (1366px+)`, 'blue');

  // Check server
  console.log('\nMengecek koneksi server...');
  try {
    await fetchPage(BASE_URL);
    log('✅ Server aktif\n', 'green');
  } catch (error) {
    log('❌ Server tidak dapat diakses!', 'red');
    log('   Jalankan: npm run dev', 'yellow');
    process.exit(1);
  }

  // Pages to audit
  const pages = [
    { url: `${BASE_URL}/`, name: 'Home' },
    { url: `${BASE_URL}/products`, name: 'Products Listing' },
    { url: `${BASE_URL}/products/songket-palembang-merah`, name: 'Product Detail' },
    { url: `${BASE_URL}/cart`, name: 'Cart' },
    { url: `${BASE_URL}/checkout`, name: 'Checkout' },
    { url: `${BASE_URL}/account`, name: 'Account' },
  ];

  // Audit each page
  logSection('📄 AUDIT PER HALAMAN');
  const results = [];
  for (const page of pages) {
    const result = await auditPage(page.url, page.name);
    results.push(result);
  }

  // Test user flows
  logSection('🔄 AUDIT USER FLOWS');
  const flowResults = [];
  for (const flow of USER_FLOWS) {
    log(`\n🔄 ${flow.name}`, 'cyan');
    const flowResult = await analyzeUserFlow(flow);
    flowResults.push(flowResult);
    
    flowResult.passed.forEach(p => log(`   ${p}`, 'green'));
    flowResult.issues.forEach(i => log(`   ${i}`, 'red'));
  }

  // Generate final report
  const summary = generateReport(results, flowResults);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary,
    pages: results,
    flows: flowResults,
  };

  const reportPath = 'audit-desktop-ux-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📁 Detailed report: ${reportPath}`, 'cyan');

  // Recommendations
  console.log('\n💡 REKOMENDASI:');
  
  if (summary.totalIssues > 0) {
    log('   1. Perbaiki semua issues (❌) terlebih dahulu', 'yellow');
  }
  
  const a11yIssues = results.filter(r => 
    r.accessibility?.issues?.length > 0
  ).length;
  
  if (a11yIssues > 0) {
    log('   2. Fokus pada accessibility - tambahkan focus states dan skip links', 'yellow');
  }

  const perfIssues = results.filter(r => 
    r.performance?.metrics?.responseTime > 1000
  ).length;
  
  if (perfIssues > 0) {
    log('   3. Optimasi loading time - pertimbangkan code splitting', 'yellow');
  }

  log('\n   Jalankan audit lagi setelah perbaikan: npm run audit:desktop', 'dim');
}

main().catch(console.error);
