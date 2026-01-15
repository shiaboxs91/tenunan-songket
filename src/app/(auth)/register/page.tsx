import { Metadata } from "next";
import { RegisterForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Daftar - Tenunan Songket",
  description: "Buat akun Tenunan Songket baru",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Buat Akun</h1>
        <p className="text-muted-foreground">
          Daftar untuk mulai berbelanja
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
