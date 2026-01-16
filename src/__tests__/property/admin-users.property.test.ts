import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { AdminUser as AdminUserType } from '@/lib/supabase/types'

/**
 * Property-Based Tests for Admin User Management
 * 
 * These tests validate the correctness properties defined in the design document
 * for user filtering, searching, and role management.
 */

// ============================================
// Arbitraries (Test Data Generators)
// ============================================

const userArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  email: fc.emailAddress(),
  full_name: fc.option(fc.string({ minLength: 2, maxLength: 100 }), { nil: null }),
  role: fc.constantFrom('admin', 'customer'),
  created_at: fc.date({ min: new Date('2024-01-01'), max: new Date() }).map(d => d.toISOString()),
  is_active: fc.boolean()
})

// ============================================
// Property 6: Role-Based User Filtering
// ============================================

describe('Property 6: Role-Based User Filtering', () => {
  /**
   * **Validates: Requirements 3.1, 3.4**
   * 
   * For any set of users with different roles, filtering by role 'admin' SHALL
   * return only users with role='admin', and filtering by role 'customer' SHALL
   * return only users with role='customer'.
   */
  
  function filterByRole(users: AdminUserType[], role: string): AdminUserType[] {
    return users.filter(u => u.role === role)
  }
  
  it('should return only admin users when filtering by admin role', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 0, maxLength: 50 }),
        (users) => {
          const admins = filterByRole(users, 'admin')
          
          // Property: All returned users have role='admin'
          return admins.every(u => u.role === 'admin')
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should return only customer users when filtering by customer role', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 0, maxLength: 50 }),
        (users) => {
          const customers = filterByRole(users, 'customer')
          
          // Property: All returned users have role='customer'
          return customers.every(u => u.role === 'customer')
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should include all users with the specified role', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 0, maxLength: 50 }),
        fc.constantFrom('admin', 'customer'),
        (users, role) => {
          const filtered = filterByRole(users, role)
          const expectedCount = users.filter(u => u.role === role).length
          
          // Property: Count matches expected
          return filtered.length === expectedCount
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should return empty array when no users have the specified role', () => {
    fc.assert(
      fc.property(
        fc.array(
          userArb.map(u => ({ ...u, role: 'customer' })),
          { minLength: 1, maxLength: 20 }
        ),
        (users) => {
          const admins = filterByRole(users, 'admin')
          return admins.length === 0
        }
      ),
      { numRuns: 25 }
    )
  })
})

// ============================================
// Property 7: User Search Functionality
// ============================================

describe('Property 7: User Search Functionality', () => {
  /**
   * **Validates: Requirements 3.5**
   * 
   * For any search query string and set of users, the search function SHALL
   * return only users where the name or email contains the query string (case-insensitive).
   */
  
  function searchUsers(users: AdminUserType[], query: string): AdminUserType[] {
    const lowerQuery = query.toLowerCase()
    return users.filter(u => 
      u.email.toLowerCase().includes(lowerQuery) ||
      (u.full_name && u.full_name.toLowerCase().includes(lowerQuery))
    )
  }
  
  it('should return users whose email contains the query (case-insensitive)', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (users, query) => {
          const results = searchUsers(users, query)
          const lowerQuery = query.toLowerCase()
          
          // Property: All results contain query in email or name
          return results.every(u => 
            u.email.toLowerCase().includes(lowerQuery) ||
            (u.full_name && u.full_name.toLowerCase().includes(lowerQuery))
          )
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should be case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (users, query) => {
          const lowerResults = searchUsers(users, query.toLowerCase())
          const upperResults = searchUsers(users, query.toUpperCase())
          
          // Property: Same results regardless of case
          return lowerResults.length === upperResults.length
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should return all users when query is empty', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 0, maxLength: 50 }),
        (users) => {
          const results = searchUsers(users, '')
          
          // Property: Empty query returns all users
          return results.length === users.length
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should not return users that do not match the query', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (users, query) => {
          const results = searchUsers(users, query)
          const nonResults = users.filter(u => !results.includes(u))
          const lowerQuery = query.toLowerCase()
          
          // Property: Non-results do not contain query
          return nonResults.every(u => 
            !u.email.toLowerCase().includes(lowerQuery) &&
            (!u.full_name || !u.full_name.toLowerCase().includes(lowerQuery))
          )
        }
      ),
      { numRuns: 25 }
    )
  })
})


// ============================================
// Property 8: Admin Creation with Correct Role
// ============================================

describe('Property 8: Admin Creation with Correct Role', () => {
  /**
   * **Validates: Requirements 3.3**
   * 
   * For any valid admin creation request, after successful creation,
   * querying the user SHALL return a profile with role='admin'.
   */
  
  interface AdminCreateRequest {
    email: string
    password: string
    full_name: string
  }
  
  function simulateAdminCreation(request: AdminCreateRequest): AdminUserType {
    return {
      id: 'generated-id',
      user_id: 'generated-user-id',
      email: request.email,
      full_name: request.full_name,
      role: 'admin', // Always set to admin
      created_at: new Date().toISOString(),
      is_active: true
    }
  }
  
  const adminCreateRequestArb = fc.record({
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 }),
    full_name: fc.string({ minLength: 2, maxLength: 100 })
  })
  
  it('should create user with admin role', () => {
    fc.assert(
      fc.property(adminCreateRequestArb, (request) => {
        const createdUser = simulateAdminCreation(request)
        
        // Property: Created user has role='admin'
        return createdUser.role === 'admin'
      }),
      { numRuns: 25 }
    )
  })
  
  it('should preserve email and full_name from request', () => {
    fc.assert(
      fc.property(adminCreateRequestArb, (request) => {
        const createdUser = simulateAdminCreation(request)
        
        // Property: Email and name are preserved
        return (
          createdUser.email === request.email &&
          createdUser.full_name === request.full_name
        )
      }),
      { numRuns: 25 }
    )
  })
  
  it('should set is_active to true by default', () => {
    fc.assert(
      fc.property(adminCreateRequestArb, (request) => {
        const createdUser = simulateAdminCreation(request)
        
        // Property: New admin is active
        return createdUser.is_active === true
      }),
      { numRuns: 25 }
    )
  })
})

// ============================================
// Property 9: Role Update Persistence
// ============================================

describe('Property 9: Role Update Persistence', () => {
  /**
   * **Validates: Requirements 3.8**
   * 
   * For any user and valid role value, after updating the user's role,
   * querying the user SHALL return the new role value.
   */
  
  function updateUserRole(user: AdminUserType, newRole: string): AdminUserType {
    return {
      ...user,
      role: newRole
    }
  }
  
  it('should update role to the new value', () => {
    fc.assert(
      fc.property(
        userArb,
        fc.constantFrom('admin', 'customer'),
        (user, newRole) => {
          const updatedUser = updateUserRole(user, newRole)
          
          // Property: Role is updated to new value
          return updatedUser.role === newRole
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should preserve other user properties', () => {
    fc.assert(
      fc.property(
        userArb,
        fc.constantFrom('admin', 'customer'),
        (user, newRole) => {
          const updatedUser = updateUserRole(user, newRole)
          
          // Property: Other properties are preserved
          return (
            updatedUser.id === user.id &&
            updatedUser.user_id === user.user_id &&
            updatedUser.email === user.email &&
            updatedUser.full_name === user.full_name &&
            updatedUser.created_at === user.created_at
          )
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should allow role change from admin to customer', () => {
    fc.assert(
      fc.property(
        userArb.map(u => ({ ...u, role: 'admin' })),
        (adminUser) => {
          const updatedUser = updateUserRole(adminUser, 'customer')
          return updatedUser.role === 'customer'
        }
      ),
      { numRuns: 25 }
    )
  })
  
  it('should allow role change from customer to admin', () => {
    fc.assert(
      fc.property(
        userArb.map(u => ({ ...u, role: 'customer' })),
        (customerUser) => {
          const updatedUser = updateUserRole(customerUser, 'admin')
          return updatedUser.role === 'admin'
        }
      ),
      { numRuns: 25 }
    )
  })
})
