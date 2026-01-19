/**
 * Input sanitization utilities for address management
 * Feature: address-management-enhancement
 * 
 * This module provides functions for sanitizing user input to ensure
 * data quality and security while preserving valid special characters.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5, 1.2, 2.2, 12.4
 */

import { FieldType } from './types';

/**
 * Safe special characters that should be preserved in address fields
 * Requirement 3.3: Preserve hyphens, commas, periods, apostrophes
 */
const SAFE_SPECIAL_CHARS = /[-,.']/;

/**
 * Maximum field lengths
 * Requirement 3.2: Length truncation logic
 */
export const FIELD_MAX_LENGTHS: Record<string, number> = {
  label: 50,
  recipientName: 100,
  addressLine1: 200,
  addressLine2: 200,
  city: 100,
  state: 100,
  phone: 20,
  postalCode: 10,
};

/**
 * Sanitize text input by removing harmful characters while preserving safe ones
 * 
 * Requirements:
 * - 3.1: Remove potentially harmful special characters
 * - 3.3: Preserve valid special characters (hyphens, commas, periods, apostrophes)
 * - 3.5: Trim leading and trailing whitespace
 * 
 * @param value - The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeText(value: string): string {
  if (!value) return '';

  // Trim whitespace (Requirement 3.5)
  let sanitized = value.trim();

  // Remove harmful characters but preserve safe special chars
  // Keep: letters, numbers, spaces, hyphens, commas, periods, apostrophes
  // Remove: all other special characters that could be harmful
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-,.']/g, '');

  // Normalize multiple spaces to single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Sanitize phone number input
 * 
 * Requirements:
 * - 3.1: Remove potentially harmful characters
 * - 3.3: Preserve hyphens for phone formatting
 * - 3.5: Trim whitespace
 * 
 * @param value - The phone number string to sanitize
 * @returns The sanitized phone number
 */
export function sanitizePhone(value: string): string {
  if (!value) return '';

  // Trim whitespace (Requirement 3.5)
  let sanitized = value.trim();

  // Allow only digits, plus sign, and hyphens
  sanitized = sanitized.replace(/[^\d+\-]/g, '');

  return sanitized;
}

/**
 * Sanitize postal code input
 * 
 * Requirements:
 * - 3.1: Remove potentially harmful characters
 * - 3.5: Trim whitespace
 * 
 * @param value - The postal code string to sanitize
 * @returns The sanitized postal code (uppercase)
 */
export function sanitizePostalCode(value: string): string {
  if (!value) return '';

  // Trim whitespace (Requirement 3.5)
  let sanitized = value.trim();

  // Allow only alphanumeric characters
  sanitized = sanitized.replace(/[^A-Za-z0-9]/g, '');

  // Convert to uppercase for consistency
  sanitized = sanitized.toUpperCase();

  return sanitized;
}

/**
 * Sanitize address line input
 * 
 * Requirements:
 * - 3.1: Remove potentially harmful characters
 * - 3.3: Preserve hyphens, commas, periods, apostrophes
 * - 3.5: Trim whitespace
 * 
 * @param value - The address line string to sanitize
 * @returns The sanitized address line
 */
export function sanitizeAddress(value: string): string {
  if (!value) return '';

  // Trim whitespace (Requirement 3.5)
  let sanitized = value.trim();

  // Remove harmful characters but preserve safe special chars
  // Keep: letters, numbers, spaces, hyphens, commas, periods, apostrophes
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-,.']/g, '');

  // Normalize multiple spaces to single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Truncate string to maximum length
 * 
 * Requirement 3.2: Truncate input at character limit
 * 
 * @param value - The string to truncate
 * @param maxLength - Maximum allowed length
 * @returns The truncated string
 */
export function truncateToLength(value: string, maxLength: number): string {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  
  return value.substring(0, maxLength);
}

/**
 * Trim leading and trailing whitespace from all text fields
 * 
 * Requirement 3.5: Trim leading and trailing whitespace
 * 
 * @param value - The string to trim
 * @returns The trimmed string
 */
export function trimWhitespace(value: string): string {
  if (!value) return '';
  return value.trim();
}

/**
 * Sanitize input based on field type
 * 
 * Requirements:
 * - 3.1: Remove potentially harmful special characters
 * - 3.2: Truncate at character limit
 * - 3.3: Preserve valid special characters
 * - 3.5: Trim whitespace
 * 
 * @param value - The input string to sanitize
 * @param fieldType - The type of field being sanitized
 * @param fieldName - Optional field name for length constraints
 * @returns The sanitized string
 */
export function sanitizeInput(
  value: string,
  fieldType: FieldType,
  fieldName?: string
): string {
  if (!value) return '';

  let sanitized: string;

  // Apply field-type specific sanitization
  switch (fieldType) {
    case 'phone':
      sanitized = sanitizePhone(value);
      break;

    case 'postalCode':
      sanitized = sanitizePostalCode(value);
      break;

    case 'address':
      sanitized = sanitizeAddress(value);
      break;

    case 'text':
      sanitized = sanitizeText(value);
      break;

    case 'email':
      // Email sanitization (allow email-safe characters)
      sanitized = value.trim().replace(/[^a-zA-Z0-9@._\-]/g, '');
      break;

    default:
      sanitized = sanitizeText(value);
  }

  // Apply length truncation if field name is provided
  if (fieldName && FIELD_MAX_LENGTHS[fieldName]) {
    sanitized = truncateToLength(sanitized, FIELD_MAX_LENGTHS[fieldName]);
  }

  return sanitized;
}

/**
 * Check if a character is a safe special character
 * 
 * Requirement 3.3: Identify safe special characters
 * 
 * @param char - The character to check
 * @returns True if the character is safe
 */
export function isSafeSpecialChar(char: string): boolean {
  return SAFE_SPECIAL_CHARS.test(char);
}

/**
 * Remove all special characters except safe ones
 * 
 * Requirements:
 * - 3.1: Remove potentially harmful special characters
 * - 3.3: Preserve safe special characters
 * 
 * @param value - The string to filter
 * @returns The filtered string with only safe characters
 */
export function filterSpecialCharacters(value: string): string {
  if (!value) return '';

  // Keep alphanumeric, spaces, and safe special characters
  return value.replace(/[^a-zA-Z0-9\s\-,.']/g, '');
}

/**
 * Generate validation error message with format example
 * 
 * Requirements:
 * - 1.2: Display descriptive error message with expected format
 * - 2.2: Display error message indicating correct format
 * - 12.4: Include correct format or expected value in error messages
 * 
 * @param fieldName - The name of the field with error
 * @param expectedFormat - The expected format or example value
 * @returns The formatted error message
 */
export function generateValidationErrorMessage(
  fieldName: string,
  expectedFormat: string
): string {
  const fieldDisplayNames: Record<string, string> = {
    phone: 'Phone number',
    postalCode: 'Postal code',
    recipientName: 'Recipient name',
    addressLine1: 'Address line 1',
    addressLine2: 'Address line 2',
    city: 'City',
    state: 'State',
    country: 'Country',
    label: 'Address label',
  };

  const displayName = fieldDisplayNames[fieldName] || fieldName;
  return `${displayName} must be in format ${expectedFormat}`;
}

/**
 * Generate required field error message
 * 
 * Requirement 12.4: Include expected value in error messages
 * 
 * @param fieldName - The name of the required field
 * @returns The formatted error message
 */
export function generateRequiredFieldMessage(fieldName: string): string {
  const fieldDisplayNames: Record<string, string> = {
    phone: 'Phone number',
    postalCode: 'Postal code',
    recipientName: 'Recipient name',
    addressLine1: 'Address line 1',
    city: 'City',
    state: 'State',
    country: 'Country',
    label: 'Address label',
  };

  const displayName = fieldDisplayNames[fieldName] || fieldName;
  return `${displayName} is required`;
}

/**
 * Generate length exceeded error message
 * 
 * Requirement 12.4: Include expected value in error messages
 * 
 * @param fieldName - The name of the field
 * @param maxLength - The maximum allowed length
 * @returns The formatted error message
 */
export function generateLengthErrorMessage(
  fieldName: string,
  maxLength: number
): string {
  const fieldDisplayNames: Record<string, string> = {
    phone: 'Phone number',
    postalCode: 'Postal code',
    recipientName: 'Recipient name',
    addressLine1: 'Address line 1',
    addressLine2: 'Address line 2',
    city: 'City',
    state: 'State',
    label: 'Address label',
  };

  const displayName = fieldDisplayNames[fieldName] || fieldName;
  return `${displayName} must be less than ${maxLength} characters`;
}

/**
 * Sanitize all fields in an address form data object
 * 
 * Requirement 3.4: Sanitize all inputs before database storage
 * 
 * @param formData - The form data object to sanitize
 * @returns A new object with all fields sanitized
 */
export function sanitizeAddressFormData<T extends Record<string, any>>(
  formData: T
): T {
  const sanitized = { ...formData } as any;

  // Sanitize text fields
  const textFields = ['label', 'recipientName', 'city', 'state'];
  textFields.forEach((field) => {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeInput(sanitized[field], 'text', field);
    }
  });

  // Sanitize address fields
  const addressFields = ['addressLine1', 'addressLine2'];
  addressFields.forEach((field) => {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeInput(sanitized[field], 'address', field);
    }
  });

  // Sanitize phone
  if ('phone' in sanitized && typeof sanitized.phone === 'string') {
    sanitized.phone = sanitizeInput(sanitized.phone, 'phone', 'phone');
  }

  // Sanitize postal code
  if ('postalCode' in sanitized && typeof sanitized.postalCode === 'string') {
    sanitized.postalCode = sanitizeInput(sanitized.postalCode, 'postalCode', 'postalCode');
  }

  return sanitized as T;
}
