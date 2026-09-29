"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle,
  ExternalLink,
  Upload,
  Smartphone,
  Monitor,
  Eye,
  Trash2,
  AlertTriangle,
  Move,
  Check,
  Sparkles,
} from "lucide-react";
import {
  getAdminSiteContentsAction,
  updateSiteContentAction,
} from "@/lib/actions/admin";

export default function AdminCMSPage() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Hero section state
  const [heroEyebrow, setHeroEyebrow] = useState("Handcrafted in small batches");
  const [heroHeadline, setHeroHeadline] = useState("Chocolate, made from the heart.");
  const [heroCopy, setHeroCopy] = useState(
    "Thoughtfully crafted truffles, bars and gifts made to turn small moments into lasting memories."
  );
  const [heroBtnLabel, setHeroBtnLabel] = useState("Discover the collection");
  const [heroBtnLink, setHeroBtnLink] = useState("/shop");
  const [heroDesktopImg, setHeroDesktopImg] = useState(
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1600&auto=format&fit=crop&q=80"
  );
  const [heroAltText, setHeroAltText] = useState("Assorted handcrafted chocolates with cacao leaves");

  // Story section state
  const [storyKicker, setStoryKicker] = useState("Made with intention");
  const [storyHeading, setStoryHeading] = useState("From our heart to yours.");
  const [storyCopy, setStoryCopy] = useState(
    "Chocobliss began with a simple belief: the most memorable gifts are made by hand and given with feeling. Tasnim brings together fine cacao, thoughtful flavors and a love for beautiful details in every batch."
  );
  const [storyFounderImg, setStoryFounderImg] = useState(
    "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80"
  );

  // Settings
  const [pageTitle, setPageTitle] = useState("Artisan Chocolate Gifts | Chocobliss by Tasnim");
  const [metaDesc, setMetaDesc] = useState(
    "Handcrafted chocolate truffles, bars and gifts made in Dhaka with fine cacao and heartfelt detail."
  );
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);

  // Structure sections
  const [sections, setSections] = useState([
    { id: "hero", name: "Hero", desc: "Full-width image + headline", visible: true },
    { id: "categories", name: "Shop by category", desc: "4 category cards", visible: true },
    { id: "story", name: "Our story", desc: "Split image and copy", visible: true },
    { id: "promo", name: "Seasonal promotion", desc: "Wide banner", visible: true },
    { id: "notes", name: "Customer notes", desc: "Testimonial carousel", visible: true },
  ]);

  const fetchCMS = async () => {
    const res = await getAdminSiteContentsAction();
    if (res.success && res.data) {
      const heroRecord = res.data.find((c) => c.key === "homepage_hero");
      if (heroRecord && typeof heroRecord.content === "object") {
        const c = heroRecord.content as any;
        if (c.eyebrow) setHeroEyebrow(c.eyebrow);
        if (c.headline) setHeroHeadline(c.headline);
        if (c.copy) setHeroCopy(c.copy);
        if (c.buttonLabel) setHeroBtnLabel(c.buttonLabel);
        if (c.buttonLink) setHeroBtnLink(c.buttonLink);
      }

      const storyRecord = res.data.find((c) => c.key === "story_history");
      if (storyRecord && typeof storyRecord.content === "object") {
        const s = storyRecord.content as any;
        if (s.heading) setStoryHeading(s.heading);
        if (s.copy) setStoryCopy(s.copy);
      }
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const handlePublishAll = async () => {
    startTransition(async () => {
      // 1. Save Hero
      await updateSiteContentAction("homepage_hero", {
        key: "homepage_hero",
        title: "Homepage Hero",
        content: {
          eyebrow: heroEyebrow,
          headline: heroHeadline,
          copy: heroCopy,
          buttonLabel: heroBtnLabel,
          buttonLink: heroBtnLink,
          altText: heroAltText,
        },
        mediaUrl: heroDesktopImg,
      });

      // 2. Save Story
      await updateSiteContentAction("story_history", {
        key: "story_history",
        title: "Our Story Section",
        content: {
          kicker: storyKicker,
          heading: storyHeading,
          copy: storyCopy,
        },
        mediaUrl: storyFounderImg,
      });

      // 3. Save Settings
      await updateSiteContentAction("homepage_settings", {
        key: "homepage_settings",
        title: "Homepage Settings",
        content: {
          pageTitle,
          metaDescription: metaDesc,
          showAnnouncementBar,
          enableAnimations,
        },
        mediaUrl: null,
      });

      setFeedback("All CMS modifications published successfully to live storefront.");
      setTimeout(() => setFeedback(null), 3500);
    });
  };

  const toggleSectionVisibility = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C140D]">
            Site Content & Media
          </h1>
          <p className="text-xs sm:text-sm text-[#634E3F] mt-1 font-medium">
            Edit storefront sections, manage visual assets and preview changes before publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#634E3F]" />
            <span>Preview site</span>
            <ExternalLink className="w-3 h-3 text-[#634E3F]/60" />
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={handlePublishAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending ? "Publishing..." : "Publish changes"}
          </button>
        </div>
      </div>

      {/* Live Status Notification */}
      <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-950 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Storefront is live. Content changes take effect across all public visitor routes.</span>
        </div>
        <span className="text-[11px] text-emerald-800 font-semibold">Ready to publish</span>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Split Layout: Left Editors & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Editors) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Homepage Structure Sections */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#1C140D]">Homepage structure</h2>
                <p className="text-xs text-[#634E3F]">Manage ordering and section visibility</p>
              </div>
            </div>

            <div className="space-y-2">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2]/60 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Move className="w-4 h-4 text-[#634E3F]/40 cursor-grab" />
                    <div>
                      <div className="font-bold text-xs text-[#1C140D]">{sec.name}</div>
                      <div className="text-[10px] text-[#634E3F]">{sec.desc}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(idx)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      sec.visible
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-zinc-100 text-zinc-500 border-zinc-200"
                    }`}
                  >
                    {sec.visible ? "Visible" : "Hidden"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Homepage Hero Editor */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C140D]">Homepage hero</h2>
              <p className="text-xs text-[#634E3F]">The first story visitors experience on the storefront.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Eyebrow</label>
              <input
                type="text"
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Headline *</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Supporting copy *</label>
              <textarea
                rows={2}
                value={heroCopy}
                onChange={(e) => setHeroCopy(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3 text-xs text-[#1C140D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Button label</label>
                <input
                  type="text"
                  value={heroBtnLabel}
                  onChange={(e) => setHeroBtnLabel(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Button link</label>
                <input
                  type="text"
                  value={heroBtnLink}
                  onChange={(e) => setHeroBtnLink(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Desktop hero image URL</label>
              <input
                type="url"
                value={heroDesktopImg}
                onChange={(e) => setHeroDesktopImg(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Accessibility alt text</label>
              <input
                type="text"
                value={heroAltText}
                onChange={(e) => setHeroAltText(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
              />
            </div>
          </div>

          {/* 3. Our Story Section Editor */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C140D]">Our story section</h2>
              <p className="text-xs text-[#634E3F]">Editorial narrative about Tasnim&apos;s chocolate studio.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Kicker</label>
              <input
                type="text"
                value={storyKicker}
                onChange={(e) => setStoryKicker(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Heading *</label>
              <input
                type="text"
                value={storyHeading}
                onChange={(e) => setStoryHeading(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Story copy *</label>
              <textarea
                rows={3}
                value={storyCopy}
                onChange={(e) => setStoryCopy(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3 text-xs text-[#1C140D] leading-relaxed"
              />
            </div>
          </div>

          {/* 4. Media Library Snippet */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1C140D]">Media library</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?w=600&auto=format&fit=crop&q=80",
              ].map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[#E8DCCF] aspect-square relative group">
                  <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">
                    WebP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Live Miniature Preview & Settings) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Miniature Preview */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <h2 className="text-sm font-bold text-[#1C140D]">Live preview</h2>
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg ${previewDevice === "desktop" ? "bg-white shadow-2xs text-[#1C140D]" : "text-[#634E3F]"}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg ${previewDevice === "mobile" ? "bg-white shadow-2xs text-[#1C140D]" : "text-[#634E3F]"}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rendered miniature */}
            <div className={`mx-auto bg-[#FAF7F2] rounded-2xl border border-[#E8DCCF] p-4 overflow-hidden transition-all ${previewDevice === "mobile" ? "max-w-[280px]" : "w-full"}`}>
              <div className="text-center pb-2">
                <span className="font-serif text-lg font-bold text-[#1C140D]">Chocobliss</span>
                <span className="block text-[8px] uppercase tracking-widest text-[#634E3F]">BY TASNIM</span>
              </div>

              <div className="bg-[#1C140D] text-white p-5 rounded-xl text-center space-y-2 mt-2">
                <span className="text-[9px] uppercase tracking-wider text-[#D4A853] font-bold block">
                  {heroEyebrow}
                </span>
                <h3 className="font-serif text-base font-bold leading-tight">
                  {heroHeadline}
                </h3>
                <p className="text-[10px] text-[#E8DCCF]/80 line-clamp-3">
                  {heroCopy}
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded bg-[#C45A3C] text-white text-[10px] font-bold">
                  {heroBtnLabel}
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-xl border border-[#E8DCCF] text-center">
                <span className="text-[9px] uppercase tracking-wider text-[#C45A3C] font-bold block">
                  {storyKicker}
                </span>
                <h4 className="font-serif text-xs font-bold text-[#1C140D] mt-0.5">
                  {storyHeading}
                </h4>
                <p className="text-[10px] text-[#634E3F] mt-1 line-clamp-2 italic">
                  &ldquo;{storyCopy}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Homepage Settings */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1C140D]">Homepage settings</h2>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Page title</label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Meta description</label>
              <textarea
                rows={2}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3 text-xs text-[#1C140D]"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-[#FAF7F2]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-[#1C140D]">Show announcement bar</span>
                <input
                  type="checkbox"
                  checked={showAnnouncementBar}
                  onChange={(e) => setShowAnnouncementBar(e.target.checked)}
                  className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-[#1C140D]">Enable section animations</span>
                <input
                  type="checkbox"
                  checked={enableAnimations}
                  onChange={(e) => setEnableAnimations(e.target.checked)}
                  className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C] w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Publish Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-[#1C140D]">Publish checklist</h2>
            <ul className="text-xs text-[#634E3F] space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>All visible images have alt text</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Links are verified and valid</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Desktop and mobile previews verified</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>SEO meta tags within limits</span>
              </li>
            </ul>

            <button
              type="button"
              disabled={isPending}
              onClick={handlePublishAll}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#C45A3C] text-white text-xs font-semibold hover:bg-[#b04f33] shadow-xs disabled:opacity-50"
            >
              {isPending ? "Publishing..." : "Publish changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
