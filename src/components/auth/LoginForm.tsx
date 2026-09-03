"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signInWithGoogle, signInWithFacebook } from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";

interface LoginFormProps {
  redirectTo?: string;
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── Style helpers ──────────────────────────────────────────────
const inputBase =
  "h-11 pl-10 text-sm rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2535]/30 focus-visible:border-[#8B2535]";
const inputStyle: React.CSSProperties = {
  background: "rgba(253,248,243,0.9)",
  borderColor: "rgba(139,37,53,0.18)",
  color: "#3D0E17",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#5A1520",
  letterSpacing: "0.01em",
};

export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingText, setLoadingText] = useState("Memverifikasi...");

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsLoading(true);
    setLoadingText("Memverifikasi kredensial...");

    try {
      const { user, error: authError } = await signIn(data.email, data.password);

      if (authError) {
        setIsLoading(false);
        if (authError.message.includes("Invalid login")) {
          setError("Email atau password salah");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Email belum diverifikasi. Silakan cek inbox Anda");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (user) {
        setLoadingText("Login berhasil! Memeriksa akses...");
        const supabase = getSupabaseClient();
        await new Promise((resolve) => setTimeout(resolve, 800));

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        setLoadingText("Mengalihkan ke dashboard...");
        setIsSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push(redirectTo);
        }
      } else {
        router.push(redirectTo);
      }

      router.refresh();
    } catch {
      setIsLoading(false);
      setError("Terjadi kesalahan. Silakan coba lagi");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError("Gagal login dengan Google");
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError(null);
    setIsFacebookLoading(true);
    try {
      const { error: authError } = await signInWithFacebook();
      if (authError) {
        setError(authError.message);
        setIsFacebookLoading(false);
      }
    } catch {
      setError("Gagal login dengan Facebook");
      setIsFacebookLoading(false);
    }
  };

  // ── Loading / success state ────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[260px] gap-5 animate-in fade-in duration-500">
        <div className="relative">
          {isSuccess ? (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center animate-in zoom-in duration-300"
              style={{ background: "rgba(34,197,94,0.12)" }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: "#16a34a" }} />
            </div>
          ) : (
            <div className="relative w-14 h-14">
              <div
                className="absolute inset-0 rounded-full border-[3px]"
                style={{ borderColor: "rgba(139,37,53,0.15)" }}
              />
              <div
                className="absolute inset-0 rounded-full border-[3px] border-t-transparent animate-spin"
                style={{ borderColor: "#8B2535", borderTopColor: "transparent" }}
              />
            </div>
          )}
        </div>
        <div className="text-center">
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "#3D0E17" }}
          >
            {isSuccess ? "Berhasil Masuk" : "Mohon Tunggu"}
          </p>
          <p className="text-xs animate-pulse" style={{ color: "rgba(107,26,42,0.55)" }}>
            {loadingText}
          </p>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Error alert */}
          {error && (
            <div
              className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.20)",
                color: "#b91c1c",
              }}
            >
              <span className="mt-px text-base leading-none">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel style={labelStyle}>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                      style={{ color: "rgba(139,37,53,0.45)" }}
                    />
                    <Input
                      placeholder="nama@email.com"
                      className={inputBase}
                      style={inputStyle}
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel style={labelStyle}>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium hover:underline"
                    style={{ color: "#8B2535" }}
                  >
                    Lupa password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                      style={{ color: "rgba(139,37,53,0.45)" }}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputBase} pl-10 pr-10`}
                      style={inputStyle}
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(139,37,53,0.40)" }}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold rounded-lg mt-1 transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #8B2535 0%, #6B1A2A 100%)",
              color: "#FDF3E7",
              border: "none",
              boxShadow: "0 2px 12px rgba(107,26,42,0.30)",
            }}
            disabled={isLoading}
          >
            Masuk
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "rgba(139,37,53,0.12)" }} />
        <span className="text-xs" style={{ color: "rgba(107,26,42,0.45)" }}>
          atau lanjutkan dengan
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(139,37,53,0.12)" }} />
      </div>

      {/* Social login */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isFacebookLoading}
          className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(139,37,53,0.15)",
            color: "#3D0E17",
            boxShadow: "0 1px 4px rgba(107,26,42,0.08)",
          }}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </>
          )}
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={handleFacebookSignIn}
          disabled={isGoogleLoading || isFacebookLoading}
          className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(139,37,53,0.15)",
            color: "#3D0E17",
            boxShadow: "0 1px 4px rgba(107,26,42,0.08)",
          }}
        >
          {isFacebookLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </>
          )}
        </button>
      </div>

      {/* Register link */}
      <p className="text-center text-sm" style={{ color: "rgba(107,26,42,0.55)" }}>
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold hover:underline"
          style={{ color: "#8B2535" }}
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
