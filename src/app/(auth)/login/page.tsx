"use client";

import { useState } from "react";
import Link from "next/link";
import { loginWithCredentialsAction } from "@/lib/actions/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Authoritative credential login with password verification
      const loginResult = await loginWithCredentialsAction({ email, password });
      if (loginResult.success) {
        const user = loginResult.data.user;
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get("redirect");

        if (user.role === "ADMIN") {
          window.location.href = redirectUrl && redirectUrl.startsWith("/admin") ? redirectUrl : "/admin";
        } else if (redirectUrl && redirectUrl.startsWith("/")) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/dashboard";
        }
        return;
      }

      setError(loginResult.error.message);
      setLoading(false);
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-[#E8DCCF] p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1C140D]">Chocobliss</h1>
          <p className="text-sm text-[#634E3F] mt-2">Sign in to your artisanal account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 rounded-lg border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#C45A3C] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#634E3F] hover:text-[#1C140D] p-1 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#1C140D] hover:bg-[#C45A3C] text-[#F5EDE4] font-medium rounded-lg text-sm transition-colors duration-200 shadow disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#634E3F]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#C45A3C] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
