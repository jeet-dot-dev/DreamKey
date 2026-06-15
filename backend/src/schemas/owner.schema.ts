import { z } from "zod";

export const ownerSchema = z.object({
  name: z
    .string()
    .min(3, "Owner name must be at least 3 characters")
    .max(100, "Owner name must be less than 100 characters"),

  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),

  phone: z
    .string()
    .length(10, "Please enter a valid 10-digit phone number")
    .regex(/^\d+$/, "Phone number must contain only digits"),

  whatsapp: z
    .string()
    .length(10, "Please enter a valid 10-digit WhatsApp number")
    .regex(/^\d+$/, "WhatsApp number must contain only digits")
    .optional()
    .or(z.literal("")),

  address: z.string().optional().or(z.literal("")),

  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),

  preferredRentMin: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^\d+$/.test(val), "Preferred rent minimum must be a valid number"),

  preferredRentMax: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^\d+$/.test(val), "Preferred rent maximum must be a valid number"),

  preferredPropertyTypes: z.string().optional().or(z.literal("")),

  preferredDealTerms: z.string().optional().or(z.literal("")),

  primaryContactPartnerId: z.string().uuid("Invalid user ID").optional().or(z.literal("")),
});

export type OwnerFormData = z.infer<typeof ownerSchema>;

export const ownerInsertSchema = ownerSchema.transform((data) => ({
  name: data.name,
  phone: data.phone,
  email: data.email && data.email !== "" ? data.email : null,
  whatsapp: data.whatsapp && data.whatsapp !== "" ? data.whatsapp : null,
  address: data.address && data.address !== "" ? data.address : null,
  status: data.status,
  preferredRentMin: data.preferredRentMin ? BigInt(data.preferredRentMin) : null,
  preferredRentMax: data.preferredRentMax ? BigInt(data.preferredRentMax) : null,
  preferredPropertyTypes: data.preferredPropertyTypes
    ? JSON.stringify(
        data.preferredPropertyTypes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      )
    : null,
  preferredDealTerms: data.preferredDealTerms && data.preferredDealTerms !== "" ? data.preferredDealTerms : null,
  primaryContactPartnerId:
    data.primaryContactPartnerId && data.primaryContactPartnerId !== ""
      ? data.primaryContactPartnerId
      : null,
}));

export type OwnerInsertData = z.infer<typeof ownerInsertSchema>;