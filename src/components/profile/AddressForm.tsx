"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Loader2, AlertCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAddress,
  updateAddress,
  type Address,
  type AddressInput,
} from "@/lib/supabase/addresses";
import { useCountry } from "@/contexts/CountryContext";
import { validationEngine } from "@/lib/validation/validation-engine";
import { CountryCode, countryConfigs } from "@/lib/validation/country-config";

// Import address data for cascading dropdowns
import {
  SUPPORTED_COUNTRIES,
  getBruneiDistricts,
  getBruneiMukims,
  getBruneiKampongs,
  getMalaysiaStates,
  getMalaysiaCities,
  getMalaysiaStatesByRegion,
  findMalaysiaLocationByPostcode,
} from "@/lib/data/address";

// Extended AddressInput with Brunei-specific fields
interface ExtendedAddressInput extends AddressInput {
  mukim?: string;
  kampong?: string;
}

interface AddressFormProps {
  address?: Address | null;
  onSuccess?: (address: Address) => void;
  onCancel?: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Country context for dynamic labels and validation
  const {
    selectedCountry,
    setSelectedCountry,
    getFieldLabel,
    getPlaceholder,
    getHelperText,
  } = useCountry();
  
  // Form data state - extended with mukim/kampong for Brunei
  const [formData, setFormData] = useState<ExtendedAddressInput>({
    label: "",
    recipient_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "BN", // Default to Brunei (Requirement 7.5)
    is_default: false,
    mukim: "",
    kampong: "",
  });
  
  // Memoized data for cascading dropdowns
  const bruneiDistricts = useMemo(() => getBruneiDistricts(), []);
  const bruneiMukims = useMemo(
    () => (formData.state ? getBruneiMukims(formData.state) : []),
    [formData.state]
  );
  const bruneiKampongs = useMemo(
    () =>
      formData.state && formData.mukim
        ? getBruneiKampongs(formData.state, formData.mukim)
        : [],
    [formData.state, formData.mukim]
  );

  const malaysiaStates = useMemo(() => getMalaysiaStates(), []);
  const malaysiaStatesByRegion = useMemo(() => getMalaysiaStatesByRegion(), []);
  const malaysiaCities = useMemo(
    () => (formData.state ? getMalaysiaCities(formData.state) : []),
    [formData.state]
  );
  
  // Validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Debounce timer ref
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Section collapse state - Requirements 9.2, 10.2, 10.3
  // Expanded by default on desktop, collapsible on mobile
  const [expandedSections, setExpandedSections] = useState({
    recipient: true,
    address: true,
    additional: true,
  });
  
  // Detect if we're on mobile (for progressive disclosure)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-detect Malaysia location from postcode
  useEffect(() => {
    if (formData.country === "MY" && formData.postal_code.length === 5) {
      const location = findMalaysiaLocationByPostcode(formData.postal_code);
      if (location) {
        const state = malaysiaStates.find((s) => s.name === location.state);
        if (state) {
          setFormData((prev) => ({
            ...prev,
            state: state.code,
            city: location.city,
          }));
        }
      }
    }
  }, [formData.country, formData.postal_code, malaysiaStates]);

  /**
   * Toggle section expansion - Requirement 10.5
   */
  const toggleSection = (section: 'recipient' | 'address' | 'additional') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  /**
   * Check if a section is complete - Requirement 10.4
   */
  const isSectionComplete = (section: 'recipient' | 'address' | 'additional'): boolean => {
    switch (section) {
      case 'recipient':
        return !!(
          formData.recipient_name &&
          formData.phone &&
          !fieldErrors.recipient_name &&
          !fieldErrors.phone
        );
      case 'address':
        // For Brunei, mukim is required instead of city
        const cityOrMukimValid = formData.country === 'BN'
          ? !!formData.mukim
          : !!formData.city;
        // For Singapore, state is not required
        const stateValid = formData.country === 'SG'
          ? true
          : !!formData.state;
        return !!(
          formData.address_line1 &&
          cityOrMukimValid &&
          stateValid &&
          formData.postal_code &&
          formData.country &&
          !fieldErrors.address_line1 &&
          !fieldErrors.city &&
          !fieldErrors.state &&
          !fieldErrors.postal_code &&
          !fieldErrors.country
        );
      case 'additional':
        return true; // Additional section has no required fields
      default:
        return false;
    }
  };
  
  /**
   * Render field error message
   * Requirements: 12.1, 12.5, 15.5
   */
  const renderFieldError = (fieldName: string) => {
    if (!touched[fieldName] || !fieldErrors[fieldName]) {
      return null;
    }
    
    return (
      <p className="text-sm text-[#DC2626] flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3" />
        {fieldErrors[fieldName]}
      </p>
    );
  };

  // Initialize form data from address prop
  useEffect(() => {
    if (address) {
      let stateCode = address.state;
      let mukimCode = "";
      
      // For Brunei, reverse lookup district/mukim codes from names
      if (address.country === "BN") {
        const districts = getBruneiDistricts();
        const district = districts.find(d => d.name === address.state || d.code === address.state);
        if (district) {
          stateCode = district.code;
          // Try to find mukim by city name
          const mukim = district.mukims.find(m => m.name === address.city || m.code === address.city);
          if (mukim) {
            mukimCode = mukim.code;
          }
        }
      }
      
      // For Malaysia, reverse lookup state code from name
      if (address.country === "MY") {
        const states = getMalaysiaStates();
        const state = states.find(s => s.name === address.state || s.code === address.state);
        if (state) {
          stateCode = state.code;
        }
      }
      
      const addressData: ExtendedAddressInput = {
        label: address.label || "",
        recipient_name: address.recipient_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || "",
        city: address.city,
        state: stateCode,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default || false,
        mukim: mukimCode,
        kampong: "",
      };
      setFormData(addressData);
      
      // Set country context to match address country
      if (address.country) {
        setSelectedCountry(address.country as CountryCode);
      }
    }
  }, [address, setSelectedCountry]);
  
  // Cleanup debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  /**
   * Map form field names (snake_case) to validation field names (camelCase)
   */
  const mapFieldNameForValidation = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      recipient_name: 'recipientName',
      address_line1: 'addressLine1',
      address_line2: 'addressLine2',
      postal_code: 'postalCode',
      is_default: 'isDefault',
    };
    return fieldMap[fieldName] || fieldName;
  };
  
  /**
   * Validate a single field with debouncing (300ms)
   * Requirements: 1.5, 2.4, 6.1, 6.2
   */
  const validateFieldDebounced = useCallback((fieldName: string, value: string) => {
    // Clear existing timer for this field
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }
    
    // Set new timer (300ms debounce)
    debounceTimers.current[fieldName] = setTimeout(() => {
      const validationFieldName = mapFieldNameForValidation(fieldName);
      const result = validationEngine.validateField(
        validationFieldName,
        value,
        selectedCountry
      );
      
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        if (!result.isValid && result.errorMessage) {
          newErrors[fieldName] = result.errorMessage;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    }, 300);
  }, [selectedCountry]);

  /**
   * Handle input change with validation
   * Requirements: 1.5, 2.4, 11.5, 12.5
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field with debounce
    if (touched[name]) {
      validateFieldDebounced(name, value);
    }
  };
  
  /**
   * Handle field blur - trigger immediate validation
   * Requirements: 1.5, 2.4
   */
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Immediate validation on blur
    const value = formData[fieldName as keyof AddressInput];
    if (typeof value === 'string') {
      const validationFieldName = mapFieldNameForValidation(fieldName);
      const result = validationEngine.validateField(
        validationFieldName,
        value,
        selectedCountry
      );
      
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        if (!result.isValid && result.errorMessage) {
          newErrors[fieldName] = result.errorMessage;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    }
  };
  
  /**
   * Handle country change
   * Requirements: 7.3, 7.4, 8.4, 8.5
   */
  const handleCountryChange = (newCountry: string) => {
    // Reset location fields when country changes
    setFormData(prev => ({
      ...prev,
      country: newCountry,
      state: "",
      city: newCountry === "SG" ? "Singapore" : "",
      mukim: "",
      kampong: "",
      postal_code: "",
    }));
    
    // Clear location field errors
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.state;
      delete newErrors.city;
      delete newErrors.postal_code;
      return newErrors;
    });
    
    // Update country context (Requirement 7.3: update labels)
    setSelectedCountry(newCountry as CountryCode);
  };
  
  /**
   * Handle state/district change for cascading dropdowns
   */
  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      state: value,
      city: "",
      mukim: "",
      kampong: "",
    }));
    if (fieldErrors.state) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.state;
        return newErrors;
      });
    }
  };
  
  /**
   * Handle mukim change for Brunei
   */
  const handleMukimChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      mukim: value,
      kampong: "",
    }));
  };
  
  /**
   * Handle kampong change for Brunei
   */
  const handleKampongChange = (value: string) => {
    setFormData(prev => ({ ...prev, kampong: value }));
  };
  
  /**
   * Handle city change for Malaysia
   */
  const handleCityChange = (value: string) => {
    setFormData(prev => ({ ...prev, city: value }));
    if (fieldErrors.city) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.city;
        return newErrors;
      });
    }
  };

  /**
   * Handle form submission with validation
   * Requirements: 1.4, 2.5, 11.3, 12.1, 12.3
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // For Brunei, use mukim as city validation
    const cityForValidation = formData.country === 'BN' 
      ? (formData.mukim || formData.city) 
      : formData.city;
    
    // For Singapore, state is not required
    const stateForValidation = formData.country === 'SG' 
      ? 'Singapore' 
      : formData.state;

    // Validate entire form (Requirement 1.4, 2.5, 11.3)
    const validationResult = validationEngine.validateForm(
      {
        label: formData.label || '',
        recipientName: formData.recipient_name,
        phone: formData.phone,
        addressLine1: formData.address_line1,
        addressLine2: formData.address_line2 || undefined,
        city: cityForValidation,
        state: stateForValidation,
        postalCode: formData.postal_code,
        country: formData.country || 'BN',
        isDefault: formData.is_default || false,
      },
      selectedCountry
    );

    // Mark all fields as touched
    const allFields = [
      'label', 'recipient_name', 'phone', 'address_line1', 
      'address_line2', 'city', 'state', 'postal_code', 'country'
    ];
    const touchedState: Record<string, boolean> = {};
    allFields.forEach(field => { touchedState[field] = true; });

    // If validation fails, prevent submission and show errors (Requirement 1.4, 2.5)
    if (!validationResult.isValid) {
      // Map field names back to form field names
      const mappedErrors: Record<string, string> = {};
      Object.entries(validationResult.fieldErrors).forEach(([key, value]) => {
        const fieldMap: Record<string, string> = {
          recipientName: 'recipient_name',
          addressLine1: 'address_line1',
          addressLine2: 'address_line2',
          postalCode: 'postal_code',
        };
        const mappedKey = fieldMap[key] || key;
        mappedErrors[mappedKey] = value;
      });
      
      // Set both touched and errors together
      setTouched(touchedState);
      setFieldErrors(mappedErrors);
      setError("Please correct the errors below before submitting");
      return;
    }

    setIsLoading(true);

    try {
      // Convert codes to names for storage
      let submittedData: AddressInput = {
        label: formData.label,
        recipient_name: formData.recipient_name,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        is_default: formData.is_default,
      };
      
      // For Brunei, convert district/mukim codes to names
      if (formData.country === "BN") {
        const district = bruneiDistricts.find(d => d.code === formData.state);
        const mukim = bruneiMukims.find(m => m.code === formData.mukim);
        submittedData.state = district?.name || formData.state;
        submittedData.city = mukim?.name || formData.mukim || "";
      }
      
      // For Malaysia, convert state code to name
      if (formData.country === "MY") {
        const state = malaysiaStates.find(s => s.code === formData.state);
        submittedData.state = state?.name || formData.state;
      }
      
      // For Singapore, set state to empty and city to Singapore
      if (formData.country === "SG") {
        submittedData.state = "";
        submittedData.city = "Singapore";
      }
      
      let result: Address | null;
      
      if (address) {
        result = await updateAddress(address.id, submittedData);
      } else {
        result = await createAddress(submittedData);
      }

      if (result) {
        onSuccess?.(result);
      } else {
        setError("Gagal menyimpan alamat. Silakan coba lagi.");
      }
    } catch (err) {
      console.error('Address save error:', err);
      if (err instanceof Error) {
        if (err.message === 'NOT_AUTHENTICATED' || err.message === 'AUTH_ERROR') {
          setError("Anda harus login untuk menyimpan alamat. Silakan login terlebih dahulu.");
        } else {
          setError("Terjadi kesalahan saat menyimpan alamat. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan saat menyimpan alamat. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render section header with collapse toggle - Requirements 9.2, 10.1, 10.4, 10.5, 15.2
   */
  const renderSectionHeader = (
    section: 'recipient' | 'address' | 'additional',
    title: string
  ) => {
    const isExpanded = expandedSections[section];
    const isComplete = isSectionComplete(section);
    
    return (
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors touch-manipulation"
        style={{ minHeight: '44px' }} // Requirement 9.3: 44px touch target
        aria-expanded={isExpanded}
        aria-controls={`section-${section}`}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {isComplete && (
            <CheckCircle2 className="h-5 w-5 text-green-600" aria-label="Section complete" />
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Legend explaining required fields - Requirement 11.2 */}
      <p className="text-sm text-muted-foreground">
        Fields marked with <span className="text-red-600">*</span> are required
      </p>

      {/* General error message - Requirement 12.3 */}
      {error && (
        <div className="p-3 text-sm text-[#DC2626] bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Section 1: Recipient Information - Requirements 10.1, 15.2 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {renderSectionHeader('recipient', 'Recipient Information')}
        
        {expandedSections.recipient && (
          <div id="section-recipient" className="p-4 space-y-4 bg-white">
            {/* Label field */}
            <div className="space-y-2">
              <Label htmlFor="label">Address Label</Label>
              <Input
                id="label"
                name="label"
                placeholder="e.g., Home, Office"
                value={formData.label}
                onChange={handleChange}
                onBlur={() => handleBlur('label')}
                disabled={isLoading}
                className={`transition-colors ${
                  fieldErrors.label && touched.label 
                    ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                    : 'focus-visible:ring-primary'
                }`}
                style={{ minHeight: '44px' }} // Requirement 9.3
              />
              {renderFieldError('label')}
            </div>

            {/* Recipient Name - Requirement 11.1, 15.5 */}
            <div className="space-y-2">
              <Label htmlFor="recipient_name">
                Recipient Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="recipient_name"
                name="recipient_name"
                placeholder="Full name of recipient"
                value={formData.recipient_name}
                onChange={handleChange}
                onBlur={() => handleBlur('recipient_name')}
                disabled={isLoading}
                required
                className={`transition-colors ${
                  fieldErrors.recipient_name && touched.recipient_name 
                    ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                    : 'focus-visible:ring-primary'
                }`}
                style={{ minHeight: '44px' }} // Requirement 9.3
              />
              {renderFieldError('recipient_name')}
            </div>

            {/* Phone Number - Requirements 5.4, 6.1, 6.3, 9.5, 11.1, 15.5 */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {getFieldLabel('phone')} <span className="text-red-600">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel" // Requirement 9.5: tel input type
                placeholder={getPlaceholder('phone')}
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                disabled={isLoading}
                required
                className={`transition-colors ${
                  fieldErrors.phone && touched.phone 
                    ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                    : 'focus-visible:ring-primary'
                }`}
                style={{ minHeight: '44px' }} // Requirement 9.3
              />
              {/* Helper text - Requirement 6.1, 6.5 */}
              <p className="text-xs text-muted-foreground">{getHelperText('phone')}</p>
              {renderFieldError('phone')}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Address Details - Requirements 10.1, 15.2 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {renderSectionHeader('address', 'Address Details')}
        
        {expandedSections.address && (
          <div id="section-address" className="p-4 space-y-4 bg-white">
            {/* Country Selection - Requirements 7.1, 7.2, 7.5 */}
            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
                disabled={isLoading}
              >
                <SelectTrigger id="country" style={{ minHeight: '44px' }}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(countryConfigs).map((config) => (
                    <SelectItem key={config.code} value={config.code}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderFieldError('country')}
            </div>

            {/* Address Line 1 - Requirements 11.1, 15.5 */}
            <div className="space-y-2">
              <Label htmlFor="address_line1">
                Address Line 1 <span className="text-red-600">*</span>
              </Label>
              <Input
                id="address_line1"
                name="address_line1"
                placeholder="Street name, house number"
                value={formData.address_line1}
                onChange={handleChange}
                onBlur={() => handleBlur('address_line1')}
                disabled={isLoading}
                required
                className={`transition-colors ${
                  fieldErrors.address_line1 && touched.address_line1 
                    ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                    : 'focus-visible:ring-primary'
                }`}
                style={{ minHeight: '44px' }} // Requirement 9.3
              />
              {renderFieldError('address_line1')}
            </div>

            {/* Address Line 2 - Requirement 15.5 */}
            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2 (optional)</Label>
              <Input
                id="address_line2"
                name="address_line2"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={formData.address_line2}
                onChange={handleChange}
                onBlur={() => handleBlur('address_line2')}
                disabled={isLoading}
                className={`transition-colors ${
                  fieldErrors.address_line2 && touched.address_line2 
                    ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                    : 'focus-visible:ring-primary'
                }`}
                style={{ minHeight: '44px' }} // Requirement 9.3
              />
              {renderFieldError('address_line2')}
            </div>

            {/* Country-specific location fields */}
            
            {/* Brunei: District > Mukim > Kampong */}
            {formData.country === "BN" && (
              <>
                {/* District & Mukim - 2 column on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* District */}
                  <div className="space-y-2">
                    <Label htmlFor="state">
                      Daerah <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={handleStateChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        id="state"
                        style={{ minHeight: '44px' }}
                        className={fieldErrors.state && touched.state ? 'border-[#DC2626]' : ''}
                      >
                        <SelectValue placeholder="Pilih daerah" />
                      </SelectTrigger>
                      <SelectContent>
                        {bruneiDistricts.map((district) => (
                          <SelectItem key={district.code} value={district.code}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError('state')}
                  </div>

                  {/* Mukim */}
                  <div className="space-y-2">
                    <Label htmlFor="mukim">
                      Mukim <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={formData.mukim}
                      onValueChange={handleMukimChange}
                      disabled={isLoading || !formData.state}
                    >
                      <SelectTrigger id="mukim" style={{ minHeight: '44px' }}>
                        <SelectValue placeholder={formData.state ? "Pilih mukim" : "Pilih daerah dahulu"} />
                      </SelectTrigger>
                      <SelectContent>
                        {bruneiMukims.map((mukim) => (
                          <SelectItem key={mukim.code} value={mukim.code}>
                            {mukim.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Kampong (optional) */}
                {formData.mukim && bruneiKampongs.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="kampong">Kampong (optional)</Label>
                    <Select
                      value={formData.kampong}
                      onValueChange={handleKampongChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="kampong" style={{ minHeight: '44px' }}>
                        <SelectValue placeholder="Pilih kampong" />
                      </SelectTrigger>
                      <SelectContent>
                        {bruneiKampongs.map((kampong) => (
                          <SelectItem key={kampong} value={kampong}>
                            {kampong}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* Malaysia: State > City > Postcode */}
            {formData.country === "MY" && (
              <>
                {/* State with grouped dropdown - native select for optgroup support */}
                <div className="space-y-2">
                  <Label htmlFor="state">
                    Negeri <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={isLoading}
                    className={`flex h-11 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      fieldErrors.state && touched.state ? 'border-[#DC2626]' : 'border-input'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <option value="">Pilih negeri</option>
                    {malaysiaStatesByRegion.map((group) => (
                      <optgroup key={group.region} label={`── ${group.regionName} ──`}>
                        {group.states.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {renderFieldError('state')}
                </div>

                {/* City & Postcode - 2 column on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      Bandar/Pekan <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={handleCityChange}
                      disabled={isLoading || !formData.state}
                    >
                      <SelectTrigger
                        id="city"
                        style={{ minHeight: '44px' }}
                        className={fieldErrors.city && touched.city ? 'border-[#DC2626]' : ''}
                      >
                        <SelectValue placeholder={formData.state ? "Pilih bandar/pekan" : "Pilih negeri dahulu"} />
                      </SelectTrigger>
                      <SelectContent>
                        {malaysiaCities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError('city')}
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">
                      Poskod <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      placeholder="50000"
                      value={formData.postal_code}
                      onChange={handleChange}
                      onBlur={() => handleBlur('postal_code')}
                      disabled={isLoading}
                      maxLength={5}
                      required
                      className={`transition-colors ${
                        fieldErrors.postal_code && touched.postal_code 
                          ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                          : 'focus-visible:ring-primary'
                      }`}
                      style={{ minHeight: '44px' }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-detect lokasi dari poskod
                    </p>
                    {renderFieldError('postal_code')}
                  </div>
                </div>
              </>
            )}

            {/* Singapore: Just postal code */}
            {formData.country === "SG" && (
              <div className="space-y-2">
                <Label htmlFor="postal_code">
                  Postal Code <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  placeholder="123456"
                  value={formData.postal_code}
                  onChange={handleChange}
                  onBlur={() => handleBlur('postal_code')}
                  disabled={isLoading}
                  maxLength={6}
                  required
                  className={`transition-colors ${
                    fieldErrors.postal_code && touched.postal_code 
                      ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                      : 'focus-visible:ring-primary'
                  }`}
                  style={{ minHeight: '44px' }}
                />
                <p className="text-xs text-muted-foreground">
                  6 digit postal code
                </p>
                {renderFieldError('postal_code')}
              </div>
            )}

            {/* Postal Code for Brunei (after location fields) */}
            {formData.country === "BN" && (
              <div className="space-y-2">
                <Label htmlFor="postal_code">
                  Poskod <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  placeholder="BB3713"
                  value={formData.postal_code}
                  onChange={handleChange}
                  onBlur={() => handleBlur('postal_code')}
                  disabled={isLoading}
                  maxLength={6}
                  required
                  className={`transition-colors ${
                    fieldErrors.postal_code && touched.postal_code 
                      ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' 
                      : 'focus-visible:ring-primary'
                  }`}
                  style={{ minHeight: '44px' }}
                />
                <p className="text-xs text-muted-foreground">
                  Format: XX1234 (contoh: BB3713)
                </p>
                {renderFieldError('postal_code')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 3: Additional Information - Requirements 10.1, 15.2 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {renderSectionHeader('additional', 'Additional Information')}
        
        {expandedSections.additional && (
          <div id="section-additional" className="p-4 space-y-4 bg-white">
            {/* Default Address Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_default: checked === true }))
                }
                disabled={isLoading}
                className="touch-manipulation"
                style={{ minWidth: '44px', minHeight: '44px' }} // Requirement 9.3
              />
              <Label htmlFor="is_default" className="text-sm font-normal cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Requirements 9.4, 15.4 */}
      {/* Sticky on mobile - Requirement 9.4 */}
      <div className="flex gap-3 pt-2 md:relative md:bottom-auto sticky bottom-0 left-0 right-0 bg-white p-4 md:p-0 border-t md:border-t-0 -mx-4 md:mx-0 -mb-4 md:mb-0 z-10">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading} 
            className="flex-1 md:flex-none md:min-w-[120px]"
            style={{ minHeight: '44px' }} // Requirement 9.3
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="flex-1 md:flex-none md:min-w-[160px] font-semibold shadow-md hover:shadow-lg transition-shadow"
          style={{ minHeight: '44px' }} // Requirement 9.3
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : address ? (
            "Save Changes"
          ) : (
            "Add Address"
          )}
        </Button>
      </div>
    </form>
  );
}
