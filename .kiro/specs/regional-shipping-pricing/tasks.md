# Implementation Plan: Regional Shipping Pricing Enhancement

## Overview

This implementation plan converts the regional shipping pricing design into actionable coding tasks. The approach follows an incremental strategy: first establishing the core data structures and region detection logic, then implementing the shipping calculation with regional pricing, updating the UI components, and finally adding the new shipping providers through database migrations. Each task builds on previous work to ensure continuous integration and early validation.

## Tasks

- [x] 1. Create regional pricing type definitions and state mapping configuration
  - Create `src/lib/shipping/types.ts` with Region, RegionalPricing, ShippingService, ShippingProvider, RegionDetectionResult, ShippingCalculationInput, and ShippingCalculationResult interfaces
  - Create `src/lib/shipping/region-mapping.ts` with REGION_MAPPING constant containing all Malaysian states, Singapore, and Brunei mappings
  - Implement `stateToRegion()`, `getRegionName()`, and `getAllRegions()` utility functions
  - Update `src/lib/supabase/types.ts` to export the new shipping types
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 12.1, 12.2, 12.3, 12.4_

- [ ]\* 1.1 Write property test for state-to-region mapping
  - **Property 2: State-to-Region Mapping Correctness**
  - **Validates: Requirements 2.1, 2.6, 13.1**

- [ ]\* 1.2 Write property test for case-insensitive state code matching
  - **Property 5: Case-Insensitive State Code Matching**
  - **Validates: Requirements 3.4**

- [ ]\* 1.3 Write property test for invalid state code handling
  - **Property 6: Invalid State Code Handling**
  - **Validates: Requirements 3.3, 13.6**

- [x] 2. Implement RegionDetector class
  - Create `src/lib/shipping/region-detector.ts` with RegionDetector class
  - Implement `detectRegionFromAddress()` method that tries state code first, then country code
  - Implement `validateRegion()` method to check if a region code is valid
  - Implement `getRegionFromStateCode()` method as a direct state-to-region lookup
  - Return RegionDetectionResult with confidence levels (high, low, none) and source tracking
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]\* 2.1 Write unit tests for RegionDetector edge cases
  - Test empty strings, null values, whitespace-only inputs
  - Test special characters in state codes
  - Test addresses with both state and country codes
  - _Requirements: 3.3_

- [x] 3. Implement ShippingCalculator class with regional pricing support
  - Create `src/lib/shipping/calculator.ts` with ShippingCalculator class
  - Implement `calculateShipping()` method that detects region if not provided and applies regional pricing
  - Implement private `getRegionalPrice()` method that finds matching regional pricing or falls back to base_cost
  - Implement `filterProvidersByRegion()` method that filters services based on regional availability
  - Handle minimum base_cost when specified in regional pricing (use Math.max)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]\* 3.1 Write property test for base cost fallback
  - **Property 1: Base Cost Fallback**
  - **Validates: Requirements 1.3, 1.4, 4.2, 4.3, 10.1, 14.4**

- [ ]\* 3.2 Write property test for regional pricing precedence
  - **Property 3: Regional Pricing Precedence**
  - **Validates: Requirements 4.1, 14.3**

- [ ]\* 3.3 Write property test for cost calculation formula
  - **Property 4: Cost Calculation Formula**
  - **Validates: Requirements 4.4, 4.5, 14.1**

- [ ]\* 3.4 Write property test for non-negative cost invariant
  - **Property 9: Non-Negative Cost Invariant**
  - **Validates: Requirements 14.2**

- [ ]\* 3.5 Write property test for backward compatibility
  - **Property 12: Backward Compatibility**
  - **Validates: Requirements 10.2, 10.3**

- [x] 4. Checkpoint - Ensure core logic tests pass
  - Run all property tests and unit tests for region detection and shipping calculation
  - Verify type safety with TypeScript compiler
  - Ask the user if questions arise

- [x] 5. Update existing shipping functions to use new calculator
  - Modify `src/lib/supabase/shipping.ts` to import and use ShippingCalculator
  - Update `calculateShipping()` function to accept address information for region detection
  - Ensure backward compatibility with existing code that doesn't provide region information
  - Update function signatures to accept ShippingCalculationInput
  - _Requirements: 4.1, 4.2, 4.3, 10.1, 10.2, 10.3_

- [ ]\* 5.1 Write integration tests for shipping calculation
  - Test end-to-end flow from address to calculated shipping cost
  - Test with providers that have regional pricing
  - Test with providers that don't have regional pricing
  - Test with mixed providers
  - _Requirements: 10.2, 10.3_

- [x] 6. Update ShippingSelector component with regional pricing display
  - Modify `src/components/checkout/ShippingSelector.tsx` to use RegionDetector
  - Add state for `detectedRegion`, `manualRegion`, and `showRegionSelector`
  - Implement region detection on address change using useEffect
  - Display detected region name with "Change Region" button
  - Show manual region selector when detection fails or user clicks "Change Region"
  - Filter providers using ShippingCalculator.filterProvidersByRegion()
  - Display regional pricing information (region name, cost per kg) for each service
  - Format costs in BND with 2 decimal places
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]\* 6.1 Write property test for provider filtering by region
  - **Property 8: Provider Filtering by Region**
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ]\* 6.2 Write unit tests for ShippingSelector UI interactions
  - Test region selector display when detection fails
  - Test manual region selection updates shipping costs
  - Test "Change Region" button functionality
  - Test address change triggers re-detection
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 7. Create database migration to add Skynet provider with regional pricing
  - Use Supabase MCP `apply_migration` tool to create migration
  - Migration name: `add_skynet_regional_pricing`
  - Insert Skynet provider with code "skynet", is_active=true, display_order=10
  - Add Standard service with regional_pricing array for semenanjung (132000 BND/kg), sabah (142000 BND/kg), and sarawak (142000 BND/kg)
  - Include all Semenanjung state codes in the regional pricing configuration
  - Set estimated_days to "2-3 hari"
  - Make migration idempotent using ON CONFLICT DO UPDATE or conditional INSERT
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 11.1, 11.3, 11.4, 11.5_

- [x] 8. Create database migration to add SF-Express provider with regional pricing
  - Use Supabase MCP `apply_migration` tool to create migration
  - Migration name: `add_sf_express_regional_pricing`
  - Insert SF-Express provider with code "sf-express", is_active=true, display_order=11
  - Add logo_url: "https://htm.sf-express.com/logo.png" (or appropriate logo URL)
  - Add Standard service with regional_pricing array for singapore (107000 BND/kg)
  - Set estimated_days to "2-4 hari"
  - Make migration idempotent using ON CONFLICT DO UPDATE or conditional INSERT
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 11.2, 11.3, 11.4, 11.5_

- [ ]\* 8.1 Write property test for migration idempotence
  - **Property 11: Migration Idempotence**
  - **Validates: Requirements 11.5**

- [x] 9. Verify database migrations and test with real data
  - Run migrations using Supabase MCP
  - Query shipping_providers table to verify Skynet and SF-Express are inserted correctly
  - Verify JSONB services structure matches the design
  - Test that existing providers are unchanged
  - Verify regional_pricing arrays contain all required fields
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10. Create custom generators for property-based testing
  - Create `src/lib/shipping/__tests__/generators.ts` with fast-check generators
  - Implement `regionArb` for generating valid Region values
  - Implement `stateCodeArb` for generating valid state codes
  - Implement `regionalPricingArb` for generating RegionalPricing objects
  - Implement `shippingServiceArb` for generating ShippingService objects with optional regional pricing
  - Implement `weightArb` for generating valid weight values (0-100kg)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]\* 10.1 Write property test for regional pricing data structure validation
  - **Property 7: Regional Pricing Data Structure Validation**
  - **Validates: Requirements 1.2**

- [ ]\* 10.2 Write property test for service sorting by display order
  - **Property 10: Service Sorting by Display Order**
  - **Validates: Requirements 8.4**

- [x] 11. Final checkpoint - End-to-end testing and validation
  - Test complete checkout flow with addresses from each region
  - Verify Skynet shows correct rates for Semenanjung, Sabah, and Sarawak
  - Verify SF-Express shows correct rate for Singapore
  - Test manual region selection when auto-detection fails
  - Test backward compatibility with existing providers without regional pricing
  - Verify all property tests pass with 100+ iterations
  - Run TypeScript compiler to ensure type safety
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Use Supabase MCP for all database operations (migrations, queries, verification)
- The design uses TypeScript, so all code should be written in TypeScript
- Regional pricing is stored in JSONB format to avoid schema changes
- Backward compatibility is maintained throughout - services without regional_pricing continue to work
