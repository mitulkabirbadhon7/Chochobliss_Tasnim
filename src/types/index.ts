export type Role = "ADMIN" | "CUSTOMER" | "GUEST";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type BannerType = "PROMO" | "ANNOUNCEMENT" | "ALERT";

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  cocoaPoints: number;
  authProvider: string;
  authProviderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  salePrice?: number | string | null;
  sku: string;
  inventory: number;
  cacaoPercentage?: number | null;
  origin?: string | null;
  flavorNotes: string[];
  ingredients?: string | null;
  allergens: string[];
  weight?: string | null;
  images: string[];
  category: string;
  isFeatured: boolean;
  isPublished: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface ShippingAddressSnapshot {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number | string;
  shippingFee: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  cocoaPointsEarned: number;
  cocoaPointsRedeemed: number;
  shippingAddress: ShippingAddressSnapshot;
  giftNote?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  bannerType: BannerType;
  linkUrl?: string | null;
  bannerImage?: string | null;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };
