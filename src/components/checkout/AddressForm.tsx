"use client";

import { useState } from "react";
import { ShippingAddress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddressFormProps {
  initialData?: ShippingAddress;
  onSubmit: (address: ShippingAddress) => void;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export function validateAddress(address: Partial<ShippingAddress>): FormErrors {
  const errors: FormErrors = {};

  if (!address.fullName?.trim()) {
    errors.fullName = "Nama lengkap wajib diisi";
  }

  if (!address.phone?.trim()) {
    errors.phone = "Nomor telepon wajib diisi";
  } else if (!/^[0-9+\-\s]{10,15}$/.test(address.phone.trim())) {
    errors.phone = "Format nomor telepon tidak valid";
  }

  if (!address.address?.trim()) {
    errors.address = "Alamat wajib diisi";
  }

  if (!address.city?.trim()) {
    errors.city = "Kota wajib diisi";
  }

  if (!address.province?.trim()) {
    errors.province = "Provinsi wajib diisi";
  }

  if (!address.postalCode?.trim()) {
    errors.postalCode = "Kode pos wajib diisi";
  } else if (!/^[0-9]{5}$/.test(address.postalCode.trim())) {
    errors.postalCode = "Kode pos harus 5 digit";
  }

  return errors;
}

export function AddressForm({ initialData, onSubmit }: AddressFormProps) {
  const [formData, setFormData] = useState<Partial<ShippingAddress>>(
    initialData || {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
    }
  );
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateAddress(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData as ShippingAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap *</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName || ""}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon *</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Alamat Lengkap *</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
          rows={3}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Kota *</Label>
          <Input
            id="city"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            placeholder="Nama kota"
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Provinsi *</Label>
          <Input
            id="province"
            name="province"
            value={formData.province || ""}
            onChange={handleChange}
            placeholder="Nama provinsi"
            className={errors.province ? "border-destructive" : ""}
          />
          {errors.province && (
            <p className="text-xs text-destructive">{errors.province}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Kode Pos *</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode || ""}
            onChange={handleChange}
            placeholder="12345"
            maxLength={5}
            className={errors.postalCode ? "border-destructive" : ""}
          />
          {errors.postalCode && (
            <p className="text-xs text-destructive">{errors.postalCode}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto">
        Lanjutkan
      </Button>
    </form>
  );
}
