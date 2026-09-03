import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Panel Brand (kiri, desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between overflow-hidden"
        style={{ background: "#1a0a0e" }}
      >
        {/* Foto kain tenun sebagai background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&auto=format&fit=crop"
            alt="Kain tenun songket Melayu"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Overlay gradient gelap supaya teks terbaca */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(26,10,14,0.72) 0%, rgba(26,10,14,0.55) 40%, rgba(26,10,14,0.78) 100%)",
            }}
          />
        </div>

        {/* Top — Logo */}
        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/icon.svg"
              alt="Logo Tenunan Songket"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span
              className="text-lg font-semibold tracking-wide"
              style={{ color: "#FDF3E7" }}
            >
              Tenunan Songket
            </span>
          </Link>
        </div>

        {/* Center — Teks brand */}
        <div className="relative z-10 px-10 py-6 flex-1 flex flex-col justify-center">
          <h2
            className="text-3xl font-bold leading-snug mb-4"
            style={{ color: "#FDF3E7" }}
          >
            Keindahan Tenun<br />
            <span style={{ color: "#D4A853" }}>Melayu Sejati</span>
          </h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "rgba(253,243,231,0.70)", maxWidth: "300px" }}
          >
            Kain tenun dan songket pilihan tangan — warisan budaya Melayu
            Brunei dan Sambas yang abadi.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {["100% Asli", "Pengrajin Lokal", "Kualiti Terjamin"].map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{
                  background: "rgba(212,168,83,0.18)",
                  border: "1px solid rgba(212,168,83,0.40)",
                  color: "#D4A853",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 px-10 py-6">
          <p className="text-xs" style={{ color: "rgba(253,243,231,0.30)" }}>
            © {new Date().getFullYear()} Tenunan Songket. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* ── Panel Form (kanan / full mobile) ── */}
      <div
        className="flex-1 flex flex-col min-h-screen lg:min-h-0"
        style={{
          background:
            "linear-gradient(145deg, #FDF8F3 0%, #FFF5E6 50%, #FDF0E8 100%)",
        }}
      >
        {/* Header mobile */}
        <header className="lg:hidden px-5 py-5 flex items-center gap-3 border-b border-amber-100">
          <Image
            src="/icon.svg"
            alt="Logo Tenunan Songket"
            width={30}
            height={30}
            className="rounded-md"
          />
          <Link
            href="/"
            className="text-base font-semibold"
            style={{ color: "#8B2535" }}
          >
            Tenunan Songket
          </Link>
        </header>

        {/* Form area */}
        <main className="flex-1 flex items-center justify-center px-5 py-8 lg:px-10 xl:px-16">
          <div className="w-full max-w-[420px]">
            <div
              className="rounded-2xl p-7 sm:p-8"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px) saturate(160%)",
                WebkitBackdropFilter: "blur(20px) saturate(160%)",
                border: "1px solid rgba(139,37,53,0.10)",
                boxShadow:
                  "0 8px 32px rgba(107,26,42,0.10), 0 2px 8px rgba(107,26,42,0.06)",
              }}
            >
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-5 py-4 text-center">
          <p className="text-xs" style={{ color: "rgba(107,26,42,0.35)" }}>
            © {new Date().getFullYear()} Tenunan Songket. Hak cipta dilindungi.
          </p>
        </footer>
      </div>
    </div>
  );
}
