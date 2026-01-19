/**
 * Validation engine implementation
 * Feature: address-management-enhancement
 */

import {
  ValidationEngine,
  ValidationResult,
  FormValidationResult,
  FieldType,
  AddressFormData,
} from './types';
import { getCountryConfig } from './country-config';
import {
  sanitizeInput as sanitizeInputUtil,
  trimWhitespace,
  truncateToLength,
  FIELD_MAX_LENGTHS,
  generateValidationErrorMessage,
  generateRequiredFieldMessage,
  generateLengthErrorMessage,
} from './sanitization';

/**
 * Field constraints
 */
const FIELD_CONSTRAINTS = {
  label: { maxLength: FIELD_MAX_LENGTHS.label, required: false }, // Label is optional
  recipientName: { maxLength: FIELD_MAX_LENGTHS.recipientName, required: true },
  phone: { required: true },
  addressLine1: { maxLength: FIELD_MAX_LENGTHS.addressLine1, required: true },
  addressLine2: { maxLength: FIELD_MAX_LENGTHS.addressLine2, required: false },
  city: { maxLength: FIELD_MAX_LENGTHS.city, required: true },
  state: { maxLength: FIELD_MAX_LENGTHS.state, required: true },
  postalCode: { required: true },
  country: { required: true },
};

/**
 * Implementation of the ValidationEngine interface
 */
export class AddressValidationEngine implements ValidationEngine {
  /**
   * Validate a single field
   * Requirements: 1.1, 1.2, 2.1, 2.2, 7.4, 8.4
   */
  validateField(
    fieldName: string,
    value: string,
    countryCode: string
  ): ValidationResult {
    // Trim whitespace first (Requirement 3.5)
    const trimmedValue = trimWhitespace(value);

    // Check if field is required
    const constraint = FIELD_CONSTRAINTS[fieldName as keyof typeof FIELD_CONSTRAINTS];
    if (!constraint) {
      return { isValid: true, sanitizedValue: trimmedValue };
    }

    // Required field validation
    if (constraint.required && !trimmedValue) {
      return {
        isValid: false,
        errorMessage: generateRequiredFieldMessage(fieldName),
      };
    }

    // Skip further validation if field is empty and not required
    if (!trimmedValue && !constraint.required) {
      return { isValid: true, sanitizedValue: trimmedValue };
    }

    // Length validation (Requirement 3.2)
    if ('maxLength' in constraint && constraint.maxLength && trimmedValue.length > constraint.maxLength) {
      return {
        isValid: false,
        errorMessage: generateLengthErrorMessage(fieldName, constraint.maxLength),
      };
    }

    // Field-specific validation
    switch (fieldName) {
      case 'phone':
        return this.validatePhone(trimmedValue, countryCode);
      case 'postalCode':
        return this.validatePostalCode(trimmedValue, countryCode);
      default:
        return { isValid: true, sanitizedValue: trimmedValue };
    }
  }

  /**
   * Validate phone number
   * Requirements: 1.1, 1.2, 1.3
   */
  private validatePhone(value: string, countryCode: string): ValidationResult {
    const config = getCountryConfig(countryCode);
    const isValid = config.phonePattern.test(value);

    if (!isValid) {
      return {
        isValid: false,
        errorMessage: generateValidationErrorMessage('phone', config.phoneExample),
      };
    }

    return { isValid: true, sanitizedValue: value };
  }

  /**
   * Validate postal code
   * Requirements: 2.1, 2.2, 2.3
   */
  private validatePostalCode(value: string, countryCode: string): ValidationResult {
    const config = getCountryConfig(countryCode);
    const isValid = config.postalCodePattern.test(value);

    if (!isValid) {
      return {
        isValid: false,
        errorMessage: generateValidationErrorMessage('postalCode', config.postalCodeExample),
      };
    }

    return { isValid: true, sanitizedValue: value };
  }

  /**
   * Validate an entire form
   * Requirements: 1.4, 2.5, 11.3
   */
  validateForm(
    formData: AddressFormData,
    countryCode: string
  ): FormValidationResult {
    const fieldErrors: Record<string, string> = {};

    // Validate each field
    const fieldsToValidate: (keyof AddressFormData)[] = [
      'label',
      'recipientName',
      'phone',
      'addressLine1',
      'addressLine2',
      'city',
      'state',
      'postalCode',
      'country',
    ];

    for (const field of fieldsToValidate) {
      const value = formData[field];
      if (typeof value === 'string') {
        const result = this.validateField(field, value, countryCode);
        if (!result.isValid && result.errorMessage) {
          fieldErrors[field] = result.errorMessage;
        }
      }
    }

    return {
      isValid: Object.keys(fieldErrors).length === 0,
      fieldErrors,
    };
  }

  /**
   * Sanitize user input
   * Requirements: 3.1, 3.3, 3.5
   */
  sanitizeInput(value: string, fieldType: FieldType): string {
    return sanitizeInputUtil(value, fieldType);
  }
}

/**
 * Create a new validation engine instance
 */
export function createValidationEngine(): ValidationEngine {
  return new AddressValidationEngine();
}

/**
 * Default validation engine instance
 */
export const validationEngine = createValidationEngine();
