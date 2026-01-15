import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Lupa Password - Tenunan Songket",
  description: "Reset password akun Tenunan Songket Anda",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
