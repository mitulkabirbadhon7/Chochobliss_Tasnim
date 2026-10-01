"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { uploadProductImageAction } from "@/lib/actions/upload";
import { compressImage } from "@/lib/utils/image-compression";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    salePrice?: number | null;
    sku?: string;
    inventory?: number;
    cacaoPercentage?: number | null;
    origin?: string | null;
    flavorNotes?: string[];
    ingredients?: string | null;
    allergens?: string[];
    weight?: string | null;
    images?: string[];
    hoverImage?: string | null;
    flavors?: string[];
    category?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
  };
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [salePrice, setSalePrice] = useState(
    initialData?.salePrice != null ? String(initialData.salePrice) : ""
  );
  const [sku, setSku] = useState(initialData?.sku || "");
  const [inventory, setInventory] = useState(
    initialData?.inventory !== undefined ? String(initialData.inventory) : "25"
  );
  const [category, setCategory] = useState(initialData?.category || "Bar");
  const [cacaoPercentage, setCacaoPercentage] = useState(
    initialData?.cacaoPercentage ? String(initialData.cacaoPercentage) : "72"
  );
  const [origin, setOrigin] = useState(initialData?.origin || "Sambirano Valley, Madagascar");
  const [flavorNotesStr, setFlavorNotesStr] = useState(
    initialData?.flavorNotes?.join(", ") || "Deep cacao, toasted hazelnut, vanilla"
  );
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients ||
      "Cocoa mass, cane sugar, cocoa butter, fresh cream, vanilla."
  );
  const [allergensStr, setAllergensStr] = useState(
    initialData?.allergens?.join(", ") || "Contains dairy, tree nuts."
  );
  const [weight, setWeight] = useState(initialData?.weight || "240g / 8.5 oz");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);

  // Gallery state
  // Gallery state
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : [
          "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80",
        ]
  );
  const [hoverImage, setHoverImage] = useState(initialData?.hoverImage || "");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newHoverImageUrl, setNewHoverImageUrl] = useState("");

  // Flavors / Types state
  const [flavors, setFlavors] = useState<string[]>(
    initialData?.flavors && initialData.flavors.length > 0
      ? initialData.flavors
      : ["Dark 72%", "White Milk 38%"]
  );
  const [newFlavorInput, setNewFlavorInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Feedback State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Helper auto-generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit || !slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleClearAllImages = () => {
    setImages([]);
  };

  const handleAddFlavor = () => {
    const val = newFlavorInput.trim();
    if (!val) return;
    if (!flavors.includes(val)) {
      setFlavors([...flavors, val]);
    }
    setNewFlavorInput("");
  };

  const handleRemoveFlavor = (index: number) => {
    setFlavors(flavors.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isForHover = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Selected image file exceeds 10MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      // Client-side canvas compression (~80% quality WebP)
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        mimeType: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", compressed);

      const res = await uploadProductImageAction(formData);
      if (res.success) {
        if (isForHover) {
          setHoverImage(res.data.url);
        } else {
          setImages((prev) => [...prev, res.data.url]);
        }
      } else {
        setErrorMsg(res.error.message || "Failed to upload image.");
      }
    } catch {
      setErrorMsg("Error compressing or uploading image.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (publishState: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const numPrice = parseFloat(price);
    const numInventory = parseInt(inventory, 10);

    if (!name.trim()) {
      setErrorMsg("Product name is required.");
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg("Please enter a valid price.");
      return;
    }
    if (!sku.trim()) {
      setErrorMsg("SKU is required.");
      return;
    }
    if (flavors.length === 0) {
      setErrorMsg("At least one available flavor or type variant is required.");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || "Artisanal handcrafted chocolate batch.",
      price: numPrice,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      sku: sku.trim(),
      inventory: isNaN(numInventory) ? 0 : numInventory,
      category,
      cacaoPercentage: cacaoPercentage ? parseInt(cacaoPercentage, 10) : null,
      origin: origin.trim() || null,
      flavorNotes: flavorNotesStr
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean),
      ingredients: ingredients.trim() || null,
      allergens: allergensStr
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean),
      weight: weight.trim() || null,
      images,
      hoverImage: hoverImage.trim() || null,
      flavors,
      isFeatured,
      isPublished: publishState,
    };

    startTransition(async () => {
      if (isEdit && initialData?.id) {
        const res = await updateProduct(initialData.id, payload);
        if (res.success) {
          setSuccessMsg("Product updated successfully.");
          router.refresh();
          setTimeout(() => router.push("/admin/products"), 1200);
        } else {
          setErrorMsg(res.error?.message || "Failed to update product.");
        }
      } else {
        const res = await createProduct(payload);
        if (res.success) {
          setSuccessMsg("Product created successfully!");
          setTimeout(() => router.push("/admin/products"), 1200);
        } else {
          setErrorMsg(res.error?.message || "Failed to create product.");
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (deleteConfirmationText !== "DELETE") {
      setErrorMsg("Please type DELETE to confirm.");
      return;
    }

    startTransition(async () => {
      const res = await deleteProduct(initialData.id!);
      if (res.success) {
        router.push("/admin/products");
      } else {
        setErrorMsg(res.error?.message || "Failed to delete product.");
      }
    });
  };

  // Readiness calculation
  const checks = [
    Boolean(name && description),
    images.length > 0,
    Boolean(price && !isNaN(parseFloat(price))),
    Boolean(sku && inventory),
    Boolean(slug),
  ];
  const readinessPercent = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DCCF]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-[#E8DCCF] bg-white text-[#634E3F] hover:bg-[#FAF7F2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C140D]">
              {isEdit ? "Edit product" : "New product"}
            </h1>
            <p className="text-xs text-[#634E3F] font-medium">
              {isEdit ? `${name || "Untitled"} • Last edited by Tasnim` : "Create new artisanal chocolate item"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending ? "Saving..." : isEdit ? "Publish updates" : "Publish product"}
          </button>
        </div>
      </div>

      {/* Banner / Feedback Messages */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isPublished && !errorMsg && (
        <div className="bg-emerald-50/70 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Product is live. Updates will appear on the storefront immediately after publishing.</span>
        </div>
      )}

      {/* Main Form Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main content, 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C140D]">Basic information</h2>
              <p className="text-xs text-[#634E3F]">The core details customers see on the product page.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                Product title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter product title"
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#1C140D] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description and tasting story..."
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3.5 text-xs text-[#1C140D] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] focus:bg-white leading-relaxed"
              />
              <span className="text-[10px] text-[#634E3F]/70">{description.length} characters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Category / Collection *</label>
                <div className="space-y-1.5">
                  <select
                    value={["Bar", "Customized Bar", "mini"].includes(category) ? category : "Custom"}
                    onChange={(e) => {
                      if (e.target.value === "Custom") {
                        setCategory("");
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-bold text-[#1C140D] focus:border-[#C45A3C]"
                  >
                    <option value="Bar">1. Bar</option>
                    <option value="Customized Bar">2. Customized Bar</option>
                    <option value="mini">3. mini</option>
                    <option value="Custom">+ Enter custom category...</option>
                  </select>
                  {!["Bar", "Customized Bar", "mini"].includes(category) && (
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter custom category name"
                      className="w-full bg-white border border-[#C45A3C] rounded-xl px-3 py-1.5 text-xs text-[#1C140D] focus:outline-none"
                      autoFocus
                      required
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Cacao %</label>
                <input
                  type="number"
                  value={cacaoPercentage}
                  onChange={(e) => setCacaoPercentage(e.target.value)}
                  placeholder="Enter cacao percentage"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Weight</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter package weight"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs text-[#1C140D]"
                />
              </div>
            </div>
          </div>

          {/* 2. Product Gallery */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1C140D]">Product gallery</h2>
                <p className="text-xs text-[#634E3F]">The first image is used as the storefront cover.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#634E3F]">{images.length} images</span>
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllImages}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden border border-[#E8DCCF] bg-[#FAF7F2] aspect-square"
                  >
                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-[#1C140D]/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 border-2 border-dashed border-[#E8DCCF] rounded-2xl text-center bg-[#FAF7F2]/50">
                <Upload className="w-8 h-8 text-[#634E3F] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#1C140D]">No product pictures added yet</p>
                <p className="text-[11px] text-[#634E3F] mt-0.5">Upload a picture from your device or paste an image URL below.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <label
                className={`cursor-pointer px-4 py-2 rounded-xl bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs ${
                  isUploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "Compressing & Uploading..." : "Upload Picture from Computer"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => handleFileUpload(e, false)}
                />
              </label>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL (https://...) to add"
                  className="flex-1 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D] focus:outline-hidden focus:border-[#C45A3C]"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DCCF] text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] shrink-0"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* 2B. Hover Image (Storefront Alternate View) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C140D]">Hover Image (Alternate Angle / Second View)</h2>
              <p className="text-xs text-[#634E3F]">
                Displayed automatically when a customer hovers over this chocolate on the storefront and collection listings.
              </p>
            </div>

            {hoverImage ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#E8DCCF] bg-[#FAF7F2] group">
                <img src={hoverImage} alt="Hover preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setHoverImage("")}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white shadow-xs"
                  title="Remove hover image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 bg-[#D4A853] text-[#1C140D] text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Hover Swap
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#634E3F] italic">No hover image set. The second gallery photo will be used if available.</p>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <label
                className={`cursor-pointer px-4 py-2 rounded-xl bg-[#1C140D] hover:bg-[#38281B] text-[#FAF7F2] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs ${
                  isUploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#D4A853]" />
                <span>{isUploading ? "Uploading..." : "Upload Hover Image"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => handleFileUpload(e, true)}
                />
              </label>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="url"
                  value={newHoverImageUrl}
                  onChange={(e) => setNewHoverImageUrl(e.target.value)}
                  placeholder="Or paste hover image URL (https://...)"
                  className="flex-1 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newHoverImageUrl.trim()) {
                      setHoverImage(newHoverImageUrl.trim());
                      setNewHoverImageUrl("");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DCCF] text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] shrink-0"
                >
                  Set Hover URL
                </button>
              </div>
            </div>
          </div>

          {/* 3. Pricing & Inventory */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C140D]">Pricing & inventory</h2>
              <p className="text-xs text-[#634E3F]">Prices include VAT. Inventory is tracked at the Dhaka studio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Price (৳) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in BDT"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D] font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Compare-at price (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Enter discounted price (optional)"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Available quantity *
                </label>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  placeholder="Enter available stock count"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D] font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Enter product SKU code"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs font-mono text-[#1C140D]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                  Cacao Origin
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter cacao origin region or country"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>
            </div>
          </div>

          {/* 3B. Available Flavors / Types Selection (Task 4) */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#D4A853]/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#1C140D] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A853]" />
                  <span>Available Flavors & Types Selection *</span>
                </h2>
                <p className="text-xs text-[#634E3F] mt-0.5">
                  Customers must choose one of these flavor variants on the storefront before adding to cart.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#C45A3C] bg-[#C45A3C]/10 px-2.5 py-1 rounded-full shrink-0">
                {flavors.length} {flavors.length === 1 ? "Option Active" : "Options Active"}
              </span>
            </div>

            {/* Quick-Add Preset Flavors */}
            <div className="space-y-1.5 pt-1 border-t border-[#E8DCCF]/60">
              <span className="text-[11px] font-semibold text-[#634E3F] block">
                Quick-Add Popular Flavors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Dark",
                  "White Milk",
                  "Chochonut",
                  "Dark 72%",
                  "Milk Chocolate",
                  "White Vanilla",
                  "Roasted Pistachio Slab",
                  "Custom Blend",
                ].map((preset) => {
                  const alreadyAdded = flavors.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => {
                        if (!alreadyAdded) setFlavors((prev) => [...prev, preset]);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                        alreadyAdded
                          ? "bg-[#FAF7F2] text-[#634E3F]/40 border border-[#E8DCCF]/40 cursor-not-allowed"
                          : "bg-[#FAF7F2] hover:bg-[#D4A853]/20 hover:text-[#1C140D] text-[#634E3F] border border-[#E8DCCF] hover:border-[#D4A853]"
                      }`}
                    >
                      {alreadyAdded ? `✓ ${preset}` : `+ ${preset}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Flavor Badges */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#1C140D] block">
                Current Active Flavors on Product Page:
              </span>
              <div className="flex flex-wrap gap-2">
                {flavors.map((flv, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C140D] text-xs font-semibold text-[#FAF7F2] border border-[#38281B] shadow-xs"
                  >
                    <span>{flv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFlavor(idx)}
                      className="p-0.5 text-[#E8DCCF]/70 hover:text-red-400 rounded-full transition-colors"
                      title={`Remove ${flv}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {flavors.length === 0 && (
                  <p className="text-xs text-red-600 font-medium">At least one flavor variant is required.</p>
                )}
              </div>
            </div>

            {/* Custom Flavor Text Input */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#E8DCCF]/60">
              <input
                type="text"
                value={newFlavorInput}
                onChange={(e) => setNewFlavorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFlavor();
                  }
                }}
                placeholder="Type custom flavor name (e.g., Hazelnut Truffle, Rose Berry)"
                className="flex-1 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D] focus:outline-hidden focus:border-[#C45A3C]"
              />
              <button
                type="button"
                onClick={handleAddFlavor}
                className="px-4 py-2 rounded-xl bg-[#1C140D] hover:bg-[#C45A3C] text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
              >
                Add Custom Flavor
              </button>
            </div>
          </div>

          {/* 4. Ingredients & Flavor Notes */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C140D]">Ingredients & flavor notes</h2>
              <p className="text-xs text-[#634E3F]">Precise confectionery formulations and customer tasting notes.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Ingredients</label>
              <textarea
                rows={2}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3 text-xs text-[#1C140D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Allergen statement</label>
                <input
                  type="text"
                  value={allergensStr}
                  onChange={(e) => setAllergensStr(e.target.value)}
                  placeholder="Enter allergens (Dairy, Tree nuts, etc.)"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Flavor notes</label>
                <input
                  type="text"
                  value={flavorNotesStr}
                  onChange={(e) => setFlavorNotesStr(e.target.value)}
                  placeholder="Enter flavor notes separated by commas"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>
            </div>
          </div>

          {/* 5. Search Engine Listing */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-[#1C140D]">Search engine listing</h2>
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DCCF]/60">
              <span className="text-[10px] font-mono text-[#634E3F]/80">
                chocoblissbytasnim.com/shop/{slug || "url-handle"}
              </span>
              <h3 className="text-sm font-bold text-[#1C140D] mt-0.5">
                {name || "Product Title"} | Chocobliss by Tasnim
              </h3>
              <p className="text-xs text-[#634E3F] mt-1 line-clamp-2">
                {description || "Handcrafted artisanal luxury confectionery crafted with passion by Tasnim."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">URL handle (slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Enter URL handle slug"
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs font-mono text-[#1C140D]"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Publishing, Organization, Readiness, Danger Zone) */}
        <div className="space-y-6">
          {/* Publishing Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1C140D]">Publishing</h2>

            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">Status</label>
              <select
                value={isPublished ? "Active" : "Draft"}
                onChange={(e) => setIsPublished(e.target.value === "Active")}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1C140D]"
              >
                <option value="Active">Active - Live on storefront</option>
                <option value="Draft">Draft - Hidden from storefront</option>
              </select>
            </div>

            <div className="pt-2 border-t border-[#FAF7F2] space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-[#1C140D]">Featured on Homepage</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-[#1C140D]">Available for Gifting</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C] w-4 h-4"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-[#E8DCCF] space-y-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSubmit(isPublished)}
                className="w-full py-2.5 rounded-xl bg-[#C45A3C] text-white text-xs font-semibold hover:bg-[#b04f33] transition-colors shadow-xs"
              >
                {isPending ? "Processing..." : "Publish updates"}
              </button>
              {slug && (
                <Link
                  href={`/shop/${slug}`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#634E3F] hover:bg-[#FAF7F2] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview product</span>
                </Link>
              )}
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1C140D]">Organization</h2>
            
            <div>
              <label className="block text-xs font-semibold text-[#1C140D] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1C140D] focus:outline-none focus:ring-2 focus:ring-[#C45A3C]"
              >
                <option value="Bar">Bar</option>
                <option value="Customized Bar">Customized Bar</option>
                <option value="mini">mini</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#634E3F] block">Vendor</span>
              <span className="text-xs font-bold text-[#1C140D]">Chocobliss by Tasnim</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#634E3F] block">Studio Location</span>
              <span className="text-xs text-[#1C140D]">Dhaka Artisan Confectionery</span>
            </div>
          </div>

          {/* Product Readiness */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1C140D]">Product readiness</h2>
              <span className="text-xs font-bold text-emerald-700">{readinessPercent}%</span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#E8DCCF]/50">
              <div
                style={{ width: `${readinessPercent}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              ></div>
            </div>
            <ul className="text-xs text-[#634E3F] space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${name && description ? "text-emerald-600" : "text-[#E8DCCF]"}`} />
                <span>Title & description</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${images.length > 0 ? "text-emerald-600" : "text-[#E8DCCF]"}`} />
                <span>Images uploaded</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${price ? "text-emerald-600" : "text-[#E8DCCF]"}`} />
                <span>Pricing & VAT</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${sku && inventory ? "text-emerald-600" : "text-[#E8DCCF]"}`} />
                <span>Inventory & SKU</span>
              </li>
            </ul>
          </div>

          {/* Danger Zone (Edit mode only) */}
          {isEdit && (
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-rose-900">Danger zone</h2>
              <p className="text-xs text-rose-800/80">Soft deletion preserves historic order relations while removing item from store.</p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
                >
                  Delete product...
                </button>
              ) : (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-rose-200 animate-in fade-in">
                  <p className="text-xs font-bold text-rose-900">Confirm deletion</p>
                  <p className="text-[11px] text-[#634E3F]">Type <span className="font-mono font-bold text-rose-700">DELETE</span> to confirm:</p>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-1.5 rounded-lg border border-[#E8DCCF] text-xs font-semibold text-[#634E3F]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
