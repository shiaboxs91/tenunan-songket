import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenunansongket.com'

export async function GET() {
  const supabase = await createClient()
  
  // Fetch published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      title,
      slug,
      excerpt,
      featured_image_url,
      published_at,
      category:blog_categories(name)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  const rssItems = (posts || []).map(post => {
    const pubDate = post.published_at 
      ? new Date(post.published_at).toUTCString() 
      : new Date().toUTCString()
    
    const categoryName = (post.category as { name: string } | null)?.name || 'Uncategorized'
    
    return `
    <item>
      <title><![CDATA[${escapeXml(post.title)}]]></title>
      <link>${SITE_URL}/blog/${encodeURIComponent(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${encodeURIComponent(post.slug)}</guid>
      <description><![CDATA[${escapeXml(post.excerpt || '')}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${escapeXml(categoryName)}]]></category>
      ${post.featured_image_url ? `<enclosure url="${escapeXml(post.featured_image_url)}" type="image/jpeg" />` : ''}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Blog Tenunan Songket</title>
    <link>${SITE_URL}/blog</link>
    <description>Artikel dan panduan tentang kain songket, tenunan Melayu, tips perawatan, inspirasi gaya, dan banyak lagi.</description>
    <language>ms</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>Tenunan Songket</title>
      <link>${SITE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
