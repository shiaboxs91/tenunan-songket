"use client";

import { useState, useEffect } from "react";
import { Truck, Check, Loader2, Clock, Shield } from "lucide-react";
import {
  calculateShipping,
  formatShippingCost,
  type ShippingOption,
  type ShippingAddress,
  type Dimensions,
} from "@/lib/supabase/shipping";

interface ShippingSelectorProps {
  address: ShippingAddress | null;
  totalWeight: number;
  dimensions?: Dimensions;
  selectedOption?: ShippingOption;
  onSelect: (option: ShippingOption) => void;
}

export function ShippingSelector({
  address,
  totalWeight,
  dimensions,
  selectedOption,
  onSelect,
}: ShippingSelectorProps) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadShippingOptions();
    }
  }, [address, totalWeight]);

  const loadShippingOptions = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const shippingOptions = await calculateShipping(address, totalWeight, dimensions);
      setOptions(shippingOptions);
      
      // Auto-select first option if none selected
      if (shippingOptions.length > 0 && !selectedOption) {
        onSelect(shippingOptions[0]);
      }
    } catch (error) {
      console.error('Error loading shipping options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Pilih alamat pengiriman terlebih dahulu</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Menghitung ongkos kirim...</span>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Tidak ada opsi pengiriman tersedia untuk alamat ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div
          key={`${option.courier}-${option.service}`}
          onClick={() => onSelect(option)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedOption?.courier === option.courier && selectedOption?.service === option.service
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-primary" />
                <span className="font-medium">{option.service}</span>
                {index === 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Termurah
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {option.estimatedDays}
                </span>
                {option.includesInsurance && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Shield className="h-3 w-3" />
                    Termasuk asuransi
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-primary">
                {formatShippingCost(option.cost, option.currency)}
              </p>
              {selectedOption?.courier === option.courier && 
               selectedOption?.service === option.service && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center mt-1 ml-auto">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground mt-2">
        * Estimasi waktu pengiriman dapat berbeda tergantung kondisi
      </p>
    </div>
  );
}
