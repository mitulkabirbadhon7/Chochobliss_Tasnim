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
  const [category, setCategory] = useState(initialData?.category || "Truffles");
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
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : [
          "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80",
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

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
                placeholder="e.g. Midnight Cacao Truffle Box"
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
                placeholder="A hand-finished collection of single-origin chocolates..."
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3.5 text-xs text-[#1C140D] focus:outline-none focus:ring-2 focus:ring-[#C45A3C] focus:bg-white leading-relaxed"
              />
              <span className="text-[10px] text-[#634E3F]/70">{description.length} characters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-medium text-[#1C140D]"
                >
                  <option value="Truffles">Truffles</option>
                  <option value="Bars">Chocolate bars</option>
                  <option value="Gift Boxes">Gift boxes</option>
                  <option value="Bites">Bites</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Cacao %</label>
                <input
                  type="number"
                  value={cacaoPercentage}
                  onChange={(e) => setCacaoPercentage(e.target.value)}
                  placeholder="e.g. 72"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Weight</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 150g / 5.3 oz"
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
              <span className="text-xs font-semibold text-[#634E3F]">{images.length} images</span>
            </div>

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

            <div className="flex items-center gap-2 pt-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL to add..."
                className="flex-1 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DCCF] text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2]"
              >
                Add Image
              </button>
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
                  placeholder="2450.00"
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
                  placeholder="Optional regular price"
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
                  placeholder="25"
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
                  placeholder="CB-TRF-024"
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
                  placeholder="e.g. Sambirano Valley, Madagascar"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>
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
                  placeholder="Contains nuts, milk"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3.5 py-2 text-xs text-[#1C140D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C140D] mb-1">Flavor notes</label>
                <input
                  type="text"
                  value={flavorNotesStr}
                  onChange={(e) => setFlavorNotesStr(e.target.value)}
                  placeholder="Floral, Red fruit, Honey"
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
                placeholder="midnight-cacao-truffle-box"
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
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-[#1C140D]">Organization</h2>
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
