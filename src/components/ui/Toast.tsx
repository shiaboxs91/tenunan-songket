"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconStyles = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:left-auto md:right-4 md:w-96">
        {toasts.map((toast, index) => {
          const Icon = toastIcons[toast.type];
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg",
                "animate-in slide-in-from-top-2 fade-in duration-300",
                toastStyles[toast.type]
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              role="alert"
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", iconStyles[toast.type])} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
