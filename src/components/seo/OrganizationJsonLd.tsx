export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tenunan Songket',
    url: 'https://tenunansongket.com',
    logo: 'https://tenunansongket.com/icons/icon-512x512.png',
    description: 'Penjual kain songket asli berkualiti tinggi. Warisan budaya Melayu dengan benang emas, 100% handmade. Melayani penghantaran ke Brunei, Malaysia, dan Singapura.',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BN',
      addressRegion: 'Brunei-Muara',
    },
    sameAs: [
      'https://instagram.com/tenunansongkett',
      'https://facebook.com/tenunansongket',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Malay', 'English'],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://tenunansongket.com/products?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
