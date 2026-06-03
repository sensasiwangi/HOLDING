"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, User, AlertCircle, ArrowRight, Layers, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal. Silakan coba lagi.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,.15),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,.06),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="group mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-lg font-black tracking-tight text-white shadow-lg shadow-teal-950/30 transition-transform duration-300 group-hover:scale-105">
              SWI
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white">Portal Internal</h1>
          <p className="mt-1 text-sm text-[#6b9e8f]">PT Sensasi Wangi Indonesia</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-teal-300">
            <LockKeyhole size={14} />
            Masuk ke Dashboard
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6b9e8f]">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a7a6a]" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder-[#4a7a6a] outline-none transition focus:border-teal-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6b9e8f]">
                Password
              </label>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a7a6a]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-12 text-sm text-white placeholder-[#4a7a6a] outline-none transition focus:border-teal-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a7a6a] transition hover:text-[#6b9e8f]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-900/30 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Masuk
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-[#4a7a6a] transition hover:text-[#6b9e8f]">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-[#3a5048]">
          © {new Date().getFullYear()} PT Sensasi Wangi Indonesia
        </div>
      </div>
    </div>
  );
}
