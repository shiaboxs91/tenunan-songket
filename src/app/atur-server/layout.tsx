import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atur Server - Tenunan Songket",
  description: "Panel kontrol server",
  robots: { index: false, follow: false },
};

export default function AturServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
