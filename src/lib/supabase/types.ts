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
