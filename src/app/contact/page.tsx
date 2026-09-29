"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { submitContactMessageAction } from "@/lib/actions/contact";
import { ADMIN_CONTACT_EMAILS } from "@/lib/constants/admins";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "GENERAL",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    id: string;
    directMailtoUrl: string;
    adminEmails: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await submitContactMessageAction(formData);
      if (!res.success) {
        setError(res.error?.message || "Failed to transmit message.");
        setLoading(false);
        return;
      }

      if (res.data) {
        setSuccessResult(res.data);
      }
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try writing directly to our administrators.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1C140D] min-h-screen py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EDE4] border border-[#E8DCCF] text-[#634E3F] text-xs uppercase tracking-widest font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
            <span>Concierge & Atelier Inquiries</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C140D] mb-4">
            Contact & Support
          </h1>
          <p className="text-[#634E3F] text-base sm:text-lg leading-relaxed">
            Have a question, feedback, custom order request, or a complaint? Send us a dispatch and our atelier
            administrators will respond promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Admin Connections & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-[#E8DCCF] shadow-xs space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1C140D] flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-[#C45A3C]" />
                <span>Direct Admin Inboxes</span>
              </h2>
              <p className="text-sm text-[#634E3F] leading-relaxed">
                All communications sent through this form are monitored directly by both authorized boutique administrators:
              </p>

              <div className="space-y-3 pt-1">
                {ADMIN_CONTACT_EMAILS.map((adminEmail) => (
                  <div
                    key={adminEmail}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-[#C45A3C] block">
                        {adminEmail.startsWith("mitul") ? "Administrator" : "Founder & Chocolatier"}
                      </span>
                      <a
                        href={`mailto:${adminEmail}`}
                        className="text-sm font-semibold text-[#1C140D] hover:text-[#C45A3C] transition-colors truncate block"
                      >
                        {adminEmail}
                      </a>
                    </div>
                    <a
                      href={`mailto:${adminEmail}`}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1C140D] text-[#FAF7F2] hover:bg-[#C45A3C] transition-colors shrink-0"
                    >
                      Write
                    </a>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E8DCCF] space-y-4 text-xs text-[#634E3F]">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C140D] block">Response Window</span>
                    <span>Typically within 12 to 24 business hours.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C45A3C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C140D] block">ChocoBliss Atelier</span>
                    <span>Dhanmondi, Dhaka, Bangladesh</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#8C6B1F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C140D] block">Privacy Assured</span>
                    <span>Your correspondence is kept confidential under our privacy standards.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Mailto Shortcut */}
            <div className="bg-[#1C140D] text-[#FAF7F2] p-8 rounded-3xl border border-[#634E3F]/40 shadow-xl space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#F5EDE4]">
                Prefer Direct Email?
              </h3>
              <p className="text-xs text-[#E8DCCF]/80 leading-relaxed">
                You can launch your default email client to write simultaneously to both administrators in one click.
              </p>
              <a
                href={`mailto:${ADMIN_CONTACT_EMAILS.join(",")}?subject=Inquiry%20regarding%20ChocoBliss%20by%20Tasnim`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] font-semibold text-xs transition-all shadow-md"
              >
                <span>Email Both Admins</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E8DCCF] shadow-xs">
              {successResult ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-3xl font-bold text-[#1C140D]">
                      Message Received
                    </h3>
                    <p className="text-sm text-[#634E3F] max-w-md mx-auto leading-relaxed">
                      Thank you for contacting ChocoBliss. Your dispatch has been saved and connected to our
                      administrators&apos; inboxes:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {successResult.adminEmails.map((email) => (
                        <span
                          key={email}
                          className="px-3 py-1 rounded-full text-xs font-mono bg-[#FAF7F2] border border-[#E8DCCF] text-[#1C140D]"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={successResult.directMailtoUrl}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] text-xs font-semibold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open Copy in Email App</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessResult(null);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          category: "GENERAL",
                          subject: "",
                          message: "",
                        });
                      }}
                      className="px-6 py-2.5 rounded-full border border-[#E8DCCF] hover:bg-[#FAF7F2] text-xs font-semibold text-[#1C140D] transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1C140D] mb-1">
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-[#634E3F]">
                      Fill out the details below. Select &quot;Complaint&quot; if you encountered any order or delivery issue.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Message Category / Type */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-2">
                      Message Category *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: "GENERAL", label: "General Inquiry" },
                        { id: "COMPLAINT", label: "Complaint / Issue", highlight: true },
                        { id: "INQUIRY", label: "Order & Shipping" },
                        { id: "FEEDBACK", label: "Tasting Feedback" },
                        { id: "CUSTOM_ORDER", label: "Custom Commission" },
                      ].map((cat) => {
                        const isSelected = formData.category === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#1C140D] text-[#FAF7F2] border-[#1C140D] shadow-xs"
                                : cat.highlight
                                ? "bg-amber-50/60 border-amber-300 text-amber-900 hover:bg-amber-100"
                                : "bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] text-[#1C140D] border-[#E8DCCF]"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tasnim Khan"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D] bg-[#FAF7F2]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D] bg-[#FAF7F2]/30"
                      />
                    </div>
                  </div>

                  {/* Phone & Subject Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+880 1712-345678"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D] bg-[#FAF7F2]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Regarding order, chocolate question, etc."
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D] bg-[#FAF7F2]/30"
                      />
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C140D] mb-1.5">
                      Your Message Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share all relevant details (order numbers, description of issue, or inquiry) so our administrators can assist you efficiently..."
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCF] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] text-sm text-[#1C140D] bg-[#FAF7F2]/30 resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] font-semibold text-sm transition-all duration-200 shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? "Transmitting to Admins..." : "Transmit Message to Administrators"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
