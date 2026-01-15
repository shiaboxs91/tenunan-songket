import { Metadata } from "next";
import { LoginForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Masuk - Tenunan Songket",
  description: "Masuk ke akun Tenunan Songket Anda",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Selamat Datang</h1>
        <p className="text-muted-foreground">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
