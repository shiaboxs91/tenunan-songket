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
  ],
  info: [
    { name: "Cara Order", href: "/cara-order" },
    { name: "Tentang Kami", href: "/tentang-kami" },
    { name: "FAQ", href: "/faq" },
  ],
  social: [
    { name: "Instagram", href: "https://instagram.com/tenunansongkett", icon: Instagram },
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Top gold ornament line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      
      {/* Subtle songket pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B' fill-opacity='1'%3E%3Cpath d='M20 0L22 2L20 4L18 2L20 0zM10 10L12 12L10 14L8 12L10 10zM30 10L32 12L30 14L28 12L30 10zM20 20L22 22L20 24L18 22L20 20zM10 30L12 32L10 34L8 32L10 30zM30 30L32 32L30 34L28 32L30 30z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Footer Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
            <p className="text-sm text-slate-600 leading-relaxed">
              Melestarikan warisan budaya Melayu melalui kain tenun dan songket
              berkualitas tinggi. Setiap helai kain kami dibuat dengan cinta oleh
              pengrajin mahir yang berpengalaman.
            </p>
            {/* Decorative element */}
            <div className="flex items-center gap-2 mt-4">
              <div className="h-px w-8 bg-gradient-to-r from-amber-400 to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-400" />
              <div className="h-px w-8 bg-gradient-to-l from-amber-400 to-transparent" />
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              Belanja
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-amber-700 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              Informasi
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-amber-700 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              Ikuti Kami
            </h3>
            <div className="flex space-x-3 mb-6">
              {footerLinks.social.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="h-10 w-10 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                <span className="text-amber-700 font-medium">Email:</span> info@tenunansongket.com
              </p>
              <p className="text-sm text-slate-600">
                <span className="text-amber-700 font-medium">WhatsApp:</span> +673 812-3456
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-amber-200/50 bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} TenunanSongket. Warisan Budaya Melayu.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1 h-1 rotate-45 bg-amber-400" />
              <span>Demo frontend - Transaksi bersifat simulasi</span>
              <div className="w-1 h-1 rotate-45 bg-amber-400" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
