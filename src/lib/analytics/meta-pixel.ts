declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

export const trackEvent = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data)
  }
}

export const trackCustomEvent = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', event, data)
  }
}

export const trackViewContent = (product: {
  id: string
  name: string
  price: number
  currency?: string
  category?: string
}) => {
  trackEvent('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    content_category: product.category,
    value: product.price,
    currency: product.currency || 'BND',
  })
}

export const trackAddToCart = (product: {
  id: string
  name: string
  price: number
  quantity: number
  currency?: string
}) => {
  trackEvent('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * product.quantity,
    currency: product.currency || 'BND',
    num_items: product.quantity,
  })
}

export const trackPurchase = (order: {
  id: string
  total: number
  currency?: string
  items: Array<{ id: string; quantity: number; price: number }>
}) => {
  trackEvent('Purchase', {
    content_ids: order.items.map(i => i.id),
    content_type: 'product',
    value: order.total,
    currency: order.currency || 'BND',
    num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
  })
}

export const trackSearch = (query: string) => {
  trackEvent('Search', { search_string: query })
}

export const trackInitiateCheckout = (cart: {
  total: number
  currency?: string
  items: Array<{ id: string; quantity: number }>
}) => {
  trackEvent('InitiateCheckout', {
    content_ids: cart.items.map(i => i.id),
    content_type: 'product',
    value: cart.total,
    currency: cart.currency || 'BND',
    num_items: cart.items.reduce((sum, i) => sum + i.quantity, 0),
  })
}

export const trackAddToWishlist = (product: {
  id: string
  name: string
  price: number
  currency?: string
}) => {
  trackEvent('AddToWishlist', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: product.currency || 'BND',
  })
}

export const trackCompleteRegistration = (method?: string) => {
  trackEvent('CompleteRegistration', {
    content_name: 'User Registration',
    status: true,
    ...(method && { registration_method: method }),
  })
}

export const trackContact = () => {
  trackEvent('Contact')
}

export const trackLead = (value?: number) => {
  trackEvent('Lead', {
    ...(value && { value, currency: 'BND' }),
  })
}
