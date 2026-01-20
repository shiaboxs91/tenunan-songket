export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Shared pagination response type
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          is_deleted: boolean | null
          label: string | null
          phone: string
          postal_code: string
          recipient_name: string
          state: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_deleted?: boolean | null
          label?: string | null
          phone: string
          postal_code: string
          recipient_name: string
          state: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_deleted?: boolean | null
          label?: string | null
          phone?: string
          postal_code?: string
          recipient_name?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          updated_at?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          coupon_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          created_at: string | null
          id: string
          order_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          category_id: string | null
          code: string
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_purchase: number | null
          start_date: string
          type: string
          usage_limit: number | null
          used_count: number | null
          value: number
        }
        Insert: {
          category_id?: string | null
          code: string
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          start_date: string
          type: string
          usage_limit?: number | null
          used_count?: number | null
          value: number
        }
        Update: {
          category_id?: string | null
          code?: string
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          start_date?: string
          type?: string
          usage_limit?: number | null
          used_count?: number | null
          value?: number
        }
        Relationships: []
      }
      inventory_logs: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity_change: number
          reason: string
          reference_id: string | null
          reference_type: string | null
          stock_after: number
          stock_before: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity_change: number
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          stock_after: number
          stock_before: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity_change?: number
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          product_image: string | null
          product_title: string
          quantity: number
          subtotal: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          product_image?: string | null
          product_title: string
          quantity: number
          subtotal: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_image?: string | null
          product_title?: string
          quantity?: number
          subtotal?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          cancel_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          coupon_id: string | null
          created_at: string | null
          currency: string
          delivered_at: string | null
          discount: number | null
          exchange_rate: number | null
          id: string
          insurance_cost: number | null
          notes: string | null
          order_number: string
          paid_at: string | null
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: string | null
          subtotal: number
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          coupon_id?: string | null
          created_at?: string | null
          currency?: string
          delivered_at?: string | null
          discount?: number | null
          exchange_rate?: number | null
          id?: string
          insurance_cost?: number | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: string | null
          subtotal: number
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          coupon_id?: string | null
          created_at?: string | null
          currency?: string
          delivered_at?: string | null
          discount?: number | null
          exchange_rate?: number | null
          id?: string
          insurance_cost?: number | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          exchange_rate: number | null
          expires_at: string | null
          gateway: string
          gateway_checkout_id: string | null
          gateway_payment_intent_id: string | null
          gateway_response: Json | null
          gateway_transaction_id: string | null
          id: string
          method: string
          order_id: string
          paid_at: string | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          exchange_rate?: number | null
          expires_at?: string | null
          gateway: string
          gateway_checkout_id?: string | null
          gateway_payment_intent_id?: string | null
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          method: string
          order_id: string
          paid_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          exchange_rate?: number | null
          expires_at?: string | null
          gateway?: string
          gateway_checkout_id?: string | null
          gateway_payment_intent_id?: string | null
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          method?: string
          order_id?: string
          paid_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_primary: boolean | null
          product_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          product_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          product_id?: string
          url?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          average_rating: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          meta_description: string | null
          meta_title: string | null
          price: number
          reserved_stock: number | null
          review_count: number | null
          sale_price: number | null
          slug: string
          sold: number | null
          source_url: string | null
          stock: number | null
          title: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          price: number
          reserved_stock?: number | null
          review_count?: number | null
          sale_price?: number | null
          slug: string
          sold?: number | null
          source_url?: string | null
          stock?: number | null
          title: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          price?: number
          reserved_stock?: number | null
          review_count?: number | null
          sale_price?: number | null
          slug?: string
          sold?: number | null
          source_url?: string | null
          stock?: number | null
          title?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          images: Json | null
          is_published: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_published?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_published?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shippings: {
        Row: {
          cost: number
          courier: string
          created_at: string | null
          currency: string
          customs_description: string | null
          customs_value: number | null
          delivered_at: string | null
          dimensions: Json | null
          estimated_days: string | null
          id: string
          insurance_cost: number | null
          label_url: string | null
          order_id: string
          service: string
          shipped_at: string | null
          tracking_history: Json | null
          tracking_number: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          cost: number
          courier: string
          created_at?: string | null
          currency?: string
          customs_description?: string | null
          customs_value?: number | null
          delivered_at?: string | null
          dimensions?: Json | null
          estimated_days?: string | null
          id?: string
          insurance_cost?: number | null
          label_url?: string | null
          order_id: string
          service: string
          shipped_at?: string | null
          tracking_history?: Json | null
          tracking_number?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          cost?: number
          courier?: string
          created_at?: string | null
          currency?: string
          customs_description?: string | null
          customs_value?: number | null
          delivered_at?: string | null
          dimensions?: Json | null
          estimated_days?: string | null
          id?: string
          insurance_cost?: number | null
          label_url?: string | null
          order_id?: string
          service?: string
          shipped_at?: string | null
          tracking_history?: Json | null
          tracking_number?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_providers: {
        Row: {
          id: string
          name: string
          code: string
          logo_url: string | null
          services: Json | null
          is_active: boolean | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          logo_url?: string | null
          services?: Json | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          logo_url?: string | null
          services?: Json | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          id: string
          name: string
          code: string
          type: string
          config: Json | null
          instructions: string | null
          is_active: boolean | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          type: string
          config?: Json | null
          instructions?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          type?: string
          config?: Json | null
          instructions?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_versions: {
        Row: {
          id: string
          version: string
          release_notes: string | null
          is_mandatory: boolean | null
          is_current: boolean | null
          released_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          version: string
          release_notes?: string | null
          is_mandatory?: boolean | null
          is_current?: boolean | null
          released_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          version?: string
          release_notes?: string | null
          is_mandatory?: boolean | null
          is_current?: boolean | null
          released_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string
          link_url: string | null
          order_index: number
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url: string
          link_url?: string | null
          order_index?: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string
          link_url?: string | null
          order_index?: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      commit_inventory: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_reference_id: string
          p_reference_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      generate_order_number: { Args: Record<string, never>; Returns: string }
      release_inventory: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_reference_id: string
          p_reference_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      reserve_inventory: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_reference_id: string
          p_reference_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      validate_coupon: {
        Args: {
          p_category_id?: string
          p_code: string
          p_subtotal: number
          p_user_id: string
        }
        Returns: {
          coupon_id: string
          discount_amount: number
          error_message: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// ============================================
// Admin Panel Enhancement Types
// ============================================

// Site Settings Types
export interface SiteSettingsGeneral {
  site_name: string
  tagline: string
  logo_url: string
  favicon_url: string
}

export interface SiteSettingsContact {
  email: string
  phone: string
  whatsapp: string
  address: string
}

export interface SiteSettingsSocial {
  instagram: string
  facebook: string
  twitter: string
  tiktok: string
}

export interface SiteSettingsSEO {
  meta_title: string
  meta_description: string
  keywords: string[]
}

export interface SiteSettings {
  general: SiteSettingsGeneral
  contact: SiteSettingsContact
  social: SiteSettingsSocial
  seo: SiteSettingsSEO
}

// Shipping Provider Types
export interface ShippingService {
  code: string
  name: string
  estimated_days: string
  base_cost: number
  cost_per_kg?: number
}

export interface ShippingProvider {
  id: string
  name: string
  code: string
  logo_url: string | null
  services: ShippingService[]
  is_active: boolean
  display_order: number
  created_at: string | null
  updated_at: string | null
}

export interface ShippingProviderCreate {
  name: string
  code: string
  logo_url?: string | null
  services?: ShippingService[]
  is_active?: boolean
  display_order?: number
}

export interface ShippingProviderUpdate {
  name?: string
  code?: string
  logo_url?: string | null
  services?: ShippingService[]
  is_active?: boolean
  display_order?: number
}

// Payment Method Types
export interface StripeConfig {
  publishable_key: string
  secret_key: string
  webhook_secret?: string
}

export interface BankAccount {
  bank_name: string
  account_number: string
  account_holder: string
}

export interface BankTransferConfig {
  bank_accounts: BankAccount[]
}

export interface ManualPaymentConfig {
  max_amount?: number
  available_areas?: string[]
}

export type PaymentMethodType = 'stripe' | 'bank_transfer' | 'manual'

export interface PaymentMethod {
  id: string
  name: string
  code: string
  type: PaymentMethodType
  config: StripeConfig | BankTransferConfig | ManualPaymentConfig | null
  instructions: string | null
  is_active: boolean
  display_order: number
  created_at: string | null
  updated_at: string | null
}

export interface PaymentMethodCreate {
  name: string
  code: string
  type: PaymentMethodType
  config?: StripeConfig | BankTransferConfig | ManualPaymentConfig | null
  instructions?: string | null
  is_active?: boolean
  display_order?: number
}

export interface PaymentMethodUpdate {
  name?: string
  code?: string
  type?: PaymentMethodType
  config?: StripeConfig | BankTransferConfig | ManualPaymentConfig | null
  instructions?: string | null
  is_active?: boolean
  display_order?: number
}

// Safe payment method for client (without secret keys)
export interface PaymentMethodPublic {
  id: string
  name: string
  code: string
  type: PaymentMethodType
  config: Omit<StripeConfig, 'secret_key' | 'webhook_secret'> | BankTransferConfig | ManualPaymentConfig | null
  instructions: string | null
  is_active: boolean
  display_order: number
}

// App Version Types
export interface AppVersion {
  id: string
  version: string
  release_notes: string | null
  is_mandatory: boolean
  is_current: boolean
  released_at: string | null
  created_at: string | null
}

export interface AppVersionCreate {
  version: string
  release_notes?: string | null
  is_mandatory?: boolean
  is_current?: boolean
  released_at?: string | null
}

export interface AppVersionUpdate {
  version?: string
  release_notes?: string | null
  is_mandatory?: boolean
  is_current?: boolean
  released_at?: string | null
}

export interface VersionCheckResult {
  current_version: string
  client_version: string
  requires_update: boolean
  is_mandatory: boolean
  release_notes: string | null
}

// Enhanced Dashboard Types
export interface LowStockProduct {
  id: string
  title: string
  slug: string
  stock: number
  reserved_stock: number
  available_stock: number
  image_url: string | null
}

export interface TopProduct {
  id: string
  title: string
  slug: string
  sold: number
  revenue: number
  image_url: string | null
}

export interface RevenueComparison {
  today: number
  yesterday: number
  thisWeek: number
  lastWeek: number
  thisMonth: number
  lastMonth: number
}

export interface OrderStatusCounts {
  pending_payment: number
  paid: number
  processing: number
  shipped: number
  delivered: number
  completed: number
  cancelled: number
  refunded: number
}

export interface EnhancedDashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  revenueComparison: RevenueComparison
  orderStatusCounts: OrderStatusCounts
  lowStockProducts: LowStockProduct[]
  topProducts: TopProduct[]
}

// Admin User Types
export interface AdminUser {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: string
  created_at: string | null
  is_active: boolean
}

export interface AdminUserCreate {
  email: string
  password: string
  full_name: string
}

export interface AdminUserUpdate {
  full_name?: string
  is_active?: boolean
}

// Customer with stats
export interface CustomerWithStats {
  id: string
  user_id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string | null
  total_orders: number
  total_spent: number
}
