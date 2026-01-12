"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

// Social icons as simple SVG components (lucide deprecated these)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
import { cn } from "@/lib/utils";

// Collapsible section for mobile
function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-amber-200/50 md:border-0">
      {/* Mobile: Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 md:hidden"
      >
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-amber-400 rounded-full" />
          {title}
        </h3>
        <ChevronDown className={cn(
          "h-4 w-4 text-slate-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {/* Desktop: Always visible header */}
      <h3 className="hidden md:flex font-semibold text-slate-800 mb-4 items-center gap-2">
        <span className="w-1 h-4 bg-amber-400 rounded-full" />
        {title}
      </h3>
      
      {/* Content */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 md:block",
        isOpen ? "max-h-96 pb-3" : "max-h-0 md:max-h-none"
      )}>
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  const footerLinks = {
    shop: [
      { nameKey: "allProducts", name: "", href: "/products" },
      { nameKey: "", name: "Beragi", href: "/products?category=Beragi" },
      { nameKey: "", name: "Arap Gegati", href: "/products?category=Arap%20Gegati" },
      { nameKey: "", name: "Bertabur", href: "/products?category=Bertabur" },
      { nameKey: "", name: "Jongsarat", href: "/products?category=Jongsarat" },
    ],
    info: [
      { nameKey: "howToOrder", name: "", href: "/cara-order" },
      { nameKey: "about", name: "", href: "/tentang-kami" },
      { nameKey: "faq", name: "", href: "/faq" },
    ],
    social: [
      { name: "Instagram", href: "https://instagram.com/tenunansongkett", icon: InstagramIcon },
      { name: "Facebook", href: "#", icon: FacebookIcon },
      { name: "Twitter", href: "#", icon: TwitterIcon },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-50 to-slate-100 pb-20 md:pb-0">
      {/* Top gold ornament line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      {/* Main Footer Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Mobile: Compact layout */}
        <div className="md:hidden">
          {/* Logo & Social - Always visible */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Image
                src="https://tenunansongket.com/wp-content/uploads/2020/08/ts-4.png"
                alt="TenunanSongket Logo"
                width={120}
                height={35}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="flex gap-2">
              {footerLinks.social.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="h-9 w-9 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Contact - Always visible */}
          <div className="flex gap-4 mb-4 p-3 bg-white/60 rounded-lg">
            <a href="mailto:info@tenunansongket.com" className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-amber-500" />
              <span className="truncate">info@tenunansongket.com</span>
            </a>
          </div>

          {/* Collapsible Sections */}
          <CollapsibleSection title={t("quickLinks")}>
            <ul className="space-y-2 pl-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-amber-700 transition-colors"
                  >
                    {link.nameKey ? tNav(link.nameKey) : link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title={t("customerService")}>
            <ul className="space-y-2 pl-3">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-amber-700 transition-colors"
                  >
                    {link.nameKey ? tCommon(link.nameKey) : link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        </div>

        {/* Desktop: Full layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 lg:gap-12">
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
              {t("aboutUs")}
            </p>
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
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-amber-700 transition-colors"
                  >
                    {link.nameKey ? tNav(link.nameKey) : link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              {t("customerService")}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-amber-700 transition-colors"
                  >
                    {link.nameKey ? tCommon(link.nameKey) : link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              {t("followUs")}
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
            <p className="text-xs md:text-sm text-slate-600 text-center md:text-left">
              © {new Date().getFullYear()} TenunanSongket. {t("copyright")}
            </p>
            <p className="text-[10px] md:text-xs text-slate-400">
              Demo frontend - Transaksi simulasi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
