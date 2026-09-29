export type Role = "ADMIN" | "CUSTOMER" | "GUEST";

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  cocoaPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  images: string[];
  category: string;
  origin?: string;
  cacaoPercentage?: number;
  flavorNotes?: string[];
  isFeatured: boolean;
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
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: string;
  giftNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  bannerImage?: string | null;
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
}
