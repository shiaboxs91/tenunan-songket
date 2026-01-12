import { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart, CreditCard, Truck, MessageCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cara Order - TenunanSongket",
  description: "Panduan lengkap cara memesan kain tenunan songket di TenunanSongket.com",
};

const steps = [
  {
    number: 1,
    title: "Pilih Produk",
    description: "Telusuri koleksi kain tenunan songket kami. Pilih produk yang anda suka berdasarkan jenis, corak, dan warna.",
    icon: ShoppingCart,
    tips: [
      "Gunakan filter untuk mencari berdasarkan kategori",
      "Lihat detail produk untuk informasi lengkap",
      "Periksa ketersediaan stok sebelum memesan",
    ],
  },
  {
    number: 2,
    title: "Tambah ke Keranjang",
    description: "Klik tombol 'Tambah ke Keranjang' pada produk yang ingin dibeli. Anda boleh menambah beberapa produk sekaligus.",
    icon: ShoppingCart,
    tips: [
      "Periksa kuantiti sebelum checkout",
      "Anda boleh mengubah jumlah di halaman keranjang",
    ],
  },
  {
    number: 3,
    title: "Checkout & Isi Data",
    description: "Lengkapkan data pengiriman anda termasuk nama, alamat lengkap, dan nombor telefon yang boleh dihubungi.",
    icon: CreditCard,
    tips: [
      "Pastikan alamat lengkap dan betul",
      "Sertakan nombor telefon aktif",
      "Pilih kaedah pengiriman yang sesuai",
    ],
  },
  {
    number: 4,
    title: "Pembayaran",
    description: "Lakukan pembayaran melalui kaedah yang tersedia. Untuk pelanggan luar negara, boleh menggunakan BigPay atau kedai remittance.",
    icon: CreditCard,
    tips: [
      "Transfer ke akaun bank yang tertera",
      "Simpan bukti pembayaran",
      "Hubungi kami jika ada masalah pembayaran",
    ],
  },
  {
    number: 5,
    title: "Konfirmasi & Pengiriman",
    description: "Setelah pembayaran disahkan, pesanan akan diproses dan dihantar ke alamat anda. Anda akan menerima nombor tracking.",
    icon: Truck,
    tips: [
      "Pesanan diproses dalam 1-3 hari kerja",
      "Pengiriman antarabangsa 7-14 hari",
      "Tracking number akan dihantar via WhatsApp",
    ],
  },
];

const paymentMethods = [
  {
    title: "Transfer Bank",
    description: "Transfer ke akaun bank kami di Indonesia",
  },
  {
    title: "BigPay",
    description: "Aplikasi pembayaran antarabangsa",
  },
  {
    title: "Kedai Remittance",
    description: "Kedai pengiriman wang ke luar negara",
  },
];

export default function CaraOrderPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B'%3E%3Cpath d='M30 0L32 4L30 8L28 4L30 0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Cara <span className="text-amber-600">Order</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Panduan lengkap untuk memesan kain tenunan songket berkualiti dari kami
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-amber-200 hidden md:block" />
                  )}
                  
                  <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 md:p-8">
                    <div className="flex items-start gap-4 md:gap-6">
                      {/* Step number */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/30">
                        {step.number}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {step.description}
                        </p>
                        
                        {/* Tips */}
                        <div className="bg-amber-50/50 rounded-lg p-4">
                          <p className="text-sm font-medium text-amber-800 mb-2">Tips:</p>
                          <ul className="space-y-1">
                            {step.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
            Kaedah Pembayaran
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div key={method.title} className="bg-white rounded-xl p-6 border border-amber-100 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{method.title}</h3>
                <p className="text-sm text-slate-500">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Ada Pertanyaan?
          </h2>
          <p className="text-slate-600 mb-6">
            Hubungi kami melalui WhatsApp untuk bantuan lebih lanjut
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600">
              <Link href="/products">
                Mulai Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-amber-400 text-amber-700 hover:bg-amber-50">
              <Link href="/faq">
                <MessageCircle className="mr-2 h-4 w-4" />
                Lihat FAQ
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
