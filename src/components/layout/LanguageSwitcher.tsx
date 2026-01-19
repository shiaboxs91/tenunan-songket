"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  variant?: "desktop" | "mobile";
}

const FlagMY = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 480"
    className={className}
    aria-hidden="true"
  >
    <path fill="#bd0026" d="M0 0h640v480H0z" />
    <path fill="#fff" d="M0 0h640v35H0zM0 70h640v35H0zM0 140h640v35H0zM0 210h640v35H0zM0 280h640v35H0zM0 350h640v35H0zM0 420h640v35H0z" />
    <path fill="#010066" d="M0 0h320v280H0z" />
    <path fill="#ffcc00" d="M192.3 84.8c-15.6-5.8-32.9-6.3-48.5 1.1 27 10.1 46.2 35.9 46.2 66.2s-19.2 56.1-46.2 66.2c15.6 7.4 32.9 6.8 48.5 1.1 7.2-2.6 14-6.3 19.9-10.9-1.5 6.8-5.7 12.8-11.4 16.9 14.9-5.4 27.4-16.1 35.3-30 4.5 13.9 4.3 29.1-.5 42.8 1.5-6.8 0-14-3.9-19.9 6.2 3.1 13 4.5 19.9 3.9-6.3-2.6-11.6-7.2-15.4-12.9 6.8 1.5 14 0 19.9-3.9-6.3-1.5-12.1-4.9-16.6-9.7 6.6-.5 13.1-2.9 18.5-7-6-.5-11.3-3.1-15.4-7.5 5.8-2.3 11-6.1 14.9-10.9-5.1 0-10.1-1.3-14.5-3.6 4.3-3.9 7.4-9.1 8.8-15-4 1.3-8.2 1.6-12.4.9 2.6-4.9 3.6-10.6 2.9-16.1-2.6 2.3-5.9 3.8-9.5 4.1 1-5.4.3-11.1-1.9-16.1-1.3 3.4-3.8 6.3-6.9 8.2-1.3-4.8-2.6-11.3 1.5-42.8-7.9 13.9-20.4 24.6-35.3 30 5.7 4.1 9.9 10.1 11.4 16.9-5.9-4.6-12.7-8.3-19.9-10.9z" />
    <path fill="#ffcc00" d="M189.4 139.7l-15.3 7 10.8 13.3-16.7-2.3 4.1 16.6-15.3-7.2 4.3 16.6-16.7-2.1 10.8 13.3-15.4 6.8 15.3-6.8-10.8-13.3 16.7 2.1-4.3-16.6 15.3 7.2-4.1-16.6 16.7 2.3-10.8-13.3 15.4-6.8z" />
  </svg>
);

const FlagGB = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 480"
    className={className}
    aria-hidden="true"
  >
    <path fill="#012169" d="M0 0h640v480H0z" />
    <path fill="#fff" d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 62V0h75z" />
    <path fill="#c8102e" d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
    <path fill="#fff" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
    <path fill="#c8102e" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
  </svg>
);

export function LanguageSwitcher({ currentLocale, variant = "desktop" }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleChange = async (locale: Locale) => {
    // Set cookie
    document.cookie = `locale=${locale};path=/;max-age=31536000`; // 1 year
    if (variant !== "mobile") {
        setIsOpen(false);
    }
    // Refresh the page to apply new locale
    router.refresh();
  };

  const getFlag = (locale: Locale, className: string = "w-6 h-6 rounded-sm shadow-sm object-cover") => {
    switch (locale) {
      case 'ms':
        return <FlagMY className={className} />;
      case 'en':
        return <FlagGB className={className} />;
      default:
        return null;
    }
  };

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-2">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              "flex items-center justify-center p-1.5 rounded-full transition-all border-2",
              currentLocale === locale
                ? "bg-amber-50 border-amber-500"
                : "bg-transparent border-transparent hover:bg-slate-100"
            )}
            title={localeNames[locale]}
            aria-label={`Ubah bahasa ke ${localeNames[locale]}`}
          >
            {getFlag(locale, "w-8 h-8 rounded-full object-cover")}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all",
          "hover:bg-amber-50",
          isOpen && "bg-amber-50"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Pilih bahasa"
      >
        <div className="relative overflow-hidden rounded-sm w-6 h-4 border border-slate-200">
             {getFlag(currentLocale, "w-full h-full object-cover")}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
          {currentLocale.toUpperCase()}
        </span>
        <svg
          className={cn(
            "w-3 h-3 text-slate-400 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pilih Bahasa
          </div>
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors",
                currentLocale === locale
                  ? "bg-amber-50 text-amber-700 font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <div className="w-5 h-3.5 relative rounded-sm overflow-hidden border border-slate-200 shadow-sm">
                 {getFlag(locale, "w-full h-full object-cover")}
              </div>
              <span className="flex-1">{localeNames[locale]}</span>
              {currentLocale === locale && (
                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
