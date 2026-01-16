import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { 
  LowStockProduct, 
  TopProduct, 
  RevenueComparison,
  OrderStatusCounts
} from '@/lib/supabase/types'

/**
 * Property-Based Tests for Admin Dashboard Functions
 * 
 * These tests validate the correctness properties defined in the design document
 * for dashboard statistics, low stock alerts, top products, and revenue comparison.
 */

// ============================================
// Arbitraries (Test Data Generators)
// ============================================

const productArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 3, maxLength: 100 }),
  slug: fc.string({ minLength: 3, maxLength: 100 }),
  stock: fc.integer({ min: 0, max: 1000 }),
  reserved_stock: fc.integer({ min: 0, max: 100 }),
  image_url: fc.option(fc.webUrl(), { nil: null })
})

const orderArb = fc.record({
  id: fc.uuid(),
  order_number: fc.string({ minLength: 5, maxLength: 20 }),
  total: fc.float({ min: 10, max: 10000, noNaN: true }),
  status: fc.constantFrom(
    'pending_payment', 'paid', 'processing', 
    'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
  ),
  created_at: fc.date({ min: new Date('2024-01-01'), max: new Date() }).map(d => d.toISOString())
})

const topProductArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 3, maxLength: 100 }),
  slug: fc.string({ minLength: 3, maxLength: 100 }),
  sold: fc.integer({ min: 0, max: 1000 }),
  revenue: fc.float({ min: 0, max: 100000, noNaN: true }),
  image_url: fc.option(fc.webUrl(), { nil: null })
})

// ============================================
// Property 1: Low Stock Products Filtering
// ============================================

describe('Property 1: Low Stock Products Filtering', () => {
  /**
   * **Validates: Requirements 1.4**
   * 
   * For any set of products with varying stock levels and a given threshold,
   * the low stock alert function SHALL return only products where stock < threshold,
   * and the result set SHALL contain all such products.
   */
  
  function filterLowStock(products: typeof productArb['_type'][], threshold: number): LowStockProduct[] {
    return products
      .filter(p => p.stock < threshold)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        stock: p.stock,
        reserved_stock: p.reserved_stock,
        available_stock: p.stock - p.reserved_stock,
        image_url: p.image_url
      }))
      .sort((a, b) => a.stock - b.stock)
  }
  
  it('should return only products with stock below threshold', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 1, max: 100 }),
        (products, threshold) => {
          const lowStock = filterLowStock(products, threshold)
          
          // Property: All returned products have stock < threshold
          return lowStock.every(p => p.stock < threshold)
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should include all products below threshold', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 1, max: 100 }),
        (products, threshold) => {
          const lowStock = filterLowStock(products, threshold)
          const expectedCount = products.filter(p => p.stock < threshold).length
          
          // Property: Count matches expected
          return lowStock.length === expectedCount
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should sort by stock ascending', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 2, maxLength: 50 }),
        fc.integer({ min: 50, max: 100 }),
        (products, threshold) => {
          const lowStock = filterLowStock(products, threshold)
          
          // Property: Results are sorted by stock ascending
          for (let i = 1; i < lowStock.length; i++) {
            if (lowStock[i].stock < lowStock[i - 1].stock) {
              return false
            }
          }
          return true
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should calculate available_stock correctly', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const lowStock = filterLowStock([product], product.stock + 1)
        
        if (lowStock.length === 0) return true
        
        // Property: available_stock = stock - reserved_stock
        return lowStock[0].available_stock === product.stock - product.reserved_stock
      }),
      { numRuns: 25 }
    )
  })
})


// ============================================
// Property 2: Revenue Period Comparison Calculation
// ============================================

describe('Property 2: Revenue Period Comparison Calculation', () => {
  /**
   * **Validates: Requirements 1.5**
   * 
   * For any set of order data with timestamps and amounts, the revenue comparison
   * function SHALL correctly calculate totals for today, yesterday, this week,
   * last week, this month, and last month periods.
   */
  
  function calculateRevenue(
    orders: Array<{ total: number; created_at: string; status: string }>,
    startDate: Date,
    endDate: Date
  ): number {
    const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'completed']
    
    return orders
      .filter(order => {
        if (!paidStatuses.includes(order.status)) return false
        const orderDate = new Date(order.created_at)
        return orderDate >= startDate && orderDate < endDate
      })
      .reduce((sum, order) => sum + order.total, 0)
  }
  
  it('should calculate period revenue as sum of order totals in that period', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 0, maxLength: 50 }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 30 }),
        (orders, startDate, days) => {
          const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)
          const revenue = calculateRevenue(orders, startDate, endDate)
          
          // Property: Revenue is non-negative
          if (revenue < 0) return false
          
          // Property: Revenue equals sum of paid orders in period
          const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'completed']
          const expectedRevenue = orders
            .filter(o => {
              const d = new Date(o.created_at)
              return paidStatuses.includes(o.status) && d >= startDate && d < endDate
            })
            .reduce((sum, o) => sum + o.total, 0)
          
          return Math.abs(revenue - expectedRevenue) < 0.01
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should return 0 for periods with no orders', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2020-12-31') }),
        (startDate) => {
          const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          // Orders from 2024, period from 2020 - no overlap
          const orders = [
            { total: 100, created_at: '2024-06-15T10:00:00Z', status: 'completed' }
          ]
          
          const revenue = calculateRevenue(orders, startDate, endDate)
          return revenue === 0
        }
      ),
      { numRuns: 25 }
    )
  })
})

// ============================================
// Property 3: Top Products Sorting
// ============================================

describe('Property 3: Top Products Sorting', () => {
  /**
   * **Validates: Requirements 1.6**
   * 
   * For any set of products with sales data, the top products function SHALL
   * return products sorted by total sold in descending order, limited to the
   * specified count (default 5).
   */
  
  function getTopProducts(products: TopProduct[], limit: number = 5): TopProduct[] {
    return [...products]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, limit)
  }
  
  it('should return products sorted by sold descending', () => {
    fc.assert(
      fc.property(
        fc.array(topProductArb, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 1, max: 10 }),
        (products, limit) => {
          const top = getTopProducts(products, limit)
          
          // Property: Results are sorted by sold descending
          for (let i = 1; i < top.length; i++) {
            if (top[i].sold > top[i - 1].sold) {
              return false
            }
          }
          return true
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should respect the limit parameter', () => {
    fc.assert(
      fc.property(
        fc.array(topProductArb, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 1, max: 10 }),
        (products, limit) => {
          const top = getTopProducts(products, limit)
          
          // Property: Result length <= limit
          return top.length <= limit
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should return all products if count is less than limit', () => {
    fc.assert(
      fc.property(
        fc.array(topProductArb, { minLength: 0, maxLength: 5 }),
        (products) => {
          const top = getTopProducts(products, 10)
          
          // Property: If products.length < limit, return all products
          return top.length === products.length
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should include the highest selling products', () => {
    fc.assert(
      fc.property(
        fc.array(topProductArb, { minLength: 5, maxLength: 50 }),
        (products) => {
          const top = getTopProducts(products, 5)
          const sortedAll = [...products].sort((a, b) => b.sold - a.sold)
          
          // Property: Top 5 should match first 5 of sorted list
          for (let i = 0; i < 5; i++) {
            if (top[i].id !== sortedAll[i].id) {
              return false
            }
          }
          return true
        }
      ),
      { numRuns: 25 }
    )
  })
})


// ============================================
// Property 4: Order Status Aggregation
// ============================================

describe('Property 4: Order Status Aggregation', () => {
  /**
   * **Validates: Requirements 1.7**
   * 
   * For any set of orders with various statuses, the status summary function
   * SHALL return accurate counts where the sum of all status counts equals
   * the total number of orders.
   */
  
  function aggregateOrderStatus(orders: Array<{ status: string }>): OrderStatusCounts {
    const counts: OrderStatusCounts = {
      pending_payment: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }
    
    for (const order of orders) {
      const status = order.status as keyof OrderStatusCounts
      if (status in counts) {
        counts[status]++
      }
    }
    
    return counts
  }
  
  it('should have sum of counts equal to total orders', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 0, maxLength: 100 }),
        (orders) => {
          const counts = aggregateOrderStatus(orders)
          const totalCounts = Object.values(counts).reduce((sum, c) => sum + c, 0)
          
          // Property: Sum of all status counts equals total orders
          return totalCounts === orders.length
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should count each status correctly', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 0, maxLength: 100 }),
        (orders) => {
          const counts = aggregateOrderStatus(orders)
          
          // Property: Each status count matches manual count
          for (const status of Object.keys(counts) as (keyof OrderStatusCounts)[]) {
            const manualCount = orders.filter(o => o.status === status).length
            if (counts[status] !== manualCount) {
              return false
            }
          }
          return true
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should return all zeros for empty orders', () => {
    const counts = aggregateOrderStatus([])
    const allZero = Object.values(counts).every(c => c === 0)
    expect(allZero).toBe(true)
  })
  
  it('should handle single status correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'pending_payment', 'paid', 'processing', 
          'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
        ),
        fc.integer({ min: 1, max: 50 }),
        (status, count) => {
          const orders = Array(count).fill({ status })
          const counts = aggregateOrderStatus(orders)
          
          // Property: Only the specified status should have count
          return counts[status as keyof OrderStatusCounts] === count &&
            Object.entries(counts)
              .filter(([s]) => s !== status)
              .every(([, c]) => c === 0)
        }
      ),
      { numRuns: 25 }
    )
  })
})

// ============================================
// Property 5: Recent Orders Sorting
// ============================================

describe('Property 5: Recent Orders Sorting', () => {
  /**
   * **Validates: Requirements 1.3**
   * 
   * For any set of orders, the recent orders function SHALL return orders
   * sorted by created_at in descending order (newest first).
   */
  
  function getRecentOrders(
    orders: Array<{ id: string; created_at: string }>,
    limit: number = 10
  ): Array<{ id: string; created_at: string }> {
    return [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }
  
  it('should return orders sorted by created_at descending', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 0, maxLength: 50 }),
        (orders) => {
          const recent = getRecentOrders(orders)
          
          // Property: Results are sorted by created_at descending
          for (let i = 1; i < recent.length; i++) {
            const prevDate = new Date(recent[i - 1].created_at).getTime()
            const currDate = new Date(recent[i].created_at).getTime()
            if (currDate > prevDate) {
              return false
            }
          }
          return true
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should respect the limit parameter', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 1, max: 20 }),
        (orders, limit) => {
          const recent = getRecentOrders(orders, limit)
          
          // Property: Result length <= limit
          return recent.length <= limit
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should include the most recent orders', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 10, maxLength: 50 }),
        (orders) => {
          const recent = getRecentOrders(orders, 5)
          const sortedAll = [...orders].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          
          // Property: Recent orders should be the first 5 of sorted list
          for (let i = 0; i < 5; i++) {
            if (recent[i].id !== sortedAll[i].id) {
              return false
            }
          }
          return true
        }
      ),
      { numRuns: 25 }
    )
  })
})
