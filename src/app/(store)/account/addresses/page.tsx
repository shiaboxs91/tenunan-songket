"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, MapPin, Package, LogOut, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressForm, AddressList } from "@/components/profile";
import { CountryProvider } from "@/contexts/CountryContext";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { getAddresses, type Address } from "@/lib/supabase/addresses";
import { getProfile } from "@/lib/supabase/profiles";
import { signOut } from "@/lib/supabase/auth";

export default function AddressesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");
      
      const [profile, addressList] = await Promise.all([
        getProfile(),
        getAddresses(),
      ]);
      
      setUserName(profile?.full_name || "User");
      setAddresses(addressList);
      setIsLoading(false);
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleSuccess = async (savedAddress: Address) => {
    setIsDialogOpen(false);
    const wasEditing = editingAddress !== null;
    setEditingAddress(null);
    
    // Refresh addresses
    const updated = await getAddresses();
    setAddresses(updated);
    
    // Show success toast - Requirement 13.1, 13.4
    if (wasEditing) {
      if (savedAddress.is_default) {
        showToast("Alamat utama berhasil diperbarui!", "success");
      } else {
        showToast("Alamat berhasil diperbarui!", "success");
      }
    } else {
      showToast("Alamat baru berhasil ditambahkan!", "success");
    }
  };

  const handleDelete = async () => {
    const updated = await getAddresses();
    setAddresses(updated);
    showToast("Alamat berhasil dihapus", "success");
  };

  const handleSetDefault = async () => {
    const updated = await getAddresses();
    setAddresses(updated);
    showToast("Alamat utama berhasil diubah", "success");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-lg">{userName}</CardTitle>
              <CardDescription className="text-sm truncate">{userEmail}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/account" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Button>
              </Link>
              <Link href="/account/addresses" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Alamat
                </Button>
              </Link>
              <Link href="/account/orders" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Pesanan
                </Button>
              </Link>
              <hr className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Alamat</CardTitle>
                <CardDescription>
                  Kelola alamat pengiriman Anda
                </CardDescription>
              </div>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Alamat
              </Button>
            </CardHeader>
            <CardContent>
              <AddressList
                addresses={addresses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
            </DialogTitle>
          </DialogHeader>
          <CountryProvider initialCountry={editingAddress?.country as any || 'BN'}>
            <AddressForm
              address={editingAddress}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </CountryProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
