"use server";

import { prisma } from "@/lib/prisma";
import { SessionService } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  type UpdateProfileInput,
  type AddressInput,
  type UpdateAddressInput,
} from "@/lib/validations/user";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  handleActionError,
  type ActionResult,
} from "@/lib/errors";

/**
 * Updates profile details for the authenticated user.
 */
export async function updateProfileAction(
  rawInput: unknown
): Promise<ActionResult<{ id: string; name: string | null; phone: string | null }>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to update your profile.");
    }

    await enforceRateLimit("user:update:profile", user.id);

    const validation = updateProfileSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid profile data.",
        validation.error.issues
      );
    }

    const input: UpdateProfileInput = validation.data;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Retrieves saved addresses for the authenticated user.
 */
export async function getUserAddressesAction(): Promise<
  ActionResult<Array<{
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
  }>>
> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to view your addresses.");
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: addresses };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Adds a new shipping address for the authenticated user.
 */
export async function addAddressAction(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to save an address.");
    }

    await enforceRateLimit("user:add:address", user.id);

    const validation = addressSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid address data.",
        validation.error.issues
      );
    }

    const input: AddressInput = validation.data;

    const created = await prisma.$transaction(async (tx) => {
      // If this address is set as default, clear any previous default
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: user.id,
          label: input.label,
          fullName: input.fullName,
          street: input.street,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          phone: input.phone,
          isDefault: input.isDefault,
        },
        select: { id: true },
      });
    });

    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Deletes a saved address with ownership verification.
 */
export async function deleteAddressAction(addressId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to manage addresses.");
    }

    if (!addressId || typeof addressId !== "string") {
      throw new ValidationError("Valid address ID is required.");
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundError("Address not found.");
    }

    if (address.userId !== user.id) {
      throw new AuthorizationError("You cannot delete another user's address.");
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Updates an existing address with strict ownership verification.
 */
export async function updateAddressAction(rawInput: unknown): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to update an address.");
    }

    await enforceRateLimit("user:update:address", user.id);

    const validation = updateAddressSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid address data.",
        validation.error.issues
      );
    }

    const input: UpdateAddressInput = validation.data;

    const existing = await prisma.address.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundError("Address not found.");
    }

    if (existing.userId !== user.id) {
      throw new AuthorizationError("You cannot modify another user's address.");
    }

    await prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      await tx.address.update({
        where: { id: input.id },
        data: {
          ...(input.label && { label: input.label }),
          ...(input.fullName && { fullName: input.fullName }),
          ...(input.street && { street: input.street }),
          ...(input.city && { city: input.city }),
          ...(input.state && { state: input.state }),
          ...(input.postalCode && { postalCode: input.postalCode }),
          ...(input.country && { country: input.country }),
          ...(input.phone && { phone: input.phone }),
          ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        },
      });
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Sets an address as the default address with strict ownership verification.
 */
export async function setDefaultAddressAction(addressId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to update default address.");
    }

    if (!addressId || typeof addressId !== "string") {
      throw new ValidationError("Valid address ID is required.");
    }

    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new NotFoundError("Address not found.");
    }

    if (existing.userId !== user.id) {
      throw new AuthorizationError("You cannot modify another user's address.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

