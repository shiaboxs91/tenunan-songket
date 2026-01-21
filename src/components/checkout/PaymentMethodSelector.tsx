"use client";

import { CreditCard, Landmark, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onSelect: (method: string) => void;
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  // Hardcoded for now, ideal to move to valid JSON translation keys if strictly enforcing i18n
  const t = (key: string) => {
    // Fallback simple translation map since we might not have 'payment' namespace setup yet
    const map: Record<string, string> = {
        "title": "Metode Pembayaran",
        "desc": "Pilih metode pembayaran yang aman dan nyaman.",
        "intl_transfer": "International Bank Transfer / Wise",
        "intl_desc": "Transfer via Wise/Remitly ke rekening IDR kami.",
        "paypal": "PayPal",
        "paypal_desc": "Pembayaran aman menggunakan saldo PayPal atau Kartu Kredit.",
        "brunei_transfer": "Bank Transfer (Brunei - BIBD/Baiduri)",
        "brunei_desc": "Transfer langsung via bank lokal Brunei.",
    };
    return map[key] || key;
  };

  const methods = [
    {
      id: "intl_transfer",
      title: t("intl_transfer"),
      description: t("intl_desc"),
      icon: Globe,
    },
    {
      id: "paypal",
      title: t("paypal"),
      description: t("paypal_desc"),
      icon: CreditCard,
    },
    {
        id: "brunei_transfer",
        title: t("brunei_transfer"),
        description: t("brunei_desc"),
        icon: Landmark,
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod || ""} onValueChange={onSelect}>
          <div className="space-y-4">
            {methods.map((method) => (
              <div key={method.id} className="relative">
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={method.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-2 border-muted rounded-lg cursor-pointer transition-all hover:bg-muted/50 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <method.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <div className="hidden md:block">
                     <div className={`w-4 h-4 rounded-full border border-slate-300 ${selectedMethod === method.id ? 'bg-amber-500 border-amber-500 ring-2 ring-amber-200' : ''}`} />
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
