import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  parseRSSToProducts,
  generateConsistentPrice,
  generateConsistentRating,
  generateConsistentSold,
  generateConsistentInStock,
  extractCategory,
  extractImage,
  stripHtml,
} from "@/lib/rss";
import { PRODUCT_CATEGORIES } from "@/lib/types";

/**
 * Feature: tenunan-songket-store, Property 8: RSS to Product mapping produces valid products
 * Validates: Requirements 9.2, 9.5
 *
 * For any valid RSS XML with items, parsing SHALL produce Product objects where each product has:
 * - non-empty id (from guid or hash of link)
 * - non-empty slug (from title)
 * - non-empty title
 * - valid price (number > 0)
 * - valid rating (0-5)
 * - image extracted from enclosure/media:content or placeholder
 */
describe("Property 8: RSS to Product mapping produces valid products", () => {
  // Generator for valid RSS item content
  const rssItemArb = fc.record({
    guid: fc.option(fc.uuid(), { nil: undefined }),
    title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    link: fc.webUrl(),
    description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    pubDate: fc.option(
      fc.date().map((d) => d.toUTCString()),
      { nil: undefined }
    ),
    hasEnclosure: fc.boolean(),
    enclosureUrl: fc.option(fc.webUrl(), { nil: undefined }),
  });

  // Generate RSS XML from item data
  const generateRSSXml = (items: Array<{
    guid?: string;
    title: string;
    link: string;
    description?: string;
    pubDate?: string;
    hasEnclosure: boolean;
    enclosureUrl?: string;
  }>): string => {
    const itemsXml = items
      .map((item) => {
        const parts = [
          `<title><![CDATA[${item.title}]]></title>`,
          `<link>${item.link}</link>`,
        ];

        if (item.guid) {
          parts.push(`<guid>${item.guid}</guid>`);
        }

        if (item.description) {
          parts.push(`<description><![CDATA[${item.description}]]></description>`);
        }

        if (item.pubDate) {
          parts.push(`<pubDate>${item.pubDate}</pubDate>`);
        }

        if (item.hasEnclosure && item.enclosureUrl) {
          parts.push(`<enclosure url="${item.enclosureUrl}" type="image/jpeg" />`);
        }

        return `<item>${parts.join("")}</item>`;
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          ${itemsXml}
        </channel>
      </rss>`;
  };

  it("should produce valid products for any valid RSS XML", () => {
    fc.assert(
      fc.property(fc.array(rssItemArb, { minLength: 1, maxLength: 10 }), (items) => {
        const xml = generateRSSXml(items);
        const products = parseRSSToProducts(xml);

        // Should produce same number of products as items
        expect(products.length).toBe(items.length);

        // Each product should have valid properties
        for (const product of products) {
          // Non-empty id
          expect(product.id).toBeTruthy();
          expect(typeof product.id).toBe("string");
          expect(product.id.length).toBeGreaterThan(0);

          // Non-empty slug
          expect(product.slug).toBeTruthy();
          expect(typeof product.slug).toBe("string");

          // Non-empty title
          expect(product.title).toBeTruthy();
          expect(typeof product.title).toBe("string");
          expect(product.title.length).toBeGreaterThan(0);

          // Valid price (number > 0)
          expect(typeof product.price).toBe("number");
          expect(product.price).toBeGreaterThan(0);

          // Valid rating (0-5)
          expect(typeof product.rating).toBe("number");
          expect(product.rating).toBeGreaterThanOrEqual(0);
          expect(product.rating).toBeLessThanOrEqual(5);

          // Currency is IDR
          expect(product.currency).toBe("IDR");

          // Category is valid
          expect(PRODUCT_CATEGORIES).toContain(product.category);

          // Tags is array
          expect(Array.isArray(product.tags)).toBe(true);

          // inStock is boolean
          expect(typeof product.inStock).toBe("boolean");

          // sold is number >= 0
          expect(typeof product.sold).toBe("number");
          expect(product.sold).toBeGreaterThanOrEqual(0);

          // sourceUrl is string
          expect(typeof product.sourceUrl).toBe("string");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should extract image from enclosure when available", () => {
    fc.assert(
      fc.property(fc.webUrl(), (imageUrl) => {
        const item = {
          enclosure: { url: imageUrl },
        };
        const extracted = extractImage(item);
        expect(extracted).toBe(imageUrl);
      }),
      { numRuns: 100 }
    );
  });

  it("should extract image from media:content when enclosure not available", () => {
    fc.assert(
      fc.property(fc.webUrl(), (imageUrl) => {
        const item = {
          "media:content": { url: imageUrl },
        };
        const extracted = extractImage(item);
        expect(extracted).toBe(imageUrl);
      }),
      { numRuns: 100 }
    );
  });

  it("should strip HTML tags correctly", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => !s.includes("<") && !s.includes(">")),
        (text) => {
          const html = `<p>${text}</p>`;
          const stripped = stripHtml(html);
          expect(stripped).toBe(text.replace(/\s+/g, " ").trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should assign valid category based on keywords", () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 200 }),
        fc.string({ maxLength: 200 }),
        (title, description) => {
          const category = extractCategory(title, description);
          expect(PRODUCT_CATEGORIES).toContain(category);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: tenunan-songket-store, Property 9: Consistent value generation (idempotence)
 * Validates: Requirements 9.3
 *
 * For any product id, calling generateConsistentPrice(id), generateConsistentRating(id),
 * and generateConsistentSold(id) multiple times SHALL always return the same values.
 */
describe("Property 9: Consistent value generation (idempotence)", () => {
  it("should generate same price for same id", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (id) => {
        const price1 = generateConsistentPrice(id);
        const price2 = generateConsistentPrice(id);
        const price3 = generateConsistentPrice(id);

        expect(price1).toBe(price2);
        expect(price2).toBe(price3);
      }),
      { numRuns: 100 }
    );
  });

  it("should generate same rating for same id", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (id) => {
        const rating1 = generateConsistentRating(id);
        const rating2 = generateConsistentRating(id);
        const rating3 = generateConsistentRating(id);

        expect(rating1).toBe(rating2);
        expect(rating2).toBe(rating3);
      }),
      { numRuns: 100 }
    );
  });

  it("should generate same sold count for same id", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (id) => {
        const sold1 = generateConsistentSold(id);
        const sold2 = generateConsistentSold(id);
        const sold3 = generateConsistentSold(id);

        expect(sold1).toBe(sold2);
        expect(sold2).toBe(sold3);
      }),
      { numRuns: 100 }
    );
  });

  it("should generate same inStock status for same id", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (id) => {
        const inStock1 = generateConsistentInStock(id);
        const inStock2 = generateConsistentInStock(id);
        const inStock3 = generateConsistentInStock(id);

        expect(inStock1).toBe(inStock2);
        expect(inStock2).toBe(inStock3);
      }),
      { numRuns: 100 }
    );
  });

  it("should generate valid price range", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (id) => {
        const price = generateConsistentPrice(id);
        expect(price).toBeGreaterThanOrEqual(500000);
        expect(price).toBeLessThanOrEqual(2500000);
      }),
      { numRuns: 100 }
    );
  });

  it("should generate valid rating range", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (id) => {
        const rating = generateConsistentRating(id);
        expect(rating).toBeGreaterThanOrEqual(3.5);
        expect(rating).toBeLessThanOrEqual(5.0);
      }),
      { numRuns: 100 }
    );
  });

  it("should generate valid sold range", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (id) => {
        const sold = generateConsistentSold(id);
        expect(sold).toBeGreaterThanOrEqual(10);
        expect(sold).toBeLessThanOrEqual(509);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: category-update, Property 2: Keyword-to-Category Mapping
 * Validates: Requirements 2.1, 2.2
 *
 * For any product title and description containing a category keyword,
 * the extractCategory function SHALL return the corresponding category.
 */
describe("Property 2: Keyword-to-Category Mapping", () => {
  // Define the keyword-to-category mapping as per requirements
  const categoryKeywordMapping: Record<string, string[]> = {
    "Beragi": ["beragi"],
    "Arap Gegati": ["arap", "gegati", "arapgegati"],
    "Bertabur": ["bertabur", "tabur", "betabur"],
    "Jongsarat": ["jongsarat", "jong sarat"],
    "Si Pugut": ["sipugut", "si pugut", "pugut"],
    "Silubang Bangsi": ["silubang", "bangsi", "silubangbangsi"],
    "Tajung": ["tajung"],
  };

  // Generator for category and its keywords
  const categoryKeywordArb = fc.constantFrom(
    ...Object.entries(categoryKeywordMapping).flatMap(([category, keywords]) =>
      keywords.map((keyword) => ({ category, keyword }))
    )
  );

  // Generator for random text that doesn't contain any category keywords
  const randomTextArb = fc.string({ minLength: 0, maxLength: 100 }).filter((s) => {
    const lower = s.toLowerCase();
    const allKeywords = Object.values(categoryKeywordMapping).flat();
    return !allKeywords.some((kw) => lower.includes(kw));
  });

  it("should map keywords to correct categories when keyword is in title", () => {
    fc.assert(
      fc.property(
        categoryKeywordArb,
        randomTextArb,
        randomTextArb,
        ({ category, keyword }, prefix, suffix) => {
          const title = `${prefix} ${keyword} ${suffix}`;
          const description = "";
          const result = extractCategory(title, description);
          expect(result).toBe(category);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should map keywords to correct categories when keyword is in description", () => {
    fc.assert(
      fc.property(
        categoryKeywordArb,
        randomTextArb,
        randomTextArb,
        ({ category, keyword }, prefix, suffix) => {
          const title = "";
          const description = `${prefix} ${keyword} ${suffix}`;
          const result = extractCategory(title, description);
          expect(result).toBe(category);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should be case-insensitive when matching keywords", () => {
    fc.assert(
      fc.property(
        categoryKeywordArb,
        fc.constantFrom("upper", "lower", "mixed"),
        ({ category, keyword }, caseType) => {
          let transformedKeyword: string;
          switch (caseType) {
            case "upper":
              transformedKeyword = keyword.toUpperCase();
              break;
            case "lower":
              transformedKeyword = keyword.toLowerCase();
              break;
            case "mixed":
              transformedKeyword = keyword
                .split("")
                .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
                .join("");
              break;
            default:
              transformedKeyword = keyword;
          }
          const result = extractCategory(transformedKeyword, "");
          expect(result).toBe(category);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: category-update, Property 3: Default Category Fallback
 * Validates: Requirements 2.3
 *
 * For any product title and description that does NOT contain any category keywords,
 * the extractCategory function SHALL return "Lainnya".
 */
describe("Property 3: Default Category Fallback", () => {
  // All keywords that should trigger a category match
  const allCategoryKeywords = [
    "beragi",
    "arap", "gegati", "arapgegati",
    "bertabur", "tabur", "betabur",
    "jongsarat", "jong sarat",
    "sipugut", "si pugut", "pugut",
    "silubang", "bangsi", "silubangbangsi",
    "tajung",
  ];

  // Generator for text that doesn't contain any category keywords
  const noKeywordTextArb = fc.string({ minLength: 0, maxLength: 200 }).filter((s) => {
    const lower = s.toLowerCase();
    return !allCategoryKeywords.some((kw) => lower.includes(kw));
  });

  it("should return 'Lainnya' when no keywords match in title or description", () => {
    fc.assert(
      fc.property(noKeywordTextArb, noKeywordTextArb, (title, description) => {
        const result = extractCategory(title, description);
        expect(result).toBe("Lainnya");
      }),
      { numRuns: 100 }
    );
  });

  it("should return 'Lainnya' for empty title and description", () => {
    const result = extractCategory("", "");
    expect(result).toBe("Lainnya");
  });

  it("should return 'Lainnya' for generic product descriptions without keywords", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "Kain tradisional berkualitas tinggi",
          "Produk handmade premium",
          "Songket asli Indonesia",
          "Kain tenun modern",
          "Produk eksklusif limited edition",
        ),
        (description) => {
          const result = extractCategory("Produk Baru", description);
          expect(result).toBe("Lainnya");
        }
      ),
      { numRuns: 100 }
    );
  });
});
