import { NextResponse } from 'next/server';
import { getPopularProducts } from '@/lib/supabase/products';
import { getCategoriesWithProductCount } from '@/lib/supabase/categories';
import { getHeroSlides } from '@/lib/supabase/hero'; // Import hero fetcher if available, assuming path
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const results: any = {};
  
  try {
    const supabase = await createClient();
    
    // Check Env Vars
    results.env = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined' : 'Missing',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined' : 'Missing',
    };

    // 1. Products
    try {
      const popular = await getPopularProducts(5);
      results.products = { success: true, count: popular.length };
    } catch (e: any) {
      results.products = { success: false, error: e.message };
    }

    // 2. Categories
    try {
      const categories = await getCategoriesWithProductCount();
      results.categories = { success: true, count: categories.length };
    } catch (e: any) {
      results.categories = { success: false, error: e.message };
    }

    // 3. Hero
    try {
      const slides = await getHeroSlides();
      results.hero = { success: true, count: slides.length };
    } catch (e: any) {
      results.hero = { success: false, error: e.message };
    }

    // 4. Check Specific Slug (User reported issue)
    try {
        const { data, error } = await supabase
            .from('products')
            .select('slug, is_active, is_deleted')
            .eq('slug', 'kain-tenunan-brunei-betabur')
            .single();
        results.slugCheck = { 
            found: !!data, 
            data, 
            error: error ? error.message : null 
        };
    } catch (e: any) {
        results.slugCheck = { error: e.message };
    }
    
    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({
      critical_failure: true,
      error: error.message,
      results 
    }, { status: 500 });
  }
}
