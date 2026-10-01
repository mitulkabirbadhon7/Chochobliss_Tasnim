"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SessionService } from "@/lib/auth/session";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
} from "@/lib/validations/order";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  handleActionError,
  type ActionResult,
} from "@/lib/errors";
import { Prisma } from "@prisma/client";

function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag, "default");
  } catch {
    // Silently proceed when running in standalone unit test runner
  }
}

/**
 * Generates an artisanal human-readable order number.
 * Format: CB-YYYY-XXXX (e.g. CB-2026-7842)
 */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = Date.now().toString(36).slice(-3).toUpperCase();
  return `CB-${year}-${randomSuffix}${timeSuffix}`;
}

export interface OrderItemSummary {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  selectedFlavor?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  cocoaPointsEarned: number;
  cocoaPointsRedeemed: number;
  shippingAddress: unknown;
  giftNote: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  items?: OrderItemSummary[];
}

/**
 * Creates an order with strict server-side price verification and atomic inventory decrements.
 *
 * Security Guarantees:
 * 1. User ID is extracted exclusively from the authenticated session (client cannot spoof).
 * 2. Prices, subtotals, and total amounts are calculated from authoritative DB product records.
 * 3. Atomic transaction prevents inventory overselling and concurrency race conditions.
 * 4. Product snapshots (name, image, price, selectedFlavor) are permanently frozen in OrderItem.
 */
export async function createOrder(
  rawInput: unknown
): Promise<ActionResult<{ orderId: string; orderNumber: string; totalAmount: number }>> {
  try {
    // 1. Session Authentication
    const currentUser = await SessionService.getCurrentUser();
    if (!currentUser) {
      throw new AuthenticationError("You must be logged in to place an order.");
    }

    // 2. Token-Bucket Rate Limiting (Capacity: 10, Refill: 1 token / 2s)
    await enforceRateLimit("order:create", currentUser.id);

    // 3. Strict Input Validation (Client can only supply item IDs, quantities, address, paymentMethod)
    const validation = createOrderSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid order details.",
        validation.error.issues
      );
    }

    const input: CreateOrderInput = validation.data;

    // Consolidate duplicate products + flavors in the cart if any
    const itemMap = new Map<string, { productId: string; selectedFlavor: string | null; quantity: number }>();
    for (const item of input.items) {
      const key = `${item.productId}::${item.selectedFlavor || ""}`;
      const existing = itemMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        itemMap.set(key, {
          productId: item.productId,
          selectedFlavor: item.selectedFlavor || null,
          quantity: item.quantity,
        });
      }
    }
    const consolidatedItems = Array.from(itemMap.values());
    const productIds = Array.from(new Set(consolidatedItems.map((i) => i.productId)));

    // 4. Retrieve authoritative product records from PostgreSQL
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null, // Exclude soft-deleted products
      },
    });

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Check total inventory required per product across all flavor variants
    const totalQtyPerProduct = new Map<string, number>();
    for (const item of consolidatedItems) {
      totalQtyPerProduct.set(
        item.productId,
        (totalQtyPerProduct.get(item.productId) || 0) + item.quantity
      );
    }

    // 5. Validate availability, publishing status, flavor availability, and inventory
    for (const item of consolidatedItems) {
      const product = dbProductMap.get(item.productId);

      if (!product) {
        throw new ValidationError("One or more items in your cart are no longer available.");
      }

      if (!product.isPublished) {
        throw new ValidationError(`"${product.name}" is currently unavailable for purchase.`);
      }

      // Validate selected flavor is available for this product if product defines flavors
      if (product.flavors && product.flavors.length > 0) {
        if (!item.selectedFlavor) {
          throw new ValidationError(`Please select an available flavor for "${product.name}".`);
        }
        if (!product.flavors.includes(item.selectedFlavor)) {
          throw new ValidationError(
            `Flavor "${item.selectedFlavor}" is not available for "${product.name}". Available options: ${product.flavors.join(", ")}`
          );
        }
      }

      const totalRequired = totalQtyPerProduct.get(item.productId) || item.quantity;
      if (product.inventory < totalRequired) {
        throw new ValidationError(
          `Insufficient stock for "${product.name}". Only ${product.inventory} available.`
        );
      }
    }

    // 6. Authoritative Pricing Calculation Server-Side
    let orderSubtotalDecimal = new Prisma.Decimal(0);
    const orderItemsToCreate: Array<{
      productId: string;
      productName: string;
      productImage: string | null;
      selectedFlavor: string | null;
      unitPrice: Prisma.Decimal;
      quantity: number;
      subtotal: Prisma.Decimal;
    }> = [];

    for (const item of consolidatedItems) {
      const product = dbProductMap.get(item.productId)!;
      // Use salePrice if active, otherwise regular price
      const unitPriceDecimal = product.salePrice != null ? product.salePrice : product.price;
      const itemSubtotalDecimal = unitPriceDecimal.mul(item.quantity);

      orderSubtotalDecimal = orderSubtotalDecimal.add(itemSubtotalDecimal);

      orderItemsToCreate.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || null,
        selectedFlavor: item.selectedFlavor || null,
        unitPrice: unitPriceDecimal,
        quantity: item.quantity,
        subtotal: itemSubtotalDecimal,
      });
    }

    // Shipping Fee Policy: Flat $15 delivery fee; Free on orders of $100 or more
    const freeShippingThreshold = new Prisma.Decimal(100);
    const standardShippingFee = new Prisma.Decimal(15);
    const shippingFeeDecimal = orderSubtotalDecimal.gte(freeShippingThreshold)
      ? new Prisma.Decimal(0)
      : standardShippingFee;

    // Cocoa Points Redemption: 100 points = $5.00 discount ($0.05 / point)
    let pointsToRedeem = 0;
    let discountAmountDecimal = new Prisma.Decimal(0);

    if (input.cocoaPointsToRedeem && input.cocoaPointsToRedeem > 0) {
      // Fetch latest user points from DB to prevent stale session exploits
      const freshUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { cocoaPoints: true },
      });

      const availablePoints = freshUser?.cocoaPoints || 0;
      if (input.cocoaPointsToRedeem > availablePoints) {
        throw new ValidationError(
          `Cannot redeem ${input.cocoaPointsToRedeem} points. Your balance is ${availablePoints} points.`
        );
      }

      // Max discount cannot exceed subtotal
      const maxDiscountValue = orderSubtotalDecimal;
      const requestedDiscountValue = new Prisma.Decimal(input.cocoaPointsToRedeem).mul(new Prisma.Decimal(0.05));

      if (requestedDiscountValue.gte(maxDiscountValue)) {
        discountAmountDecimal = maxDiscountValue;
        pointsToRedeem = Math.ceil(Number(maxDiscountValue.div(new Prisma.Decimal(0.05))));
      } else {
        discountAmountDecimal = requestedDiscountValue;
        pointsToRedeem = input.cocoaPointsToRedeem;
      }
    }

    // Total Amount Calculation
    const totalAmountDecimal = orderSubtotalDecimal
      .add(shippingFeeDecimal)
      .sub(discountAmountDecimal);

    // Points Earned: 1 Cocoa Point per whole dollar of totalAmount
    const cocoaPointsEarned = Math.max(0, Math.floor(Number(totalAmountDecimal)));

    const orderNumber = generateOrderNumber();

    // 7. Atomic Database Transaction
    // Ensures all inventory decrements, order creation, items, and loyalty points succeed together
    const createdOrder = await prisma.$transaction(async (tx) => {
      // a. Concurrently decrement inventory with atomic condition guard across variants
      for (const [productId, qty] of totalQtyPerProduct.entries()) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: productId,
            inventory: { gte: qty }, // Prevents race condition overselling
          },
          data: {
            inventory: { decrement: qty },
          },
        });

        if (updateResult.count === 0) {
          throw new ValidationError(
            `Unable to reserve stock for item. Inventory was changed by another order.`
          );
        }
      }

      // b. Create Order & Line Item Snapshots
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUser.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: input.paymentMethod,
          subtotal: orderSubtotalDecimal,
          shippingFee: shippingFeeDecimal,
          discountAmount: discountAmountDecimal,
          totalAmount: totalAmountDecimal,
          cocoaPointsEarned,
          cocoaPointsRedeemed: pointsToRedeem,
          shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
          giftNote: input.giftNote || null,
          items: {
            create: orderItemsToCreate,
          },
        },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
        },
      });

      // c. Update User Cocoa Points
      const netPointsDiff = cocoaPointsEarned - pointsToRedeem;
      if (netPointsDiff !== 0) {
        await tx.user.update({
          where: { id: currentUser.id },
          data: {
            cocoaPoints: { increment: netPointsDiff },
          },
        });
      }

      return order;
    });

    // 8. Invalidate Caches
    safeRevalidateTag("products");
    safeRevalidateTag("orders");

    return {
      success: true,
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        totalAmount: Number(createdOrder.totalAmount),
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Retrieves the current customer's order history.
 * Authenticated user can ONLY view their own orders.
 */
export async function getUserOrders(): Promise<ActionResult<OrderSummary[]>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to view your orders.");
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    const formatted: OrderSummary[] = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      subtotal: Number(o.subtotal),
      shippingFee: Number(o.shippingFee),
      discountAmount: Number(o.discountAmount),
      totalAmount: Number(o.totalAmount),
      cocoaPointsEarned: o.cocoaPointsEarned,
      cocoaPointsRedeemed: o.cocoaPointsRedeemed,
      shippingAddress: o.shippingAddress,
      giftNote: o.giftNote,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        productImage: i.productImage,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      })),
    }));

    return { success: true, data: formatted };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Retrieves order details by ID with strict ownership verification.
 */
export async function getOrderById(orderId: string): Promise<ActionResult<OrderSummary>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to view this order.");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    // Ownership check: Only order owner or verified ADMIN can access order
    if (order.userId !== user.id && user.role !== "ADMIN") {
      throw new AuthorizationError("You do not have permission to view this order.");
    }

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        cocoaPointsEarned: order.cocoaPointsEarned,
        cocoaPointsRedeemed: order.cocoaPointsRedeemed,
        shippingAddress: order.shippingAddress,
        giftNote: order.giftNote,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        items: order.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          unitPrice: Number(i.unitPrice),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
        })),
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Updates order status and tracking info.
 * Restricted strictly to verified ADMIN users.
 */
export async function updateOrderStatus(rawInput: unknown): Promise<ActionResult<{ success: boolean; id: string }>> {
  try {
    const admin = await AdminGuard.verifyAdmin();
    await enforceRateLimit("order:status:update", admin.id);

    const validation = updateOrderStatusSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid status update data.",
        validation.error.issues
      );
    }

    const input: UpdateOrderStatusInput = validation.data;

    const existingOrder = await prisma.order.findUnique({
      where: { id: input.orderId },
    });

    if (!existingOrder) {
      throw new NotFoundError("Order not found.");
    }

    await prisma.order.update({
      where: { id: input.orderId },
      data: {
        status: input.status,
        paymentStatus: input.paymentStatus ?? existingOrder.paymentStatus,
        trackingNumber: input.trackingNumber ?? existingOrder.trackingNumber,
        notes: input.notes ?? existingOrder.notes,
      },
    });

    safeRevalidateTag("orders");

    return {
      success: true,
      data: { success: true, id: input.orderId },
    };
  } catch (error) {
    return handleActionError(error);
  }
}
