/**
 * Unit tests for CountryContext
 * Feature: address-management-enhancement
 */

import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import { CountryProvider, useCountry, useCountryOptional } from './CountryContext';
import { CountryCode } from '@/lib/validation/country-config';

describe('CountryContext', () => {
  describe('CountryProvider', () => {
    it('should provide default country as Brunei (BN)', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current.selectedCountry).toBe('BN');
    });

    it('should accept initial country prop', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: ({ children }) => (
          <CountryProvider initialCountry="MY">{children}</CountryProvider>
        ),
      });

      expect(result.current.selectedCountry).toBe('MY');
    });

    it('should render children', () => {
      render(
        <CountryProvider>
          <div data-testid="child">Test Child</div>
        </CountryProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('useCountry hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useCountry());
      }).toThrow('useCountry must be used within a CountryProvider');

      consoleSpy.mockRestore();
    });

    it('should return context value when used inside provider', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.selectedCountry).toBe('BN');
      expect(typeof result.current.setSelectedCountry).toBe('function');
      expect(typeof result.current.getFieldLabel).toBe('function');
      expect(typeof result.current.getValidationRule).toBe('function');
      expect(typeof result.current.getPlaceholder).toBe('function');
      expect(typeof result.current.getHelperText).toBe('function');
    });
  });

  describe('useCountryOptional hook', () => {
    it('should return undefined when used outside provider', () => {
      const { result } = renderHook(() => useCountryOptional());

      expect(result.current).toBeUndefined();
    });

    it('should return context value when used inside provider', () => {
      const { result } = renderHook(() => useCountryOptional(), {
        wrapper: CountryProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current?.selectedCountry).toBe('BN');
    });
  });

  describe('setSelectedCountry', () => {
    it('should update selected country', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current.selectedCountry).toBe('BN');

      act(() => {
        result.current.setSelectedCountry('MY');
      });

      expect(result.current.selectedCountry).toBe('MY');
    });

    it('should update country multiple times', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      const countries: CountryCode[] = ['BN', 'MY', 'SG', 'ID'];

      countries.forEach((country) => {
        act(() => {
          result.current.setSelectedCountry(country);
        });
        expect(result.current.selectedCountry).toBe(country);
      });
    });
  });

  describe('getFieldLabel', () => {
    it('should return Brunei-specific labels', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current.getFieldLabel('city')).toBe('Bandar');
      expect(result.current.getFieldLabel('state')).toBe('Daerah/Mukim');
      expect(result.current.getFieldLabel('postalCode')).toBe('Poskod');
      expect(result.current.getFieldLabel('phone')).toBe('Nombor Telefon');
    });

    it('should return Malaysia-specific labels', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: ({ children }) => (
          <CountryProvider initialCountry="MY">{children}</CountryProvider>
        ),
      });

      expect(result.current.getFieldLabel('city')).toBe('Bandar');
      expect(result.current.getFieldLabel('state')).toBe('Negeri');
      expect(result.current.getFieldLabel('postalCode')).toBe('Poskod');
      expect(result.current.getFieldLabel('phone')).toBe('Nombor Telefon');
    });

    it('should return Singapore-specific labels', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: ({ children }) => (
          <CountryProvider initialCountry="SG">{children}</CountryProvider>
        ),
      });

      expect(result.current.getFieldLabel('city')).toBe('City');
      expect(result.current.getFieldLabel('state')).toBe('District');
      expect(result.current.getFieldLabel('postalCode')).toBe('Postal Code');
      expect(result.current.getFieldLabel('phone')).toBe('Phone Number');
    });

    it('should return Indonesia-specific labels', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: ({ children }) => (
          <CountryProvider initialCountry="ID">{children}</CountryProvider>
        ),
      });

      expect(result.current.getFieldLabel('city')).toBe('Kota');
      expect(result.current.getFieldLabel('state')).toBe('Provinsi');
      expect(result.current.getFieldLabel('postalCode')).toBe('Kode Pos');
      expect(result.current.getFieldLabel('phone')).toBe('Nomor Telepon');
    });

    it('should update labels when country changes', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      // Start with Brunei
      expect(result.current.getFieldLabel('state')).toBe('Daerah/Mukim');

      // Change to Malaysia
      act(() => {
        result.current.setSelectedCountry('MY');
      });
      expect(result.current.getFieldLabel('state')).toBe('Negeri');

      // Change to Singapore
      act(() => {
        result.current.setSelectedCountry('SG');
      });
      expect(result.current.getFieldLabel('state')).toBe('District');

      // Change to Indonesia
      act(() => {
        result.current.setSelectedCountry('ID');
      });
      expect(result.current.getFieldLabel('state')).toBe('Provinsi');
    });
  });

  describe('getValidationRule', () => {
    it('should return Brunei phone pattern', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      const pattern = result.current.getValidationRule('phone');
      expect(pattern.test('+673-123-4567')).toBe(true);
      expect(pattern.test('123-4567')).toBe(true);
      expect(pattern.test('+60-123-4567')).toBe(false);
    });

    it('should return Brunei postal code pattern', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      const pattern = result.current.getValidationRule('postalCode');
      expect(pattern.test('BB1234')).toBe(true);
      expect(pattern.test('12345')).toBe(false);
    });

    it('should update validation rules when country changes', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      // Brunei postal code
      let pattern = result.current.getValidationRule('postalCode');
      expect(pattern.test('BB1234')).toBe(true);

      // Change to Malaysia
      act(() => {
        result.current.setSelectedCountry('MY');
      });
      pattern = result.current.getValidationRule('postalCode');
      expect(pattern.test('50000')).toBe(true);
      expect(pattern.test('BB1234')).toBe(false);
    });
  });

  describe('getPlaceholder', () => {
    it('should return Brunei placeholders', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current.getPlaceholder('phone')).toBe('+673-123-4567');
      expect(result.current.getPlaceholder('postalCode')).toBe('BB1234');
    });

    it('should return Malaysia placeholders', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: ({ children }) => (
          <CountryProvider initialCountry="MY">{children}</CountryProvider>
        ),
      });

      expect(result.current.getPlaceholder('phone')).toBe('+603-12345678');
      expect(result.current.getPlaceholder('postalCode')).toBe('50000');
    });

    it('should update placeholders when country changes', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current.getPlaceholder('phone')).toBe('+673-123-4567');

      act(() => {
        result.current.setSelectedCountry('SG');
      });

      expect(result.current.getPlaceholder('phone')).toBe('+65-1234-5678');
    });
  });

  describe('getHelperText', () => {
    it('should return Brunei helper text', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current.getHelperText('phone')).toBe(
        'Format: +673-XXX-XXXX atau XXX-XXXX'
      );
      expect(result.current.getHelperText('postalCode')).toBe(
        'Format: XX1234 (contoh: BB1234)'
      );
    });

    it('should return Singapore helper text', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: ({ children }) => (
          <CountryProvider initialCountry="SG">{children}</CountryProvider>
        ),
      });

      expect(result.current.getHelperText('phone')).toBe('Format: +65-XXXX-XXXX');
      expect(result.current.getHelperText('postalCode')).toBe(
        'Format: 6 digits (e.g., 123456)'
      );
    });

    it('should update helper text when country changes', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      expect(result.current.getHelperText('postalCode')).toContain('XX1234');

      act(() => {
        result.current.setSelectedCountry('ID');
      });

      expect(result.current.getHelperText('postalCode')).toContain('5 digit');
    });
  });

  describe('getCountryConfiguration', () => {
    it('should return complete Brunei configuration', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      const config = result.current.getCountryConfiguration();
      expect(config.code).toBe('BN');
      expect(config.name).toBe('Brunei Darussalam');
      expect(config.phoneExample).toBe('+673-123-4567');
      expect(config.postalCodeExample).toBe('BB1234');
      expect(config.labels.city).toBe('Bandar');
    });

    it('should return updated configuration when country changes', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      let config = result.current.getCountryConfiguration();
      expect(config.code).toBe('BN');

      act(() => {
        result.current.setSelectedCountry('MY');
      });

      config = result.current.getCountryConfiguration();
      expect(config.code).toBe('MY');
      expect(config.name).toBe('Malaysia');
    });
  });

  describe('Integration: Country switching preserves context', () => {
    it('should maintain all functions after country change', () => {
      const { result } = renderHook(() => useCountry(), {
        wrapper: CountryProvider,
      });

      // Verify all functions exist initially
      expect(typeof result.current.getFieldLabel).toBe('function');
      expect(typeof result.current.getValidationRule).toBe('function');
      expect(typeof result.current.getPlaceholder).toBe('function');
      expect(typeof result.current.getHelperText).toBe('function');

      // Change country
      act(() => {
        result.current.setSelectedCountry('MY');
      });

      // Verify all functions still exist and work
      expect(typeof result.current.getFieldLabel).toBe('function');
      expect(result.current.getFieldLabel('city')).toBe('Bandar');
      expect(typeof result.current.getValidationRule).toBe('function');
      expect(result.current.getValidationRule('phone')).toBeDefined();
      expect(typeof result.current.getPlaceholder).toBe('function');
      expect(result.current.getPlaceholder('phone')).toBe('+603-12345678');
      expect(typeof result.current.getHelperText).toBe('function');
      expect(result.current.getHelperText('phone')).toContain('+60');
    });
  });
});
