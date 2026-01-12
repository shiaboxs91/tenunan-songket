const fs = require('fs');
const path = require('path');

// Read the XML file
const xmlPath = path.join(__dirname, '../data_produk/tenunansongket.WordPress.2026-01-12.xml');
const mediaXmlPath = path.join(__dirname, '../data_produk/Media Produk.xml');

const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
const mediaXmlContent = fs.readFileSync(mediaXmlPath, 'utf-8');

// Extract products
const productRegex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>[\s\S]*?<wp:post_type><!\[CDATA\[product\]\]><\/wp:post_type>[\s\S]*?<category domain="product_cat" nicename="(.*?)"><!\[CDATA\[(.*?)\]\]><\/category>[\s\S]*?<wp:meta_key><!\[CDATA\[_price\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>[\s\S]*?<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>[\s\S]*?<\/item>/g;

// Simpler approach - extract item blocks first
const itemBlocks = xmlContent.split('<item>').slice(1);

const products = [];
const mediaMap = new Map();

// Extract media URLs from media XML
const mediaRegex = /<wp:post_id>(\d+)<\/wp:post_id>[\s\S]*?<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/g;
let mediaMatch;
while ((mediaMatch = mediaRegex.exec(mediaXmlContent)) !== null) {
  mediaMap.set(mediaMatch[1], mediaMatch[2]);
}

// Also extract from main XML
const mainMediaRegex = /<wp:post_id>(\d+)<\/wp:post_id>[\s\S]*?<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/g;
while ((mediaMatch = mainMediaRegex.exec(xmlContent)) !== null) {
  mediaMap.set(mediaMatch[1], mediaMatch[2]);
}

console.log('Media map size:', mediaMap.size);

for (const block of itemBlocks) {
  // Check if it's a product
  if (!block.includes('<wp:post_type><![CDATA[product]]></wp:post_type>')) continue;
  
  // Extract title
  const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
  if (!titleMatch) continue;
  
  // Extract link
  const linkMatch = block.match(/<link>(.*?)<\/link>/);
  
  // Extract description
  const descMatch = block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
  
  // Extract category
  const catMatch = block.match(/<category domain="product_cat" nicename="(.*?)"><!\[CDATA\[(.*?)\]\]><\/category>/);
  
  // Extract price
  const priceMatch = block.match(/<wp:meta_key><!\[CDATA\[_price\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>/);
  
  // Extract thumbnail ID
  const thumbMatch = block.match(/<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>/);
  
  // Extract stock status
  const stockMatch = block.match(/<wp:meta_key><!\[CDATA\[_stock_status\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/);
  
  // Extract gallery images
  const galleryMatch = block.match(/<wp:meta_key><!\[CDATA\[_product_image_gallery\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/);
  
  const product = {
    title: titleMatch[1],
    slug: titleMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    link: linkMatch ? linkMatch[1] : '',
    description: descMatch ? descMatch[1].trim() : '',
    category: catMatch ? catMatch[2] : 'Lainnya',
    categorySlug: catMatch ? catMatch[1] : 'lainnya',
    price: priceMatch ? parseInt(priceMatch[1]) : 0,
    thumbnailId: thumbMatch ? thumbMatch[1] : null,
    thumbnailUrl: thumbMatch ? mediaMap.get(thumbMatch[1]) : null,
    inStock: stockMatch ? stockMatch[1] === 'instock' : true,
    galleryIds: galleryMatch ? galleryMatch[1].split(',') : [],
  };
  
  // Get gallery URLs
  product.galleryUrls = product.galleryIds.map(id => mediaMap.get(id)).filter(Boolean);
  
  products.push(product);
}

console.log('Total products found:', products.length);

// Take ALL products with good data (not just 20)
const selectedProducts = products
  .filter(p => p.price > 0 && p.description);

console.log(`\n=== SEMUA ${selectedProducts.length} PRODUK UNTUK DEMO ===\n`);

selectedProducts.forEach((p, i) => {
  console.log(`${i + 1}. ${p.title}`);
  console.log(`   Kategori: ${p.category}`);
  console.log(`   Harga: Rp ${p.price.toLocaleString('id-ID')}`);
  console.log(`   Thumbnail ID: ${p.thumbnailId}`);
  console.log(`   Thumbnail URL: ${p.thumbnailUrl || 'Not found'}`);
  console.log(`   Gallery: ${p.galleryUrls.length} images`);
  console.log(`   Stock: ${p.inStock ? 'In Stock' : 'Out of Stock'}`);
  console.log('');
});

// Create JSON output for products.snapshot.json
const snapshotProducts = selectedProducts.map((p, i) => ({
  id: `prod-${i + 1}`,
  slug: p.slug || `product-${i + 1}`,
  title: p.title,
  description: p.description,
  image: p.thumbnailUrl || '/images/placeholder-product.svg',
  price: p.price,
  currency: 'IDR',
  category: mapCategory(p.category),
  tags: [p.category.toLowerCase()],
  inStock: p.inStock,
  rating: 4.5 + Math.random() * 0.5,
  sold: Math.floor(Math.random() * 50) + 5,
  createdAt: new Date().toISOString(),
  sourceUrl: p.link,
  gallery: p.galleryUrls.length > 0 ? p.galleryUrls : undefined,
}));

function mapCategory(cat) {
  const mapping = {
    'Bertabur': 'Bertabur',
    'Arap Gegati': 'Arap Gegati',
    'Silubang Bangsi': 'Silubang Bangsi',
    'Beragi': 'Beragi',
    'Jongsarat': 'Jongsarat',
    'Si Pugut': 'Si Pugut',
    'Tajung': 'Tajung',
  };
  return mapping[cat] || 'Lainnya';
}

// Write to file
fs.writeFileSync(
  path.join(__dirname, '../src/data/products.snapshot.json'),
  JSON.stringify(snapshotProducts, null, 2)
);

console.log(`\n=== products.snapshot.json updated with ${selectedProducts.length} products ===`);

// Extract category images for homepage
console.log('\n=== GAMBAR UNTUK KATEGORI DI HALAMAN DEPAN ===\n');

const categoryImages = {};
for (const p of products) {
  if (!categoryImages[p.category] && p.thumbnailUrl) {
    categoryImages[p.category] = p.thumbnailUrl;
  }
}

Object.entries(categoryImages).forEach(([cat, url]) => {
  console.log(`${cat}: ${url}`);
});
