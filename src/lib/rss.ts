import { Product, PRODUCT_CATEGORIES } from "./types";
import { slugify } from "./utils";

const RSS_FEED_URL = "https://tenunansongket.com/feed/";
const PLACEHOLDER_IMAGE = "/images/placeholder-product.jpg";

/**
 * Generate a consistent hash from a string for seeding random values
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate consistent price based on product id (seeded random)
 */
export function generateConsistentPrice(id: string): number {
  const hash = hashString(id);
  const basePrice = 500000; // 500k IDR base
  const variation = (hash % 20) * 100000; // 0-2M variation
  return basePrice + variation;
}

/**
 * Generate consistent rating based on product id (seeded random)
 */
export function generateConsistentRating(id: string): number {
  const hash = hashString(id);
  const rating = 3.5 + (hash % 16) / 10; // 3.5 - 5.0
  return Math.round(rating * 10) / 10;
}

/**
 * Generate consistent sold count based on product id (seeded random)
 */
export function generateConsistentSold(id: string): number {
  const hash = hashString(id);
  return (hash % 500) + 10; // 10 - 509
}

/**
 * Generate consistent stock status based on product id (seeded random)
 */
export function generateConsistentInStock(id: string): boolean {
  const hash = hashString(id);
  return hash % 10 !== 0; // 90% in stock
}

/**
 * Extract category from title and description using keyword matching
 */
export function extractCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    "Beragi": ["beragi"],
    "Arap Gegati": ["arap", "gegati", "arapgegati"],
    "Bertabur": ["bertabur", "tabur", "betabur"],
    "Jongsarat": ["jongsarat", "jong sarat"],
    "Si Pugut": ["sipugut", "si pugut", "pugut"],
    "Silubang Bangsi": ["silubang", "bangsi", "silubangbangsi"],
    "Tajung": ["tajung"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return "Lainnya";
}

/**
 * Extract image URL from RSS item
 */
export function extractImage(item: {
  enclosure?: { url?: string };
  "media:content"?: { url?: string };
  description?: string;
  "content:encoded"?: string;
}): string | undefined {
  // Try enclosure first
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  // Try media:content
  if (item["media:content"]?.url) {
    return item["media:content"].url;
  }

  // Try to extract from content/description HTML
  const content = item["content:encoded"] || item.description || "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract tags from title and description
 */
export function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  const tagKeywords = [
    "songket",
    "tenun",
    "handmade",
    "tradisional",
    "premium",
    "emas",
    "perak",
    "sutra",
    "katun",
    "palembang",
    "minang",
    "bali",
    "lombok",
  ];

  for (const keyword of tagKeywords) {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  }

  return tags.slice(0, 5); // Max 5 tags
}

/**
 * Parse RSS XML to Product array
 */
export function parseRSSToProducts(xml: string): Product[] {
  const products: Product[] = [];

  // Simple XML parsing using regex (for server-side use)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getTagContent = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const tagMatch = itemXml.match(regex);
      return tagMatch ? (tagMatch[1] || tagMatch[2] || "").trim() : "";
    };

    const getEnclosureUrl = (): string | undefined => {
      const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
      return enclosureMatch ? enclosureMatch[1] : undefined;
    };

    const getMediaContentUrl = (): string | undefined => {
      const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      return mediaMatch ? mediaMatch[1] : undefined;
    };

    const guid = getTagContent("guid");
    const link = getTagContent("link");
    const title = getTagContent("title");
    const description = getTagContent("description");
    const contentEncoded = getTagContent("content:encoded");
    const pubDate = getTagContent("pubDate");

    if (!title || !link) continue;

    const id = guid || hashString(link).toString();
    const cleanDescription = stripHtml(contentEncoded || description);
    const image = getEnclosureUrl() || getMediaContentUrl() || extractImage({
      description,
      "content:encoded": contentEncoded,
    });

    const product: Product = {
      id,
      slug: slugify(title),
      title,
      description: cleanDescription.slice(0, 500),
      image: image || PLACEHOLDER_IMAGE,
      price: generateConsistentPrice(id),
      currency: "IDR",
      category: extractCategory(title, cleanDescription),
      tags: extractTags(title, cleanDescription),
      inStock: generateConsistentInStock(id),
      rating: generateConsistentRating(id),
      sold: generateConsistentSold(id),
      createdAt: pubDate || undefined,
      sourceUrl: link,
    };

    products.push(product);
  }

  return products;
}

/**
 * Fetch RSS feed and parse to products
 */
export async function fetchRSSProducts(): Promise<Product[]> {
  const response = await fetch(RSS_FEED_URL, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS: ${response.status}`);
  }

  const xml = await response.text();
  return parseRSSToProducts(xml);
}
