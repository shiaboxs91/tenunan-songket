/**
 * Validation types for address management
 * Feature: address-management-enhancement
 */

/**
 * Result of a single field validation
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  sanitizedValue?: string;
}

/**
 * Result of a complete form validation
 */
export interface FormValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
}

/**
 * Types of validation rules
 */
export type ValidationRuleType = 'required' | 'pattern' | 'maxLength' | 'custom';

/**
 * A single validation rule
 */
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

/**
 * Schema for validating a field
 */
export interface ValidationSchema {
  field: string;
  rules: ValidationRule[];
}

/**
 * Field types for sanitization
 */
export type FieldType = 
  | 'text' 
  | 'phone' 
  | 'postalCode' 
  | 'email' 
  | 'address';

/**
 * Address form data structure
 */
export interface AddressFormData {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

/**
 * Validation engine interface
 */
export interface ValidationEngine {
  /**
   * Validate a single field
   */
  validateField(
    fieldName: string,
    value: string,
    countryCode: string
  ): ValidationResult;

  /**
   * Validate an entire form
   */
  validateForm(
    formData: AddressFormData,
    countryCode: string
  ): FormValidationResult;

  /**
   * Sanitize user input
   */
  sanitizeInput(
    value: string,
    fieldType: FieldType
  ): string;
}
