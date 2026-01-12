"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "Semua Produk", href: "/products" },
    { name: "Beragi", href: "/products?category=Beragi" },
    { name: "Arap Gegati", href: "/products?category=Arap%20Gegati" },
    { name: "Bertabur", href: "/products?category=Bertabur" },
    { name: "Jongsarat", href: "/products?category=Jongsarat" },
    { name: "Si Pugut", href: "/products?category=Si%20Pugut" },
    { name: "Silubang Bangsi", href: "/products?category=Silubang%20Bangsi" },
    { name: "Tajung", href: "/products?category=Tajung" },
    { name: "Lainnya", href: "/products?category=Lainnya" },
  ],
  info: [
    { name: "Cara Order", href: "#" },
    { name: "Tentang Kami", href: "#" },
    { name: "Kontak", href: "#" },
    { name: "FAQ", href: "#" },
  ],
  social: [
    { name: "Instagram", href: "#", icon: Instagram },
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Story with Logo */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="https://tenunansongket.com/wp-content/uploads/2020/08/ts-4.png"
                alt="TenunanSongket Logo"
                width={160}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Melestarikan warisan budaya Indonesia melalui kain tenun dan songket
              berkualitas tinggi. Setiap helai kain kami dibuat dengan cinta oleh
              pengrajin lokal yang berpengalaman.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Belanja</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Informasi</h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Ikuti Kami</h3>
            <div className="flex space-x-3 mb-6">
              {footerLinks.social.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">Email:</span> info@tenunansongket.com
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">WhatsApp:</span> +62 812-3456-7890
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-slate-100/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TenunanSongket. Semua hak dilindungi.
            </p>
            <p className="text-xs text-muted-foreground">
              Demo frontend - Transaksi bersifat simulasi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
