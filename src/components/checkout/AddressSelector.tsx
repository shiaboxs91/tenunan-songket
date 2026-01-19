"use client";

/**
 * AddressSelector component with inline edit capability
 * Feature: address-management-enhancement
 * Task 11: Enhance AddressSelector with inline edit capability
 * 
 * Requirements:
 * - 4.1: "Edit" button next to selected address
 * - 4.2: Integrate AddressEditModal
 * - 4.4: onAddressUpdated callback to refresh after save
 * - 13.2: Highlight updated address after save
 */

import { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Check, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressForm } from "@/components/profile";
import { AddressEditModal } from "./AddressEditModal";
import { CountryProvider } from "@/contexts/CountryContext";
import { getAddresses, type Address } from "@/lib/supabase/addresses";

interface AddressSelectorProps {
  selectedAddressId?: string;
  onSelect: (address: Address) => void;
  /** Optional callback when an address is updated */
  onAddressUpdated?: (address: Address) => void;
}

export function AddressSelector({ 
  selectedAddressId, 
  onSelect,
  onAddressUpdated,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // State for inline edit modal - Task 11
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Track recently updated address for highlight effect - Requirement 13.2
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  // Clear highlight effect after 3 seconds
  useEffect(() => {
    if (recentlyUpdatedId) {
      const timer = setTimeout(() => {
        setRecentlyUpdatedId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyUpdatedId]);

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

  /**
   * Handle new address created
   */
  const handleAddressCreated = async (address: Address) => {
    setIsAddDialogOpen(false);
    await loadAddresses();
    onSelect(address);
    setRecentlyUpdatedId(address.id);
    onAddressUpdated?.(address);
  };

  /**
   * Handle edit button click - Requirement 4.1
   * Opens the edit modal for the selected address
   */
  const handleEditClick = useCallback((e: React.MouseEvent, address: Address) => {
    // Prevent address selection when clicking edit button
    e.stopPropagation();
    setEditingAddress(address);
    setIsEditModalOpen(true);
  }, []);

  /**
   * Handle address updated after edit - Requirements 4.4, 13.2
   */
  const handleAddressUpdated = async (updatedAddress: Address) => {
    // Close modal
    setIsEditModalOpen(false);
    setEditingAddress(null);
    
    // Reload addresses to get fresh data
    await loadAddresses();
    
    // Re-select the updated address if it was selected
    if (selectedAddressId === updatedAddress.id) {
      onSelect(updatedAddress);
    }
    
    // Highlight the updated address - Requirement 13.2
    setRecentlyUpdatedId(updatedAddress.id);
    
    // Call optional callback
    onAddressUpdated?.(updatedAddress);
  };

  /**
   * Handle edit modal close
   */
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingAddress(null);
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Alamat
        </Button>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Alamat Baru</DialogTitle>
            </DialogHeader>
            <CountryProvider initialCountry="BN">
              <AddressForm
                onSuccess={handleAddressCreated}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </CountryProvider>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => {
        const isSelected = selectedAddressId === address.id;
        const isRecentlyUpdated = recentlyUpdatedId === address.id;
        
        return (
          <div
            key={address.id}
            onClick={() => onSelect(address)}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all duration-300
              ${isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
              }
              ${isRecentlyUpdated
                ? "ring-2 ring-green-500 ring-offset-2 animate-pulse"
                : ""
              }
            `}
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
                  {isRecentlyUpdated && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded animate-pulse">
                      Diperbarui
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
              
              {/* Right side: Edit button and check mark */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {/* Edit button - Requirement 4.1 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleEditClick(e, address)}
                  className="h-8 px-2 text-muted-foreground hover:text-primary"
                  aria-label={`Edit alamat ${address.label || address.recipient_name}`}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  <span className="text-xs">Edit</span>
                </Button>
                
                {/* Check mark for selected address */}
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Alamat Baru
      </Button>

      {/* Add new address dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Alamat Baru</DialogTitle>
          </DialogHeader>
          <CountryProvider initialCountry="BN">
            <AddressForm
              onSuccess={handleAddressCreated}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </CountryProvider>
        </DialogContent>
      </Dialog>

      {/* Edit address modal - Task 11 integration */}
      <AddressEditModal
        isOpen={isEditModalOpen}
        address={editingAddress}
        onClose={handleEditModalClose}
        onSuccess={handleAddressUpdated}
      />
    </div>
  );
}
