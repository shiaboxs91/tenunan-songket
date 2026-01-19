/**
 * CountryContext for country-aware address functionality
 * Feature: address-management-enhancement
 * Requirements: 7.1, 7.2, 7.3, 7.5, 8.5
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  CountryCode,
  CountryConfig,
  CountryLabels,
  getCountryConfig,
  getFieldLabel as getFieldLabelUtil,
  getValidationPattern,
  getPlaceholder as getPlaceholderUtil,
  getHelperText as getHelperTextUtil,
} from '@/lib/validation/country-config';

/**
 * Context value interface
 */
export interface CountryContextValue {
  /** Currently selected country code */
  selectedCountry: CountryCode;
  
  /** Update the selected country */
  setSelectedCountry: (country: CountryCode) => void;
  
  /** Get localized field label for the current country */
  getFieldLabel: (field: keyof CountryLabels) => string;
  
  /** Get validation rule (regex) for a field in the current country */
  getValidationRule: (field: 'phone' | 'postalCode') => RegExp;
  
  /** Get placeholder text for a field in the current country */
  getPlaceholder: (field: 'phone' | 'postalCode') => string;
  
  /** Get helper text for a field in the current country */
  getHelperText: (field: 'phone' | 'postalCode') => string;
  
  /** Get the complete country configuration */
  getCountryConfiguration: () => CountryConfig;
}

/**
 * Create the context with undefined default
 */
const CountryContext = createContext<CountryContextValue | undefined>(undefined);

/**
 * Props for CountryProvider
 */
export interface CountryProviderProps {
  children: ReactNode;
  /** Initial country code (defaults to Brunei 'BN') */
  initialCountry?: CountryCode;
}

/**
 * CountryProvider component
 * Provides country-aware functionality to child components
 * 
 * Requirements:
 * - 7.1: Country selection dropdown
 * - 7.2: Support for BN, MY, SG, ID
 * - 7.3: Update field labels based on country
 * - 7.5: Default to Brunei for new addresses
 * - 8.5: Preserve form data when country changes
 */
export function CountryProvider({ 
  children, 
  initialCountry = 'BN' // Requirement 7.5: Default to Brunei
}: CountryProviderProps) {
  const [selectedCountry, setSelectedCountryState] = useState<CountryCode>(initialCountry);

  /**
   * Update selected country
   * Requirement 7.3: Update field labels when country changes
   */
  const setSelectedCountry = useCallback((country: CountryCode) => {
    setSelectedCountryState(country);
  }, []);

  /**
   * Get field label for current country
   * Requirement 7.3: Country-specific field labels
   */
  const getFieldLabel = useCallback((field: keyof CountryLabels): string => {
    return getFieldLabelUtil(selectedCountry, field);
  }, [selectedCountry]);

  /**
   * Get validation rule for current country
   * Requirement 7.4: Country-specific validation rules
   */
  const getValidationRule = useCallback((field: 'phone' | 'postalCode'): RegExp => {
    return getValidationPattern(selectedCountry, field);
  }, [selectedCountry]);

  /**
   * Get placeholder text for current country
   * Requirement 6.3: Placeholder text showing example values
   */
  const getPlaceholder = useCallback((field: 'phone' | 'postalCode'): string => {
    return getPlaceholderUtil(selectedCountry, field);
  }, [selectedCountry]);

  /**
   * Get helper text for current country
   * Requirement 6.1, 6.2: Helper text showing expected format
   */
  const getHelperText = useCallback((field: 'phone' | 'postalCode'): string => {
    return getHelperTextUtil(selectedCountry, field);
  }, [selectedCountry]);

  /**
   * Get complete country configuration
   */
  const getCountryConfiguration = useCallback((): CountryConfig => {
    return getCountryConfig(selectedCountry);
  }, [selectedCountry]);

  const value: CountryContextValue = {
    selectedCountry,
    setSelectedCountry,
    getFieldLabel,
    getValidationRule,
    getPlaceholder,
    getHelperText,
    getCountryConfiguration,
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

/**
 * Hook to use CountryContext
 * Throws error if used outside of CountryProvider
 */
export function useCountry(): CountryContextValue {
  const context = useContext(CountryContext);
  
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  
  return context;
}

/**
 * Hook to use CountryContext with optional fallback
 * Returns undefined if used outside of CountryProvider
 */
export function useCountryOptional(): CountryContextValue | undefined {
  return useContext(CountryContext);
}
