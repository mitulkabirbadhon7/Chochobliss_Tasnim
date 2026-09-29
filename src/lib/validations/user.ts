import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long.")
    .optional(),
  phone: z
    .string()
    .trim()
    .min(6, "Valid phone number required.")
    .max(20, "Phone number is too long.")
    .nullable()
    .optional(),
  avatarUrl: z.string().url("Avatar must be a valid URL.").nullable().optional(),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Address label is required.").default("Home"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name is too long."),
  street: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters.")
    .max(200, "Street address is too long."),
  city: z.string().trim().min(2, "City is required.").max(100, "City name is too long."),
  state: z.string().trim().min(2, "State is required.").max(100, "State name is too long."),
  postalCode: z.string().trim().min(2, "Postal code is required.").max(20, "Postal code is too long."),
  country: z.string().trim().min(2, "Country is required.").default("Bangladesh"),
  phone: z.string().trim().min(6, "Phone number is required.").max(20, "Phone number is too long."),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  id: z.string().min(1, "Address ID is required."),
  label: z.string().trim().min(1, "Address label is required.").optional(),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(100).optional(),
  street: z.string().trim().min(5, "Street address must be at least 5 characters.").max(200).optional(),
  city: z.string().trim().min(2, "City is required.").max(100).optional(),
  state: z.string().trim().min(2, "State is required.").max(100).optional(),
  postalCode: z.string().trim().min(2, "Postal code is required.").max(20).optional(),
  country: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(6, "Phone number is required.").max(20).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
