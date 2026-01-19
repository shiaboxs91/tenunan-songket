/**
 * Region Detector
 * Feature: regional-shipping-pricing
 * Task 2: Implement RegionDetector class
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import type { 
  Region, 
  RegionDetectionResult, 
  DetectionConfidence, 
  DetectionSource 
} from './types';
import { 
  stateToRegion, 
  countryToRegion, 
  getRegionName, 
  REGION_INFO 
} from './region-mapping';

/**
 * Address information for region detection
 */
export interface AddressForDetection {
  state?: string;
  country?: string;
  postalCode?: string;
  city?: string;
}

/**
 * RegionDetector class for detecting shipping regions from address information
 * 
 * Detection priority:
 * 1. State code (highest confidence)
 * 2. Country code (lower confidence, uses default region)
 * 3. Fallback to unknown
 */
export class RegionDetector {
  /**
   * Detect region from address information
   * 
   * @param address - Address information
   * @returns Detection result with region, confidence, and source
   */
  detectRegionFromAddress(address: AddressForDetection): RegionDetectionResult {
    // Validate input
    if (!address || typeof address !== 'object') {
      return this.createResult('unknown', 'none', 'fallback');
    }

    // Try state code first (highest confidence)
    if (address.state) {
      const regionFromState = this.getRegionFromStateCode(address.state);
      if (regionFromState !== 'unknown') {
        return this.createResult(
          regionFromState, 
          'high', 
          'state_code',
          address.state
        );
      }
    }

    // Try country code (lower confidence)
    if (address.country) {
      const regionFromCountry = countryToRegion(address.country);
      if (regionFromCountry !== 'unknown') {
        return this.createResult(
          regionFromCountry, 
          'low', 
          'country_code',
          address.country
        );
      }
    }

    // Fallback to unknown
    return this.createResult('unknown', 'none', 'fallback');
  }

  /**
   * Get region from state code directly
   * 
   * @param stateCode - State code (case-insensitive)
   * @returns Region code
   */
  getRegionFromStateCode(stateCode: string): Region {
    if (!stateCode || typeof stateCode !== 'string') {
      return 'unknown';
    }
    
    return stateToRegion(stateCode);
  }

  /**
   * Validate if a region code is valid
   * 
   * @param regionCode - Region code to validate
   * @returns true if valid
   */
  validateRegion(regionCode: string): boolean {
    if (!regionCode || typeof regionCode !== 'string') {
      return false;
    }
    
    const normalized = regionCode.toLowerCase() as Region;
    return normalized in REGION_INFO && normalized !== 'unknown';
  }

  /**
   * Get all valid region codes
   * 
   * @returns Array of valid region codes (excluding 'unknown')
   */
  getValidRegions(): Region[] {
    return Object.keys(REGION_INFO)
      .filter(r => r !== 'unknown') as Region[];
  }

  /**
   * Create a detection result
   */
  private createResult(
    region: Region,
    confidence: DetectionConfidence,
    source: DetectionSource,
    matchedInput?: string
  ): RegionDetectionResult {
    return {
      region,
      confidence,
      source,
      regionName: getRegionName(region),
      matchedInput,
    };
  }

  /**
   * Create a manual selection result
   * 
   * @param region - Manually selected region
   * @returns Detection result with manual source
   */
  createManualResult(region: Region): RegionDetectionResult {
    if (!this.validateRegion(region)) {
      return this.createResult('unknown', 'none', 'manual');
    }
    
    return this.createResult(region, 'high', 'manual');
  }

  /**
   * Detect region from postal code (for Malaysian postcodes)
   * Postal code ranges:
   * - 01000-35999: Semenanjung
   * - 87000-91999: Sabah
   * - 93000-98999: Sarawak
   * 
   * @param postalCode - Postal code
   * @returns Region or unknown
   */
  detectRegionFromPostalCode(postalCode: string): Region {
    if (!postalCode || typeof postalCode !== 'string') {
      return 'unknown';
    }

    // Extract numeric part
    const numericPart = postalCode.replace(/\D/g, '');
    if (numericPart.length < 5) {
      return 'unknown';
    }

    const firstTwoDigits = parseInt(numericPart.substring(0, 2), 10);

    // Malaysian postal code ranges
    if (firstTwoDigits >= 1 && firstTwoDigits <= 35) {
      return 'semenanjung';
    } else if (firstTwoDigits >= 87 && firstTwoDigits <= 91) {
      return 'sabah';
    } else if (firstTwoDigits >= 93 && firstTwoDigits <= 98) {
      return 'sarawak';
    }

    // Singapore postal codes are 6 digits
    if (numericPart.length === 6) {
      return 'singapore';
    }

    // Brunei postal codes are 4-6 alphanumeric
    if (/^[A-Z]{2}\d{4}$/i.test(postalCode.trim())) {
      return 'brunei';
    }

    return 'unknown';
  }
}

/**
 * Default instance of RegionDetector for convenience
 */
export const regionDetector = new RegionDetector();
