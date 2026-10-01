"use client";

import React, { useState } from "react";
import {
  addAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/users";
import { maskPhone, maskStreet } from "@/lib/utils/masking";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  ShieldCheck,
  Star,
} from "lucide-react";

export interface AddressItem {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  initialAddresses: AddressItem[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    label: "Home",
    fullName: "",
    street: "",
    city: "Dhaka",
    state: "Dhaka",
    postalCode: "",
    country: "Bangladesh",
    phone: "",
    isDefault: false,
  });

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      label: "Home",
      fullName: "",
      street: "",
      city: "Dhaka",
      state: "Dhaka",
      postalCode: "",
      country: "Bangladesh",
      phone: "",
      isDefault: addresses.length === 0,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingAddress) {
        // Update existing address
        const res = await updateAddressAction({
          id: editingAddress.id,
          ...formData,
        });

        if (!res.success) {
          setErrorMessage(res.error?.message || "Failed to update address.");
          setIsSubmitting(false);
          return;
        }

        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === editingAddress.id) {
              return { ...a, ...formData };
            }
            if (formData.isDefault) {
              return { ...a, isDefault: false };
            }
            return a;
          })
        );
      } else {
        // Create new address
        const res = await addAddressAction(formData);

        if (!res.success) {
          setErrorMessage(res.error.message || "Failed to save address.");
          setIsSubmitting(false);
          return;
        }

        const newAddr: AddressItem = {
          id: res.data.id,
          ...formData,
        };

        setAddresses((prev) => {
          let updated = [...prev];
          if (formData.isDefault) {
            updated = updated.map((a) => ({ ...a, isDefault: false }));
          }
          return [newAddr, ...updated];
        });
      }

      setIsModalOpen(false);
    } catch {
      setErrorMessage("An unexpected error occurred while saving address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery address?")) return;
    try {
      const res = await deleteAddressAction(id);
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await setDefaultAddressAction(id);
      if (res.success) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#634E3F]">
          Manage destinations for climate-controlled chocolate delivery
        </p>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards */}
      {addresses.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <MapPin className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C140D]">No Addresses Saved</h3>
            <p className="text-xs text-[#634E3F] max-w-sm mx-auto mt-1">
              Add your delivery address to enjoy seamless 1-click checkout and insulated courier delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1C140D] text-[#FAF7F2] text-xs font-semibold hover:bg-[#C45A3C] transition shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-[#FFFFFF] rounded-2xl border p-6 shadow-sm flex flex-col justify-between space-y-4 transition ${
                addr.isDefault
                  ? "border-[#D4A853] ring-1 ring-[#D4A853]/40"
                  : "border-[#E8DCCF] hover:border-[#634E3F]/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-bold text-[#1C140D]">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A853]/20 text-[#1C140D]">
                        <Star className="w-3 h-3 text-[#D4A853] fill-[#D4A853]" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="p-1.5 rounded-lg text-[#634E3F] hover:text-[#1C140D] hover:bg-[#FAF7F2] transition"
                      title="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 rounded-lg text-[#634E3F] hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#634E3F] space-y-1">
                  <span className="font-semibold text-[#1C140D] block">{addr.fullName}</span>
                  <span className="block">{maskStreet(addr.street)}</span>
                  <span className="block">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </span>
                  <span className="block font-medium">{addr.country}</span>
                  <span className="block font-mono pt-1 text-[#1C140D]">
                    Phone: {maskPhone(addr.phone)}
                  </span>
                </div>
              </div>

              {!addr.isDefault && (
                <div className="pt-3 border-t border-[#E8DCCF]/60">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-[#C45A3C] hover:underline"
                  >
                    Set as Default Address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#1C140D]">
                {editingAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#634E3F] hover:text-[#1C140D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#634E3F] font-semibold mb-1">
                    Address Label
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:outline-none focus:border-[#C45A3C]"
                    placeholder="Enter your address label (Home, Work, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-[#634E3F] font-semibold mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:outline-none focus:border-[#C45A3C]"
                    placeholder="Enter recipient's full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#634E3F] font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:outline-none focus:border-[#C45A3C]"
                  placeholder="Enter street address and house/apartment details"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#634E3F] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:outline-none focus:border-[#C45A3C]"
                  />
                </div>
                <div>
                  <label className="block text-[#634E3F] font-semibold mb-1">State / Division</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Enter state / division"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:outline-none focus:border-[#C45A3C]"
                  />
                </div>
                <div>
                  <label className="block text-[#634E3F] font-semibold mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:outline-none focus:border-[#C45A3C]"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#634E3F] font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:outline-none focus:border-[#C45A3C]"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-[#634E3F] font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={formData.country}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2]/60 text-[#634E3F]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-[#E8DCCF] text-[#C45A3C] focus:ring-[#C45A3C]"
                />
                <label htmlFor="isDefault" className="text-xs text-[#1C140D] font-medium cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8DCCF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8DCCF] text-[#634E3F] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] font-semibold transition"
                >
                  {isSubmitting ? "Saving..." : editingAddress ? "Save Changes" : "Create Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
