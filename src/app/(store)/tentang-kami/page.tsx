import { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Users, MapPin, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami - TenunanSongket",
  description: "Kenali lebih dekat TenunanSongket - syarikat pembuatan kain tenunan tradisional berkualiti tinggi dari Sambas, Indonesia.",
};

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B'%3E%3Cpath d='M30 0L32 4L30 8L28 4L30 0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-amber-100/80 border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-amber-800 text-sm font-medium">Warisan Budaya Melayu</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Tentang <span className="text-amber-600">Tenunan Songket</span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Melestarikan seni tenun tradisional Melayu dengan kualiti terbaik dan harga berpatutan
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 md:p-10 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-amber-600" />
                </div>
                Siapa Kami
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Tenunan Songket merupakan sebuah syarikat pembuatan kain tenunan tradisional yang menjual kain tenunan songket kepada pengguna. Kami menjual kain tenunan hasil buatan sendiri dalam bentuk kain mentah, kain sinjang (sampin), kain tenunan/songket mentah untuk pakaian baju pengantin.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Jika anda tengah mencari kain, sila hubungi kami. Kami menawarkan kain berkualiti tinggi pada harga yang berpatutan.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 md:p-10 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                Produk Kami
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Kami membuka toko online yang menjual beragam jenis dan corak songket dengan bermacam warna baik itu Tenunan Brunei, Songket Sarawak, Malaysia yang dipadukan dengan corak Songket Sambas.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Semua produk yang kami jual merupakan hasil tenunan alat tradisional (handmade). Hasil produk TenunanSongket.com dibuat oleh tukang tenun yang sudah dibina dan berpengalaman bekerja sebagai penenun di Brunei sehingga produk kain tenun songket buatan mereka berkualitas, dengan pelbagai corak cantik dengan sentuhan seni Melayu dari turun temurun.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Walau begitu kami juga menciptakan corak-corak baru sesuai dengan perkembangan zaman.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 md:p-10 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                Lokasi & Sejarah
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Kedai Tenunan Songket ini berada di Sambas, Indonesia berdekatan dengan Sarawak Malaysia. Di Sambas adalah pusat tenunan, ada sekitar 3 kampung di sini yang rata-rata mempunyai keahlian menenun dengan kondisi ekonomi yang susah.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Dengan tujuan ingin mensejahterakan kehidupan penenun, maka kami menghimpunkan penenun untuk membuat tenunan dengan cara Brunei. Kami mula menjual produk kain di Instagram @tenunansongkett kemudian membuat website online tenunansongket.com.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Seiring waktu perniagaan kami menjual tenun songket ini berkembang pesat di Brunei dan Malaysia. Sambutan yang luar biasa dari pelanggan membeli dan menempah kain sesuai dengan jenis dan corak yang mereka mahukan.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 md:p-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                Misi Kami
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Kami berkomitmen untuk melestarikan seni tenun tradisional Melayu sambil mensejahterakan kehidupan para penenun lokal. Setiap pembelian anda membantu menyokong komuniti penenun di Sambas dan menjaga warisan budaya yang berharga ini untuk generasi akan datang.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
