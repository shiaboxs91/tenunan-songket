# Requirements Document: Regional Shipping Pricing Enhancement

## Introduction

This document specifies the requirements for enhancing the Tenunan Songket e-commerce platform's shipping system to support region-based pricing for international destinations. The system currently uses a flat-rate pricing model that does not account for regional variations in shipping costs across Malaysia (Semenanjung, Sabah, Sarawak) and Singapore. This enhancement will enable accurate shipping cost calculation based on destination regions while maintaining backward compatibility with existing shipping providers.

## Glossary

- **Shipping_System**: The subsystem responsible for calculating and displaying shipping costs during checkout
- **Region**: A geographical area with distinct shipping rates (e.g., Semenanjung, Sabah, Sarawak, Singapore, Brunei)
- **State_Code**: A standardized abbreviation for Malaysian states (e.g., "JHR" for Johor, "SBH" for Sabah)
- **Regional_Pricing**: A pricing structure that varies based on the destination region
- **Cost_Per_Kg**: The shipping rate charged per kilogram for a specific region
- **Region_Detector**: The component that determines the destination region from an address
- **Shipping_Provider**: A courier service company (e.g., Skynet, SF-Express, JNE)
- **Shipping_Service**: A specific delivery option offered by a provider (e.g., Standard, Express)
- **Base_Cost**: The default or fallback shipping cost when regional pricing is not available
- **Address_State**: The state field in a customer's delivery address
- **Store_Currency**: Brunei Dollar (BND), the primary currency used in the store
- **JSONB_Services**: The JSON field in the shipping_providers table that stores service configurations

## Requirements

### Requirement 1: Regional Pricing Data Structure

**User Story:** As a system administrator, I want to configure different shipping rates for different regions, so that customers are charged accurate shipping costs based on their destination.

#### Acceptance Criteria

1. THE Shipping_System SHALL store regional pricing configurations in the JSONB_Services field
2. WHEN a Shipping_Service includes regional pricing, THE Shipping_System SHALL store region code, region name, state codes array, and cost per kilogram for each region
3. THE Shipping_System SHALL maintain Base_Cost as a fallback when regional pricing is not available
4. WHEN regional pricing is not configured for a service, THE Shipping_System SHALL use the Base_Cost for all destinations
5. THE Shipping_System SHALL support multiple regions per Shipping_Service with distinct pricing

### Requirement 2: State-to-Region Mapping

**User Story:** As a developer, I want a reliable mapping between Malaysian states and shipping regions, so that the system can automatically detect the correct region from customer addresses.

#### Acceptance Criteria

1. THE Shipping_System SHALL map Semenanjung region to state codes: JHR, KDH, KTN, MLK, NSN, PHG, PNG, PRK, PLS, SEL, TRG, KUL, LBN, PJY
2. THE Shipping_System SHALL map Sabah region to state code: SBH
3. THE Shipping_System SHALL map Sarawak region to state code: SWK
4. THE Shipping_System SHALL map Singapore region to country code: SG
5. THE Shipping_System SHALL map Brunei region to country code: BN
6. WHEN an Address_State matches a State_Code in the mapping, THE Region_Detector SHALL return the corresponding region

### Requirement 3: Region Detection from Address

**User Story:** As a customer, I want the system to automatically detect my shipping region from my address, so that I see accurate shipping costs without manual selection.

#### Acceptance Criteria

1. WHEN a customer provides an address with a valid Address_State, THE Region_Detector SHALL determine the destination region automatically
2. WHEN the Address_State matches a State_Code in the mapping, THE Region_Detector SHALL return the corresponding region code
3. WHEN the Address_State does not match any State_Code, THE Region_Detector SHALL return null to indicate manual selection is needed
4. THE Region_Detector SHALL perform case-insensitive matching of State_Codes
5. WHEN multiple addresses exist, THE Region_Detector SHALL detect the region for the selected delivery address

### Requirement 4: Regional Shipping Cost Calculation

**User Story:** As a customer, I want to see accurate shipping costs based on my destination region, so that I know the exact amount I need to pay for delivery.

#### Acceptance Criteria

1. WHEN calculating shipping cost with regional pricing available, THE Shipping_System SHALL use the cost per kilogram for the detected region
2. WHEN regional pricing is not available for the detected region, THE Shipping_System SHALL use the Base_Cost
3. WHEN the region cannot be detected, THE Shipping_System SHALL use the Base_Cost as fallback
4. THE Shipping_System SHALL multiply Cost_Per_Kg by the total package weight to calculate the final shipping cost
5. WHEN a Shipping_Service has a base cost in regional pricing, THE Shipping_System SHALL apply the maximum of (Cost_Per_Kg × weight) and base cost

### Requirement 5: Skynet Provider Integration

**User Story:** As a system administrator, I want to add Skynet as a shipping provider with regional pricing for Malaysia, so that customers can choose Skynet for deliveries to Malaysian destinations.

#### Acceptance Criteria

1. THE Shipping_System SHALL include Skynet as an active Shipping_Provider
2. THE Skynet provider SHALL offer a Standard service with regional pricing
3. WHEN shipping to Semenanjung region, THE Skynet Standard service SHALL charge 132,000 BND per kilogram
4. WHEN shipping to Sabah region, THE Skynet Standard service SHALL charge 142,000 BND per kilogram
5. WHEN shipping to Sarawak region, THE Skynet Standard service SHALL charge 142,000 BND per kilogram
6. THE Skynet Standard service SHALL have an estimated delivery time of 2-3 days

### Requirement 6: SF-Express Provider Integration

**User Story:** As a system administrator, I want to add SF-Express as a shipping provider for Singapore, so that customers can choose SF-Express for deliveries to Singapore.

#### Acceptance Criteria

1. THE Shipping_System SHALL include SF-Express as an active Shipping_Provider
2. THE SF-Express provider SHALL offer a Standard service with regional pricing
3. WHEN shipping to Singapore region, THE SF-Express Standard service SHALL charge 107,000 BND per kilogram
4. THE SF-Express provider SHALL store the website URL https://htm.sf-express.com in its configuration
5. THE SF-Express Standard service SHALL have an estimated delivery time specified

### Requirement 7: Shipping Provider Filtering by Region

**User Story:** As a customer, I want to see only shipping providers that serve my destination region, so that I don't waste time selecting unavailable options.

#### Acceptance Criteria

1. WHEN displaying available shipping options, THE Shipping_System SHALL filter providers based on the detected region
2. WHEN a Shipping_Service has regional pricing, THE Shipping_System SHALL only display it if the detected region is in the regional pricing array
3. WHEN a Shipping_Service has no regional pricing, THE Shipping_System SHALL display it for all regions
4. WHEN no region is detected, THE Shipping_System SHALL display all active Shipping_Services
5. THE Shipping_System SHALL display at least one shipping option for every valid region

### Requirement 8: Shipping Cost Display in UI

**User Story:** As a customer, I want to see clear shipping costs with region information, so that I understand why different rates apply to different destinations.

#### Acceptance Criteria

1. WHEN displaying shipping options, THE Shipping_System SHALL show the calculated cost for each service
2. WHEN regional pricing is applied, THE Shipping_System SHALL display the detected region name
3. THE Shipping_System SHALL format shipping costs in Store_Currency with appropriate decimal places
4. WHEN multiple services are available, THE Shipping_System SHALL display them in order of display_order
5. THE Shipping_System SHALL show the cost per kilogram rate alongside the total cost

### Requirement 9: Manual Region Override

**User Story:** As a customer, I want to manually select my destination region if auto-detection fails, so that I can still complete my purchase with accurate shipping costs.

#### Acceptance Criteria

1. WHEN region detection returns null, THE Shipping_System SHALL display a region selection interface
2. THE region selection interface SHALL list all available regions with their names
3. WHEN a customer selects a region manually, THE Shipping_System SHALL recalculate shipping costs using the selected region
4. THE Shipping_System SHALL persist the manually selected region for the current checkout session
5. WHEN the customer changes their address, THE Shipping_System SHALL re-attempt automatic region detection

### Requirement 10: Backward Compatibility

**User Story:** As a system administrator, I want existing shipping providers without regional pricing to continue working, so that the system remains functional during the migration period.

#### Acceptance Criteria

1. WHEN a Shipping_Service does not have regional pricing configured, THE Shipping_System SHALL use the Base_Cost for all destinations
2. THE Shipping_System SHALL support both old format (base_cost only) and new format (regional_pricing array) simultaneously
3. WHEN calculating costs for services without regional pricing, THE Shipping_System SHALL not require region detection
4. THE Shipping_System SHALL display services without regional pricing alongside services with regional pricing
5. WHEN migrating existing providers, THE Shipping_System SHALL preserve all existing service configurations

### Requirement 11: Database Migration for New Providers

**User Story:** As a system administrator, I want to add new shipping providers through database migrations, so that the deployment process is automated and repeatable.

#### Acceptance Criteria

1. THE Shipping_System SHALL provide a migration script to insert Skynet provider with regional pricing
2. THE Shipping_System SHALL provide a migration script to insert SF-Express provider with regional pricing
3. WHEN running migrations, THE Shipping_System SHALL set is_active to true for new providers
4. WHEN running migrations, THE Shipping_System SHALL assign appropriate display_order values
5. THE migration scripts SHALL be idempotent and safe to run multiple times

### Requirement 12: TypeScript Type Safety

**User Story:** As a developer, I want strong TypeScript types for regional pricing structures, so that I can catch errors at compile time and have better IDE support.

#### Acceptance Criteria

1. THE Shipping_System SHALL define a RegionalPricing interface with region, region_name, state_codes, cost_per_kg, and optional base_cost fields
2. THE Shipping_System SHALL extend the ShippingService interface to include optional regional_pricing array
3. THE Shipping_System SHALL define a Region type union for valid region codes
4. THE Shipping_System SHALL export all shipping-related types from a central types file
5. WHEN accessing regional pricing properties, THE TypeScript compiler SHALL enforce type safety

### Requirement 13: Region Detection Testing

**User Story:** As a developer, I want comprehensive tests for region detection logic, so that I can ensure accurate region mapping for all Malaysian states.

#### Acceptance Criteria

1. THE Shipping_System SHALL validate that all Semenanjung state codes map to the semenanjung region
2. THE Shipping_System SHALL validate that Sabah state code maps to the sabah region
3. THE Shipping_System SHALL validate that Sarawak state code maps to the sarawak region
4. THE Shipping_System SHALL validate that Singapore country code maps to the singapore region
5. THE Shipping_System SHALL validate that Brunei country code maps to the brunei region
6. THE Shipping_System SHALL validate that invalid state codes return null

### Requirement 14: Shipping Cost Calculation Testing

**User Story:** As a developer, I want property-based tests for shipping cost calculations, so that I can verify correctness across all possible weight and region combinations.

#### Acceptance Criteria

1. THE Shipping_System SHALL validate that calculated cost equals Cost_Per_Kg multiplied by weight for any valid weight and region
2. THE Shipping_System SHALL validate that costs are never negative for any input
3. THE Shipping_System SHALL validate that regional pricing takes precedence over Base_Cost when available
4. THE Shipping_System SHALL validate that Base_Cost is used when regional pricing is unavailable
5. THE Shipping_System SHALL validate that cost calculation handles zero weight gracefully
