"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface ColorOption {
  id: string;
  name: string;
  slug: string;
  hex_code: string | null;
}

interface ColorFilterProps {
  colors: ColorOption[];
  selectedColors: string[];
  onToggleColor: (colorSlug: string) => void;
}

export function ColorFilter({
  colors,
  selectedColors,
  onToggleColor,
}: ColorFilterProps) {
  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Warna</Label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selectedColors.includes(color.slug);
          const hexCode = color.hex_code || "#808080";
          const isLight = isLightColor(hexCode);

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onToggleColor(color.slug)}
              title={color.name}
              className={cn(
                "relative w-8 h-8 rounded-full border-2 transition-all duration-200",
                "hover:scale-110 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500",
                isSelected
                  ? "border-amber-500 ring-2 ring-amber-500/30"
                  : "border-gray-300 hover:border-gray-400"
              )}
              style={{ backgroundColor: hexCode }}
              aria-label={`Filter warna ${color.name}`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-4 w-4",
                    isLight ? "text-gray-800" : "text-white"
                  )}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
