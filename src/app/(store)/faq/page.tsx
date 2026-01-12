import { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ - TenunanSongket",
  description: "Pertanyaan yang sering ditanya tentang produk dan layanan TenunanSongket",
};

const faqCategories = [
  {
    title: "Produk",
    faqs: [
      {
        question: "Apakah semua produk handmade?",
        answer: "Ya, semua produk kami adalah hasil tenunan tangan (handmade) menggunakan alat tenun tradisional. Setiap kain dibuat oleh penenun berpengalaman dengan teknik turun-temurun.",
      },
      {
        question: "Apa jenis kain yang dijual?",
        answer: "Kami menjual berbagai jenis kain tenunan songket termasuk Tenunan Brunei, Songket Sarawak, dan Songket Sambas. Tersedia dalam bentuk kain mentah, kain sinjang (sampin), dan kain untuk baju pengantin.",
      },
      {
        question: "Bolehkah saya memesan corak khas/custom?",
        answer: "Ya, kami menerima pesanan custom dengan corak tertentu. Sila hubungi kami melalui WhatsApp untuk membincangkan keperluan anda. Pesanan custom memerlukan masa lebih lama untuk disiapkan.",
      },
      {
        question: "Bagaimana cara menjaga kain songket?",
        answer: "Kain songket sebaiknya dicuci dengan tangan menggunakan air sejuk dan sabun lembut. Jangan diperas, cukup ditekan perlahan. Jemur di tempat teduh dan simpan dengan dilipat rapi atau digulung.",
      },
    ],
  },
  {
    title: "Pemesanan",
    faqs: [
      {
        question: "Bagaimana cara memesan?",
        answer: "Pilih produk yang diinginkan, tambahkan ke keranjang, lalu checkout dengan mengisi data pengiriman. Setelah itu, lakukan pembayaran dan konfirmasi kepada kami.",
      },
      {
        question: "Berapa lama pesanan diproses?",
        answer: "Pesanan akan diproses dalam 1-3 hari kerja setelah pembayaran disahkan. Untuk pesanan custom, masa pemprosesan boleh mencapai 2-4 minggu bergantung pada kerumitan corak.",
      },
      {
        question: "Bolehkah saya membatalkan pesanan?",
        answer: "Pembatalan boleh dilakukan sebelum pesanan diproses. Sila hubungi kami segera jika ingin membatalkan. Untuk pesanan custom yang sudah dimulakan, pembatalan tidak dapat dilakukan.",
      },
    ],
  },
  {
    title: "Pembayaran",
    faqs: [
      {
        question: "Apa kaedah pembayaran yang tersedia?",
        answer: "Kami menerima pembayaran melalui transfer bank (Indonesia), BigPay, dan kedai remittance untuk pelanggan luar negara seperti Brunei dan Malaysia.",
      },
      {
        question: "Adakah harga sudah termasuk cukai?",
        answer: "Harga yang tertera adalah harga produk sahaja. Untuk pengiriman antarabangsa, mungkin ada cukai import yang dikenakan oleh negara tujuan.",
      },
      {
        question: "Bolehkah bayar secara ansuran?",
        answer: "Untuk pesanan dalam jumlah besar atau pesanan custom, kami boleh membincangkan pembayaran secara ansuran. Sila hubungi kami untuk maklumat lanjut.",
      },
    ],
  },
  {
    title: "Pengiriman",
    faqs: [
      {
        question: "Ke mana sahaja pengiriman dilakukan?",
        answer: "Kami menghantar ke seluruh Indonesia, Brunei, Malaysia, dan negara-negara lain. Kos pengiriman berbeza mengikut lokasi dan berat barang.",
      },
      {
        question: "Berapa lama masa pengiriman?",
        answer: "Pengiriman dalam Indonesia: 3-7 hari. Pengiriman ke Brunei/Malaysia: 7-14 hari. Pengiriman antarabangsa lain: 14-21 hari.",
      },
      {
        question: "Bagaimana saya boleh track pesanan?",
        answer: "Setelah pesanan dihantar, kami akan memberikan nombor tracking melalui WhatsApp. Anda boleh menggunakan nombor tersebut untuk menjejaki status pengiriman.",
      },
      {
        question: "Apa yang berlaku jika barang rosak semasa pengiriman?",
        answer: "Sila hubungi kami dalam masa 24 jam selepas menerima barang dengan menyertakan foto kerosakan. Kami akan membantu menyelesaikan masalah tersebut.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B'%3E%3Cpath d='M30 0L32 4L30 8L28 4L30 0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Soalan <span className="text-amber-600">Lazim</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Jawapan untuk pertanyaan yang sering ditanya tentang produk dan layanan kami
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {faqCategories.map((category) => (
              <div key={category.title} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-6 py-4 border-b border-amber-100">
                  <h2 className="text-xl font-bold text-slate-800">{category.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="px-6">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`${category.title}-${index}`} className="border-amber-100">
                      <AccordionTrigger className="text-left text-slate-800 hover:text-amber-700 hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Masih Ada Pertanyaan?
          </h2>
          <p className="text-slate-600 mb-6">
            Jangan ragu untuk menghubungi kami. Kami sedia membantu anda.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600">
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Hubungi via WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
