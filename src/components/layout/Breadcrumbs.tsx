"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Map path segments to readable labels
const pathLabels: Record<string, string> = {
  products: "Produk",
  cart: "Keranjang",
  checkout: "Checkout",
  account: "Akun",
  success: "Sukses",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  
  // Don't show on home page
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  
  // Build breadcrumb items
  const items: BreadcrumbItem[] = [
    { label: "Beranda", href: "/" },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip dynamic segments that look like slugs (contain hyphens and no special chars)
    const isSlug = segment.includes("-") && !pathLabels[segment];
    
    if (isSlug) {
      // For product slugs, show a readable version
      const label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      items.push({ label, href: currentPath });
    } else {
      const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ label, href: currentPath });
    }
  });

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("py-3", className)}
    >
      <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  aria-label="Kembali ke beranda"
                >
                  <Home className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">{item.label}</span>
                </Link>
              ) : isLast ? (
                <span className="font-medium text-foreground truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </Link>
              )}
              
              {!isLast && (
                <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
