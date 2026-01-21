import { createClient } from './client';
import { HeroSlide } from './hero';

export async function getHeroSlidesClient(): Promise<HeroSlide[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
  
  return (data || []).map((item: any) => ({
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
}

export async function upsertHeroSlide(slide: Partial<HeroSlide>): Promise<HeroSlide | null> {
  const supabase = createClient();
  
  // Convert undefined to null for database compatibility
  const dbSlide = {
    ...slide,
    subtitle: slide.subtitle ?? null,
    description: slide.description ?? null,
    cta_text: slide.cta_text ?? null,
    cta_link: slide.cta_link ?? null,
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
  const result = data as any;
  return result ? {
    ...result,
    subtitle: result.subtitle ?? undefined,
    description: result.description ?? undefined,
    cta_text: result.cta_text ?? undefined,
    cta_link: result.cta_link ?? undefined,
    link_url: result.link_url ?? undefined,
    is_active: result.is_active ?? true,
    created_at: result.created_at ?? new Date().toISOString(),
    updated_at: result.updated_at ?? new Date().toISOString(),
  } : null;
}

export async function deleteHeroSlide(id: string): Promise<boolean> {
  const supabase = createClient();
  
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
