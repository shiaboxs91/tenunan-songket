"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteAddress, setDefaultAddress, type Address } from "@/lib/supabase/addresses";

interface AddressListProps {
  addresses: Address[];
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

export function AddressList({ addresses, onEdit, onDelete, onSetDefault }: AddressListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteAddress(id);
    if (success) {
      onDelete?.(id);
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    const success = await setDefaultAddress(id);
    if (success) {
      onSetDefault?.(id);
    }
    setSettingDefaultId(null);
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Belum ada alamat tersimpan</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`p-4 border rounded-lg ${
              address.is_default ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {address.label && (
                    <span className="text-sm font-medium text-primary">
                      {address.label}
                    </span>
                  )}
                  {address.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3" />
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
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(address)}
                  title="Edit alamat"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDelete(address.id)}
                  disabled={deletingId === address.id}
                  title="Hapus alamat"
                >
                  {deletingId === address.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>

            {!address.is_default && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleSetDefault(address.id)}
                disabled={settingDefaultId === address.id}
              >
                {settingDefaultId === address.id ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-3 w-3" />
                    Jadikan Alamat Utama
                  </>
                )}
              </Button>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Alamat?</AlertDialogTitle>
            <AlertDialogDescription>
              Alamat ini akan dihapus dari daftar alamat Anda. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
