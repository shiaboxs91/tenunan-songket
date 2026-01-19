/**
 * Region Mapping Configuration
 * Feature: regional-shipping-pricing
 * Task 1: Create state mapping configuration
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 12.1, 12.2, 12.3, 12.4
 */

import type { Region, StateMapping, RegionInfo } from './types';

/**
 * Complete mapping of Malaysian state codes to regions
 * Includes Semenanjung (Peninsular), Sabah, and Sarawak
 */
export const REGION_MAPPING: StateMapping[] = [
  // Semenanjung (Peninsular Malaysia) - 11 states + 3 Federal Territories
  { code: 'JHR', name: 'Johor', region: 'semenanjung' },
  { code: 'KDH', name: 'Kedah', region: 'semenanjung' },
  { code: 'KTN', name: 'Kelantan', region: 'semenanjung' },
  { code: 'MLK', name: 'Melaka', region: 'semenanjung' },
  { code: 'NSN', name: 'Negeri Sembilan', region: 'semenanjung' },
  { code: 'PHG', name: 'Pahang', region: 'semenanjung' },
  { code: 'PNG', name: 'Pulau Pinang', region: 'semenanjung' },
  { code: 'PRK', name: 'Perak', region: 'semenanjung' },
  { code: 'PLS', name: 'Perlis', region: 'semenanjung' },
  { code: 'SGR', name: 'Selangor', region: 'semenanjung' },
  { code: 'TRG', name: 'Terengganu', region: 'semenanjung' },
  { code: 'KUL', name: 'Kuala Lumpur', region: 'semenanjung' },
  { code: 'LBN', name: 'Labuan', region: 'semenanjung' },
  { code: 'PJY', name: 'Putrajaya', region: 'semenanjung' },
  
  // Sabah (East Malaysia)
  { code: 'SBH', name: 'Sabah', region: 'sabah' },
  
  // Sarawak (East Malaysia)
  { code: 'SWK', name: 'Sarawak', region: 'sarawak' },
  
  // Singapore
  { code: 'SG', name: 'Singapore', region: 'singapore' },
  
  // Brunei districts
  { code: 'BN', name: 'Brunei', region: 'brunei' },
  { code: 'BM', name: 'Brunei-Muara', region: 'brunei' },
  { code: 'BE', name: 'Belait', region: 'brunei' },
  { code: 'TU', name: 'Tutong', region: 'brunei' },
  { code: 'TE', name: 'Temburong', region: 'brunei' },
];

/**
 * Alternative state name mappings (for fuzzy matching)
 * Maps common variations to standard state codes
 */
export const STATE_NAME_ALIASES: Record<string, string> = {
  // Full names (lowercase)
  'johor': 'JHR',
  'johore': 'JHR',
  'kedah': 'KDH',
  'kelantan': 'KTN',
  'melaka': 'MLK',
  'malacca': 'MLK',
  'negeri sembilan': 'NSN',
  'n. sembilan': 'NSN',
  'pahang': 'PHG',
  'pulau pinang': 'PNG',
  'penang': 'PNG',
  'perak': 'PRK',
  'perlis': 'PLS',
  'selangor': 'SGR',
  'terengganu': 'TRG',
  'trengganu': 'TRG',
  'kuala lumpur': 'KUL',
  'kl': 'KUL',
  'labuan': 'LBN',
  'putrajaya': 'PJY',
  'sabah': 'SBH',
  'sarawak': 'SWK',
  'singapore': 'SG',
  'singapura': 'SG',
  'brunei': 'BN',
  'brunei darussalam': 'BN',
  'brunei-muara': 'BM',
  'belait': 'BE',
  'tutong': 'TU',
  'temburong': 'TE',
};

/**
 * Country code to default region mapping
 */
export const COUNTRY_TO_REGION: Record<string, Region> = {
  'MY': 'semenanjung', // Default to semenanjung, specific states override
  'SG': 'singapore',
  'BN': 'brunei',
};

/**
 * Region information with display names
 */
export const REGION_INFO: Record<Region, RegionInfo> = {
  semenanjung: {
    code: 'semenanjung',
    name: 'Peninsular Malaysia',
    nameMalay: 'Semenanjung Malaysia',
    countryCode: 'MY',
  },
  sabah: {
    code: 'sabah',
    name: 'Sabah',
    nameMalay: 'Sabah',
    countryCode: 'MY',
  },
  sarawak: {
    code: 'sarawak',
    name: 'Sarawak',
    nameMalay: 'Sarawak',
    countryCode: 'MY',
  },
  singapore: {
    code: 'singapore',
    name: 'Singapore',
    nameMalay: 'Singapura',
    countryCode: 'SG',
  },
  brunei: {
    code: 'brunei',
    name: 'Brunei Darussalam',
    nameMalay: 'Negara Brunei Darussalam',
    countryCode: 'BN',
  },
  unknown: {
    code: 'unknown',
    name: 'Unknown Region',
    nameMalay: 'Kawasan Tidak Dikenali',
    countryCode: '',
  },
};

/**
 * Convert state code (or name) to region
 * Handles case-insensitive matching
 * 
 * @param stateCode - State code or name
 * @returns Region or 'unknown' if not found
 */
export function stateToRegion(stateCode: string): Region {
  if (!stateCode || typeof stateCode !== 'string') {
    return 'unknown';
  }
  
  const normalizedInput = stateCode.trim().toUpperCase();
  
  // First try direct code match
  const directMatch = REGION_MAPPING.find(
    m => m.code.toUpperCase() === normalizedInput
  );
  if (directMatch) {
    return directMatch.region;
  }
  
  // Try alias/name match (case-insensitive)
  const lowerInput = stateCode.trim().toLowerCase();
  const aliasCode = STATE_NAME_ALIASES[lowerInput];
  if (aliasCode) {
    const aliasMatch = REGION_MAPPING.find(
      m => m.code.toUpperCase() === aliasCode.toUpperCase()
    );
    if (aliasMatch) {
      return aliasMatch.region;
    }
  }
  
  return 'unknown';
}

/**
 * Get region from country code
 * Returns the default region for a country
 * 
 * @param countryCode - ISO country code (e.g., 'MY', 'SG', 'BN')
 * @returns Region or 'unknown' if not found
 */
export function countryToRegion(countryCode: string): Region {
  if (!countryCode || typeof countryCode !== 'string') {
    return 'unknown';
  }
  
  const normalized = countryCode.trim().toUpperCase();
  return COUNTRY_TO_REGION[normalized] || 'unknown';
}

/**
 * Get human-readable region name
 * 
 * @param region - Region code
 * @param useMalay - If true, return Malay name
 * @returns Region display name
 */
export function getRegionName(region: Region, useMalay: boolean = false): string {
  const info = REGION_INFO[region];
  if (!info) {
    return useMalay ? 'Kawasan Tidak Dikenali' : 'Unknown Region';
  }
  return useMalay ? info.nameMalay : info.name;
}

/**
 * Get all available regions
 * 
 * @returns Array of region info objects (excluding 'unknown')
 */
export function getAllRegions(): RegionInfo[] {
  return Object.values(REGION_INFO).filter(r => r.code !== 'unknown');
}

/**
 * Get all state mappings for a specific region
 * 
 * @param region - Region code
 * @returns Array of state mappings
 */
export function getStatesInRegion(region: Region): StateMapping[] {
  return REGION_MAPPING.filter(m => m.region === region);
}

/**
 * Check if a state code is valid
 * 
 * @param stateCode - State code to check
 * @returns true if valid
 */
export function isValidStateCode(stateCode: string): boolean {
  return stateToRegion(stateCode) !== 'unknown';
}

/**
 * Get state code from state name
 * 
 * @param stateName - State name to lookup
 * @returns State code or null if not found
 */
export function getStateCode(stateName: string): string | null {
  if (!stateName || typeof stateName !== 'string') {
    return null;
  }
  
  const lowerName = stateName.trim().toLowerCase();
  const code = STATE_NAME_ALIASES[lowerName];
  
  if (code) {
    return code;
  }
  
  // Check if it's already a valid code
  const mapping = REGION_MAPPING.find(
    m => m.code.toUpperCase() === stateName.trim().toUpperCase()
  );
  
  return mapping ? mapping.code : null;
}
