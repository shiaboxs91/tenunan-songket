// Supabase clients
export { createClient } from './client'
export { createClient as createServerClient } from './server'

// Types
export type { Database, Tables, TablesInsert, TablesUpdate, Json, PaginatedResponse } from './types'

// Auth
export * from './auth'

// Middleware utilities (for use in Next.js middleware)
export {
  createMiddlewareClient,
  handleAuth,
  isProtectedRoute,
  isAdminRoute,
  isAuthRoute,
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  AUTH_ROUTES,
} from './middleware'

// Products & Categories
export * from './products'
export * from './categories'

// Cart
export * from './cart'

// Orders
export * from './orders'

// Profiles & Addresses
export * from './profiles'
export * from './addresses'

// Wishlist
export * from './wishlist'

// Reviews
export * from './reviews'

// Adapters
export * from './adapters'
