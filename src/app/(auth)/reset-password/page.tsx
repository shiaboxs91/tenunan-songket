import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Reset Password - Tenunan Songket",
  description: "Buat password baru untuk akun Tenunan Songket Anda",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
