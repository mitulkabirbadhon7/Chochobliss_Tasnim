"use client";

import { useState } from "react";
import { registerAction } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [emailUpdatesAccepted, setEmailUpdatesAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!privacyPolicyAccepted) {
      setError("Please review and agree to the Privacy Policy to create your account.");
      return;
    }

    setLoading(true);

    const result = await registerAction({ name, email, password });

    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-[#E8DCCF] p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1C140D]">Chocobliss</h1>
          <p className="text-sm text-[#634E3F] mt-2">Create your luxury confectionery account</p>
        </div>

        {success ? (
          <div className="p-6 bg-amber-50 border border-amber-200 text-[#1C140D] rounded-lg text-center space-y-4">
            <h2 className="font-semibold text-lg text-[#C45A3C]">Welcome to Chocobliss!</h2>
            <p className="text-xs text-[#634E3F]">
              Your account has been created and credited with <strong>50 Cocoa Points</strong>.
            </p>
            <a
              href="/login"
              className="inline-block py-2.5 px-6 bg-[#1C140D] hover:bg-[#C45A3C] text-[#F5EDE4] text-xs font-semibold rounded-lg transition-colors"
            >
              Sign In Now
            </a>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amira Khan"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amira@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D]"
                />
              </div>

              {/* Consent & Preference Checkboxes */}
              <div className="space-y-3 pt-1">
                {/* 1. Privacy Policy Checkbox */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="privacyPolicy"
                    required
                    checked={privacyPolicyAccepted}
                    onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C] cursor-pointer"
                  />
                  <label htmlFor="privacyPolicy" className="text-xs text-[#634E3F] leading-tight cursor-pointer">
                    I agree to the{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C45A3C] font-semibold underline hover:text-[#1C140D]"
                    >
                      Privacy Policy
                    </a>{" "}
                    and data protection terms. <span className="text-[#C45A3C]">*</span>
                  </label>
                </div>

                {/* 2. Email Updates Checkbox */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="emailUpdates"
                    checked={emailUpdatesAccepted}
                    onChange={(e) => setEmailUpdatesAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C] cursor-pointer"
                  />
                  <label htmlFor="emailUpdates" className="text-xs text-[#634E3F] leading-tight cursor-pointer">
                    Keep me updated with seasonal chocolate collections, private tasting invitations, and artisan news via email.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#C45A3C] hover:bg-[#1C140D] text-white font-medium rounded-lg text-sm transition-colors duration-200 shadow disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#634E3F]">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-[#1C140D] hover:underline">
                Sign in
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
