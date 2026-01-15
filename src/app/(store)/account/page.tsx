"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, MapPin, Package, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile";
import { createClient } from "@/lib/supabase/client";
import { getProfile, type Profile } from "@/lib/supabase/profiles";
import { signOut } from "@/lib/supabase/auth";

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");
      const profileData = await getProfile();
      setProfile(profileData);
      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleProfileUpdate = (updated: Profile) => {
    setProfile(updated);
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
              <CardTitle className="text-lg">{profile?.full_name || "User"}</CardTitle>
              <CardDescription className="text-sm truncate">{userEmail}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/account" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Button>
              </Link>
              <Link href="/account/addresses" className="block">
                <Button variant="ghost" className="w-full justify-start">
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
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Kelola informasi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile && (
                <ProfileForm profile={profile} onUpdate={handleProfileUpdate} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
