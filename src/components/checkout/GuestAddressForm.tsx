"use client";

/**
 * GuestAddressForm - Form alamat untuk guest checkout
 * Alamat disimpan di state/order saja, tidak ke database
 */

import { useState } from "react";
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
}

const COUNTRIES = [
  { code: "BN", name: "Brunei Darussalam" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "ID", name: "Indonesia" },
];

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
    }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "recipient_name":
        if (!value.trim()) return "Nama penerima wajib diisi";
        if (value.trim().length < 3) return "Nama minimal 3 karakter";
        break;
      case "phone":
        if (!value.trim()) return "Nomor telepon wajib diisi";
        if (!/^[0-9+]{8,15}$/.test(value.trim())) return "Format nomor tidak valid";
        break;
      case "email":
        if (!value.trim()) return "Email wajib diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Format email tidak valid";
        break;
      case "address_line1":
        if (!value.trim()) return "Alamat wajib diisi";
        break;
      case "city":
        if (!value.trim()) return "Kota wajib diisi";
        break;
      case "state":
        if (!value.trim()) return "Provinsi/Daerah wajib diisi";
        break;
      case "postal_code":
        if (!value.trim()) return "Kode pos wajib diisi";
        break;
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
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
    setFormData((prev) => ({ ...prev, country: value }));
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

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field] || "");
      if (error) {
        newErrors[field as keyof FormErrors] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Mark all as touched
      const allTouched: Record<string, boolean> = {};
      fieldsToValidate.forEach((f) => (allTouched[f] = true));
      setTouched(allTouched);
      return;
    }

    onSubmit(formData);
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
          className={errors.recipient_name && touched.recipient_name ? "border-destructive" : ""}
        />
        {renderError("recipient_name")}
      </div>

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
          placeholder="+6731234567"
          className={errors.phone && touched.phone ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground">Format: +673XXXXXXX</p>
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
        <p className="text-xs text-muted-foreground">Untuk konfirmasi pesanan dan tracking</p>
        {renderError("email")}
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
          placeholder="Nama jalan, nomor rumah, RT/RW"
          rows={2}
          className={errors.address_line1 && touched.address_line1 ? "border-destructive" : ""}
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

      {/* City & State */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            Kota <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={() => handleBlur("city")}
            placeholder="Nama kota"
            className={errors.city && touched.city ? "border-destructive" : ""}
          />
          {renderError("city")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            Provinsi/Daerah <span className="text-destructive">*</span>
          </Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            onBlur={() => handleBlur("state")}
            placeholder="Nama provinsi"
            className={errors.state && touched.state ? "border-destructive" : ""}
          />
          {renderError("state")}
        </div>
      </div>

      {/* Postal Code & Country */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal_code">
            Kode Pos <span className="text-destructive">*</span>
          </Label>
          <Input
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            onBlur={() => handleBlur("postal_code")}
            placeholder="12345"
            className={errors.postal_code && touched.postal_code ? "border-destructive" : ""}
          />
          {renderError("postal_code")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Negara</Label>
          <Select value={formData.country} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih negara" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
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
