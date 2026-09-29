"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  Archive,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAdminProductsAction,
  bulkUpdateProductsAction,
  type AdminProductFilter,
} from "@/lib/actions/admin";
import { deleteProduct } from "@/lib/actions/products";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  inventory: number;
  category: string;
  isPublished: boolean;
  deletedAt: Date | null;
  images: string[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [statusTab, setStatusTab] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<AdminProductFilter["sortBy"]>("updated");
  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    lowStock: 0,
    drafts: 0,
    archived: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalCount: 0,
    totalPages: 1,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    const res = await getAdminProductsAction({
      status: statusTab as AdminProductFilter["status"],
      category: categoryFilter !== "All" ? categoryFilter : undefined,
      search: searchQuery || undefined,
      sortBy,
      page: currentPage,
      limit: 15,
    });

    if (res.success && res.data) {
      setProducts(res.data.products as unknown as ProductRow[]);
      setCounts(res.data.counts);
      setPagination(res.data.pagination);
    }
  };

  useEffect(() => {
    startTransition(() => {
      fetchProducts();
    });
  }, [statusTab, categoryFilter, sortBy, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    startTransition(() => {
      fetchProducts();
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: "set_active" | "set_draft" | "archive" | "delete") => {
    if (selectedIds.length === 0) return;
    const res = await bulkUpdateProductsAction(selectedIds, action);
    if (res.success) {
      setMessage(`Successfully updated ${selectedIds.length} products.`);
      setSelectedIds([]);
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteSingle = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to soft-delete "${name}"?`)) return;
    const res = await deleteProduct(id);
    if (res.success) {
      setMessage(`"${name}" was safely archived.`);
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C140D]">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-[#634E3F] mt-1 font-medium">
            Manage Chocobliss products, inventory, pricing and availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert("Products CSV exported successfully.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#634E3F]" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* 5 Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          onClick={() => {
            setStatusTab("all");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusTab === "all"
              ? "border-[#C45A3C] bg-white shadow-sm ring-1 ring-[#C45A3C]"
              : "border-[#E8DCCF] bg-white hover:bg-[#FAF7F2]"
          }`}
        >
          <span className="text-[11px] font-medium text-[#634E3F] block">All products</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.all}
          </div>
        </button>

        <button
          onClick={() => {
            setStatusTab("active");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusTab === "active"
              ? "border-emerald-500 bg-white shadow-sm ring-1 ring-emerald-500"
              : "border-[#E8DCCF] bg-white hover:bg-[#FAF7F2]"
          }`}
        >
          <span className="text-[11px] font-medium text-emerald-700 block">Active</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.active}
          </div>
        </button>

        <button
          onClick={() => {
            setStatusTab("low-stock");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusTab === "low-stock"
              ? "border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-500"
              : "border-amber-200 bg-[#FDF9F3] hover:bg-amber-50/80"
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-800 flex items-center justify-between">
            <span>Low stock</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.lowStock}
          </div>
        </button>

        <button
          onClick={() => {
            setStatusTab("draft");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusTab === "draft"
              ? "border-zinc-400 bg-white shadow-sm ring-1 ring-zinc-400"
              : "border-[#E8DCCF] bg-white hover:bg-[#FAF7F2]"
          }`}
        >
          <span className="text-[11px] font-medium text-[#634E3F] block">Drafts</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.drafts}
          </div>
        </button>

        <button
          onClick={() => {
            setStatusTab("archived");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusTab === "archived"
              ? "border-rose-400 bg-white shadow-sm ring-1 ring-rose-400"
              : "border-[#E8DCCF] bg-white hover:bg-[#FAF7F2]"
          }`}
        >
          <span className="text-[11px] font-medium text-[#634E3F] block">Archived</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.archived}
          </div>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-[#E8DCCF] shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="px-6 pt-4 border-b border-[#E8DCCF] flex items-center gap-6 overflow-x-auto">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "active", label: "Active", count: counts.active },
            { id: "draft", label: "Draft", count: counts.drafts },
            { id: "archived", label: "Archived", count: counts.archived },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#C45A3C] text-[#C45A3C]"
                    : "border-transparent text-[#634E3F] hover:text-[#1C140D]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-[#C45A3C] text-white" : "bg-[#FAF7F2] text-[#634E3F]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8DCCF] bg-[#FAF7F2]/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
            <Search className="w-4 h-4 text-[#634E3F]/60 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, SKU or category..."
              className="w-full bg-white border border-[#E8DCCF] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C140D] placeholder-[#634E3F]/60 focus:outline-none focus:ring-2 focus:ring-[#C45A3C] shadow-2xs"
            />
          </form>

          <div className="w-full md:w-auto flex items-center gap-2 justify-end">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-medium text-[#1C140D] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#C45A3C]"
            >
              <option value="All">All Categories</option>
              <option value="Truffles">Truffles</option>
              <option value="Bars">Chocolate bars</option>
              <option value="Gift Boxes">Gift boxes</option>
              <option value="Bites">Bites</option>
              <option value="Seasonal">Seasonal</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as AdminProductFilter["sortBy"])}
              className="bg-white border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-medium text-[#1C140D] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#C45A3C]"
            >
              <option value="updated">Sort: Updated</option>
              <option value="price_asc">Sort: Price (Low → High)</option>
              <option value="price_desc">Sort: Price (High → Low)</option>
              <option value="inventory">Sort: Stock Level</option>
              <option value="name">Sort: Product Name</option>
            </select>
          </div>
        </div>

        {/* Selected Items Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#FAF2EB] border-b border-[#E8DCCF] px-6 py-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C45A3C]">
              <span>{selectedIds.length} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkAction("set_active")}
                className="px-3 py-1.5 rounded-lg border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors"
              >
                Set active
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction("set_draft")}
                className="px-3 py-1.5 rounded-lg border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors"
              >
                Set draft
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction("archive")}
                className="px-3 py-1.5 rounded-lg border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-2xs"
              >
                Delete
              </button>
            </div>
            <div className="text-[11px] text-[#634E3F]/80">
              Soft deletion preserves historical customer order records.
            </div>
          </div>
        )}

        {/* Notifications / Toast */}
        {message && (
          <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-6 py-2.5 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Product Listing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DCCF] text-[10px] uppercase font-bold text-[#634E3F] tracking-wider bg-[#FAF7F2]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === products.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C]"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Inventory</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCF]/60">
              {products.length > 0 ? (
                products.map((p) => {
                  const isLow = p.inventory <= 10;
                  const isArchived = p.deletedAt !== null;
                  const isDraft = !p.isPublished && !isArchived;
                  const isActive = p.isPublished && !isArchived;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors group">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => handleSelectOne(p.id)}
                          className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C]"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] overflow-hidden shrink-0 flex items-center justify-center font-serif text-sm font-bold text-[#634E3F]">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "CB"
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-bold text-[#1C140D] hover:text-[#C45A3C] transition-colors"
                            >
                              {p.name}
                            </Link>
                            <div className="text-[11px] font-mono text-[#634E3F]/70">
                              {p.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#634E3F]">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1C140D]">
                        ৳{p.price.toLocaleString()}
                        {p.salePrice && (
                          <span className="block text-[10px] text-[#C45A3C] line-through font-normal">
                            ৳{p.salePrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            isLow ? "text-amber-700 font-bold" : "text-[#1C140D]"
                          }`}
                        >
                          {p.inventory}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isArchived ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Archived
                          </span>
                        ) : isDraft ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                            Draft
                          </span>
                        ) : isLow ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Low stock
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] text-[#634E3F] hover:text-[#1C140D] transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/shop/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] text-[#634E3F] hover:text-[#1C140D] transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(p.id, p.name)}
                              className="p-1.5 rounded-lg border border-[#E8DCCF] bg-white hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Archive / Soft Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#634E3F]">
                    No products found matching your current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E8DCCF] bg-[#FAF7F2]/40 flex items-center justify-between text-xs text-[#634E3F]">
          <span>
            Showing {products.length > 0 ? (currentPage - 1) * pagination.limit + 1 : 0}–
            {Math.min(currentPage * pagination.limit, pagination.totalCount)} of{" "}
            {pagination.totalCount} products
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#C45A3C] text-white"
                    : "border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] text-[#1C140D]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
