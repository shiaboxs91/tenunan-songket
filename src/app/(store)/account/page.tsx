"use client";

import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just set logged in state
    setIsLoggedIn(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just set logged in state
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Akun Saya</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Demo User</CardTitle>
              <CardDescription>demo@tenunansongket.com</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                Keluar
              </Button>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Kelola informasi akun Anda (Demo)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input defaultValue="Demo User" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="demo@tenunansongket.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Telepon</Label>
                  <Input defaultValue="081234567890" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Bergabung</Label>
                  <Input defaultValue="1 Januari 2024" disabled />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Catatan:</strong> Ini adalah halaman demo. Fitur akun
                  lengkap akan tersedia setelah integrasi backend.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang</h1>
          <p className="text-muted-foreground">
            Masuk atau daftar untuk melanjutkan
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        defaultValue="demo@tenunansongket.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        defaultValue="demo123"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Ingat saya</span>
                    </label>
                    <a href="#" className="text-primary hover:underline">
                      Lupa password?
                    </a>
                  </div>

                  <Button type="submit" className="w-full">
                    Masuk
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Nama lengkap"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-sm">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded mt-1" />
                      <span className="text-muted-foreground">
                        Saya setuju dengan{" "}
                        <a href="#" className="text-primary hover:underline">
                          Syarat & Ketentuan
                        </a>{" "}
                        dan{" "}
                        <a href="#" className="text-primary hover:underline">
                          Kebijakan Privasi
                        </a>
                      </span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full">
                    Daftar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Ini adalah demo. Klik tombol untuk simulasi login/register.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
