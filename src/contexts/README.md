# Contexts

This directory contains React Context providers for global state management.

## CountryContext

Provides country-aware functionality for address forms and validation.

### Features

- **Country Selection**: Manage selected country state (BN, MY, SG, ID)
- **Dynamic Labels**: Get localized field labels based on country
- **Validation Rules**: Get country-specific validation patterns
- **Helper Text**: Get country-specific placeholder and helper text
- **Default to Brunei**: Automatically defaults to 'BN' for new addresses

### Usage

```tsx
import { CountryProvider, useCountry } from '@/contexts';

// Wrap your app or component tree
function App() {
  return (
    <CountryProvider>
      <YourComponents />
    </CountryProvider>
  );
}

// Use in child components
function AddressForm() {
  const {
    selectedCountry,
    setSelectedCountry,
    getFieldLabel,
    getValidationRule,
    getPlaceholder,
    getHelperText,
  } = useCountry();

  return (
    <div>
      <label>{getFieldLabel('city')}</label>
      <input 
        placeholder={getPlaceholder('phone')}
        pattern={getValidationRule('phone').source}
      />
      <small>{getHelperText('phone')}</small>
    </div>
  );
}
```

### API

#### `CountryProvider`

Props:
- `children`: ReactNode - Child components
- `initialCountry?`: CountryCode - Initial country (defaults to 'BN')

#### `useCountry()`

Returns:
- `selectedCountry`: CountryCode - Current country
- `setSelectedCountry`: (country: CountryCode) => void - Update country
- `getFieldLabel`: (field: keyof CountryLabels) => string - Get field label
- `getValidationRule`: (field: 'phone' | 'postalCode') => RegExp - Get validation pattern
- `getPlaceholder`: (field: 'phone' | 'postalCode') => string - Get placeholder
- `getHelperText`: (field: 'phone' | 'postalCode') => string - Get helper text
- `getCountryConfiguration`: () => CountryConfig - Get complete config

#### `useCountryOptional()`

Same as `useCountry()` but returns `undefined` instead of throwing when used outside provider.

### Requirements Satisfied

- **7.1**: Country selection dropdown
- **7.2**: Support for BN, MY, SG, ID
- **7.3**: Update field labels based on country
- **7.5**: Default to Brunei for new addresses
- **8.5**: Preserve form data when country changes

### Testing

Run tests with:
```bash
npm test src/contexts/CountryContext.test.tsx
```

All 26 tests passing ✓
