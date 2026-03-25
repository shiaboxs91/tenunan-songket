"use client";

import { useState, useEffect } from "react";

type ServerStatus = {
  is_active: boolean;
  message: string;
  admin_contact: string;
  expired_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

export default function AturServerPage() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/server-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }

  async function toggleServer() {
    if (!status) return;
    setSaving(true);
    try {
      const res = await fetch("/api/server-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !status.is_active }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setToast(
          data.status.is_active
            ? "Server AKTIF - Website dapat diakses"
            : "Server NONAKTIF - Pengunjung akan melihat halaman expired"
        );
      }
    } catch {
      setToast("Gagal mengubah status");
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-6">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-stone-800">
            Atur Server
          </h1>
          <p className="text-sm text-stone-500">Tenunan Songket</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-stone-500 mt-3">Memuat...</p>
          </div>
        ) : status ? (
          <>
            {/* Status Card */}
            <div
              className={`rounded-xl border p-4 ${
                status.is_active
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status.is_active ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      status.is_active
                        ? "text-emerald-800"
                        : "text-red-800"
                    }`}
                  >
                    Server {status.is_active ? "AKTIF" : "NONAKTIF"}
                  </p>
                  <p
                    className={`text-xs ${
                      status.is_active
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {status.is_active
                      ? "Website dapat diakses semua pengunjung"
                      : "Pengunjung akan melihat halaman server expired"}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-stone-800">
                    Status Server
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {status.is_active
                      ? "Nonaktifkan untuk menampilkan halaman expired"
                      : "Aktifkan untuk mengembalikan website"}
                  </p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={toggleServer}
                  disabled={saving}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    status.is_active ? "bg-emerald-500" : "bg-stone-300"
                  } ${saving ? "opacity-50" : ""}`}
                  role="switch"
                  aria-checked={status.is_active}
                  aria-label="Toggle server status"
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      status.is_active
                        ? "translate-x-[22px]"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={toggleServer}
                disabled={saving}
                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  status.is_active
                    ? "bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200"
                } ${saving ? "opacity-50" : ""}`}
              >
                {saving
                  ? "Menyimpan..."
                  : status.is_active
                    ? "Nonaktifkan Server"
                    : "Aktifkan Server"}
              </button>
            </div>

            {/* Info */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                Informasi
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Status</span>
                  <span
                    className={`font-medium ${
                      status.is_active
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {status.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                {status.updated_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Terakhir diubah</span>
                    <span className="text-stone-800">
                      {new Date(status.updated_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Link */}
            <a
              href="/server-expired"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 active:bg-stone-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              Lihat Halaman Server Expired
            </a>

            {/* Quick Links */}
            <div className="flex gap-2">
              <a
                href="/"
                className="flex-1 py-2 text-center text-sm text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Beranda
              </a>
              <a
                href="/admin"
                className="flex-1 py-2 text-center text-sm text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Admin Panel
              </a>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <p className="text-sm text-stone-500">
              Gagal memuat data. Periksa koneksi database.
            </p>
            <button
              onClick={fetchStatus}
              className="mt-3 text-sm text-stone-600 hover:text-stone-800 underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-stone-800 text-white text-sm py-3 px-4 rounded-xl shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
