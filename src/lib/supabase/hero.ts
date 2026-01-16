import { createClient } from "./server";

export interface HeroSlide {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get active hero slides ordered by order_index
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
    // Return default slides as fallback
    return [
      {
        id: '1',
        title: 'Tenunan Songket Collection',
        image_url: 'https://tenunansongket.com/wp-content/uploads/2020/08/Untitled-Facebook-Cover-6-1.webp',
        order_index: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Model Songket Elegant',
        image_url: 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-14.png',
        order_index: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Songket Fashion',
        image_url: 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-10.png',
        order_index: 3,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
  
  // Transform data to match HeroSlide type (convert null to undefined)
  const transformedData: HeroSlide[] = (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    image_url: item.image_url,
    link_url: item.link_url ?? undefined,
    order_index: item.order_index,
    is_active: item.is_active ?? true,
    created_at: item.created_at ?? new Date().toISOString(),
    updated_at: item.updated_at ?? new Date().toISOString(),
  }));
  
  return transformedData;
}

/**
 * Create or update hero slide (admin only)
 */
export async function upsertHeroSlide(slide: Partial<HeroSlide>): Promise<HeroSlide | null> {
  const supabase = await createClient();
  
  // Convert undefined to null for database compatibility
  const dbSlide = {
    ...slide,
    description: slide.description ?? null,
    link_url: slide.link_url ?? null,
  };
  
  const { data, error } = await supabase
    .from('hero_slides')
    .upsert(dbSlide as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting hero slide:', error);
    return null;
  }
  
  // Transform back to HeroSlide type
  return data ? {
    ...data,
    description: data.description ?? undefined,
    link_url: data.link_url ?? undefined,
    is_active: data.is_active ?? true,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString(),
  } : null;
}

/**
 * Delete hero slide (admin only)
 */
export async function deleteHeroSlide(id: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting hero slide:', error);
    return false;
  }
  
  return true;
}
