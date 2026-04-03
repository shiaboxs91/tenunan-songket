interface ArticleJsonLdProps {
  article: {
    title: string
    description: string
    url: string
    image: string
    publishedAt: string
    modifiedAt?: string
    authorName: string
    authorUrl?: string
    section?: string
    tags?: string[]
  }
}

export function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    url: article.url,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
      ...(article.authorUrl && { url: article.authorUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tenunan Songket',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tenunan-songket.com'}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    ...(article.section && { articleSection: article.section }),
    ...(article.tags && article.tags.length > 0 && { keywords: article.tags.join(', ') }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BlogListingJsonLdProps {
  posts: {
    title: string
    url: string
    image: string
    publishedAt: string
  }[]
  name: string
  description: string
  url: string
}

export function BlogListingJsonLd({ posts, name, description, url }: BlogListingJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name,
    description,
    url,
    publisher: {
      '@type': 'Organization',
      name: 'Tenunan Songket',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tenunan-songket.com'}/logo.png`,
      },
    },
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: post.url,
      image: post.image,
      datePublished: post.publishedAt,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface FAQJsonLdProps {
  faqs: {
    question: string
    answer: string
  }[]
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
