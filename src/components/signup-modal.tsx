"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SignupModalProps {
  onClose: () => void
  onSuccess: (userData: { id: string; email: string }) => void
  onSwitchToLogin?: () => void
}

export default function SignupModal({ onClose, onSuccess, onSwitchToLogin }: SignupModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (password !== confirmPassword) {
    setError("Mật khẩu không khớp");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Đăng ký thất bại");
    }

    // ✅ Hiển thị thông báo đăng ký thành công
    alert(data.message || "🎉 Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");

    // ✅ Đóng form đăng ký
    onClose();

    // ✅ Chuyển sang form đăng nhập
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
  } finally {
    setLoading(false);
  }
};


  const handleGoogleSignup = async () => {
    setLoading(true)
    setError("")

    try {
      // Mock API call - Replace with your Python API
      const response = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google" }),
      })

      if (!response.ok) {
        throw new Error("Đăng ký với Google thất bại")
      }

      const data = await response.json()
      onSuccess(data.user)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-10 max-w-lg w-full mx-4 border border-slate-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Đăng ký</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium text-slate-300 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium text-slate-300 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-5 py-3 rounded-lg text-base">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-3 rounded-xl transition"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>

        {/* Google Signup */}
        <div className="mt-6">
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-base mt-6">
          Đã có tài khoản?{" "}
          <button onClick={onSwitchToLogin} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  )
}