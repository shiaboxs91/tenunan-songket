/**
 * Unit tests for sanitization utilities
 * Feature: address-management-enhancement
 */

import { describe, it, expect } from 'vitest';
import {
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

describe('sanitizeText', () => {
  it('should remove harmful special characters', () => {
    const input = 'Hello<script>alert("xss")</script>World';
    const result = sanitizeText(input);
    expect(result).toBe('HelloscriptalertxssscriptWorld');
  });

  it('should preserve safe special characters (hyphens, commas, periods, apostrophes)', () => {
    const input = "O'Brien-Smith, Jr.";
    const result = sanitizeText(input);
    expect(result).toBe("O'Brien-Smith, Jr.");
  });

  it('should trim leading and trailing whitespace', () => {
    const input = '  Hello World  ';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });

  it('should normalize multiple spaces to single space', () => {
    const input = 'Hello    World';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });

  it('should return empty string for empty input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText('   ')).toBe('');
  });
});

describe('sanitizePhone', () => {
  it('should preserve digits, plus sign, and hyphens', () => {
    const input = '+673-123-4567';
    const result = sanitizePhone(input);
    expect(result).toBe('+673-123-4567');
  });

  it('should remove letters and other characters', () => {
    const input = '+673-ABC-4567';
    const result = sanitizePhone(input);
    expect(result).toBe('+673--4567');
  });

  it('should trim whitespace', () => {
    const input = '  +673-123-4567  ';
    const result = sanitizePhone(input);
    expect(result).toBe('+673-123-4567');
  });

  it('should handle local format without country code', () => {
    const input = '123-4567';
    const result = sanitizePhone(input);
    expect(result).toBe('123-4567');
  });

  it('should return empty string for empty input', () => {
    expect(sanitizePhone('')).toBe('');
  });
});

describe('sanitizePostalCode', () => {
  it('should preserve alphanumeric characters', () => {
    const input = 'BB1234';
    const result = sanitizePostalCode(input);
    expect(result).toBe('BB1234');
  });

  it('should convert to uppercase', () => {
    const input = 'bb1234';
    const result = sanitizePostalCode(input);
    expect(result).toBe('BB1234');
  });

  it('should remove special characters', () => {
    const input = 'BB-1234';
    const result = sanitizePostalCode(input);
    expect(result).toBe('BB1234');
  });

  it('should trim whitespace', () => {
    const input = '  BB1234  ';
    const result = sanitizePostalCode(input);
    expect(result).toBe('BB1234');
  });

  it('should return empty string for empty input', () => {
    expect(sanitizePostalCode('')).toBe('');
  });
});

describe('sanitizeAddress', () => {
  it('should preserve safe special characters', () => {
    const input = "123 Main St., Apt. 4-B, O'Connor";
    const result = sanitizeAddress(input);
    expect(result).toBe("123 Main St., Apt. 4-B, O'Connor");
  });

  it('should remove harmful characters', () => {
    const input = '123 Main St.<script>alert("xss")</script>';
    const result = sanitizeAddress(input);
    expect(result).toBe('123 Main St.scriptalertxssscript');
  });

  it('should trim whitespace', () => {
    const input = '  123 Main St.  ';
    const result = sanitizeAddress(input);
    expect(result).toBe('123 Main St.');
  });

  it('should normalize multiple spaces', () => {
    const input = '123    Main    St.';
    const result = sanitizeAddress(input);
    expect(result).toBe('123 Main St.');
  });

  it('should return empty string for empty input', () => {
    expect(sanitizeAddress('')).toBe('');
  });
});

describe('truncateToLength', () => {
  it('should truncate string exceeding max length', () => {
    const input = 'This is a very long string that needs to be truncated';
    const result = truncateToLength(input, 20);
    expect(result).toBe('This is a very long ');
    expect(result.length).toBe(20);
  });

  it('should not truncate string within max length', () => {
    const input = 'Short string';
    const result = truncateToLength(input, 20);
    expect(result).toBe('Short string');
  });

  it('should handle exact length', () => {
    const input = 'Exactly twenty chars';
    const result = truncateToLength(input, 20);
    expect(result).toBe('Exactly twenty chars');
    expect(result.length).toBe(20);
  });

  it('should return empty string for empty input', () => {
    expect(truncateToLength('', 10)).toBe('');
  });
});

describe('trimWhitespace', () => {
  it('should trim leading whitespace', () => {
    const input = '   Hello';
    const result = trimWhitespace(input);
    expect(result).toBe('Hello');
  });

  it('should trim trailing whitespace', () => {
    const input = 'Hello   ';
    const result = trimWhitespace(input);
    expect(result).toBe('Hello');
  });

  it('should trim both leading and trailing whitespace', () => {
    const input = '   Hello   ';
    const result = trimWhitespace(input);
    expect(result).toBe('Hello');
  });

  it('should preserve internal whitespace', () => {
    const input = '  Hello World  ';
    const result = trimWhitespace(input);
    expect(result).toBe('Hello World');
  });

  it('should return empty string for whitespace-only input', () => {
    expect(trimWhitespace('   ')).toBe('');
  });

  it('should return empty string for empty input', () => {
    expect(trimWhitespace('')).toBe('');
  });
});

describe('sanitizeInput', () => {
  it('should sanitize phone field type', () => {
    const result = sanitizeInput('+673-ABC-4567', 'phone');
    expect(result).toBe('+673--4567');
  });

  it('should sanitize postalCode field type', () => {
    const result = sanitizeInput('bb-1234', 'postalCode');
    expect(result).toBe('BB1234');
  });

  it('should sanitize address field type', () => {
    const result = sanitizeInput('123 Main St.<script>', 'address');
    expect(result).toBe('123 Main St.script');
  });

  it('should sanitize text field type', () => {
    const result = sanitizeInput("O'Brien<script>", 'text');
    expect(result).toBe("O'Brienscript");
  });

  it('should apply length truncation when field name provided', () => {
    const longText = 'A'.repeat(150);
    const result = sanitizeInput(longText, 'text', 'label');
    expect(result.length).toBe(FIELD_MAX_LENGTHS.label);
  });

  it('should return empty string for empty input', () => {
    expect(sanitizeInput('', 'text')).toBe('');
  });
});

describe('isSafeSpecialChar', () => {
  it('should return true for hyphen', () => {
    expect(isSafeSpecialChar('-')).toBe(true);
  });

  it('should return true for comma', () => {
    expect(isSafeSpecialChar(',')).toBe(true);
  });

  it('should return true for period', () => {
    expect(isSafeSpecialChar('.')).toBe(true);
  });

  it('should return true for apostrophe', () => {
    expect(isSafeSpecialChar("'")).toBe(true);
  });

  it('should return false for other special characters', () => {
    expect(isSafeSpecialChar('<')).toBe(false);
    expect(isSafeSpecialChar('>')).toBe(false);
    expect(isSafeSpecialChar('&')).toBe(false);
    expect(isSafeSpecialChar('$')).toBe(false);
  });

  it('should return false for alphanumeric characters', () => {
    expect(isSafeSpecialChar('a')).toBe(false);
    expect(isSafeSpecialChar('1')).toBe(false);
  });
});

describe('filterSpecialCharacters', () => {
  it('should keep alphanumeric and safe special characters', () => {
    const input = "Hello, World! O'Brien-Smith.";
    const result = filterSpecialCharacters(input);
    expect(result).toBe("Hello, World O'Brien-Smith.");
  });

  it('should remove harmful special characters', () => {
    const input = '<script>alert("xss")</script>';
    const result = filterSpecialCharacters(input);
    expect(result).toBe('scriptalertxssscript');
  });

  it('should return empty string for empty input', () => {
    expect(filterSpecialCharacters('')).toBe('');
  });
});

describe('generateValidationErrorMessage', () => {
  it('should generate error message for phone field', () => {
    const result = generateValidationErrorMessage('phone', '+673-XXX-XXXX');
    expect(result).toBe('Phone number must be in format +673-XXX-XXXX');
  });

  it('should generate error message for postalCode field', () => {
    const result = generateValidationErrorMessage('postalCode', 'BB1234');
    expect(result).toBe('Postal code must be in format BB1234');
  });

  it('should generate error message for recipientName field', () => {
    const result = generateValidationErrorMessage('recipientName', 'John Doe');
    expect(result).toBe('Recipient name must be in format John Doe');
  });

  it('should handle unknown field names', () => {
    const result = generateValidationErrorMessage('unknownField', 'format');
    expect(result).toBe('unknownField must be in format format');
  });
});

describe('generateRequiredFieldMessage', () => {
  it('should generate required message for phone field', () => {
    const result = generateRequiredFieldMessage('phone');
    expect(result).toBe('Phone number is required');
  });

  it('should generate required message for postalCode field', () => {
    const result = generateRequiredFieldMessage('postalCode');
    expect(result).toBe('Postal code is required');
  });

  it('should generate required message for recipientName field', () => {
    const result = generateRequiredFieldMessage('recipientName');
    expect(result).toBe('Recipient name is required');
  });

  it('should generate required message for addressLine1 field', () => {
    const result = generateRequiredFieldMessage('addressLine1');
    expect(result).toBe('Address line 1 is required');
  });

  it('should handle unknown field names', () => {
    const result = generateRequiredFieldMessage('unknownField');
    expect(result).toBe('unknownField is required');
  });
});

describe('generateLengthErrorMessage', () => {
  it('should generate length error for recipientName', () => {
    const result = generateLengthErrorMessage('recipientName', 100);
    expect(result).toBe('Recipient name must be less than 100 characters');
  });

  it('should generate length error for addressLine1', () => {
    const result = generateLengthErrorMessage('addressLine1', 200);
    expect(result).toBe('Address line 1 must be less than 200 characters');
  });

  it('should generate length error for label', () => {
    const result = generateLengthErrorMessage('label', 50);
    expect(result).toBe('Address label must be less than 50 characters');
  });

  it('should handle unknown field names', () => {
    const result = generateLengthErrorMessage('unknownField', 50);
    expect(result).toBe('unknownField must be less than 50 characters');
  });
});

describe('sanitizeAddressFormData', () => {
  it('should sanitize all text fields', () => {
    const formData = {
      label: '  Home<script>  ',
      recipientName: '  John Doe  ',
      city: '  Bandar  ',
      state: '  Brunei-Muara  ',
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.label).toBe('Homescript');
    expect(result.recipientName).toBe('John Doe');
    expect(result.city).toBe('Bandar');
    expect(result.state).toBe('Brunei-Muara');
  });

  it('should sanitize address fields', () => {
    const formData = {
      addressLine1: '  123 Main St.<script>  ',
      addressLine2: '  Apt. 4-B  ',
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.addressLine1).toBe('123 Main St.script');
    expect(result.addressLine2).toBe('Apt. 4-B');
  });

  it('should sanitize phone field', () => {
    const formData = {
      phone: '  +673-ABC-4567  ',
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.phone).toBe('+673--4567');
  });

  it('should sanitize postal code field', () => {
    const formData = {
      postalCode: '  bb-1234  ',
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.postalCode).toBe('BB1234');
  });

  it('should handle complete address form data', () => {
    const formData = {
      label: '  Home  ',
      recipientName: '  John Doe  ',
      phone: '  +673-123-4567  ',
      addressLine1: '  123 Main St.  ',
      addressLine2: '  Apt. 4-B  ',
      city: '  Bandar  ',
      state: '  Brunei-Muara  ',
      postalCode: '  bb1234  ',
      country: 'BN',
      isDefault: true,
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.label).toBe('Home');
    expect(result.recipientName).toBe('John Doe');
    expect(result.phone).toBe('+673-123-4567');
    expect(result.addressLine1).toBe('123 Main St.');
    expect(result.addressLine2).toBe('Apt. 4-B');
    expect(result.city).toBe('Bandar');
    expect(result.state).toBe('Brunei-Muara');
    expect(result.postalCode).toBe('BB1234');
    expect(result.country).toBe('BN');
    expect(result.isDefault).toBe(true);
  });

  it('should not modify non-string fields', () => {
    const formData = {
      label: 'Home',
      isDefault: true,
      someNumber: 123,
      someBoolean: false,
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.isDefault).toBe(true);
    expect(result.someNumber).toBe(123);
    expect(result.someBoolean).toBe(false);
  });

  it('should handle missing optional fields', () => {
    const formData = {
      label: 'Home',
      recipientName: 'John Doe',
      phone: '+673-123-4567',
      addressLine1: '123 Main St.',
      city: 'Bandar',
      state: 'Brunei-Muara',
      postalCode: 'BB1234',
      country: 'BN',
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.label).toBe('Home');
    expect(result.addressLine2).toBeUndefined();
  });

  it('should apply length truncation', () => {
    const formData = {
      label: 'A'.repeat(100), // Exceeds max length of 50
      recipientName: 'B'.repeat(150), // Exceeds max length of 100
    };

    const result = sanitizeAddressFormData(formData);

    expect(result.label.length).toBe(FIELD_MAX_LENGTHS.label);
    expect(result.recipientName.length).toBe(FIELD_MAX_LENGTHS.recipientName);
  });
});

describe('FIELD_MAX_LENGTHS', () => {
  it('should have correct max lengths defined', () => {
    expect(FIELD_MAX_LENGTHS.label).toBe(50);
    expect(FIELD_MAX_LENGTHS.recipientName).toBe(100);
    expect(FIELD_MAX_LENGTHS.addressLine1).toBe(200);
    expect(FIELD_MAX_LENGTHS.addressLine2).toBe(200);
    expect(FIELD_MAX_LENGTHS.city).toBe(100);
    expect(FIELD_MAX_LENGTHS.state).toBe(100);
    expect(FIELD_MAX_LENGTHS.phone).toBe(20);
    expect(FIELD_MAX_LENGTHS.postalCode).toBe(10);
  });
});
