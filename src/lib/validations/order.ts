import { z } from "zod";

/**
 * Zod schemas for Order creation and management.
 * Note: Never accept unitPrice, totalAmount, subtotal, or userId from the client.
 */

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name is too long."),
  phone: z
    .string()
    .trim()
    .min(6, "Valid phone number is required.")
    .max(20, "Phone number is too long."),
  street: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters.")
    .max(200, "Street address is too long."),
  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(100, "City name is too long."),
  state: z
    .string()
    .trim()
    .min(2, "State or region is required.")
    .max(100, "State name is too long."),
  postalCode: z
    .string()
    .trim()
    .min(2, "Postal code is required.")
    .max(20, "Postal code is too long."),
  country: z
    .string()
    .trim()
    .min(2, "Country is required.")
    .max(100, "Country name is too long.")
    .default("Bangladesh"),
});

export const orderItemInputSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required."),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1.")
    .max(50, "Maximum 50 units per item."),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemInputSchema)
    .min(1, "Order must contain at least one product.")
    .max(50, "Order cannot exceed 50 distinct items."),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z
    .enum(["CARD", "COD", "BKASH", "NAGAD"], {
      message: "Payment method must be CARD, COD, BKASH, or NAGAD.",
    })
    .default("CARD"),
  giftNote: z
    .string()
    .trim()
    .max(500, "Gift note cannot exceed 500 characters.")
    .nullable()
    .optional(),
  cocoaPointsToRedeem: z.coerce
    .number()
    .int()
    .min(0, "Points to redeem cannot be negative.")
    .default(0),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required."),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
