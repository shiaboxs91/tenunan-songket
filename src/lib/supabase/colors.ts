// Re-export server functions for backward compatibility
// Use colors.server.ts directly for server components
// Use colors.client.ts directly for client components

export {
  getColors,
  getColorBySlug,
  getProductColors,
  getProductsColors
} from './colors.server'
