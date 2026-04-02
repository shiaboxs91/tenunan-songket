"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface IntlProviderProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
  timeZone?: string;
}

export function IntlProvider({ children, locale, messages, timeZone = "Asia/Kuala_Lumpur" }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  );
}
