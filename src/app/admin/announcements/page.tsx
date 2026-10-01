"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Download,
  Search,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  Smartphone,
  Monitor,
  Trash2,
  AlertCircle,
  Tag,
  ArrowRight,
} from "lucide-react";
import {
  getAdminAnnouncementsAction,
  updateAnnouncementAction,
  toggleAnnouncementActiveAction,
} from "@/lib/actions/admin";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/announcements";

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  bannerType: "PROMO" | "ANNOUNCEMENT" | "ALERT";
  linkUrl: string | null;
  bannerImage: string | null;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}

export default function AdminAnnouncementsPage() {
  const [tab, setTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [counts, setCounts] = useState({ total: 0, live: 0, scheduled: 0, draft: 0 });
  const [selectedCampaign, setSelectedCampaign] = useState<AnnouncementRecord | null>(null);

  // Editor Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bannerType, setBannerType] = useState<"PROMO" | "ANNOUNCEMENT" | "ALERT">("PROMO");
  const [linkUrl, setLinkUrl] = useState("/shop");
  const [bannerImage, setBannerImage] = useState(
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1200&auto=format&fit=crop&q=80"
  );
  const [isActive, setIsActive] = useState(true);
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    const res = await getAdminAnnouncementsAction();
    if (res.success && res.data) {
      const list = res.data.announcements as unknown as AnnouncementRecord[];
      setAnnouncements(list);
      setCounts(res.data.counts);

      if (list.length > 0 && !selectedCampaign) {
        populateEditor(list[0]);
      }
    }
  };

  const populateEditor = (record: AnnouncementRecord) => {
    setSelectedCampaign(record);
    setTitle(record.title);
    setContent(record.content);
    setBannerType(record.bannerType);
    setLinkUrl(record.linkUrl || "/shop");
    setBannerImage(record.bannerImage || "");
    setIsActive(record.isActive);
    setStartDateStr(
      record.startDate ? new Date(record.startDate).toISOString().slice(0, 16) : ""
    );
    setEndDateStr(
      record.endDate ? new Date(record.endDate).toISOString().slice(0, 16) : ""
    );
  };

  useEffect(() => {
    startTransition(() => {
      fetchAnnouncements();
    });
  }, []);

  const handleSaveCampaign = async () => {
    if (!title.trim() || !content.trim()) {
      setFeedback("Please provide a title and announcement message.");
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      bannerType,
      linkUrl: linkUrl ? linkUrl.trim() : null,
      bannerImage: bannerImage ? bannerImage.trim() : null,
      isActive,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
    };

    startTransition(async () => {
      if (selectedCampaign) {
        const res = await updateAnnouncementAction(selectedCampaign.id, payload);
        if (res.success) {
          setFeedback("Campaign updated successfully.");
          fetchAnnouncements();
          setTimeout(() => setFeedback(null), 3000);
        } else {
          setFeedback(res.error?.message || "Failed to update campaign.");
        }
      } else {
        const res = await createAnnouncement(payload);
        if (res.success) {
          setFeedback("New campaign created successfully!");
          fetchAnnouncements();
          setTimeout(() => setFeedback(null), 3000);
        } else {
          setFeedback(res.error?.message || "Failed to create campaign.");
        }
      }
    });
  };

  const handleToggleActive = async (id: string) => {
    const res = await toggleAnnouncementActiveAction(id);
    if (res.success) {
      fetchAnnouncements();
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    const res = await deleteAnnouncement(id);
    if (res.success) {
      setFeedback("Announcement deleted.");
      fetchAnnouncements();
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleNewCampaign = () => {
    setSelectedCampaign(null);
    setTitle("New Seasonal Campaign");
    setContent("Celebrate with artisanal handcrafted chocolates — free shipping this weekend.");
    setBannerType("PROMO");
    setLinkUrl("/shop");
    setBannerImage("https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1200&auto=format&fit=crop&q=80");
    setIsActive(true);
    setStartDateStr("");
    setEndDateStr("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C140D]">
            Announcements & Offers
          </h1>
          <p className="text-xs sm:text-sm text-[#634E3F] mt-1 font-medium">
            Create, schedule and measure storefront announcements, offer codes and visual campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert("Campaign reports exported.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#634E3F]" />
            <span>Campaign report</span>
          </button>
          <button
            type="button"
            onClick={handleNewCampaign}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New campaign</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Live campaigns</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.live || 3}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Scheduled</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.scheduled || 2}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Offer redemptions</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            184
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Attributed revenue</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            ৳92.4k
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-medium">
          {feedback}
        </div>
      )}

      {/* Split Layout: Left Campaigns List & Right Campaign Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <h2 className="text-sm font-bold text-[#1C140D]">Active & Scheduled</h2>
              <span className="text-xs text-[#634E3F]">{announcements.length} campaigns</span>
            </div>

            <div className="space-y-3">
              {announcements.map((a) => {
                const isSelected = selectedCampaign?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => populateEditor(a)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#C45A3C] bg-[#FAF2EB] shadow-xs"
                        : "border-[#E8DCCF] bg-white hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-[#1C140D]">{a.title}</h3>
                        <p className="text-[11px] text-[#634E3F] line-clamp-2 mt-1">
                          {a.content}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          a.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {a.isActive ? "Active" : "Draft"}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#FAF7F2] flex items-center justify-between text-[11px] text-[#634E3F]">
                      <span className="font-semibold text-[#C45A3C] uppercase">
                        {a.bannerType}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(a.id);
                          }}
                          className="hover:underline font-medium"
                        >
                          {a.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(a.id);
                          }}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Campaign Editor Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#FAF7F2]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1C140D]">
                  {selectedCampaign ? "Edit Campaign" : "New Campaign"}
                </h2>
                <p className="text-xs text-[#634E3F]">Configure message and scheduling</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSaveCampaign}
                  className="px-4 py-2 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] shadow-xs"
                >
                  {isPending ? "Saving..." : "Save Campaign"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                Campaign title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter campaign title"
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#1C140D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                Announcement message *
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="A little warmth for every heart — enjoy 15% off our Autumn Gifting Edit."
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3.5 text-xs text-[#1C140D] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Banner classification
                </label>
                <select
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-medium text-[#1C140D]"
                >
                  <option value="PROMO">PROMO (Promotional offer)</option>
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT (General news)</option>
                  <option value="ALERT">ALERT (Urgent shipping advisory)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Destination link URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/shop"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Schedule start (optional)
                </label>
                <input
                  type="datetime-local"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Schedule expiration (optional)
                </label>
                <input
                  type="datetime-local"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs text-[#1C140D]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#FAF7F2]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#1C140D] block">
                    Active on Storefront
                  </span>
                  <span className="text-[11px] text-[#634E3F]">
                    When active, banner displays on homepage and announcement bulletin.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C] w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Storefront Live Preview */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#1C140D]">Storefront preview</h3>
            <p className="text-xs text-[#634E3F]">Live interactive preview of how customers see this announcement.</p>
          </div>

          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DCCF]">
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewMode === "desktop"
                  ? "bg-white text-[#1C140D] shadow-2xs"
                  : "text-[#634E3F] hover:text-[#1C140D]"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewMode === "mobile"
                  ? "bg-white text-[#1C140D] shadow-2xs"
                  : "text-[#634E3F] hover:text-[#1C140D]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        <div className={`mx-auto transition-all ${previewMode === "mobile" ? "max-w-sm" : "w-full"}`}>
          {/* Announcement Strip */}
          <div className="bg-[#C45A3C] text-white text-xs py-2 px-4 text-center font-bold tracking-wide uppercase flex items-center justify-center gap-2 rounded-t-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
            <span>{title || "Autumn Gifting Edit — 15% Off"}</span>
          </div>

          {/* Banner Graphic Card */}
          <div className="bg-[#1C140D] text-[#F5EDE4] p-6 sm:p-8 rounded-b-xl flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <div className="relative z-10 max-w-md">
              <span className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold block mb-1">
                Seasonal Edit
              </span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {title || "Warmth, wrapped beautifully."}
              </h4>
              <p className="text-xs text-[#E8DCCF]/80 leading-relaxed">
                {content || "A little warmth for every heart — enjoy handcrafted confections."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
