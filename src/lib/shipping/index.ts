/**
 * Regional Shipping Pricing Module
 * Feature: regional-shipping-pricing
 * 
 * Exports all shipping-related types, utilities, and classes
 */

// Types
export type {
  Region,
  RegionalPricing,
  ShippingService,
  ShippingProvider,
  RegionDetectionResult,
  ShippingCalculationInput,
  ShippingCalculationResult,
  DetectionConfidence,
  DetectionSource,
  StateMapping,
  RegionInfo,
} from './types';

// Region mapping utilities
export {
  REGION_MAPPING,
  STATE_NAME_ALIASES,
  COUNTRY_TO_REGION,
  REGION_INFO,
  stateToRegion,
  countryToRegion,
  getRegionName,
  getAllRegions,
  getStatesInRegion,
  isValidStateCode,
  getStateCode,
} from './region-mapping';

// Region detector
export { 
  RegionDetector, 
  regionDetector,
  type AddressForDetection,
} from './region-detector';

// Shipping calculator
export { 
  ShippingCalculator, 
  shippingCalculator,
} from './calculator';
