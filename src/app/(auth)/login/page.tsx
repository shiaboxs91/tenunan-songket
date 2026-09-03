import { Metadata } from "next";
import { LoginForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Masuk - Tenunan Songket",
  description: "Masuk ke akun Tenunan Songket Anda",
};

export default function LoginPage() {
  return (
    <div className="space-y-1">
      {/* Heading */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: "#3D0E17" }}
        >
          Selamat Datang
        </h1>
        <p className="text-sm" style={{ color: "rgba(107,26,42,0.60)" }}>
          Masuk ke akun Anda untuk melanjutkan
        </p>
        {/* Accent line */}
        <div
          className="mt-3 h-[2px] w-10 rounded-full"
          style={{ background: "linear-gradient(90deg, #8B2535, #D4A853)" }}
        />
      </div>

      <LoginForm />
    </div>
  );
}
