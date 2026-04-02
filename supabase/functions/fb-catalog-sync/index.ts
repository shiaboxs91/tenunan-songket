import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number | null;
  slug: string;
  is_active: boolean | null;
  category?: { name: string } | null;
  images?: { url: string; is_primary: boolean | null }[];
}

interface FBCatalogConfig {
  catalog_id: string;
  access_token: string;
  pixel_id?: string;
}

interface SyncRequest {
  action: "sync_all" | "sync_single" | "delete";
  product_ids?: string[];
}

// Facebook Graph API base URL
const FB_GRAPH_API = "https://graph.facebook.com/v18.0";

// Convert product to Facebook Commerce format
function productToFBFormat(product: Product, baseUrl: string): Record<string, unknown> {
  const primaryImage = product.images?.find(img => img.is_primary)?.url 
    || product.images?.[0]?.url 
    || `${baseUrl}/images/placeholder-product.svg`;
  
  const additionalImages = product.images
    ?.filter(img => !img.is_primary)
    .map(img => img.url)
    .slice(0, 9) || []; // FB allows max 10 images total
  
  return {
    retailer_id: product.id,
    name: product.title,
    description: product.description || product.title,
    url: `${baseUrl}/products/${product.slug}`,
    image_url: primaryImage,
    additional_image_urls: additionalImages,
    price: `${(product.sale_price || product.price).toFixed(2)} BND`,
    sale_price: product.sale_price ? `${product.sale_price.toFixed(2)} BND` : undefined,
    currency: "BND",
    availability: product.stock && product.stock > 0 ? "in stock" : "out of stock",
    condition: "new",
    brand: "Tenunan Songket",
    category: product.category?.name || "Kain Songket",
    inventory: product.stock || 0,
  };
}

// Sync products to Facebook Catalog
async function syncToFacebook(
  config: FBCatalogConfig,
  products: Product[],
  baseUrl: string
): Promise<{ success: string[]; errors: { id: string; error: string }[] }> {
  const success: string[] = [];
  const errors: { id: string; error: string }[] = [];

  for (const product of products) {
    try {
      const fbProduct = productToFBFormat(product, baseUrl);
      
      // Use batch API for efficiency
      const response = await fetch(
        `${FB_GRAPH_API}/${config.catalog_id}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: config.access_token,
            requests: [{
              method: "UPDATE",
              retailer_id: product.id,
              data: fbProduct,
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Unknown FB API error");
      }

      const result = await response.json();
      
      if (result.handles?.[0]?.errors) {
        throw new Error(result.handles[0].errors[0]?.message || "Sync failed");
      }
      
      success.push(product.id);
    } catch (error) {
      errors.push({
        id: product.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { success, errors };
}

// Delete products from Facebook Catalog
async function deleteFromFacebook(
  config: FBCatalogConfig,
  productIds: string[]
): Promise<{ success: string[]; errors: { id: string; error: string }[] }> {
  const success: string[] = [];
  const errors: { id: string; error: string }[] = [];

  for (const productId of productIds) {
    try {
      const response = await fetch(
        `${FB_GRAPH_API}/${config.catalog_id}/products`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: config.access_token,
            requests: [{
              method: "DELETE",
              retailer_id: productId,
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Unknown FB API error");
      }
      
      success.push(productId);
    } catch (error) {
      errors.push({
        id: productId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { success, errors };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header for Supabase client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const body: SyncRequest = await req.json();
    const { action, product_ids } = body;

    // Get Facebook config
    const { data: configData, error: configError } = await supabase
      .from("fb_catalog_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (configError || !configData) {
      return new Response(
        JSON.stringify({ error: "Facebook catalog not configured or inactive" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config: FBCatalogConfig = {
      catalog_id: configData.catalog_id,
      access_token: configData.access_token,
      pixel_id: configData.pixel_id,
    };

    if (!config.catalog_id || !config.access_token) {
      return new Response(
        JSON.stringify({ error: "Missing Facebook catalog ID or access token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get base URL from environment or default
    const baseUrl = Deno.env.get("SITE_URL") || "https://tenunansongket.com";

    // Create sync log entry
    const startTime = Date.now();
    const { data: logData } = await supabase
      .from("fb_sync_logs")
      .insert({
        action,
        started_at: new Date().toISOString(),
        product_count: product_ids?.length || 0,
      })
      .select()
      .single();

    let result: { success: string[]; errors: { id: string; error: string }[] };

    if (action === "delete" && product_ids) {
      result = await deleteFromFacebook(config, product_ids);
    } else {
      // Fetch products to sync
      let query = supabase
        .from("products")
        .select(`
          id, title, description, price, sale_price, stock, slug, is_active,
          category:categories(name),
          images:product_images(url, is_primary)
        `)
        .eq("is_active", true)
        .eq("is_deleted", false);

      if (action === "sync_single" && product_ids?.length) {
        query = query.in("id", product_ids);
      }

      const { data: products, error: productsError } = await query;

      if (productsError) {
        throw new Error(`Failed to fetch products: ${productsError.message}`);
      }

      result = await syncToFacebook(config, products || [], baseUrl);

      // Update fb_catalog_products status
      for (const productId of result.success) {
        await supabase
          .from("fb_catalog_products")
          .upsert({
            product_id: productId,
            sync_status: "synced",
            last_sync_at: new Date().toISOString(),
            error_message: null,
          }, { onConflict: "product_id" });
      }

      for (const { id, error } of result.errors) {
        await supabase
          .from("fb_catalog_products")
          .upsert({
            product_id: id,
            sync_status: "error",
            last_sync_at: new Date().toISOString(),
            error_message: error,
          }, { onConflict: "product_id" });
      }
    }

    // Update sync log with results
    const endTime = Date.now();
    if (logData) {
      await supabase
        .from("fb_sync_logs")
        .update({
          completed_at: new Date().toISOString(),
          duration_ms: endTime - startTime,
          success_count: result.success.length,
          error_count: result.errors.length,
          error_details: result.errors.length > 0 ? result.errors : null,
        })
        .eq("id", logData.id);
    }

    // Update last_sync_at in config
    await supabase
      .from("fb_catalog_config")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", configData.id);

    return new Response(
      JSON.stringify({
        success: true,
        synced: result.success.length,
        errors: result.errors.length,
        details: result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("FB Catalog Sync Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
