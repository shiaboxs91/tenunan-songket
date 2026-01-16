"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null);

  // Check for recovery token in URL hash on mount
  useEffect(() => {
    const checkRecoveryToken = async () => {
      // Check if there's a hash fragment with access_token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (accessToken && type === 'recovery') {
        // Token exists in URL, verify it's valid
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          setError('Link reset password tidak valid atau sudah kadaluarsa');
          setHasValidToken(false);
        } else {
          setHasValidToken(true);
          // Clear the hash from URL for security
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        // No token in URL, check if user has an active session
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        
        if (data.user) {
          setHasValidToken(true);
        } else {
          setError('Link reset password tidak ditemukan. Silakan minta link baru dari halaman Forgot Password.');
          setHasValidToken(false);
        }
      }
    };

    checkRecoveryToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const { error: authError } = await updatePassword(password);

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (hasValidToken === null) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Memverifikasi link reset password...</p>
      </div>
    );
  }

  // Show error if token is invalid
  if (hasValidToken === false) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold">Link Tidak Valid</h2>
        <p className="text-muted-foreground">
          {error || 'Link reset password tidak valid atau sudah kadaluarsa.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => router.push('/forgot-password')}>
            Minta Link Baru
          </Button>
          <Button onClick={() => router.push('/login')}>
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Password Berhasil Diubah</h2>
        <p className="text-muted-foreground">
          Password Anda telah berhasil diperbarui. Silakan login dengan password baru.
        </p>
        <Button onClick={() => router.push("/login")}>
          Masuk Sekarang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          Masukkan password baru Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password Baru</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
              disabled={isLoading}
              minLength={6}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Ulangi password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Password Baru"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Kembali ke Login
        </Link>
      </p>
    </div>
  );
}
