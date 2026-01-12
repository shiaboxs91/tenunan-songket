"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, title: "Alamat" },
  { number: 2, title: "Pengiriman" },
  { number: 3, title: "Ringkasan" },
];

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors",
                currentStep > step.number
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.number
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step.number}</span>
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium",
                currentStep >= step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-8 sm:w-16 md:w-24 h-0.5 mx-1 sm:mx-2",
                currentStep > step.number ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
