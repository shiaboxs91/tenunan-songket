"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const badgeConfigs = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    titleKey: "authentic",
    descKey: "authenticDesc",
    color: "from-emerald-400 to-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
    iconBg: "bg-emerald-500",
    borderColor: "border-emerald-200/60",
  },
  {
    icon: "M5 13l4 4L19 7",
    titleKey: "handmade",
    descKey: "handmadeDesc",
    color: "from-amber-400 to-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/50",
    iconBg: "bg-amber-500",
    borderColor: "border-amber-200/60",
  },
  {
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    titleKey: "safeShipping",
    descKey: "safeShippingDesc",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/50",
    iconBg: "bg-blue-500",
    borderColor: "border-blue-200/60",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    titleKey: "bestPrice",
    descKey: "bestPriceDesc",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100/50",
    iconBg: "bg-purple-500",
    borderColor: "border-purple-200/60",
  },
  {
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    titleKey: "qualityGuarantee",
    descKey: "qualityGuaranteeDesc",
    color: "from-rose-400 to-rose-600",
    bgColor: "bg-gradient-to-br from-rose-50 to-rose-100/50",
    iconBg: "bg-rose-500",
    borderColor: "border-rose-200/60",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    titleKey: "support",
    descKey: "supportDesc",
    color: "from-teal-400 to-teal-600",
    bgColor: "bg-gradient-to-br from-teal-50 to-teal-100/50",
    iconBg: "bg-teal-500",
    borderColor: "border-teal-200/60",
  },
];

export function TrustBadges() {
  const t = useTranslations("trustBadges");

  return (
    <div className="md:hidden py-4 px-3 bg-gradient-to-b from-slate-50/80 to-white">
      {/* Section Title */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300" />
        <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">
          {t("whyChooseUs")}
        </span>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300" />
      </div>

      {/* Grid Layout - 3 columns */}
      <div className="grid grid-cols-3 gap-2">
        {badgeConfigs.map((badge, index) => (
          <div
            key={index}
            className={cn(
              "relative flex flex-col items-center text-center p-2.5 rounded-xl",
              "border shadow-sm",
              "transition-all duration-200 active:scale-95",
              badge.bgColor,
              badge.borderColor
            )}
          >
            {/* Icon Circle with Glow Effect */}
            <div className="relative mb-1.5">
              <div className={cn(
                "absolute inset-0 rounded-full blur-md opacity-40",
                badge.iconBg
              )} />
              <div className={cn(
                "relative w-10 h-10 rounded-full flex items-center justify-center",
                "bg-gradient-to-br shadow-md",
                badge.color
              )}>
                <svg 
                  className="w-5 h-5 text-white drop-shadow-sm" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                </svg>
              </div>
            </div>

            {/* Text */}
            <p className="text-[11px] font-semibold text-slate-700 leading-tight">
              {t(badge.titleKey)}
            </p>
            <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
              {t(badge.descKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
