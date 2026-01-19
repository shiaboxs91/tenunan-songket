/**
 * Country-specific configuration for address validation
 * Feature: address-management-enhancement
 */

/**
 * Country codes supported by the system
 */
export type CountryCode = 'BN' | 'MY' | 'SG' | 'ID';

/**
 * Field labels for different countries
 */
export interface CountryLabels {
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

/**
 * Helper text for form fields
 */
export interface CountryHelperText {
  phone: string;
  postalCode: string;
}

/**
 * Complete country configuration
 */
export interface CountryConfig {
  code: CountryCode;
  name: string;
  phonePattern: RegExp;
  phoneExample: string;
  postalCodePattern: RegExp;
  postalCodeExample: string;
  labels: CountryLabels;
  helperText: CountryHelperText;
}

/**
 * Brunei Darussalam configuration
 * Requirements: 1.1, 2.1, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2
 */
export const bruneiConfig: CountryConfig = {
  code: 'BN',
  name: 'Brunei Darussalam',
  // Phone: +673-XXX-XXXX or XXX-XXXX
  phonePattern: /^\+673-\d{3}-\d{4}$|^\d{3}-\d{4}$/,
  phoneExample: '+673-123-4567',
  // Postal code: XX1234 (2 letters + 4 digits)
  postalCodePattern: /^[A-Z]{2}\d{4}$/,
  postalCodeExample: 'BB1234',
  labels: {
    city: 'Bandar',
    state: 'Daerah/Mukim',
    postalCode: 'Poskod',
    phone: 'Nombor Telefon',
  },
  helperText: {
    phone: 'Format: +673-XXX-XXXX atau XXX-XXXX',
    postalCode: 'Format: XX1234 (contoh: BB1234)',
  },
};

/**
 * Malaysia configuration
 * Requirements: 7.2, 8.1
 */
export const malaysiaConfig: CountryConfig = {
  code: 'MY',
  name: 'Malaysia',
  // Phone: +60XX-XXXXXXX or +60X-XXXXXXXX
  phonePattern: /^\+60\d{1,2}-\d{7,8}$/,
  phoneExample: '+603-12345678',
  // Postal code: 5 digits
  postalCodePattern: /^\d{5}$/,
  postalCodeExample: '50000',
  labels: {
    city: 'Bandar',
    state: 'Negeri',
    postalCode: 'Poskod',
    phone: 'Nombor Telefon',
  },
  helperText: {
    phone: 'Format: +60XX-XXXXXXX',
    postalCode: 'Format: 5 digit (contoh: 50000)',
  },
};

/**
 * Singapore configuration
 * Requirements: 7.2, 8.2
 */
export const singaporeConfig: CountryConfig = {
  code: 'SG',
  name: 'Singapore',
  // Phone: +65-XXXX-XXXX
  phonePattern: /^\+65-\d{4}-\d{4}$/,
  phoneExample: '+65-1234-5678',
  // Postal code: 6 digits
  postalCodePattern: /^\d{6}$/,
  postalCodeExample: '123456',
  labels: {
    city: 'City',
    state: 'District',
    postalCode: 'Postal Code',
    phone: 'Phone Number',
  },
  helperText: {
    phone: 'Format: +65-XXXX-XXXX',
    postalCode: 'Format: 6 digits (e.g., 123456)',
  },
};

/**
 * Indonesia configuration
 * Requirements: 7.2, 8.3
 */
export const indonesiaConfig: CountryConfig = {
  code: 'ID',
  name: 'Indonesia',
  // Phone: +62XX-XXXXXX to +62XXX-XXXXXXXX
  phonePattern: /^\+62\d{2,3}-\d{6,8}$/,
  phoneExample: '+6221-12345678',
  // Postal code: 5 digits
  postalCodePattern: /^\d{5}$/,
  postalCodeExample: '12345',
  labels: {
    city: 'Kota',
    state: 'Provinsi',
    postalCode: 'Kode Pos',
    phone: 'Nomor Telepon',
  },
  helperText: {
    phone: 'Format: +62XX-XXXXXXXX',
    postalCode: 'Format: 5 digit (contoh: 12345)',
  },
};

/**
 * Map of all country configurations
 */
export const countryConfigs: Record<CountryCode, CountryConfig> = {
  BN: bruneiConfig,
  MY: malaysiaConfig,
  SG: singaporeConfig,
  ID: indonesiaConfig,
};

/**
 * Get configuration for a specific country
 * @param countryCode - The country code
 * @returns The country configuration
 */
export function getCountryConfig(countryCode: string): CountryConfig {
  const code = countryCode.toUpperCase() as CountryCode;
  return countryConfigs[code] || bruneiConfig; // Default to Brunei
}

/**
 * Get field label for a specific country
 * @param countryCode - The country code
 * @param field - The field name
 * @returns The localized field label
 */
export function getFieldLabel(
  countryCode: string,
  field: keyof CountryLabels
): string {
  const config = getCountryConfig(countryCode);
  return config.labels[field];
}

/**
 * Get validation pattern for a specific country and field
 * @param countryCode - The country code
 * @param field - The field name ('phone' or 'postalCode')
 * @returns The validation regex pattern
 */
export function getValidationPattern(
  countryCode: string,
  field: 'phone' | 'postalCode'
): RegExp {
  const config = getCountryConfig(countryCode);
  return field === 'phone' ? config.phonePattern : config.postalCodePattern;
}

/**
 * Get placeholder text for a specific country and field
 * @param countryCode - The country code
 * @param field - The field name ('phone' or 'postalCode')
 * @returns The placeholder text
 */
export function getPlaceholder(
  countryCode: string,
  field: 'phone' | 'postalCode'
): string {
  const config = getCountryConfig(countryCode);
  return field === 'phone' ? config.phoneExample : config.postalCodeExample;
}

/**
 * Get helper text for a specific country and field
 * @param countryCode - The country code
 * @param field - The field name ('phone' or 'postalCode')
 * @returns The helper text
 */
export function getHelperText(
  countryCode: string,
  field: 'phone' | 'postalCode'
): string {
  const config = getCountryConfig(countryCode);
  return config.helperText[field];
}
