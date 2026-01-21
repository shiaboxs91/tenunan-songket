// This file is for Server Components only
import { createClient } from "./server";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  cta_text?: string;
  cta_link?: string;
  link_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get active hero slides ordered by order_index (Server Side)
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
  
  // Transform data to match HeroSlide type (convert null to undefined)
  // Cast to any because Supabase generated types might be outdated
  const transformedData: HeroSlide[] = (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? undefined,
    description: item.description ?? undefined,
    image_url: item.image_url,
    cta_text: item.cta_text ?? undefined,
    cta_link: item.cta_link ?? undefined,
    link_url: item.link_url ?? undefined,
    order_index: item.order_index,
    is_active: item.is_active ?? true,
    created_at: item.created_at ?? new Date().toISOString(),
    updated_at: item.updated_at ?? new Date().toISOString(),
  }));
  
  return transformedData;
}
