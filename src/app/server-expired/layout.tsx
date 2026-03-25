import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Server Tidak Aktif - Tenunan Songket",
  description: "Masa aktif server telah habis",
  robots: { index: false, follow: false },
};

export default function ServerExpiredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
