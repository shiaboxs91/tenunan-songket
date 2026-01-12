"use client";

import { LayoutGrid, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type GridDensity = "compact" | "comfortable";

const STORAGE_KEY = "tenunan-grid-density";

interface GridDensityToggleProps {
  value: GridDensity;
  onChange: (value: GridDensity) => void;
}

export function GridDensityToggle({ value, onChange }: GridDensityToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-md p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("compact")}
        className={cn(
          "h-8 px-2.5 gap-1.5",
          value === "compact" && "bg-muted"
        )}
        aria-label="Compact view"
        aria-pressed={value === "compact"}
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Compact</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("comfortable")}
        className={cn(
          "h-8 px-2.5 gap-1.5",
          value === "comfortable" && "bg-muted"
        )}
        aria-label="Comfortable view"
        aria-pressed={value === "comfortable"}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Comfortable</span>
      </Button>
    </div>
  );
}

// Custom hook for grid density with localStorage persistence
export function useGridDensity(): [GridDensity, (value: GridDensity) => void] {
  const [density, setDensity] = useState<GridDensity>("comfortable");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "compact" || stored === "comfortable") {
      setDensity(stored);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when density changes
  const handleChange = (value: GridDensity) => {
    setDensity(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return [density, handleChange];
}

// Export storage key for testing
export { STORAGE_KEY };
