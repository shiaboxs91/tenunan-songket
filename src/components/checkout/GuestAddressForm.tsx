"use client";

/**
 * GuestAddressForm - Form alamat untuk guest checkout
 * Alamat disimpan di state/order saja, tidak ke database
 * 
 * Features:
 * - Cascading dropdowns for Brunei (District > Mukim > Kampong)
 * - Cascading dropdowns for Malaysia (State > City)
 * - Singapore simplified (no state/region needed)
 * - Auto-detect location from Malaysia postcode
 */

import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import address data
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

export interface GuestAddress {
  recipient_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  // Brunei specific
  mukim?: string;
  kampong?: string;
}

interface GuestAddressFormProps {
  initialData?: GuestAddress;
  onSubmit: (address: GuestAddress) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  recipient_name?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  mukim?: string;
}

// Get label for region field based on country
const getRegionLabel = (country: string) => {
  switch (country) {
    case "BN":
      return "Daerah";
    case "MY":
      return "Negeri";
    case "SG":
      return "";
    default:
      return "Provinsi/Daerah";
  }
};

// Get city label based on country
const getCityLabel = (country: string) => {
  switch (country) {
    case "BN":
      return "Mukim";
    case "MY":
      return "Bandar/Pekan";
    case "SG":
      return "Kota";
    default:
      return "Kota";
  }
};

// Check if region field is required
const isRegionRequired = (country: string) => {
  return country !== "SG";
};

// Get phone placeholder based on country
const getPhonePlaceholder = (country: string) => {
  switch (country) {
    case "BN":
      return "+6731234567";
    case "MY":
      return "+60123456789";
    case "SG":
      return "+6591234567";
    default:
      return "+6731234567";
  }
};

// Get postal code placeholder based on country
const getPostalPlaceholder = (country: string) => {
  switch (country) {
    case "BN":
      return "BB3713";
    case "MY":
      return "50000";
    case "SG":
      return "123456";
    default:
      return "12345";
  }
};

export function GuestAddressForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: GuestAddressFormProps) {
  const [formData, setFormData] = useState<GuestAddress>(
    initialData || {
      recipient_name: "",
      phone: "",
      email: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "BN",
      mukim: "",
      kampong: "",
    }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Memoized data for dropdowns
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

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "recipient_name":
        if (!value.trim()) return "Nama penerima wajib diisi";
        if (value.trim().length < 3) return "Nama minimal 3 karakter";
        break;
      case "phone":
        if (!value.trim()) return "Nomor telepon wajib diisi";
        if (!/^[0-9+]{8,15}$/.test(value.trim()))
          return "Format nomor tidak valid";
        break;
      case "email":
        if (!value.trim()) return "Email wajib diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          return "Format email tidak valid";
        break;
      case "address_line1":
        if (!value.trim()) return "Alamat wajib diisi";
        break;
      case "city":
        if (formData.country !== "BN" && !value.trim()) return "Kota wajib diisi";
        break;
      case "state":
        if (isRegionRequired(formData.country) && !value.trim()) {
          return `${getRegionLabel(formData.country)} wajib diisi`;
        }
        break;
      case "mukim":
        if (formData.country === "BN" && !value.trim()) {
          return "Mukim wajib diisi";
        }
        break;
      case "postal_code":
        if (!value.trim()) return "Kode pos wajib diisi";
        // Validate format based on country
        if (formData.country === "BN" && !/^[A-Z]{2}\d{4}$/i.test(value.trim())) {
          return "Format: XX1234 (contoh: BB3713)";
        }
        if (formData.country === "MY" && !/^\d{5}$/.test(value.trim())) {
          return "Format: 5 digit (contoh: 50000)";
        }
        if (formData.country === "SG" && !/^\d{6}$/.test(value.trim())) {
          return "Format: 6 digit (contoh: 123456)";
        }
        break;
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const value = formData[name as keyof GuestAddress] || "";
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleCountryChange = (value: string) => {
    // Reset location fields when country changes
    setFormData((prev) => ({
      ...prev,
      country: value,
      state: "",
      city: value === "SG" ? "Singapore" : "",
      mukim: "",
      kampong: "",
      postal_code: "",
    }));
    setErrors((prev) => ({
      ...prev,
      state: undefined,
      city: undefined,
      mukim: undefined,
      postal_code: undefined,
    }));
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
      city: "",
      mukim: "",
      kampong: "",
    }));
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: undefined }));
    }
  };

  const handleMukimChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      mukim: value,
      kampong: "",
    }));
    if (errors.mukim) {
      setErrors((prev) => ({ ...prev, mukim: undefined }));
    }
  };

  const handleKampongChange = (value: string) => {
    setFormData((prev) => ({ ...prev, kampong: value }));
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    const fieldsToValidate: (keyof GuestAddress)[] = [
      "recipient_name",
      "phone",
      "email",
      "address_line1",
      "city",
      "state",
      "postal_code",
    ];

    // Add mukim for Brunei
    if (formData.country === "BN") {
      fieldsToValidate.push("mukim");
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field] || "");
      if (error) {
        newErrors[field as keyof FormErrors] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const allTouched: Record<string, boolean> = {};
      fieldsToValidate.forEach((f) => (allTouched[f] = true));
      setTouched(allTouched);
      return;
    }

    // Format address for submission
    const submittedAddress = { ...formData };
    
    // For Brunei, construct city from mukim and kampong
    if (formData.country === "BN") {
      const mukimData = bruneiMukims.find((m) => m.code === formData.mukim);
      const districtData = bruneiDistricts.find((d) => d.code === formData.state);
      submittedAddress.city = mukimData?.name || formData.mukim || "";
      submittedAddress.state = districtData?.name || formData.state || "";
    }
    
    // For Malaysia, get proper state name
    if (formData.country === "MY") {
      const stateData = malaysiaStates.find((s) => s.code === formData.state);
      submittedAddress.state = stateData?.name || formData.state || "";
    }

    onSubmit(submittedAddress);
  };

  const renderError = (fieldName: keyof FormErrors) => {
    if (!touched[fieldName] || !errors[fieldName]) return null;
    return (
      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3" />
        {errors[fieldName]}
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Recipient Name */}
      <div className="space-y-2">
        <Label htmlFor="recipient_name">
          Nama Penerima <span className="text-destructive">*</span>
        </Label>
        <Input
          id="recipient_name"
          name="recipient_name"
          value={formData.recipient_name}
          onChange={handleChange}
          onBlur={() => handleBlur("recipient_name")}
          placeholder="Nama lengkap penerima"
          className={
            errors.recipient_name && touched.recipient_name
              ? "border-destructive"
              : ""
          }
        />
        {renderError("recipient_name")}
      </div>

      {/* Phone & Email - 2 column on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Nomor Telepon <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={() => handleBlur("phone")}
            placeholder={getPhonePlaceholder(formData.country)}
            className={errors.phone && touched.phone ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Format: {getPhonePlaceholder(formData.country)}
          </p>
          {renderError("phone")}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
            placeholder="email@contoh.com"
            className={errors.email && touched.email ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Untuk konfirmasi pesanan dan tracking
          </p>
          {renderError("email")}
        </div>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country">Negara</Label>
        <Select value={formData.country} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih negara" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brunei-specific fields */}
      {formData.country === "BN" && (
        <>
          {/* District */}
          <div className="space-y-2">
            <Label htmlFor="state">
              Daerah <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.state} onValueChange={handleStateChange}>
              <SelectTrigger
                className={
                  errors.state && touched.state ? "border-destructive" : ""
                }
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
            {renderError("state")}
          </div>

          {/* Mukim */}
          <div className="space-y-2">
            <Label htmlFor="mukim">
              Mukim <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.mukim} 
              onValueChange={handleMukimChange}
              disabled={!formData.state}
            >
              <SelectTrigger
                className={
                  errors.mukim && touched.mukim ? "border-destructive" : ""
                }
              >
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
            {renderError("mukim")}
          </div>

          {/* Kampong */}
          {formData.mukim && bruneiKampongs.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="kampong">Kampong (Opsional)</Label>
              <Select
                value={formData.kampong}
                onValueChange={handleKampongChange}
              >
                <SelectTrigger>
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

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="address_line1">
              Alamat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              onBlur={() => handleBlur("address_line1")}
              placeholder="Nama jalan, nombor rumah, simpang"
              rows={2}
              className={
                errors.address_line1 && touched.address_line1
                  ? "border-destructive"
                  : ""
              }
            />
            {renderError("address_line1")}
          </div>

          {/* Address Line 2 (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="address_line2">Detail Tambahan (Opsional)</Label>
            <Input
              id="address_line2"
              name="address_line2"
              value={formData.address_line2 || ""}
              onChange={handleChange}
              placeholder="Apartemen, gedung, lantai, dll"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postal_code">
              Poskod <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              onBlur={() => handleBlur("postal_code")}
              placeholder={getPostalPlaceholder(formData.country)}
              maxLength={6}
              className={
                errors.postal_code && touched.postal_code
                  ? "border-destructive"
                  : ""
              }
            />
            <p className="text-xs text-muted-foreground">
              Format: XX1234 (contoh: BB3713)
            </p>
            {renderError("postal_code")}
          </div>
        </>
      )}

      {/* Malaysia-specific fields */}
      {formData.country === "MY" && (
        <>
          {/* State with grouped dropdown */}
          <div className="space-y-2">
            <Label htmlFor="state">
              Negeri <span className="text-destructive">*</span>
            </Label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => handleStateChange(e.target.value)}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.state && touched.state ? "border-destructive" : "border-input"
              }`}
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
            {renderError("state")}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">
              Bandar/Pekan <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.city} 
              onValueChange={handleCityChange}
              disabled={!formData.state}
            >
              <SelectTrigger
                className={
                  errors.city && touched.city ? "border-destructive" : ""
                }
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
            {renderError("city")}
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="address_line1">
              Alamat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              onBlur={() => handleBlur("address_line1")}
              placeholder="Nama jalan, nomor rumah"
              rows={2}
              className={
                errors.address_line1 && touched.address_line1
                  ? "border-destructive"
                  : ""
              }
            />
            {renderError("address_line1")}
          </div>

          {/* Address Line 2 (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="address_line2">Detail Tambahan (Opsional)</Label>
            <Input
              id="address_line2"
              name="address_line2"
              value={formData.address_line2 || ""}
              onChange={handleChange}
              placeholder="Apartemen, gedung, lantai, dll"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postal_code">
              Poskod <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              onBlur={() => handleBlur("postal_code")}
              placeholder={getPostalPlaceholder(formData.country)}
              maxLength={5}
              className={
                errors.postal_code && touched.postal_code
                  ? "border-destructive"
                  : ""
              }
            />
            <p className="text-xs text-muted-foreground">
              Masukkan poskod (5 digit)
            </p>
            {renderError("postal_code")}
          </div>
        </>
      )}

      {/* Singapore-specific fields */}
      {formData.country === "SG" && (
        <>
          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="address_line1">
              Alamat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              onBlur={() => handleBlur("address_line1")}
              placeholder="Nama jalan, nomor rumah"
              rows={2}
              className={
                errors.address_line1 && touched.address_line1
                  ? "border-destructive"
                  : ""
              }
            />
            {renderError("address_line1")}
          </div>

          {/* Address Line 2 (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="address_line2">Detail Tambahan (Opsional)</Label>
            <Input
              id="address_line2"
              name="address_line2"
              value={formData.address_line2 || ""}
              onChange={handleChange}
              placeholder="Apartemen, gedung, lantai, dll"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postal_code">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              onBlur={() => handleBlur("postal_code")}
              placeholder={getPostalPlaceholder(formData.country)}
              maxLength={6}
              className={
                errors.postal_code && touched.postal_code
                  ? "border-destructive"
                  : ""
              }
            />
            <p className="text-xs text-muted-foreground">
              6 digit postal code
            </p>
            {renderError("postal_code")}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gunakan Alamat Ini
        </Button>
      </div>
    </form>
  );
}
