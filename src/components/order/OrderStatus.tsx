"use client";

import { Check, Clock, Package, Truck, Home, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/supabase/orders";

interface OrderStatusProps {
  order: Order;
}

interface StatusStep {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const STEPS: StatusStep[] = [
  {
    key: "pending",
    label: "Pesanan Dibuat",
    icon: Clock,
    description: "Menunggu pembayaran",
  },
  {
    key: "confirmed",
    label: "Pembayaran Dikonfirmasi",
    icon: Check,
    description: "Pembayaran telah diterima",
  },
  {
    key: "processing",
    label: "Diproses",
    icon: Package,
    description: "Pesanan sedang dikemas",
  },
  {
    key: "shipped",
    label: "Dikirim",
    icon: Truck,
    description: "Pesanan dalam perjalanan",
  },
  {
    key: "delivered",
    label: "Diterima",
    icon: Home,
    description: "Pesanan telah sampai",
  },
];

const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered", "completed"];

function getStepStatus(stepKey: string, currentStatus: string): "completed" | "current" | "upcoming" | "cancelled" {
  if (currentStatus === "cancelled") {
    return "cancelled";
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const stepIndex = STATUS_ORDER.indexOf(stepKey);

  if (stepIndex < currentIndex) {
    return "completed";
  } else if (stepIndex === currentIndex) {
    return "current";
  }
  return "upcoming";
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderStatus({ order }: OrderStatusProps) {
  const currentStatus = order.status || "pending";
  const isCancelled = currentStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <X className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-800">Pesanan Dibatalkan</p>
          <p className="text-sm text-red-600">
            {order.cancelled_at ? formatDate(order.cancelled_at) : ""}
          </p>
          {order.cancel_reason && (
            <p className="text-sm text-red-600 mt-1">
              Alasan: {order.cancel_reason}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Get timestamps for each step
  const timestamps: Record<string, string | null> = {
    pending: order.created_at,
    confirmed: order.paid_at,
    processing: order.paid_at, // Same as confirmed for now
    shipped: order.shipped_at,
    delivered: order.delivered_at,
  };

  return (
    <div className="space-y-0">
      {STEPS.map((step, index) => {
        const status = getStepStatus(step.key, currentStatus);
        const Icon = step.icon;
        const isLast = index === STEPS.length - 1;
        const timestamp = timestamps[step.key];

        return (
          <div key={step.key} className="flex gap-4">
            {/* Icon and Line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  status === "completed" && "bg-green-100 text-green-600",
                  status === "current" && "bg-primary text-primary-foreground",
                  status === "upcoming" && "bg-muted text-muted-foreground"
                )}
              >
                {status === "completed" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 h-12 my-1",
                    status === "completed" ? "bg-green-300" : "bg-muted"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-8", isLast && "pb-0")}>
              <p
                className={cn(
                  "font-medium",
                  status === "upcoming" && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
              {status !== "upcoming" && timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(timestamp)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
