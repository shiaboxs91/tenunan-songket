"use client";

import { cn } from "@/lib/utils";

export interface ProductColorDot {
  name: string;
  slug: string;
  hex_code: string | null;
  is_primary: boolean;
}

interface ColorDotsProps {
  colors: ProductColorDot[];
  maxVisible?: number;
  size?: "sm" | "md";
  className?: string;
}

export function ColorDots({
  colors,
  maxVisible = 5,
  size = "sm",
  className,
}: ColorDotsProps) {
  if (colors.length === 0) return null;

  const visible = colors.slice(0, maxVisible);
  const remaining = colors.length - maxVisible;

  const dotSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const fontSize = size === "sm" ? "text-[9px]" : "text-[10px]";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visible.map((color) => (
        <span
          key={color.slug}
          title={color.name}
          className={cn(
            dotSize,
            "rounded-full border border-gray-300/60 inline-block flex-shrink-0",
            color.is_primary && "ring-1 ring-amber-400/60"
          )}
          style={{ backgroundColor: color.hex_code || "#808080" }}
        />
      ))}
      {remaining > 0 && (
        <span className={cn(fontSize, "text-muted-foreground ml-0.5")}>
          +{remaining}
        </span>
      )}
    </div>
  );
}
