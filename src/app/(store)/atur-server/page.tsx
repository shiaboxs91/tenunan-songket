"use client";

import { useState, useEffect } from "react";
import { 
  Server, 
  Power, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function ServerControlPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");

  // Check current maintenance status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/maintenance");
        const data = await res.json();
        setMaintenanceMode(data.maintenanceMode || data.envMode);
      } catch {
        // Fallback to cookie check
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
          return null;
        };
        setMaintenanceMode(getCookie("maintenanceMode") === "true");
      }
    };
    checkStatus();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Password salah!");
    }
  };

  const toggleMaintenance = async () => {
    setIsLoading(true);
    
    try {
      const newStatus = !maintenanceMode;
      
      // Call API to set maintenance mode
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newStatus }),
      });
      
      if (res.ok) {
        setMaintenanceMode(newStatus);
        setMessage(
          newStatus 
            ? "✅ Maintenance mode AKTIF! Semua pengunjung akan diarahkan ke halaman maintenance."
            : "✅ Maintenance mode NONAKTIF! Website kembali normal."
        );
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback to cookie
      const newStatus = !maintenanceMode;
      document.cookie = `maintenanceMode=${newStatus}; path=/; max-age=${60 * 60 * 24 * 7}`;
      setMaintenanceMode(newStatus);
      setMessage(
        newStatus 
          ? "✅ Maintenance mode AKTIF! (via cookie)"
          : "✅ Maintenance mode NONAKTIF! (via cookie)"
      );
    }
    
    setIsLoading(false);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Server Control</h1>
              <p className="text-slate-400 text-sm mt-2">Masukkan password admin</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              
              {message && <p className="text-red-400 text-sm text-center">{message}</p>}

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90">
                Login
              </button>
            </form>

            <p className="text-slate-500 text-xs text-center mt-6">Hint: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Server Control Panel</h1>
              <p className="text-slate-400 text-sm">Kelola status server website</p>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 text-slate-400 hover:text-white">
            Logout
          </button>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl border p-6 ${maintenanceMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${maintenanceMode ? "bg-yellow-500/20" : "bg-green-500/20"}`}>
              {maintenanceMode ? <AlertTriangle className="w-8 h-8 text-yellow-500" /> : <CheckCircle className="w-8 h-8 text-green-500" />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Status Server: {maintenanceMode ? "MAINTENANCE" : "ONLINE"}
              </h2>
              <p className="text-slate-400">
                {maintenanceMode 
                  ? "Website dalam mode maintenance. SEMUA pengunjung akan melihat halaman maintenance."
                  : "Website berjalan normal. Semua halaman dapat diakses."}
              </p>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Power className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Aktifkan untuk menampilkan halaman maintenance kepada SEMUA pengunjung.
            </p>
            <button
              onClick={toggleMaintenance}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                maintenanceMode
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
              } ${isLoading ? "opacity-50" : ""}`}
            >
              {isLoading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Processing...</>
              ) : maintenanceMode ? (
                <><CheckCircle className="w-5 h-5" /> Nonaktifkan Maintenance</>
              ) : (
                <><AlertTriangle className="w-5 h-5" /> Aktifkan Maintenance</>
              )}
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Preview</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Lihat tampilan halaman maintenance yang akan dilihat pengunjung.
            </p>
            <Link href="/maintenance" target="_blank" className="w-full py-4 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" /> Lihat Halaman Maintenance
            </Link>
          </div>
        </div>

        {message && (
          <div className="bg-slate-800/50 rounded-xl border border-cyan-500/30 p-4 text-center">
            <p className="text-cyan-400">{message}</p>
          </div>
        )}

        {/* Server Info */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Server Information</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Status", value: maintenanceMode ? "Maintenance" : "Online", color: maintenanceMode ? "text-yellow-400" : "text-green-400" },
              { label: "Uptime", value: "99.9%", color: "text-cyan-400" },
              { label: "Response", value: "45ms", color: "text-cyan-400" },
              { label: "Last Update", value: new Date().toLocaleTimeString(), color: "text-slate-400" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                <p className={`font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm">🏠 Homepage</Link>
            <Link href="/products" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm">🛍️ Products</Link>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm">🔄 Refresh</button>
          </div>
        </div>
      </div>
    </div>
  );
}
