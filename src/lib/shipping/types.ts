/**
 * Regional Shipping Pricing Types
 * Feature: regional-shipping-pricing
 * Task 1: Create regional pricing type definitions
 * 
 * Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 12.1, 12.2, 12.3, 12.4
 */

/**
 * Supported shipping regions
 */
export type Region = 
  | 'semenanjung'  // Peninsular Malaysia
  | 'sabah'        // Sabah, East Malaysia
  | 'sarawak'      // Sarawak, East Malaysia
  | 'singapore'    // Singapore
  | 'brunei'       // Brunei Darussalam
  | 'unknown';     // Unknown/unsupported region

/**
 * Regional pricing configuration for a shipping service
 * Requirement 1.2: Regional pricing stored in JSONB format
 */
export interface RegionalPricing {
  /** Target region code */
  region: Region;
  /** Cost per kilogram in smallest currency unit (e.g., cents) */
  cost_per_kg: number;
  /** Optional minimum cost for this region */
  min_cost?: number;
  /** List of state codes that map to this region */
  state_codes?: string[];
}

/**
 * Shipping service definition with optional regional pricing
 */
export interface ShippingService {
  /** Service unique identifier */
  id: string;
  /** Display name for the service */
  name: string;
  /** Base cost before regional adjustments (fallback) */
  base_cost: number;
  /** Estimated delivery time display string */
  estimated_days: string;
  /** Whether tracking is available */
  tracking_available: boolean;
  /** Whether insurance is included */
  includes_insurance: boolean;
  /** Regional pricing overrides - if present, used instead of base_cost */
  regional_pricing?: RegionalPricing[];
  /** Display order for sorting */
  display_order: number;
}

/**
 * Shipping provider with multiple services
 */
export interface ShippingProvider {
  /** Provider unique identifier */
  id: string;
  /** Provider code (e.g., 'skynet', 'sf-express') */
  code: string;
  /** Display name */
  name: string;
  /** Optional logo URL */
  logo_url?: string;
  /** Whether provider is active */
  is_active: boolean;
  /** Services offered by this provider */
  services: ShippingService[];
  /** Display order for sorting */
  display_order: number;
}

/**
 * Confidence level for region detection
 */
export type DetectionConfidence = 'high' | 'low' | 'none';

/**
 * Source of region detection
 */
export type DetectionSource = 'state_code' | 'country_code' | 'manual' | 'fallback';

/**
 * Result of region detection
 */
export interface RegionDetectionResult {
  /** Detected region */
  region: Region;
  /** Confidence level of detection */
  confidence: DetectionConfidence;
  /** Source of the detection */
  source: DetectionSource;
  /** Human-readable region name */
  regionName: string;
  /** Original input that was matched */
  matchedInput?: string;
}

/**
 * Input for shipping calculation
 */
export interface ShippingCalculationInput {
  /** Destination address */
  destination: {
    state?: string;
    country: string;
    postalCode?: string;
    city?: string;
  };
  /** Package weight in kilograms */
  weight: number;
  /** Optional package dimensions for volumetric weight */
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  /** Optional pre-detected region */
  region?: Region;
}

/**
 * Result of shipping calculation
 */
export interface ShippingCalculationResult {
  /** Provider code */
  providerCode: string;
  /** Provider display name */
  providerName: string;
  /** Service name */
  serviceName: string;
  /** Calculated cost in smallest currency unit */
  cost: number;
  /** Currency code */
  currency: string;
  /** Estimated delivery time */
  estimatedDays: string;
  /** Whether tracking is available */
  trackingAvailable: boolean;
  /** Whether insurance is included */
  includesInsurance: boolean;
  /** Detected region used for calculation */
  region: Region;
  /** Human-readable region name */
  regionName: string;
  /** Whether regional pricing was applied */
  usedRegionalPricing: boolean;
  /** Cost per kg used (for display) */
  costPerKg?: number;
}

/**
 * State code to region mapping entry
 */
export interface StateMapping {
  /** State code (uppercase) */
  code: string;
  /** State name */
  name: string;
  /** Region this state belongs to */
  region: Region;
}

/**
 * Complete region information
 */
export interface RegionInfo {
  /** Region code */
  code: Region;
  /** Display name in English */
  name: string;
  /** Display name in Malay */
  nameMalay: string;
  /** Country code */
  countryCode: string;
}
