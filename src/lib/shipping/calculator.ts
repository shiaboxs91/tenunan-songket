/**
 * Shipping Calculator with Regional Pricing Support
 * Feature: regional-shipping-pricing
 * Task 3: Implement ShippingCalculator class
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import type {
  Region,
  RegionalPricing,
  ShippingService,
  ShippingProvider,
  ShippingCalculationInput,
  ShippingCalculationResult,
} from './types';
import { RegionDetector } from './region-detector';
import { getRegionName } from './region-mapping';

/**
 * ShippingCalculator class for calculating shipping costs with regional pricing
 */
export class ShippingCalculator {
  private regionDetector: RegionDetector;

  constructor() {
    this.regionDetector = new RegionDetector();
  }

  /**
   * Calculate shipping cost for a given input
   * 
   * @param input - Calculation input with destination, weight, and optional region
   * @param providers - Available shipping providers
   * @returns Array of calculation results sorted by cost
   */
  calculateShipping(
    input: ShippingCalculationInput,
    providers: ShippingProvider[]
  ): ShippingCalculationResult[] {
    // Detect region if not provided
    let region: Region = input.region || 'unknown';
    
    if (region === 'unknown' || !region) {
      const detection = this.regionDetector.detectRegionFromAddress({
        state: input.destination.state,
        country: input.destination.country,
        postalCode: input.destination.postalCode,
        city: input.destination.city,
      });
      region = detection.region;
    }

    const results: ShippingCalculationResult[] = [];
    
    // Calculate chargeable weight
    let chargeableWeight = input.weight;
    if (input.dimensions) {
      const volumetricWeight = this.calculateVolumetricWeight(input.dimensions);
      chargeableWeight = Math.max(input.weight, volumetricWeight);
    }
    // Minimum weight 0.5 kg
    chargeableWeight = Math.max(chargeableWeight, 0.5);

    // Filter and calculate for each provider and service
    for (const provider of providers) {
      if (!provider.is_active) continue;

      for (const service of provider.services) {
        // Check if service is available in this region
        if (!this.isServiceAvailableInRegion(service, region)) {
          continue;
        }

        const { cost, usedRegionalPricing, costPerKg } = this.calculateServiceCost(
          service,
          region,
          chargeableWeight
        );

        results.push({
          providerCode: provider.code,
          providerName: provider.name,
          serviceName: service.name,
          cost: Math.round(cost),
          currency: 'BND',
          estimatedDays: service.estimated_days,
          trackingAvailable: service.tracking_available,
          includesInsurance: service.includes_insurance,
          region,
          regionName: getRegionName(region),
          usedRegionalPricing,
          costPerKg,
        });
      }
    }

    // Sort by cost ascending
    results.sort((a, b) => a.cost - b.cost);

    return results;
  }

  /**
   * Calculate cost for a specific service
   * 
   * @param service - Shipping service
   * @param region - Target region
   * @param weight - Chargeable weight in kg
   * @returns Cost calculation result
   */
  private calculateServiceCost(
    service: ShippingService,
    region: Region,
    weight: number
  ): { cost: number; usedRegionalPricing: boolean; costPerKg?: number } {
    // Try to find regional pricing
    const regionalPrice = this.getRegionalPrice(service, region);

    if (regionalPrice) {
      // Use regional pricing
      let cost = regionalPrice.cost_per_kg * weight;
      
      // Apply minimum cost if specified
      if (regionalPrice.min_cost) {
        cost = Math.max(cost, regionalPrice.min_cost);
      }

      return {
        cost: Math.max(cost, 0), // Ensure non-negative
        usedRegionalPricing: true,
        costPerKg: regionalPrice.cost_per_kg,
      };
    }

    // Fallback to base cost with weight multiplier
    // If service has specific cost_per_kg, use that. Otherwise use 10% of base_cost as default multiplier
    const weightMultiplier = service.cost_per_kg ?? (service.base_cost * 0.1);
    const cost = service.base_cost + (weightMultiplier * weight);
    
    return {
      cost: Math.max(cost, 0),
      usedRegionalPricing: false,
      costPerKg: service.cost_per_kg
    };
  }

  /**
   * Get regional pricing for a service and region
   * 
   * @param service - Shipping service
   * @param region - Target region
   * @returns Regional pricing or null if not found
   */
  private getRegionalPrice(
    service: ShippingService,
    region: Region
  ): RegionalPricing | null {
    if (!service.regional_pricing || service.regional_pricing.length === 0) {
      return null;
    }

    return service.regional_pricing.find(rp => rp.region === region) || null;
  }

  /**
   * Check if a service is available in a region
   * A service is available if:
   * 1. It has no regional_pricing (uses base_cost for all regions)
   * 2. It has regional_pricing for the specified region
   * 
   * @param service - Shipping service
   * @param region - Target region
   * @returns true if service is available
   */
  private isServiceAvailableInRegion(
    service: ShippingService,
    region: Region
  ): boolean {
    // If unknown region, only show services without regional pricing
    if (region === 'unknown') {
      return !service.regional_pricing || service.regional_pricing.length === 0;
    }

    // If no regional pricing, service is available everywhere
    if (!service.regional_pricing || service.regional_pricing.length === 0) {
      return true;
    }

    // Check if region is in the regional pricing list
    return service.regional_pricing.some(rp => rp.region === region);
  }

  /**
   * Filter providers by region availability
   * 
   * @param providers - All providers
   * @param region - Target region
   * @returns Filtered providers with only available services
   */
  filterProvidersByRegion(
    providers: ShippingProvider[],
    region: Region
  ): ShippingProvider[] {
    return providers
      .filter(p => p.is_active)
      .map(provider => ({
        ...provider,
        services: provider.services.filter(service =>
          this.isServiceAvailableInRegion(service, region)
        ),
      }))
      .filter(provider => provider.services.length > 0);
  }

  /**
   * Calculate volumetric weight from dimensions
   * 
   * @param dimensions - Package dimensions in cm
   * @returns Volumetric weight in kg
   */
  private calculateVolumetricWeight(dimensions: {
    length: number;
    width: number;
    height: number;
  }): number {
    // Standard dimensional factor: 5000 for international shipping
    return (dimensions.length * dimensions.width * dimensions.height) / 5000;
  }

  /**
   * Get the region detector instance
   */
  getRegionDetector(): RegionDetector {
    return this.regionDetector;
  }
}

/**
 * Default instance of ShippingCalculator
 */
export const shippingCalculator = new ShippingCalculator();
