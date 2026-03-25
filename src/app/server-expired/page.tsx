import { createAnonClient } from "@/lib/supabase/server";

export const revalidate = 0;

async function getServerStatus() {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "server_status")
      .single();
    return data?.value as {
      is_active: boolean;
      message: string;
      admin_contact: string;
      expired_at: string | null;
    } | null;
  } catch {
    return null;
  }
}

export default async function ServerExpiredPage() {
  const status = await getServerStatus();
  const contact = status?.admin_contact || "+673 123 4567";
  const waLink = `https://wa.me/${contact.replace(/[^0-9]/g, "")}?text=Halo%20admin%2C%20saya%20ingin%20menanyakan%20tentang%20masa%20aktif%20server%20Toko%20Tenunan%20Songket.`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-stone-800 mb-1">
          Masa Aktif Server Habis
        </h1>
        <p className="text-sm text-stone-500 mb-6">Toko Tenunan Songket</p>

        {/* Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6 text-left">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800">
                Server Tidak Aktif
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                Layanan server untuk toko ini telah berakhir
              </p>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <p className="text-sm text-stone-600 leading-relaxed">
              {status?.message ||
                "Masa aktif server telah habis. Silakan hubungi administrator untuk memperpanjang layanan."}
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-400 mt-2">
          Silakan hubungi administrator untuk memperpanjang masa aktif server.
        </p>
      </div>
    </div>
  );
}
