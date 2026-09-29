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
          color: "bg-gold/15 text-gold border-gold/30",
        };
      case "ALERT":
        return {
          icon: AlertCircle,
          text: "Atelier Notice",
          color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        };
      default:
        return {
          icon: Megaphone,
          text: "Special Announcement",
          color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        };
    }
  };

  return (
    <div className="bg-espresso-950 text-cream min-h-screen py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atelier Bulletins & Drops</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-cream mb-4">
            Announcements & Releases
          </h1>
          <p className="text-cream/70 text-base sm:text-lg">
            Direct dispatches from Tasnim&apos;s chocolate kitchen—seasonal seasonal harvests, limited-edition
            gift boxes, and tasting room schedule updates.
          </p>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-espresso-900/40 rounded-3xl border border-gold/15 p-8">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto text-gold mb-4">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-cream font-bold mb-2">No Active Announcements</h3>
            <p className="text-cream/65 text-sm max-w-md mx-auto mb-6">
              Our chocolatiers are hard at work conching fresh harvests. Check back shortly for seasonal drops!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-espresso-950 font-semibold hover:bg-gold-light transition text-sm"
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
                  className="p-8 rounded-2xl bg-espresso-900/60 border border-gold/20 hover:border-gold/40 transition shadow-xl relative overflow-hidden group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.text}</span>
                    </span>

                    <div className="flex items-center gap-2 text-xs text-cream/50">
                      <Calendar className="w-3.5 h-3.5 text-gold/70" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-cream font-bold mb-3 group-hover:text-gold transition">
                    {item.title}
                  </h2>

                  <p className="text-cream/75 leading-relaxed text-sm sm:text-base whitespace-pre-line mb-6">
                    {item.content}
                  </p>

                  {item.linkUrl && (
                    <div className="pt-2">
                      <Link
                        href={item.linkUrl}
                        className="inline-flex items-center gap-2 text-gold font-semibold text-sm hover:underline group-hover:translate-x-1 transition-transform"
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
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-espresso-900 via-espresso-900/80 to-espresso-950 border border-gold/30 text-center">
          <h3 className="font-serif text-2xl font-bold text-cream mb-2">
            Want Early Access to Limited Micro-Batches?
          </h3>
          <p className="text-cream/70 text-sm max-w-xl mx-auto mb-6">
            Join the ChocoBliss Connoisseur Club to earn Cocoa Points on every order and receive 24-hour priority access
            to single-origin seasonal reserves before public release.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-espresso-950 font-bold hover:bg-gold-light transition text-sm"
            >
              <span>Join Connoisseur Club</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
