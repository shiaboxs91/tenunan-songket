# Implementation Plan: Address Management Enhancement

## Overview

This implementation plan enhances the address management system with improved validation, inline editing during checkout, country-aware localization, and mobile-optimized UX. The implementation maintains backward compatibility with the existing Supabase database schema and follows a component-based architecture with TypeScript and React.

## Tasks

- [x] 1. Set up validation infrastructure and country configuration
  - Create `src/lib/validation/types.ts` with validation interfaces (ValidationEngine, ValidationResult, ValidationRule, ValidationSchema)
  - Create `src/lib/validation/country-config.ts` with country-specific configurations (Brunei, Malaysia, Singapore, Indonesia)
  - Create `src/lib/validation/validation-engine.ts` implementing the ValidationEngine interface
  - Set up fast-check library for property-based testing
  - _Requirements: 1.1, 2.1, 7.2, 7.4, 8.1, 8.2, 8.3_

- [ ]\* 1.1 Write property test for phone number validation
  - **Property 1: Phone Number Format Validation**
  - **Validates: Requirements 1.1**

- [ ]\* 1.2 Write property test for postal code validation
  - **Property 4: Postal Code Format Validation**
  - **Validates: Requirements 2.1**

- [ ]\* 1.3 Write property test for country-specific validation rules
  - **Property 12: Country-Specific Validation Rules**
  - **Validates: Requirements 7.4, 8.4**

- [x] 2. Implement input sanitization and validation utilities
  - Create `src/lib/validation/sanitization.ts` with sanitization functions
  - Implement special character filtering (preserve hyphens, commas, periods, apostrophes)
  - Implement length truncation logic
  - Implement whitespace trimming
  - Add validation error message generation with format examples
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 1.2, 2.2, 12.4_

- [ ]\* 2.1 Write property test for input sanitization
  - **Property 5: Input Sanitization**
  - **Validates: Requirements 3.1, 3.3**

- [ ]\* 2.2 Write property test for length truncation
  - **Property 6: Length Truncation**
  - **Validates: Requirements 3.2**

- [ ]\* 2.3 Write property test for whitespace trimming
  - **Property 8: Whitespace Trimming**
  - **Validates: Requirements 3.5**

- [ ]\* 2.4 Write property test for validation error messages
  - **Property 2: Validation Error Messages**
  - **Validates: Requirements 1.2, 2.2, 12.4**

- [x] 3. Create CountryContext for country-aware functionality
  - Create `src/contexts/CountryContext.tsx` with CountryContext provider
  - Implement country selection state management
  - Implement getFieldLabel, getValidationRule, getPlaceholder, getHelperText functions
  - Default to Brunei ('BN') for new addresses
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 8.5_

- [ ]\* 3.1 Write property test for country-specific labels
  - **Property 11: Country-Specific Labels**
  - **Validates: Requirements 7.3**

- [ ]\* 3.2 Write property test for form data preservation on country change
  - **Property 13: Form Data Preservation on Country Change**
  - **Validates: Requirements 8.5**

- [x] 4. Checkpoint - Ensure validation and context tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Enhance AddressForm component with validation and country awareness
  - Update `src/components/profile/AddressForm.tsx` to use CountryContext
  - Integrate ValidationEngine for real-time validation (300ms debounce)
  - Add country dropdown selector with Brunei, Malaysia, Singapore, Indonesia options
  - Update field labels dynamically based on selected country
  - Add helper text and placeholder text for phone and postal code fields
  - Implement required field indicators (asterisks)
  - Add legend explaining required field markers
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 11.1, 11.2_

- [ ]\* 5.1 Write property test for required field indicators
  - **Property 14: Required Field Indicators**
  - **Validates: Requirements 6.4, 11.1**

- [ ]\* 5.2 Write unit tests for AddressForm rendering
  - Test Brunei-specific labels display correctly
  - Test helper text appears on field focus
  - Test country dropdown contains all options
  - Test default country is Brunei
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 7.2, 7.5_

- [x] 6. Implement form validation and error handling in AddressForm
  - Add real-time validation on field blur and input change
  - Display error messages below relevant fields
  - Implement form submission blocking when validation errors exist
  - Highlight all fields with errors on submit attempt
  - Clear error messages immediately when user corrects errors
  - Display all validation errors simultaneously
  - _Requirements: 1.4, 2.5, 11.3, 11.5, 12.1, 12.3, 12.5_

- [ ]\* 6.1 Write property test for form submission blocking
  - **Property 3: Form Submission Blocking**
  - **Validates: Requirements 1.4, 2.5, 11.3**

- [ ]\* 6.2 Write property test for error clearing on correction
  - **Property 19: Error Clearing on Correction**
  - **Validates: Requirements 11.5, 12.5**

- [ ]\* 6.3 Write property test for error message placement
  - **Property 20: Error Message Placement**
  - **Validates: Requirements 12.1**

- [ ]\* 6.4 Write property test for multiple error display
  - **Property 21: Multiple Error Display**
  - **Validates: Requirements 12.3**

- [x] 7. Add mobile-optimized layout to AddressForm
  - Implement responsive single-column layout for mobile viewports
  - Create three collapsible sections: "Recipient Information", "Address Details", "Additional Information"
  - Implement progressive disclosure (sections expanded on desktop, collapsible on mobile)
  - Add section completion indicators
  - Ensure touch targets are at least 44x44 pixels
  - Add sticky save button for mobile
  - Set appropriate input types (tel for phone, numeric for postal code)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]\* 7.1 Write property test for touch target sizing
  - **Property 15: Touch Target Sizing**
  - **Validates: Requirements 9.3**

- [ ]\* 7.2 Write property test for appropriate input types
  - **Property 16: Appropriate Input Types**
  - **Validates: Requirements 9.5**

- [ ]\* 7.3 Write property test for section completion indicators
  - **Property 17: Section Completion Indicators**
  - **Validates: Requirements 10.4**

- [ ]\* 7.4 Write property test for independent section toggling
  - **Property 18: Independent Section Toggling**
  - **Validates: Requirements 10.5**

- [ ]\* 7.5 Write unit tests for mobile layout
  - Test single column layout on mobile viewport (375px)
  - Test collapsible sections on mobile
  - Test sticky save button appears on scroll
  - Test sections expanded by default on desktop (1024px)
  - _Requirements: 9.1, 9.2, 9.4, 10.2_

- [x] 8. Implement visual styling and hierarchy for AddressForm
  - Add consistent spacing between sections (16px minimum)
  - Implement visual grouping with borders or background colors
  - Style primary action buttons (Save) with higher prominence than secondary (Cancel)
  - Add color-coded field states (default, focus, error, success)
  - Use red (#DC2626) for error states
  - Add error icons for visual clarity
  - _Requirements: 15.2, 15.5_

- [ ]\* 8.1 Write property test for field state styling
  - **Property 27: Field State Styling**
  - **Validates: Requirements 15.5**

- [ ]\* 8.2 Write unit tests for visual styling
  - Test section spacing is 16px minimum
  - Test error state uses red color
  - Test Save button has higher prominence than Cancel
  - _Requirements: 15.2_

- [x] 9. Checkpoint - Ensure AddressForm enhancements are complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create AddressEditModal component for inline editing
  - Create `src/components/checkout/AddressEditModal.tsx`
  - Implement modal overlay with backdrop
  - Add close functionality (Escape key, click outside with unsaved changes warning)
  - Make modal full-screen on mobile, centered dialog on desktop
  - Implement focus trap for accessibility
  - Embed AddressForm component inside modal
  - _Requirements: 4.2, 4.5_

- [ ]\* 10.1 Write property test for cancel preserves data
  - **Property 10: Cancel Preserves Data**
  - **Validates: Requirements 4.5**

- [ ]\* 10.2 Write unit tests for AddressEditModal
  - Test modal opens when isOpen is true
  - Test modal closes on Escape key
  - Test modal closes on backdrop click (with warning if unsaved changes)
  - Test modal is full-screen on mobile viewport
  - Test focus trap works correctly
  - _Requirements: 4.2_

- [x] 11. Enhance AddressSelector component with inline edit capability
  - Update `src/components/checkout/AddressSelector.tsx`
  - Add "Edit" button next to selected address
  - Integrate AddressEditModal component
  - Implement onAddressUpdated callback to refresh selector after save
  - Ensure user remains in checkout flow after editing
  - Highlight updated address after save
  - _Requirements: 4.1, 4.2, 4.4, 13.2_

- [ ]\* 11.1 Write property test for address update persistence
  - **Property 9: Address Update Persistence**
  - **Validates: Requirements 4.4**

- [ ]\* 11.2 Write unit tests for AddressSelector with edit functionality
  - Test "Edit" button appears next to selected address
  - Test clicking "Edit" opens AddressEditModal
  - Test saving address updates the selector
  - Test user remains in checkout flow after edit
  - Test updated address is highlighted
  - _Requirements: 4.1, 4.2, 4.4, 13.2_

- [x] 12. Update AddressController with sanitization before save
  - Update `src/lib/supabase/address-controller.ts` (or create if doesn't exist)
  - Integrate sanitization functions before database operations
  - Ensure all inputs are sanitized before createAddress and updateAddress
  - Implement default address management (only one default per user)
  - Maintain soft delete functionality using is_deleted flag
  - _Requirements: 3.4, 14.1, 14.5_

- [ ]\* 12.1 Write property test for sanitization before save
  - **Property 7: Sanitization Before Save**
  - **Validates: Requirements 3.4**

- [ ]\* 12.2 Write property test for database schema compatibility
  - **Property 23: Database Schema Compatibility**
  - **Validates: Requirements 14.1**

- [ ]\* 12.3 Write property test for field preservation on update
  - **Property 26: Field Preservation on Update**
  - **Validates: Requirements 14.5**

- [ ]\* 12.4 Write unit tests for AddressController
  - Test createAddress sanitizes inputs before save
  - Test updateAddress sanitizes inputs before save
  - Test setDefaultAddress updates only one default per user
  - Test soft delete sets is_deleted flag
  - _Requirements: 3.4, 14.1_

- [x] 13. Implement backward compatibility for existing addresses
  - Add logic to handle existing addresses that may not meet new validation requirements
  - Allow viewing of legacy addresses without validation errors
  - Apply new validation rules only on save, not on load
  - Preserve all existing address fields during updates
  - _Requirements: 14.2, 14.3, 14.5_

- [ ]\* 13.1 Write property test for legacy address viewing
  - **Property 24: Legacy Address Viewing**
  - **Validates: Requirements 14.2**

- [ ]\* 13.2 Write property test for validation on save only
  - **Property 25: Validation on Save Only**
  - **Validates: Requirements 14.3**

- [ ]\* 13.3 Write unit tests for backward compatibility
  - Test existing addresses without country code can be viewed
  - Test existing addresses with old phone formats can be viewed
  - Test validation only triggers on save attempt
  - Test all fields preserved when updating legacy address
  - _Requirements: 14.2, 14.3, 14.5_

- [x] 14. Add success feedback and notifications
  - Implement success message display after address save
  - Add success message with checkmark icon
  - Implement auto-dismiss after 3 seconds
  - Add specific confirmation message when default address is updated
  - Integrate with existing toast/notification system
  - _Requirements: 13.1, 13.4_

- [ ]\* 14.1 Write property test for success message display
  - **Property 22: Success Message Display**
  - **Validates: Requirements 13.1, 13.4**

- [ ]\* 14.2 Write unit tests for success feedback
  - Test success message appears after save
  - Test success message includes checkmark icon
  - Test default address update shows specific confirmation
  - _Requirements: 13.1, 13.4_

- [x] 15. Implement error handling and network error recovery
  - Add try-catch blocks around all address operations
  - Display user-friendly error messages for network failures
  - Implement retry functionality for failed operations
  - Preserve form data when errors occur
  - Log errors for debugging without exposing to user
  - Add error toast notifications with retry button
  - _Requirements: 12.2_

- [ ]\* 15.1 Write unit tests for error handling
  - Test network error displays user-friendly message
  - Test retry button appears on network error
  - Test form data preserved after error
  - Test errors logged without technical jargon shown to user

- [x] 16. Checkpoint - Ensure all components integrated and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Add TypeScript type definitions and update Supabase types
  - Update `src/lib/supabase/types.ts` with Address interface matching database schema
  - Add AddressFormData, AddressFormState, ValidationResult types
  - Add CountryCode, CountryConfig types
  - Ensure all components use proper TypeScript types
  - _Requirements: 14.1_

- [x] 18. Implement accessibility features
  - Add ARIA labels to all form fields
  - Implement proper keyboard navigation (tab order)
  - Add focus indicators for all interactive elements
  - Ensure error messages are announced to screen readers
  - Add ARIA live regions for dynamic content updates
  - Test with axe-core for WCAG 2.1 AA compliance
  - _Requirements: 11.2, 12.1_

- [ ]\* 18.1 Write unit tests for accessibility
  - Test all form fields have ARIA labels
  - Test keyboard navigation works correctly
  - Test focus indicators are visible
  - Test error announcements work with screen readers
  - Run axe-core automated tests

- [x] 19. Update checkout page to use enhanced AddressSelector
  - Update `src/app/(store)/checkout/page.tsx`
  - Integrate enhanced AddressSelector with inline edit capability
  - Ensure checkout flow remains uninterrupted during address editing
  - Test complete checkout flow with address editing
  - _Requirements: 4.1, 4.2, 4.4_

- [ ]\* 19.1 Write integration tests for checkout flow
  - Test selecting address in checkout
  - Test editing address inline during checkout
  - Test saving edited address updates selector
  - Test checkout flow continues after address edit
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 20. Update profile page with enhanced AddressForm
  - Update `src/app/(store)/profile/page.tsx` or relevant profile component
  - Integrate enhanced AddressForm with validation and country awareness
  - Test adding new address with validation
  - Test editing existing address
  - Test setting default address
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]\* 20.1 Write integration tests for profile address management
  - Test adding new address from profile
  - Test editing existing address from profile
  - Test setting address as default
  - Test validation prevents invalid address save
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 21. Perform cross-browser and mobile device testing
  - Test on Chrome, Firefox, Safari, Edge (latest versions)
  - Test on mobile Safari (iOS 14+)
  - Test on Chrome Mobile (Android 10+)
  - Verify responsive layout on viewports: 320px, 375px, 768px, 1024px
  - Test touch interactions on real mobile devices
  - Verify keyboard types appear correctly on mobile
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 22. Final checkpoint - Complete end-to-end testing
  - Run all unit tests and property-based tests
  - Run integration tests for checkout and profile flows
  - Test backward compatibility with existing addresses
  - Verify all validation rules work correctly for all countries
  - Test error handling and recovery
  - Verify success feedback displays correctly
  - Ensure all accessibility requirements met
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All tests tagged with format: `Feature: address-management-enhancement, Property {N}: {property_text}`
- Checkpoints ensure incremental validation throughout implementation
- Backward compatibility maintained with existing Supabase schema
- Mobile-first approach with responsive design
- TypeScript strict mode enforced throughout
