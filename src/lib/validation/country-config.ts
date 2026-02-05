/**
 * Country-specific configuration for address validation
 * Feature: address-management-enhancement
 */

/**
 * Country codes supported by the system
 */
export type CountryCode = 'BN' | 'MY' | 'SG';

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
  stateRequired: boolean;
  states?: Array<{ code: string; name: string }>;
}

/**
 * Brunei Districts
 */
export const BRUNEI_DISTRICTS = [
  { code: 'brunei-muara', name: 'Brunei-Muara' },
  { code: 'belait', name: 'Belait' },
  { code: 'tutong', name: 'Tutong' },
  { code: 'temburong', name: 'Temburong' },
];

/**
 * Malaysia States
 */
export const MALAYSIA_STATES = [
  { code: 'johor', name: 'Johor' },
  { code: 'kedah', name: 'Kedah' },
  { code: 'kelantan', name: 'Kelantan' },
  { code: 'melaka', name: 'Melaka' },
  { code: 'negeri-sembilan', name: 'Negeri Sembilan' },
  { code: 'pahang', name: 'Pahang' },
  { code: 'perak', name: 'Perak' },
  { code: 'perlis', name: 'Perlis' },
  { code: 'pulau-pinang', name: 'Pulau Pinang' },
  { code: 'sabah', name: 'Sabah' },
  { code: 'sarawak', name: 'Sarawak' },
  { code: 'selangor', name: 'Selangor' },
  { code: 'terengganu', name: 'Terengganu' },
  { code: 'kuala-lumpur', name: 'Kuala Lumpur' },
  { code: 'labuan', name: 'Labuan' },
  { code: 'putrajaya', name: 'Putrajaya' },
];

/**
 * Brunei Darussalam configuration
 */
export const bruneiConfig: CountryConfig = {
  code: 'BN',
  name: 'Brunei Darussalam',
  phonePattern: /^\+673\d{7}$|^\d{7}$/,
  phoneExample: '+6731234567',
  postalCodePattern: /^[A-Z]{2}\d{4}$/,
  postalCodeExample: 'BB1234',
  labels: {
    city: 'Bandar',
    state: 'Daerah',
    postalCode: 'Poskod',
    phone: 'Nombor Telefon',
  },
  helperText: {
    phone: 'Format: +673XXXXXXX atau XXXXXXX',
    postalCode: 'Format: XX1234 (contoh: BB1234)',
  },
  stateRequired: true,
  states: BRUNEI_DISTRICTS,
};

/**
 * Malaysia configuration
 */
export const malaysiaConfig: CountryConfig = {
  code: 'MY',
  name: 'Malaysia',
  phonePattern: /^\+60\d{9,10}$/,
  phoneExample: '+60312345678',
  postalCodePattern: /^\d{5}$/,
  postalCodeExample: '50000',
  labels: {
    city: 'Bandar',
    state: 'Negeri',
    postalCode: 'Poskod',
    phone: 'Nombor Telefon',
  },
  helperText: {
    phone: 'Format: +60XXXXXXXXX',
    postalCode: 'Format: 5 digit (contoh: 50000)',
  },
  stateRequired: true,
  states: MALAYSIA_STATES,
};

/**
 * Singapore configuration
 */
export const singaporeConfig: CountryConfig = {
  code: 'SG',
  name: 'Singapore',
  phonePattern: /^\+65\d{8}$/,
  phoneExample: '+6512345678',
  postalCodePattern: /^\d{6}$/,
  postalCodeExample: '123456',
  labels: {
    city: 'City',
    state: '', // Not used for Singapore
    postalCode: 'Postal Code',
    phone: 'Phone Number',
  },
  helperText: {
    phone: 'Format: +65XXXXXXXX',
    postalCode: 'Format: 6 digits (e.g., 123456)',
  },
  stateRequired: false, // Singapore doesn't have states
  states: undefined,
};

/**
 * Map of all country configurations
 */
export const countryConfigs: Record<CountryCode, CountryConfig> = {
  BN: bruneiConfig,
  MY: malaysiaConfig,
  SG: singaporeConfig,
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

/**
 * Get state/region options for a specific country
 */
export function getStateOptions(countryCode: string): Array<{ code: string; name: string }> {
  const config = getCountryConfig(countryCode);
  return config.states || [];
}

/**
 * Check if state field is required for a country
 */
export function isStateRequired(countryCode: string): boolean {
  const config = getCountryConfig(countryCode);
  return config.stateRequired;
}
