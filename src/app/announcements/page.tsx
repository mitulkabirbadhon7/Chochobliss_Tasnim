import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Megaphone, Tag, AlertCircle, ArrowRight, Calendar, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Announcements & Special Releases | ChocoBliss by Tasnim",
  description:
    "Stay informed with the latest micro-batch chocolate releases, seasonal announcements, tasting events, and atelier news from ChocoBliss.",
};

export const revalidate = 60; // Refresh every 60s for timely updates

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const getBadge = (type: string) => {
    switch (type) {
      case "PROMO":
        return {
          icon: Tag,
          text: "Exclusive Promotion",
          color: "bg-[#D4A853]/15 text-[#8C6B1F] border-[#D4A853]/40",
        };
      case "ALERT":
        return {
          icon: AlertCircle,
          text: "Atelier Notice",
          color: "bg-amber-100 text-amber-900 border-amber-300",
        };
      default:
        return {
          icon: Megaphone,
          text: "Special Announcement",
          color: "bg-[#C45A3C]/10 text-[#C45A3C] border-[#C45A3C]/30",
        };
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1C140D] min-h-screen py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EDE4] border border-[#E8DCCF] text-[#634E3F] text-xs uppercase tracking-widest font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
            <span>Atelier Bulletins & Drops</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C140D] mb-4">
            Announcements & Releases
          </h1>
          <p className="text-[#634E3F] text-base sm:text-lg leading-relaxed">
            Direct dispatches from Tasnim&apos;s chocolate kitchen—seasonal harvests, limited-edition
            gift boxes, and tasting room schedule updates.
          </p>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DCCF] p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#C45A3C]/10 border border-[#C45A3C]/20 flex items-center justify-center mx-auto text-[#C45A3C] mb-4">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-[#1C140D] font-bold mb-2">No Active Announcements</h3>
            <p className="text-[#634E3F] text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Our chocolatiers are hard at work conching fresh harvests. Check back shortly for seasonal drops!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] font-semibold transition-all text-sm shadow-md"
            >
              <span>Explore The Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {announcements.map((item) => {
              const badge = getBadge(item.bannerType);
              const BadgeIcon = badge.icon;
              return (
                <article
                  key={item.id}
                  className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E8DCCF] hover:border-[#C45A3C]/40 transition-all shadow-xs hover:shadow-md relative overflow-hidden group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.text}</span>
                    </span>

                    <div className="flex items-center gap-2 text-xs text-[#634E3F] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#C45A3C]" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1C140D] font-bold mb-3 group-hover:text-[#C45A3C] transition-colors">
                    {item.title}
                  </h2>

                  <p className="text-[#634E3F] leading-relaxed text-sm sm:text-base whitespace-pre-line mb-6">
                    {item.content}
                  </p>

                  {item.linkUrl && (
                    <div className="pt-2">
                      <Link
                        href={item.linkUrl}
                        className="inline-flex items-center gap-2 text-[#C45A3C] font-semibold text-sm hover:underline group-hover:translate-x-1 transition-transform"
                      >
                        <span>Learn More / Claim Offer</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Newsletter / Loyalty Callout */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-[#1C140D] text-[#FAF7F2] border border-[#634E3F]/40 text-center shadow-xl">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5EDE4] mb-3">
            Want Early Access to Limited Micro-Batches?
          </h3>
          <p className="text-[#E8DCCF]/85 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join the ChocoBliss Connoisseur Club to earn Cocoa Points on every order and receive 24-hour priority access
            to single-origin seasonal reserves before public release.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] font-bold transition-all text-sm shadow-md"
            >
              <span>Join Connoisseur Club</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
