"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createAddress,
  updateAddress,
  type Address,
  type AddressInput,
} from "@/lib/supabase/addresses";

interface AddressFormProps {
  address?: Address | null;
  onSuccess?: (address: Address) => void;
  onCancel?: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AddressInput>({
    label: "",
    recipient_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Indonesia",
    is_default: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || "",
        recipient_name: address.recipient_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default || false,
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!formData.recipient_name.trim()) {
      setError("Nama penerima wajib diisi");
      setIsLoading(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError("Nomor telepon wajib diisi");
      setIsLoading(false);
      return;
    }
    if (!formData.address_line1.trim()) {
      setError("Alamat wajib diisi");
      setIsLoading(false);
      return;
    }
    if (!formData.city.trim()) {
      setError("Kota wajib diisi");
      setIsLoading(false);
      return;
    }
    if (!formData.state.trim()) {
      setError("Provinsi wajib diisi");
      setIsLoading(false);
      return;
    }
    if (!formData.postal_code.trim()) {
      setError("Kode pos wajib diisi");
      setIsLoading(false);
      return;
    }

    try {
      let result: Address | null;
      
      if (address) {
        result = await updateAddress(address.id, formData);
      } else {
        result = await createAddress(formData);
      }

      if (result) {
        onSuccess?.(result);
      } else {
        setError("Gagal menyimpan alamat");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">Label Alamat (opsional)</Label>
        <Input
          id="label"
          name="label"
          placeholder="Contoh: Rumah, Kantor"
          value={formData.label}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient_name">Nama Penerima *</Label>
        <Input
          id="recipient_name"
          name="recipient_name"
          placeholder="Nama lengkap penerima"
          value={formData.recipient_name}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Nomor Telepon *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="08xxxxxxxxxx"
          value={formData.phone}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_line1">Alamat *</Label>
        <Input
          id="address_line1"
          name="address_line1"
          placeholder="Nama jalan, nomor rumah"
          value={formData.address_line1}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_line2">Detail Alamat (opsional)</Label>
        <Input
          id="address_line2"
          name="address_line2"
          placeholder="RT/RW, Kelurahan, Kecamatan"
          value={formData.address_line2}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Kota *</Label>
          <Input
            id="city"
            name="city"
            placeholder="Kota"
            value={formData.city}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Provinsi *</Label>
          <Input
            id="state"
            name="state"
            placeholder="Provinsi"
            value={formData.state}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Kode Pos *</Label>
          <Input
            id="postal_code"
            name="postal_code"
            placeholder="12345"
            value={formData.postal_code}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Negara</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, is_default: checked === true }))
          }
          disabled={isLoading}
        />
        <Label htmlFor="is_default" className="text-sm font-normal cursor-pointer">
          Jadikan alamat utama
        </Label>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : address ? (
            "Simpan Perubahan"
          ) : (
            "Tambah Alamat"
          )}
        </Button>
      </div>
    </form>
  );
}
