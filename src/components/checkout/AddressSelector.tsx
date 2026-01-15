"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressForm } from "@/components/profile";
import { getAddresses, type Address } from "@/lib/supabase/addresses";

interface AddressSelectorProps {
  selectedAddressId?: string;
  onSelect: (address: Address) => void;
}

export function AddressSelector({ selectedAddressId, onSelect }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    const data = await getAddresses();
    setAddresses(data);
    
    // Auto-select default address if none selected
    if (!selectedAddressId && data.length > 0) {
      const defaultAddr = data.find(a => a.is_default) || data[0];
      onSelect(defaultAddr);
    }
    
    setIsLoading(false);
  };

  const handleAddressCreated = async (address: Address) => {
    setIsDialogOpen(false);
    await loadAddresses();
    onSelect(address);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground mb-4">Belum ada alamat tersimpan</p>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Alamat
        </Button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Alamat Baru</DialogTitle>
            </DialogHeader>
            <AddressForm
              onSuccess={handleAddressCreated}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <div
          key={address.id}
          onClick={() => onSelect(address)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedAddressId === address.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {address.label && (
                  <span className="text-sm font-medium text-primary">
                    {address.label}
                  </span>
                )}
                {address.is_default && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    Utama
                  </span>
                )}
              </div>
              <p className="font-medium">{address.recipient_name}</p>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
              <p className="text-sm mt-1">
                {address.address_line1}
                {address.address_line2 && `, ${address.address_line2}`}
              </p>
              <p className="text-sm">
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p className="text-sm text-muted-foreground">{address.country}</p>
            </div>
            
            {selectedAddressId === address.id && (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Alamat Baru
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Alamat Baru</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSuccess={handleAddressCreated}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
