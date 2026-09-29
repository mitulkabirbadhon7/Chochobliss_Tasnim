"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createSessionAction, devLoginAction } from "@/lib/actions/auth";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Automatically detect user role from database
      const devResult = await devLoginAction(email);
      if (devResult.success) {
        // Automatically route: if role is ADMIN go to /admin, else /dashboard
        if (devResult.data.user.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
        return;
      }

      // 2. Fallback to Firebase client authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const sessionResult = await createSessionAction(idToken);

      if (!sessionResult.success) {
        setError(sessionResult.error.message);
        setLoading(false);
        return;
      }

      // Automatically route according to verified role
      const user = sessionResult.data.user;
      if (user.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
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
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D]"
            />
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
          <a href="/register" className="font-semibold text-[#C45A3C] hover:underline">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
}
