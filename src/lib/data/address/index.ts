/**
 * Address Data Index
 * 
 * Static address data for Brunei, Malaysia, and Singapore
 * Used for dropdown selections in address forms
 */

// Type definitions
export interface Country {
  code: string;
  name: string;
  phone_code: string;
  postal_format: string;
  postal_example: string;
}

// Brunei types
export interface BruneiKampong {
  name: string;
}

export interface BruneiMukim {
  code: string;
  name: string;
  kampongs: string[];
}

export interface BruneiDistrict {
  code: string;
  name: string;
  mukims: BruneiMukim[];
}

export interface BruneiData {
  country: Country;
  districts: BruneiDistrict[];
  postcodes: Record<string, string[]>;
}

// Malaysia types
export interface MalaysiaCity {
  name: string;
  postcodes: string[];
}

export interface MalaysiaState {
  code: string;
  name: string;
  cities: MalaysiaCity[];
}

export interface MalaysiaData {
  country: Country;
  states: MalaysiaState[];
}

// Singapore types
export interface SingaporeDistrict {
  code: string;
  name: string;
  postal_sectors: string[];
}

export interface SingaporeRegion {
  code: string;
  name: string;
  districts: SingaporeDistrict[];
}

export interface SingaporePlanningArea {
  code: string;
  name: string;
}

export interface SingaporeData {
  country: Country;
  regions: SingaporeRegion[];
  planning_areas: SingaporePlanningArea[];
  note: string;
}

// Import JSON data
import bruneiData from './brunei.json';
import malaysiaData from './malaysia.json';
import singaporeData from './singapore.json';

// Export typed data
export const brunei = bruneiData as BruneiData;
export const malaysia = malaysiaData as MalaysiaData;
export const singapore = singaporeData as SingaporeData;

// Helper functions
export function getBruneiDistricts(): BruneiDistrict[] {
  return brunei.districts;
}

export function getBruneiMukims(districtCode: string): BruneiMukim[] {
  const district = brunei.districts.find(d => d.code === districtCode);
  return district?.mukims || [];
}

export function getBruneiKampongs(districtCode: string, mukimCode: string): string[] {
  const mukims = getBruneiMukims(districtCode);
  const mukim = mukims.find(m => m.code === mukimCode);
  return mukim?.kampongs || [];
}

export function getMalaysiaStates(): MalaysiaState[] {
  return malaysia.states;
}

export function getMalaysiaCities(stateCode: string): MalaysiaCity[] {
  const state = malaysia.states.find(s => s.code === stateCode);
  return state?.cities || [];
}

export function getMalaysiaPostcodes(stateCode: string, cityName: string): string[] {
  const cities = getMalaysiaCities(stateCode);
  const city = cities.find(c => c.name === cityName);
  return city?.postcodes || [];
}

export function findMalaysiaLocationByPostcode(postcode: string): { state: string; city: string } | null {
  for (const state of malaysia.states) {
    for (const city of state.cities) {
      if (city.postcodes.includes(postcode)) {
        return { state: state.name, city: city.name };
      }
    }
  }
  return null;
}

export function getSingaporePlanningAreas(): SingaporePlanningArea[] {
  return singapore.planning_areas;
}

export function getSingaporeRegions(): SingaporeRegion[] {
  return singapore.regions;
}

// Country list for dropdown
export const SUPPORTED_COUNTRIES = [
  { code: 'BN', name: 'Brunei Darussalam', phoneCode: '+673' },
  { code: 'MY', name: 'Malaysia', phoneCode: '+60' },
  { code: 'SG', name: 'Singapore', phoneCode: '+65' },
] as const;

export type SupportedCountryCode = typeof SUPPORTED_COUNTRIES[number]['code'];
