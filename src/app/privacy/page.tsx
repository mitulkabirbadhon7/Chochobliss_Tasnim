import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Lock, Mail, ArrowLeft, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Chocobliss by Tasnim",
  description:
    "Learn how Chocobliss by Tasnim protects your personal data, handles orders, and ensures privacy across our artisanal confectionery boutique.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 29, 2026";

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#634E3F] hover:text-[#C45A3C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Boutique
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12 border-b border-[#E8DCCF] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C140D]/5 border border-[#D4A853]/40 text-[#634E3F] text-xs font-semibold tracking-widest uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C45A3C]" />
            <span>Customer Trust & Integrity</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C140D] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#634E3F] mt-2 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </header>

        {/* Content Body */}
        <article className="prose prose-stone max-w-none text-[#1C140D] space-y-10 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1C140D] flex items-center gap-2.5">
              <span>1. Our Commitment to Your Privacy</span>
            </h2>
            <p className="text-[#634E3F]">
              At <strong>Chocobliss by Tasnim</strong>, we hold the stewardship of your personal information with the same uncompromising standard of care that we apply to crafting single-origin chocolate bars and velvet ganache truffles. This Privacy Policy details how we collect, safeguard, and utilize information when you explore our boutique, create an account, purchase bespoke confections, or subscribe to our atelier dispatches.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1C140D]">
              2. Information We Collect
            </h2>
            <p className="text-[#634E3F]">
              To deliver our confections reliably, we may collect the following categories of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#634E3F]">
              <li>
                <strong>Account Credentials & Profile:</strong> Your full name, email address, password hashes, and Cocoa Points balance when you register.
              </li>
              <li>
                <strong>Delivery & Shipping Details:</strong> Recipient names, street addresses, postal codes, and contact phone numbers required for temperature-controlled parcel courier delivery.
              </li>
              <li>
                <strong>Order & Transaction Records:</strong> Product SKUs, purchase timestamps, customization notes (such as personalized tasting gift card inscriptions), and payment status confirmations.
              </li>
              <li>
                <strong>Communication Preferences:</strong> Your explicit consent choices regarding seasonal menu announcements, micro-batch restock alerts, and tasting invitations.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1C140D]">
              3. How We Use Your Information
            </h2>
            <p className="text-[#634E3F]">
              We strictly process your personal information for legitimate boutique purposes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-5 rounded-xl border border-[#E8DCCF] shadow-2xs">
                <h3 className="font-serif font-bold text-[#1C140D] mb-1">Order Fulfillment</h3>
                <p className="text-xs text-[#634E3F]">
                  Preparing artisanal batches, insulated packing with ice gel, dispatching regional couriers, and sending real-time tracking updates.
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E8DCCF] shadow-2xs">
                <h3 className="font-serif font-bold text-[#1C140D] mb-1">Cocoa Points Loyalty</h3>
                <p className="text-xs text-[#634E3F]">
                  Tracking confection rewards, tier upgrades, and automated reward bonus redemptions on seasonal releases.
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E8DCCF] shadow-2xs">
                <h3 className="font-serif font-bold text-[#1C140D] mb-1">Atelier Email Updates</h3>
                <p className="text-xs text-[#634E3F]">
                  Notifying opted-in connoisseurs about limited holiday releases, fresh micro-roast batches, and private tasting events.
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E8DCCF] shadow-2xs">
                <h3 className="font-serif font-bold text-[#1C140D] mb-1">Security & Protection</h3>
                <p className="text-xs text-[#634E3F]">
                  Defending against fraudulent transactions, credential abuse, and verifying authentic administrative and customer authorizations.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1C140D] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C45A3C]" />
              <span>4. Data Security & Storage Architecture</span>
            </h2>
            <p className="text-[#634E3F]">
              Our application architecture is fortified with enterprise-grade security invariants:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#634E3F]">
              <li>
                <strong>Database Encryption:</strong> Your profile and orders reside in protected PostgreSQL databases running on secure SSL/TLS encrypted connections.
              </li>
              <li>
                <strong>No Plaintext Passwords:</strong> Credentials are encrypted and authenticated via industry-standard cryptographically signed token sessions.
              </li>
              <li>
                <strong>Strict Cross-User Isolation:</strong> Server-side authorization rules enforce that customer accounts can only view and update their own addresses, wishlists, and order histories.
              </li>
              <li>
                <strong>Sensitive Field Masking:</strong> Sensitive identifiers, telephone numbers, and street address lines are masked in administrative summaries to protect customer privacy.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1C140D]">
              5. Your Rights & Email Preferences
            </h2>
            <p className="text-[#634E3F]">
              You hold complete control over your relationship with Chocobliss:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#634E3F]">
              <li>
                <strong>Access & Modification:</strong> You can view and update your registered shipping addresses, recipient details, and account name at any time via your Customer Dashboard.
              </li>
              <li>
                <strong>Email Updates Opt-Out:</strong> If you elected to receive email updates during registration, you may opt out at any time by clicking the unsubscribe link in any message or contacting our atelier team.
              </li>
              <li>
                <strong>Account Deletion:</strong> You may request the permanent anonymization or deletion of your customer profile and historical data by writing directly to customer care.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 border-t border-[#E8DCCF] pt-8">
            <h2 className="font-serif text-2xl font-bold text-[#1C140D] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#D4A853]" />
              <span>6. Contacting the Atelier</span>
            </h2>
            <p className="text-[#634E3F]">
              If you have any questions, inquiries, or requests regarding this Privacy Policy or your personal data, please reach out to us:
            </p>
            <div className="bg-[#1C140D] text-[#FAF7F2] p-6 rounded-2xl space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#F5EDE4]">Chocobliss by Tasnim Atelier</h4>
              <p className="text-xs text-[#E8DCCF]/80">Dhanmondi, Dhaka, Bangladesh</p>
              <p className="text-xs text-[#E8DCCF]/80">Email: <span className="text-[#D4A853] font-mono">care@chocobliss.test</span></p>
              <div className="pt-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C45A3C] hover:bg-[#a8492e] text-white text-xs font-semibold transition-colors"
                >
                  Create Account <HeartHandshake className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
