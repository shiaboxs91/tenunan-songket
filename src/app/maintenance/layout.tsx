import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance - Tenunan Songket",
  description: "Website sedang dalam perbaikan",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
