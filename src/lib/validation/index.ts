/**
 * Validation module exports
 * Feature: address-management-enhancement
 */

// Types
export type {
  ValidationResult,
  FormValidationResult,
  ValidationRule,
  ValidationSchema,
  ValidationRuleType,
  FieldType,
  AddressFormData,
  ValidationEngine,
} from './types';

// Country configuration
export type {
  CountryCode,
  CountryLabels,
  CountryHelperText,
  CountryConfig,
} from './country-config';

export {
  bruneiConfig,
  malaysiaConfig,
  singaporeConfig,
  indonesiaConfig,
  countryConfigs,
  getCountryConfig,
  getFieldLabel,
  getValidationPattern,
  getPlaceholder,
  getHelperText,
} from './country-config';

// Validation engine
export {
  AddressValidationEngine,
  createValidationEngine,
  validationEngine,
} from './validation-engine';

// Sanitization utilities
export {
  sanitizeText,
  sanitizePhone,
  sanitizePostalCode,
  sanitizeAddress,
  truncateToLength,
  trimWhitespace,
  sanitizeInput,
  isSafeSpecialChar,
  filterSpecialCharacters,
  generateValidationErrorMessage,
  generateRequiredFieldMessage,
  generateLengthErrorMessage,
  sanitizeAddressFormData,
  FIELD_MAX_LENGTHS,
} from './sanitization';
