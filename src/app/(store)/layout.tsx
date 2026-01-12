import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SkipLink } from "@/components/layout/SkipLink";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SkipLink />
        <Header />
        <main id="main-content" className="flex-1 pb-16 md:pb-0">
          {/* Breadcrumbs with container */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs className="border-b border-slate-200" />
          </div>
          {/* Content - pages handle their own containers for full-width sections */}
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <InstallPrompt />
      </div>
    </CartProvider>
  );
}
