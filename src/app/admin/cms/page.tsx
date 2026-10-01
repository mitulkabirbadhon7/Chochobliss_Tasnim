"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Share2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import {
  getAdminSiteContentsAction,
  updateSiteContentAction,
} from "@/lib/actions/admin";

interface CategoryItem {
  title: string;
  tag: string;
  description: string;
  href: string;
  image: string;
}

interface ShowcaseItem {
  title: string;
  subtitle: string;
  image: string;
}

export default function AdminCMSPage() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [socialFeedback, setSocialFeedback] = useState<string | null>(null);
  const [catFeedback, setCatFeedback] = useState<string | null>(null);
  const [showcaseFeedback, setShowcaseFeedback] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Social Links State (Instagram & Facebook)
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/chocobliss.tasnim");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/chocoblissbytasnim");

  // 3 Curated Categories State (Bar, Customized Bar, mini)
  const [categories, setCategories] = useState<CategoryItem[]>([
    {
      title: "Bar",
      tag: "SINGLE ORIGIN",
      description: "Terroir-driven 68% to 85% single-origin dark and milk chocolate bars crafted from rare cacao beans.",
      href: "/shop?category=Bar",
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Customized Bar",
      tag: "BESPOKE CREATION",
      description: "Hand-poured bespoke chocolate bars custom-infused with roasted nuts, berries, and personalized inscriptions.",
      href: "/shop?category=Customized+Bar",
      image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "mini",
      tag: "ARTISANAL BITES",
      description: "Velvety bite-sized chocolates, mini bars, and delicate cocoa confections crafted for every sweet craving.",
      href: "/shop?category=mini",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  // Non-Clickable Lucrative Showcase Gallery State
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([
    {
      title: "Molten Artisanal Ganache",
      subtitle: "70% Single-Origin Cacao",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Gold-Dusted Truffles",
      subtitle: "Hand-Rolled Artisan Gems",
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Customized Roasted Slabs",
      subtitle: "Pistachio & Sea Salt Inscription",
      image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Mini Cacao Bonbons",
      subtitle: "Bite-Sized Indulgence",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    },
  ]);

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
    { id: "hero", name: "Hero Sequence", desc: "Full-width scroll canvas + headline", visible: true },
    { id: "showcase", name: "Lucrative Showcase", desc: "Pure visual non-clickable confectionery gallery", visible: true },
    { id: "categories", name: "Curated Collections", desc: "3 Clickable categories (Bar, Customized Bar, mini)", visible: true },
    { id: "featured", name: "Tasnim's Signature", desc: "Hand-selected micro-batches", visible: true },
    { id: "story", name: "Bean-to-Bar Story", desc: "72 hours of conching & ethics", visible: true },
  ]);

  const fetchCMS = async () => {
    const res = await getAdminSiteContentsAction();
    if (res.success && res.data) {
      // 1. Hero
      const heroRecord = res.data.find((c) => c.key === "homepage_hero");
      if (heroRecord && typeof heroRecord.content === "object" && heroRecord.content !== null) {
        const c = heroRecord.content as Record<string, unknown>;
        if (c.eyebrow) setHeroEyebrow(String(c.eyebrow));
        if (c.headline) setHeroHeadline(String(c.headline));
        if (c.copy) setHeroCopy(String(c.copy));
        if (c.buttonLabel) setHeroBtnLabel(String(c.buttonLabel));
        if (c.buttonLink) setHeroBtnLink(String(c.buttonLink));
      }

      // 2. Story
      const storyRecord = res.data.find((c) => c.key === "story_history");
      if (storyRecord && typeof storyRecord.content === "object" && storyRecord.content !== null) {
        const s = storyRecord.content as Record<string, unknown>;
        if (s.heading) setStoryHeading(String(s.heading));
        if (s.copy) setStoryCopy(String(s.copy));
      }

      // 3. Social
      const socialRecord = res.data.find((c) => c.key === "social_links");
      if (socialRecord && typeof socialRecord.content === "object" && socialRecord.content !== null) {
        const soc = socialRecord.content as Record<string, unknown>;
        if (soc.instagramUrl) setInstagramUrl(String(soc.instagramUrl));
        if (soc.facebookUrl) setFacebookUrl(String(soc.facebookUrl));
      }

      // 4. Categories
      const catRecord = res.data.find((c) => c.key === "homepage_categories");
      if (catRecord && typeof catRecord.content === "object" && catRecord.content !== null) {
        const raw = catRecord.content as Record<string, unknown>;
        if (Array.isArray(raw.items) && raw.items.length > 0) {
          setCategories(raw.items as CategoryItem[]);
        }
      }

      // 5. Showcase
      const showRecord = res.data.find((c) => c.key === "homepage_showcase");
      if (showRecord && typeof showRecord.content === "object" && showRecord.content !== null) {
        const raw = showRecord.content as Record<string, unknown>;
        if (Array.isArray(raw.items) && raw.items.length > 0) {
          setShowcaseItems(raw.items as ShowcaseItem[]);
        }
      }
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const handleSaveSocialLinks = async () => {
    startTransition(async () => {
      let finalInsta = instagramUrl.trim();
      if (finalInsta.startsWith("@")) {
        finalInsta = `https://instagram.com/${finalInsta.slice(1)}`;
      } else if (finalInsta && !finalInsta.startsWith("http")) {
        finalInsta = `https://instagram.com/${finalInsta}`;
      }

      let finalFb = facebookUrl.trim();
      if (finalFb && !finalFb.startsWith("http")) {
        finalFb = `https://${finalFb}`;
      }

      const res = await updateSiteContentAction("social_links", {
        key: "social_links",
        title: "Social Media Links",
        content: {
          instagramUrl: finalInsta,
          facebookUrl: finalFb,
        },
        mediaUrl: null,
      });

      if (res.success) {
        setSocialFeedback("Instagram and Facebook links saved successfully!");
        setTimeout(() => setSocialFeedback(null), 3500);
      }
    });
  };

  const handleSaveCategories = async () => {
    startTransition(async () => {
      const res = await updateSiteContentAction("homepage_categories", {
        key: "homepage_categories",
        title: "Curated Categories",
        content: { items: categories },
        mediaUrl: null,
      });

      if (res.success) {
        setCatFeedback("3 Curated Categories (Bar, Customized Bar, mini) updated successfully!");
        setTimeout(() => setCatFeedback(null), 3500);
      }
    });
  };

  const handleSaveShowcase = async () => {
    startTransition(async () => {
      const res = await updateSiteContentAction("homepage_showcase", {
        key: "homepage_showcase",
        title: "Artisanal Confectionery Showcase",
        content: { items: showcaseItems },
        mediaUrl: null,
      });

      if (res.success) {
        setShowcaseFeedback("Lucrative Showcase gallery saved successfully!");
        setTimeout(() => setShowcaseFeedback(null), 3500);
      }
    });
  };

  const handlePublishAll = async () => {
    startTransition(async () => {
      // 1. Hero
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

      // 2. Categories
      await updateSiteContentAction("homepage_categories", {
        key: "homepage_categories",
        title: "Curated Categories",
        content: { items: categories },
        mediaUrl: null,
      });

      // 3. Showcase
      await updateSiteContentAction("homepage_showcase", {
        key: "homepage_showcase",
        title: "Artisanal Confectionery Showcase",
        content: { items: showcaseItems },
        mediaUrl: null,
      });

      // 4. Story
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

      // 5. Settings
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

      // 6. Social Links
      let finalInsta = instagramUrl.trim();
      if (finalInsta.startsWith("@")) {
        finalInsta = `https://instagram.com/${finalInsta.slice(1)}`;
      } else if (finalInsta && !finalInsta.startsWith("http")) {
        finalInsta = `https://instagram.com/${finalInsta}`;
      }

      let finalFb = facebookUrl.trim();
      if (finalFb && !finalFb.startsWith("http")) {
        finalFb = `https://${finalFb}`;
      }

      await updateSiteContentAction("social_links", {
        key: "social_links",
        title: "Social Media Links",
        content: {
          instagramUrl: finalInsta,
          facebookUrl: finalFb,
        },
        mediaUrl: null,
      });

      setFeedback("All CMS modifications published successfully to live storefront.");
      setTimeout(() => setFeedback(null), 3500);
    });
  };

  const handleCategoryImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const next = [...categories];
        next[index].image = reader.result as string;
        setCategories(next);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleShowcaseImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const next = [...showcaseItems];
        next[index].image = reader.result as string;
        setShowcaseItems(next);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddShowcaseItem = () => {
    setShowcaseItems([
      ...showcaseItems,
      {
        title: "New Artisanal Creation",
        subtitle: "Handcrafted Batch",
        image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
      },
    ]);
  };

  const handleRemoveShowcaseItem = (index: number) => {
    setShowcaseItems(showcaseItems.filter((_, i) => i !== index));
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
            Manage your categories (Bar, Customized Bar, mini), showcase pictures, and brand media.
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
            {isPending ? "Publishing..." : "Publish all changes"}
          </button>
        </div>
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

          {/* 1. CURATED CATEGORIES (Bar, Customized Bar, mini) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C45A3C] block">
                  Clickable Storefront Categories
                </span>
                <h2 className="text-base font-bold text-[#1C140D]">1. Curated Categories (3 Core Collections)</h2>
                <p className="text-xs text-[#634E3F]">
                  These 3 category cards are clickable on the homepage and direct visitors to filtered confections.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveCategories}
                disabled={isPending}
                className="px-3.5 py-1.5 rounded-xl bg-[#1C140D] hover:bg-[#38281B] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                Save Categories
              </button>
            </div>

            {catFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{catFeedback}</span>
              </div>
            )}

            <div className="space-y-6 divide-y divide-[#E8DCCF]/60">
              {categories.map((cat, idx) => (
                <div key={idx} className="pt-5 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C140D] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#F5EDE4] text-[#C45A3C] text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      Category: {cat.title}
                    </span>
                    <span className="text-[10px] font-mono bg-[#FAF7F2] text-[#634E3F] px-2 py-0.5 rounded border border-[#E8DCCF]">
                      {cat.href}
                    </span>
                  </div>

                  {/* Thumbnail and image options */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DCCF] shrink-0">
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cat.image}
                          onChange={(e) => {
                            const next = [...categories];
                            next[idx].image = e.target.value;
                            setCategories(next);
                          }}
                          placeholder="Enter category picture URL"
                          className="flex-1 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-1.5 text-xs text-[#1C140D]"
                        />
                        <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#C45A3C] hover:bg-[#a8492e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0">
                          <Upload className="w-3 h-3" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleCategoryImageUpload(idx, e)}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#634E3F] uppercase mb-0.5">Title</label>
                          <input
                            type="text"
                            value={cat.title}
                            onChange={(e) => {
                              const next = [...categories];
                              next[idx].title = e.target.value;
                              setCategories(next);
                            }}
                            placeholder="Enter category title"
                            className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-1.5 text-xs text-[#1C140D] font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#634E3F] uppercase mb-0.5">Tag Badge</label>
                          <input
                            type="text"
                            value={cat.tag}
                            onChange={(e) => {
                              const next = [...categories];
                              next[idx].tag = e.target.value;
                              setCategories(next);
                            }}
                            placeholder="Enter badge tag (e.g. SINGLE ORIGIN)"
                            className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-1.5 text-xs text-[#1C140D]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#634E3F] uppercase mb-0.5">Description</label>
                        <input
                          type="text"
                          value={cat.description}
                          onChange={(e) => {
                            const next = [...categories];
                            next[idx].description = e.target.value;
                            setCategories(next);
                          }}
                          placeholder="Enter short description"
                          className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-1.5 text-xs text-[#1C140D]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. LUCRATIVE SHOWCASE GALLERY (Non-Clickable Showcase) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853] block">
                  Artisanal Eye-Candy Showcase
                </span>
                <h2 className="text-base font-bold text-[#1C140D]">2. Lucrative Product Showcase (Non-Clickable)</h2>
                <p className="text-xs text-[#634E3F]">
                  Mouthwatering random pictures of your chocolate creations to showcase craftsmanship. Purely visual and non-clickable.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddShowcaseItem}
                  className="px-3 py-1.5 rounded-xl border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] text-[#1C140D] text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C45A3C]" /> Add Photo
                </button>
                <button
                  type="button"
                  onClick={handleSaveShowcase}
                  disabled={isPending}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1C140D] hover:bg-[#38281B] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  Save Showcase
                </button>
              </div>
            </div>

            {showcaseFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{showcaseFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showcaseItems.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C140D]">Showcase #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveShowcaseItem(idx)}
                      className="text-[#634E3F] hover:text-rose-600 transition-colors p-1"
                      title="Remove from showcase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-white border border-[#E8DCCF]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => {
                          const next = [...showcaseItems];
                          next[idx].image = e.target.value;
                          setShowcaseItems(next);
                        }}
                        placeholder="Enter showcase picture URL"
                        className="flex-1 bg-white border border-[#E8DCCF] rounded-lg px-2.5 py-1.5 text-xs text-[#1C140D]"
                      />
                      <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-[#C45A3C] hover:bg-[#a8492e] text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0">
                        <Upload className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleShowcaseImageUpload(idx, e)}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...showcaseItems];
                        next[idx].title = e.target.value;
                        setShowcaseItems(next);
                      }}
                      placeholder="Enter photo title (e.g. Molten Ganache)"
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1C140D]"
                    />

                    <input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) => {
                        const next = [...showcaseItems];
                        next[idx].subtitle = e.target.value;
                        setShowcaseItems(next);
                      }}
                      placeholder="Enter subtitle tag"
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg px-2.5 py-1.5 text-[11px] text-[#634E3F]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SOCIAL MEDIA PROFILES */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#1C140D]">3. Social Media Connections</h2>
                <p className="text-xs text-[#634E3F]">Manage official Instagram & Facebook boutique links</p>
              </div>
              <button
                type="button"
                onClick={handleSaveSocialLinks}
                disabled={isPending}
                className="px-3.5 py-1.5 rounded-xl bg-[#1C140D] hover:bg-[#38281B] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                Save Social Links
              </button>
            </div>

            {socialFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{socialFeedback}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Instagram Field */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1C140D] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-linear-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </span>
                    <span>Instagram Profile / Handle</span>
                  </label>
                  {instagramUrl && (
                    <a
                      href={
                        instagramUrl.startsWith("http")
                          ? instagramUrl
                          : instagramUrl.startsWith("@")
                          ? `https://instagram.com/${instagramUrl.slice(1)}`
                          : `https://instagram.com/${instagramUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-[#E1306C] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Test link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/chocobliss.tasnim or @chocobliss.tasnim"
                  className="w-full bg-white border border-[#E8DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#1C140D] placeholder:text-[#634E3F]/40 focus:ring-1 focus:ring-[#C45A3C] focus:border-[#C45A3C]"
                />
              </div>

              {/* Facebook Field */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1C140D] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </span>
                    <span>Facebook Page URL</span>
                  </label>
                  {facebookUrl && (
                    <a
                      href={facebookUrl.startsWith("http") ? facebookUrl : `https://${facebookUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-[#1877F2] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Test link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/chocoblissbytasnim"
                  className="w-full bg-white border border-[#E8DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#1C140D] placeholder:text-[#634E3F]/40 focus:ring-1 focus:ring-[#C45A3C] focus:border-[#C45A3C]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Storefront Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#1C140D]">Real-Time Storefront Preview</h2>
                <p className="text-xs text-[#634E3F]">Simulate live visitor perspective</p>
              </div>
              <div className="flex items-center bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-white text-[#1C140D] shadow-xs font-bold"
                      : "text-[#634E3F]"
                  }`}
                  title="Desktop preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-white text-[#1C140D] shadow-xs font-bold"
                      : "text-[#634E3F]"
                  }`}
                  title="Mobile preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div className={`mx-auto bg-[#FAF7F2] rounded-2xl border border-[#E8DCCF] overflow-hidden p-4 space-y-4 transition-all ${
              previewDevice === "mobile" ? "max-w-[320px]" : "w-full"
            }`}>
              {/* Simulated Showcase Strip */}
              <div className="bg-[#1C140D] rounded-xl p-3 text-white space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-[#D4A853] font-bold block">
                  Lucrative Showcase (Non-Clickable)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {showcaseItems.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#38281B]">
                      <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[9px] font-bold text-white leading-none truncate">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Curated Collections (Bar, Customized Bar, mini) */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-[#C45A3C] font-bold block">
                  Curated Categories (Clickable)
                </span>
                <div className="space-y-2">
                  {categories.map((col, idx) => (
                    <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-[#E8DCCF]">
                      <Image src={col.image} alt={col.title} fill sizes="200px" className="object-cover" />
                      <div className="absolute inset-0 bg-linear-to-r from-[#1C140D]/90 via-[#1C140D]/40 to-transparent p-2.5 flex flex-col justify-end text-white">
                        <span className="text-[8px] font-bold text-[#D4A853] uppercase">{col.tag}</span>
                        <span className="font-serif text-xs font-bold leading-tight">{col.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
