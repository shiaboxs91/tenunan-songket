import Link from "next/link";

// Motif songket SVG — dekoratif, murni visual
function SongketPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.07]"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="songket" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="40" height="40" fill="none" />
          {/* Diamond center */}
          <polygon points="20,4 36,20 20,36 4,20" fill="none" stroke="currentColor" strokeWidth="0.8" />
          {/* Inner diamond */}
          <polygon points="20,10 30,20 20,30 10,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          {/* Corner dots */}
          <circle cx="20" cy="4" r="1.2" fill="currentColor" />
          <circle cx="36" cy="20" r="1.2" fill="currentColor" />
          <circle cx="20" cy="36" r="1.2" fill="currentColor" />
          <circle cx="4" cy="20" r="1.2" fill="currentColor" />
          {/* Center dot */}
          <circle cx="20" cy="20" r="2" fill="currentColor" />
          {/* Cross lines */}
          <line x1="0" y1="0" x2="4" y2="4" stroke="currentColor" strokeWidth="0.4" />
          <line x1="40" y1="0" x2="36" y2="4" stroke="currentColor" strokeWidth="0.4" />
          <line x1="0" y1="40" x2="4" y2="36" stroke="currentColor" strokeWidth="0.4" />
          <line x1="40" y1="40" x2="36" y2="36" stroke="currentColor" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#songket)" />
    </svg>
  );
}

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
        style={{
          background: "linear-gradient(160deg, #6B1A2A 0%, #8B2535 40%, #5A1520 75%, #3D0E17 100%)",
          color: "#FDF3E7",
        }}
      >
        {/* Motif songket overlay */}
        <SongketPattern />

        {/* Glow orbs */}
        <div
          className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)" }}
        />

        {/* Top — Logo */}
        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "rgba(212,168,83,0.25)", border: "1px solid rgba(212,168,83,0.4)", color: "#D4A853" }}
            >
              TS
            </div>
            <span className="text-lg font-semibold tracking-wide" style={{ color: "#FDF3E7" }}>
              Tenunan Songket
            </span>
          </Link>
        </div>

        {/* Center — Ilustrasi motif + teks */}
        <div className="relative z-10 px-10 py-6 flex-1 flex flex-col justify-center">
          {/* Ilustrasi songket SVG animasi */}
          <div className="mb-8">
            <svg
              viewBox="0 0 280 200"
              className="w-full max-w-[280px]"
              aria-label="Ilustrasi tenun songket Melayu"
              role="img"
            >
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4A853" />
                  <stop offset="50%" stopColor="#F0C96A" />
                  <stop offset="100%" stopColor="#A8813A" />
                </linearGradient>
                <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(253,243,231,0.08)" />
                  <stop offset="50%" stopColor="rgba(253,243,231,0.18)" />
                  <stop offset="100%" stopColor="rgba(253,243,231,0.08)" />
                </linearGradient>
              </defs>

              {/* Kain — latar */}
              <rect x="10" y="30" width="260" height="140" rx="4" fill="rgba(253,243,231,0.06)" stroke="rgba(212,168,83,0.3)" strokeWidth="1" />

              {/* Garis tenun horizontal */}
              {[50, 70, 90, 110, 130, 150].map((y, i) => (
                <line key={i} x1="10" y1={y} x2="270" y2={y} stroke="rgba(212,168,83,0.15)" strokeWidth="1">
                  <animate attributeName="opacity" values="0.15;0.35;0.15" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                </line>
              ))}

              {/* Garis tenun vertikal */}
              {[40, 80, 120, 160, 200, 240].map((x, i) => (
                <line key={i} x1={x} y1="30" x2={x} y2="170" stroke="rgba(212,168,83,0.12)" strokeWidth="1">
                  <animate attributeName="opacity" values="0.12;0.28;0.12" dur={`${2.8 + i * 0.25}s`} repeatCount="indefinite" />
                </line>
              ))}

              {/* Motif diamond utama */}
              <polygon points="140,55 175,100 140,145 105,100" fill="none" stroke="url(#goldGrad)" strokeWidth="2">
                <animate attributeName="stroke-dasharray" values="0 300;300 0" dur="2s" fill="freeze" />
              </polygon>
              <polygon points="140,68 163,100 140,132 117,100" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5">
                <animate attributeName="stroke-dasharray" values="0 240;240 0" dur="2.4s" fill="freeze" begin="0.3s" />
              </polygon>
              <circle cx="140" cy="100" r="5" fill="url(#goldGrad)">
                <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Corner accents */}
              {[[30, 50], [250, 50], [30, 150], [250, 150]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.5" fill="none" stroke="#D4A853" strokeWidth="1.2">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="1.5" fill="#D4A853">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              ))}

              {/* Border dekoratif atas-bawah */}
              <rect x="10" y="30" width="260" height="8" rx="2" fill="url(#silkGrad)" />
              <rect x="10" y="162" width="260" height="8" rx="2" fill="url(#silkGrad)" />
            </svg>
          </div>

          <h2
            className="text-2xl font-bold leading-snug mb-3"
            style={{ color: "#FDF3E7" }}
          >
            Keindahan Tenun<br />
            <span style={{ color: "#D4A853" }}>Melayu Sejati</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(253,243,231,0.65)", maxWidth: "280px" }}>
            Kain tenun dan songket pilihan tangan — warisan budaya Melayu Brunei dan Sambas yang abadi.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {["100% Asli", "Pengrajin Lokal", "Kualiti Terjamin"].map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "rgba(212,168,83,0.15)",
                  border: "1px solid rgba(212,168,83,0.35)",
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
          <p className="text-xs" style={{ color: "rgba(253,243,231,0.35)" }}>
            © {new Date().getFullYear()} Tenunan Songket. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* ── Panel Form (kanan / full mobile) ── */}
      <div
        className="flex-1 flex flex-col min-h-screen lg:min-h-0"
        style={{ background: "linear-gradient(145deg, #FDF8F3 0%, #FFF5E6 50%, #FDF0E8 100%)" }}
      >
        {/* Header mobile */}
        <header className="lg:hidden px-5 py-5 flex items-center gap-3 border-b border-amber-100">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: "#8B2535", color: "#FDF3E7" }}
          >
            TS
          </div>
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
            {/* Card form */}
            <div
              className="rounded-2xl p-7 sm:p-8"
              style={{
                background: "rgba(255,255,255,0.80)",
                backdropFilter: "blur(20px) saturate(160%)",
                WebkitBackdropFilter: "blur(20px) saturate(160%)",
                border: "1px solid rgba(139,37,53,0.10)",
                boxShadow: "0 8px 32px rgba(107,26,42,0.10), 0 2px 8px rgba(107,26,42,0.06)",
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
