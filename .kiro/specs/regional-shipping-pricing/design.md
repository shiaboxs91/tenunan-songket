# Design Document: Regional Shipping Pricing Enhancement

## Overview

This design extends the existing shipping system to support region-based pricing for international destinations across ASEAN countries. The solution leverages the existing JSONB `services` field in the `shipping_providers` table to store regional pricing configurations, avoiding the need for new database tables while maintaining backward compatibility.

The design introduces three key components:
1. **Regional Pricing Data Structure**: Extends the existing `ShippingService` interface to include optional regional pricing arrays
2. **Region Detection Logic**: Maps customer addresses to shipping regions using state/country codes
3. **Enhanced Shipping Calculator**: Applies region-specific rates when calculating shipping costs

The system will support automatic region detection from addresses with fallback to manual selection, ensuring customers always see accurate shipping costs for their destination.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Checkout Flow                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              ShippingSelector Component                      │
│  - Displays available shipping options                       │
│  - Shows regional pricing information                        │
│  - Handles manual region override                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Region Detection Layer                          │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  RegionDetector                               │           │
│  │  - detectRegionFromAddress()                  │           │
│  │  - getRegionFromStateCode()                   │           │
│  │  - validateRegion()                           │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  StateRegionMapping                           │           │
│  │  - SEMENANJUNG_STATES[]                       │           │
│  │  - SABAH_STATES[]                             │           │
│  │  - SARAWAK_STATES[]                           │           │
│  │  - stateToRegion()                            │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Shipping Calculation Layer                         │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  ShippingCalculator                           │           │
│  │  - calculateShipping()                        │           │
│  │  - getRegionalPrice()                         │           │
│  │  - filterProvidersByRegion()                  │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Access Layer                           │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  Supabase Client                              │           │
│  │  - fetchShippingProviders()                   │           │
│  │  - getActiveProviders()                       │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  shipping_providers table                     │           │
│  │  - services (JSONB with regional_pricing)     │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Address Selection**: Customer selects or enters delivery address
2. **Region Detection**: System extracts state/country code and maps to region
3. **Provider Filtering**: System filters shipping providers that serve the detected region
4. **Price Calculation**: System calculates shipping cost using regional rate × weight
5. **Display**: UI shows available options with regional pricing information
6. **Manual Override** (if needed): Customer can manually select region if auto-detection fails

## Components and Interfaces

### 1. Type Definitions

```typescript
// Core region type
type Region = 'semenanjung' | 'sabah' | 'sarawak' | 'singapore' | 'brunei';

// Regional pricing configuration
interface RegionalPricing {
  region: Region;
  region_name: string;
  state_codes?: string[];  // For auto-detection
  cost_per_kg: number;     // Cost in BND
  base_cost?: number;      // Optional minimum cost
}

// Extended shipping service with regional pricing
interface ShippingService {
  code: string;
  name: string;
  estimated_days: string;
  base_cost: number;                    // Fallback cost
  regional_pricing?: RegionalPricing[]; // Optional regional rates
}

// Shipping provider from database
interface ShippingProvider {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  services: ShippingService[];
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

// Region detection result
interface RegionDetectionResult {
  region: Region | null;
  confidence: 'high' | 'low' | 'none';
  source: 'state_code' | 'country_code' | 'manual' | 'unknown';
  detected_from?: string; // The state/country code used
}

// Shipping calculation input
interface ShippingCalculationInput {
  weight_kg: number;
  region?: Region;
  address_state?: string;
  address_country?: string;
}

// Shipping calculation result
interface ShippingCalculationResult {
  provider_code: string;
  provider_name: string;
  service_code: string;
  service_name: string;
  cost: number;
  cost_per_kg: number;
  estimated_days: string;
  region_used: Region | null;
  region_name?: string;
}
```

### 2. State-to-Region Mapping Configuration

```typescript
// src/lib/shipping/region-mapping.ts

export const REGION_MAPPING = {
  semenanjung: {
    name: 'Semenanjung Malaysia',
    states: [
      'JHR', // Johor
      'KDH', // Kedah
      'KTN', // Kelantan
      'MLK', // Melaka
      'NSN', // Negeri Sembilan
      'PHG', // Pahang
      'PNG', // Penang
      'PRK', // Perak
      'PLS', // Perlis
      'SEL', // Selangor
      'TRG', // Terengganu
      'KUL', // Kuala Lumpur
      'LBN', // Labuan
      'PJY', // Putrajaya
    ],
  },
  sabah: {
    name: 'Sabah',
    states: ['SBH'],
  },
  sarawak: {
    name: 'Sarawak',
    states: ['SWK'],
  },
  singapore: {
    name: 'Singapore',
    countries: ['SG'],
  },
  brunei: {
    name: 'Brunei',
    countries: ['BN'],
  },
} as const;

export function stateToRegion(stateCode: string): Region | null {
  const normalizedCode = stateCode.trim().toUpperCase();
  
  for (const [region, config] of Object.entries(REGION_MAPPING)) {
    if (config.states?.includes(normalizedCode)) {
      return region as Region;
    }
    if (config.countries?.includes(normalizedCode)) {
      return region as Region;
    }
  }
  
  return null;
}

export function getRegionName(region: Region): string {
  return REGION_MAPPING[region]?.name || region;
}

export function getAllRegions(): Region[] {
  return Object.keys(REGION_MAPPING) as Region[];
}
```

### 3. Region Detector

```typescript
// src/lib/shipping/region-detector.ts

export class RegionDetector {
  /**
   * Detect region from a customer address
   */
  detectRegionFromAddress(address: {
    state?: string;
    country?: string;
  }): RegionDetectionResult {
    // Try state code first (for Malaysia)
    if (address.state) {
      const region = stateToRegion(address.state);
      if (region) {
        return {
          region,
          confidence: 'high',
          source: 'state_code',
          detected_from: address.state,
        };
      }
    }
    
    // Try country code (for Singapore, Brunei)
    if (address.country) {
      const region = stateToRegion(address.country);
      if (region) {
        return {
          region,
          confidence: 'high',
          source: 'country_code',
          detected_from: address.country,
        };
      }
    }
    
    // No detection possible
    return {
      region: null,
      confidence: 'none',
      source: 'unknown',
    };
  }
  
  /**
   * Validate if a region code is valid
   */
  validateRegion(region: string): region is Region {
    return getAllRegions().includes(region as Region);
  }
  
  /**
   * Get region from state code directly
   */
  getRegionFromStateCode(stateCode: string): Region | null {
    return stateToRegion(stateCode);
  }
}
```

### 4. Shipping Calculator

```typescript
// src/lib/shipping/calculator.ts

export class ShippingCalculator {
  /**
   * Calculate shipping cost for a given weight and region
   */
  calculateShipping(
    provider: ShippingProvider,
    service: ShippingService,
    input: ShippingCalculationInput
  ): ShippingCalculationResult {
    // Detect region if not provided
    let region = input.region;
    if (!region && (input.address_state || input.address_country)) {
      const detector = new RegionDetector();
      const detection = detector.detectRegionFromAddress({
        state: input.address_state,
        country: input.address_country,
      });
      region = detection.region || undefined;
    }
    
    // Get regional price or fallback to base cost
    const pricing = this.getRegionalPrice(service, region);
    const cost = pricing.cost_per_kg * input.weight_kg;
    
    // Apply minimum base cost if specified
    const finalCost = pricing.base_cost 
      ? Math.max(cost, pricing.base_cost)
      : cost;
    
    return {
      provider_code: provider.code,
      provider_name: provider.name,
      service_code: service.code,
      service_name: service.name,
      cost: finalCost,
      cost_per_kg: pricing.cost_per_kg,
      estimated_days: service.estimated_days,
      region_used: region || null,
      region_name: region ? getRegionName(region) : undefined,
    };
  }
  
  /**
   * Get regional pricing or fallback to base cost
   */
  private getRegionalPrice(
    service: ShippingService,
    region?: Region
  ): { cost_per_kg: number; base_cost?: number } {
    // If no regional pricing, use base cost
    if (!service.regional_pricing || !region) {
      return {
        cost_per_kg: service.base_cost,
      };
    }
    
    // Find matching regional pricing
    const regionalPrice = service.regional_pricing.find(
      (rp) => rp.region === region
    );
    
    if (regionalPrice) {
      return {
        cost_per_kg: regionalPrice.cost_per_kg,
        base_cost: regionalPrice.base_cost,
      };
    }
    
    // Fallback to base cost
    return {
      cost_per_kg: service.base_cost,
    };
  }
  
  /**
   * Filter providers that serve a specific region
   */
  filterProvidersByRegion(
    providers: ShippingProvider[],
    region?: Region
  ): ShippingProvider[] {
    if (!region) {
      return providers; // Show all if no region
    }
    
    return providers
      .map((provider) => ({
        ...provider,
        services: provider.services.filter((service) => {
          // Include services without regional pricing (universal)
          if (!service.regional_pricing) {
            return true;
          }
          
          // Include services that have pricing for this region
          return service.regional_pricing.some(
            (rp) => rp.region === region
          );
        }),
      }))
      .filter((provider) => provider.services.length > 0);
  }
}
```

### 5. Updated ShippingSelector Component

```typescript
// src/components/checkout/ShippingSelector.tsx

interface ShippingSelectorProps {
  address: Address;
  weight_kg: number;
  onSelect: (result: ShippingCalculationResult) => void;
}

export function ShippingSelector({ 
  address, 
  weight_kg, 
  onSelect 
}: ShippingSelectorProps) {
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [detectedRegion, setDetectedRegion] = useState<Region | null>(null);
  const [manualRegion, setManualRegion] = useState<Region | null>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  
  useEffect(() => {
    // Detect region from address
    const detector = new RegionDetector();
    const detection = detector.detectRegionFromAddress({
      state: address.state,
      country: address.country,
    });
    
    setDetectedRegion(detection.region);
    
    // Show manual selector if detection failed
    if (detection.confidence === 'none') {
      setShowRegionSelector(true);
    }
    
    // Fetch and filter providers
    fetchProviders(detection.region || manualRegion);
  }, [address, manualRegion]);
  
  const fetchProviders = async (region?: Region | null) => {
    const allProviders = await getActiveShippingProviders();
    const calculator = new ShippingCalculator();
    const filtered = calculator.filterProvidersByRegion(
      allProviders,
      region || undefined
    );
    setProviders(filtered);
  };
  
  const handleServiceSelect = (
    provider: ShippingProvider,
    service: ShippingService
  ) => {
    const calculator = new ShippingCalculator();
    const result = calculator.calculateShipping(provider, service, {
      weight_kg,
      region: manualRegion || detectedRegion || undefined,
      address_state: address.state,
      address_country: address.country,
    });
    onSelect(result);
  };
  
  const activeRegion = manualRegion || detectedRegion;
  
  return (
    <div className="shipping-selector">
      {/* Region Detection Display */}
      {activeRegion && (
        <div className="region-info">
          <span>Shipping to: {getRegionName(activeRegion)}</span>
          <button onClick={() => setShowRegionSelector(true)}>
            Change Region
          </button>
        </div>
      )}
      
      {/* Manual Region Selector */}
      {showRegionSelector && (
        <div className="region-selector">
          <label>Select Destination Region:</label>
          <select
            value={manualRegion || ''}
            onChange={(e) => {
              setManualRegion(e.target.value as Region);
              setShowRegionSelector(false);
            }}
          >
            <option value="">-- Select Region --</option>
            {getAllRegions().map((region) => (
              <option key={region} value={region}>
                {getRegionName(region)}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Shipping Options */}
      <div className="shipping-options">
        {providers.map((provider) =>
          provider.services.map((service) => {
            const calculator = new ShippingCalculator();
            const result = calculator.calculateShipping(provider, service, {
              weight_kg,
              region: activeRegion || undefined,
            });
            
            return (
              <div
                key={`${provider.code}-${service.code}`}
                className="shipping-option"
                onClick={() => handleServiceSelect(provider, service)}
              >
                <div className="provider-info">
                  {provider.logo_url && (
                    <img src={provider.logo_url} alt={provider.name} />
                  )}
                  <div>
                    <h4>{provider.name}</h4>
                    <p>{service.name}</p>
                    <span>{service.estimated_days}</span>
                  </div>
                </div>
                <div className="pricing-info">
                  <div className="cost">BND {result.cost.toFixed(2)}</div>
                  <div className="rate">
                    {result.cost_per_kg.toFixed(0)} BND/kg
                  </div>
                  {result.region_name && (
                    <div className="region-tag">{result.region_name}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
```

## Data Models

### Database Schema (Existing)

The `shipping_providers` table structure remains unchanged:

```sql
CREATE TABLE shipping_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  code VARCHAR NOT NULL UNIQUE,
  logo_url TEXT,
  services JSONB,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### JSONB Services Structure

**Old Format (Backward Compatible):**
```json
{
  "code": "REG",
  "name": "Regular Service",
  "estimated_days": "3-5 hari",
  "base_cost": 50000
}
```

**New Format (With Regional Pricing):**
```json
{
  "code": "STD",
  "name": "Standard Service",
  "estimated_days": "2-3 hari",
  "base_cost": 132000,
  "regional_pricing": [
    {
      "region": "semenanjung",
      "region_name": "Semenanjung Malaysia",
      "state_codes": ["JHR", "KDH", "KTN", "MLK", "NSN", "PHG", "PNG", "PRK", "PLS", "SEL", "TRG", "KUL", "LBN", "PJY"],
      "cost_per_kg": 132000
    },
    {
      "region": "sabah",
      "region_name": "Sabah",
      "state_codes": ["SBH"],
      "cost_per_kg": 142000
    },
    {
      "region": "sarawak",
      "region_name": "Sarawak",
      "state_codes": ["SWK"],
      "cost_per_kg": 142000
    }
  ]
}
```

### Migration Data

**Skynet Provider:**
```json
{
  "name": "Skynet",
  "code": "skynet",
  "is_active": true,
  "display_order": 10,
  "services": [
    {
      "code": "STD",
      "name": "Skynet Standard",
      "estimated_days": "2-3 hari",
      "base_cost": 132000,
      "regional_pricing": [
        {
          "region": "semenanjung",
          "region_name": "Semenanjung Malaysia",
          "state_codes": ["JHR", "KDH", "KTN", "MLK", "NSN", "PHG", "PNG", "PRK", "PLS", "SEL", "TRG", "KUL", "LBN", "PJY"],
          "cost_per_kg": 132000
        },
        {
          "region": "sabah",
          "region_name": "Sabah",
          "state_codes": ["SBH"],
          "cost_per_kg": 142000
        },
        {
          "region": "sarawak",
          "region_name": "Sarawak",
          "state_codes": ["SWK"],
          "cost_per_kg": 142000
        }
      ]
    }
  ]
}
```

**SF-Express Provider:**
```json
{
  "name": "SF-Express",
  "code": "sf-express",
  "logo_url": "https://htm.sf-express.com/logo.png",
  "is_active": true,
  "display_order": 11,
  "services": [
    {
      "code": "STD",
      "name": "SF-Express Standard",
      "estimated_days": "2-4 hari",
      "base_cost": 107000,
      "regional_pricing": [
        {
          "region": "singapore",
          "region_name": "Singapore",
          "cost_per_kg": 107000
        }
      ]
    }
  ]
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Requirements 1.3, 1.4, and 10.1 all specify the same fallback behavior (use base_cost when regional pricing unavailable) → Combine into Property 1
- Requirements 2.6, 3.1, and 3.2 all specify state-to-region mapping behavior → Covered by Property 2
- Requirements 4.2 and 4.3 both specify fallback to base_cost → Combine into Property 1
- Requirements 4.1, 14.3 specify regional pricing precedence → Covered by Property 3
- Requirements 4.4 and 14.1 specify cost calculation formula → Covered by Property 4
- Requirements 13.1-13.6 duplicate requirements 2.1-2.6 → Already covered by Properties 2 and 6
- Requirements 14.4 duplicates 4.2 → Already covered by Property 1

After eliminating redundancies, we have 11 unique properties to test.

### Property 1: Base Cost Fallback

*For any* shipping service and any region, when regional pricing is not configured or the region is not found in the regional_pricing array, the shipping cost calculation should use the base_cost.

**Validates: Requirements 1.3, 1.4, 4.2, 4.3, 10.1, 14.4**

### Property 2: State-to-Region Mapping Correctness

*For any* valid state code from the Semenanjung states list (JHR, KDH, KTN, MLK, NSN, PHG, PNG, PRK, PLS, SEL, TRG, KUL, LBN, PJY), the region detector should return "semenanjung" as the region.

**Validates: Requirements 2.1, 2.6, 13.1**

### Property 3: Regional Pricing Precedence

*For any* shipping service with regional pricing configured, when calculating cost for a region that exists in the regional_pricing array, the system should use the regional cost_per_kg instead of the base_cost.

**Validates: Requirements 4.1, 14.3**

### Property 4: Cost Calculation Formula

*For any* valid weight (kg) and cost_per_kg rate, the calculated shipping cost should equal weight × cost_per_kg (or the maximum of this value and base_cost if base_cost is specified in regional pricing).

**Validates: Requirements 4.4, 4.5, 14.1**

### Property 5: Case-Insensitive State Code Matching

*For any* valid state code, the region detector should return the same region regardless of the case (uppercase, lowercase, or mixed case) of the input state code.

**Validates: Requirements 3.4**

### Property 6: Invalid State Code Handling

*For any* string that is not a valid state code or country code in the mapping, the region detector should return null.

**Validates: Requirements 3.3, 13.6**

### Property 7: Regional Pricing Data Structure Validation

*For any* shipping service with regional_pricing configured, each regional pricing entry should contain all required fields: region, region_name, cost_per_kg, and optionally state_codes and base_cost.

**Validates: Requirements 1.2**

### Property 8: Provider Filtering by Region

*For any* list of shipping providers and a specific region, the filtered result should only include services that either have no regional_pricing (universal services) or have the specified region in their regional_pricing array.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 9: Non-Negative Cost Invariant

*For any* valid shipping calculation inputs (weight, region, service), the calculated shipping cost should never be negative.

**Validates: Requirements 14.2**

### Property 10: Service Sorting by Display Order

*For any* list of shipping services with display_order values, when sorted, the services should be ordered by their display_order field in ascending order.

**Validates: Requirements 8.4**

### Property 11: Migration Idempotence

*For any* migration script that inserts shipping providers, running the script multiple times should produce the same final database state (same providers with same configurations).

**Validates: Requirements 11.5**

### Property 12: Backward Compatibility

*For any* shipping service in the old format (with only base_cost, no regional_pricing), the cost calculation should work correctly and return base_cost × weight.

**Validates: Requirements 10.2, 10.3**

## Error Handling

### Region Detection Errors

**Scenario**: Address has invalid or missing state/country code
- **Handling**: Return `RegionDetectionResult` with `region: null` and `confidence: 'none'`
- **User Experience**: Display manual region selector
- **Fallback**: Use base_cost for shipping calculation

**Scenario**: State code format is ambiguous or corrupted
- **Handling**: Normalize input (trim, uppercase) before matching
- **User Experience**: Attempt auto-detection with normalized input
- **Fallback**: If still fails, show manual selector

### Shipping Calculation Errors

**Scenario**: Service has regional_pricing but region is null
- **Handling**: Fall back to base_cost
- **User Experience**: Show base rate with note "Select region for accurate pricing"
- **Logging**: Log warning for analytics

**Scenario**: Weight is zero or negative
- **Handling**: Treat zero weight as valid (return 0 or base_cost), reject negative weight
- **User Experience**: Show validation error for negative weight
- **Validation**: Validate weight at input level

**Scenario**: Regional pricing entry missing cost_per_kg
- **Handling**: Fall back to base_cost for that region
- **User Experience**: Show base rate
- **Logging**: Log error for data integrity issue

### Provider Filtering Errors

**Scenario**: No providers serve the detected region
- **Handling**: Show all universal providers (those without regional_pricing)
- **User Experience**: Display message "Limited shipping options for your region"
- **Fallback**: Allow manual region selection to see other options

**Scenario**: All providers are inactive
- **Handling**: Return empty array
- **User Experience**: Show error message "Shipping unavailable, please contact support"
- **Admin Alert**: Send notification to admin

### Data Integrity Errors

**Scenario**: JSONB services field is malformed
- **Handling**: Catch JSON parse errors, skip malformed provider
- **User Experience**: Show other valid providers
- **Logging**: Log error with provider ID for investigation

**Scenario**: Regional pricing has duplicate regions
- **Handling**: Use first occurrence, log warning
- **User Experience**: No impact (first match used)
- **Logging**: Log data integrity warning

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of state-to-region mappings (e.g., "JHR" → "semenanjung")
- Edge cases (empty strings, null values, special characters)
- Integration between components (RegionDetector → ShippingCalculator)
- Error conditions (malformed data, missing fields)
- UI component rendering and interaction

**Property-Based Tests** focus on:
- Universal properties across all inputs (cost calculation formula)
- State code mapping for all valid codes
- Case-insensitivity for all state codes
- Filtering logic for all region combinations
- Data structure validation for all services

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: regional-shipping-pricing, Property {N}: {description}`
- Use custom generators for domain types (Region, StateCode, ShippingService)

**Test Organization**:
```
src/lib/shipping/__tests__/
├── region-detector.test.ts          # Unit tests
├── region-detector.properties.test.ts  # Property tests
├── calculator.test.ts                # Unit tests
├── calculator.properties.test.ts     # Property tests
├── filtering.test.ts                 # Unit tests
├── filtering.properties.test.ts      # Property tests
└── generators.ts                     # Custom generators for PBT
```

### Custom Generators

```typescript
// generators.ts
import * as fc from 'fast-check';

export const regionArb = fc.constantFrom(
  'semenanjung', 'sabah', 'sarawak', 'singapore', 'brunei'
);

export const stateCodeArb = fc.constantFrom(
  'JHR', 'KDH', 'KTN', 'MLK', 'NSN', 'PHG', 'PNG', 
  'PRK', 'PLS', 'SEL', 'TRG', 'KUL', 'LBN', 'PJY',
  'SBH', 'SWK'
);

export const regionalPricingArb = fc.record({
  region: regionArb,
  region_name: fc.string(),
  state_codes: fc.option(fc.array(stateCodeArb)),
  cost_per_kg: fc.nat({ max: 1000000 }),
  base_cost: fc.option(fc.nat({ max: 1000000 })),
});

export const shippingServiceArb = fc.record({
  code: fc.string({ minLength: 2, maxLength: 10 }),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  estimated_days: fc.string(),
  base_cost: fc.nat({ max: 1000000 }),
  regional_pricing: fc.option(fc.array(regionalPricingArb)),
});

export const weightArb = fc.float({ 
  min: 0, 
  max: 100, 
  noNaN: true 
});
```

### Example Property Test

```typescript
// region-detector.properties.test.ts
import * as fc from 'fast-check';
import { RegionDetector } from '../region-detector';
import { stateCodeArb } from './generators';

describe('RegionDetector Properties', () => {
  const detector = new RegionDetector();
  
  // Feature: regional-shipping-pricing, Property 5: Case-Insensitive State Code Matching
  it('should return same region regardless of case', () => {
    fc.assert(
      fc.property(stateCodeArb, (stateCode) => {
        const upperResult = detector.getRegionFromStateCode(stateCode.toUpperCase());
        const lowerResult = detector.getRegionFromStateCode(stateCode.toLowerCase());
        const mixedResult = detector.getRegionFromStateCode(
          stateCode.charAt(0).toUpperCase() + stateCode.slice(1).toLowerCase()
        );
        
        return upperResult === lowerResult && lowerResult === mixedResult;
      }),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Checkout Flow Integration**:
1. Create test address with known state code
2. Verify region is detected correctly
3. Verify shipping options are filtered appropriately
4. Verify costs are calculated with correct regional rate
5. Verify UI displays region information

**Database Integration**:
1. Insert test providers with regional pricing
2. Query and verify JSONB structure is preserved
3. Test backward compatibility with old format providers
4. Verify migrations are idempotent

### Manual Testing Checklist

- [ ] Test address in each Malaysian state maps to correct region
- [ ] Test Singapore address maps to singapore region
- [ ] Test Brunei address maps to brunei region
- [ ] Test invalid state code shows manual region selector
- [ ] Test manual region selection updates shipping costs
- [ ] Test changing address re-triggers region detection
- [ ] Test Skynet shows correct rates for each Malaysian region
- [ ] Test SF-Express shows correct rate for Singapore
- [ ] Test providers without regional pricing show for all regions
- [ ] Test cost display shows region name and rate per kg
- [ ] Test zero weight handling
- [ ] Test very large weight (100kg+) calculation
- [ ] Test mixed case state codes work correctly

### Performance Testing

**Targets**:
- Region detection: < 1ms per address
- Shipping calculation: < 5ms for all providers
- Provider filtering: < 10ms for 20+ providers
- UI render: < 100ms for shipping selector

**Load Testing**:
- Test with 100+ concurrent checkout sessions
- Test with 50+ shipping providers
- Test with 10+ services per provider
- Verify no memory leaks in region detection

### Database Migration Testing

**Pre-Migration Validation**:
- Backup existing shipping_providers data
- Verify all existing providers have valid JSONB structure
- Check for any malformed services entries

**Post-Migration Validation**:
- Verify Skynet provider exists with correct regional pricing
- Verify SF-Express provider exists with correct regional pricing
- Verify existing providers are unchanged
- Verify all services have valid structure
- Run idempotence test (run migration again, verify no duplicates)

**Rollback Plan**:
- Keep migration down script to remove new providers
- Document manual rollback steps
- Test rollback in staging environment
