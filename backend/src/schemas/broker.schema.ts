import { z } from "zod";

// ============ BROKER SCHEMA ============
export const brokerSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(3, "Broker name must be at least 3 characters")
    .max(100, "Broker name must be less than 100 characters"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),

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

  status: z
    .enum(["ACTIVE", "INACTIVE", "BLOCKED"])
    .default("ACTIVE"),

  // Budget Range (in BigInt - stored as strings in JSON)
  budgetMin: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), "Budget must be a valid number"),

  budgetMax: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), "Budget must be a valid number"),

  // Areas & Expertise - Stored as JSON array strings
  areaOfOperation: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const areas = val.split(",").map((a) => a.trim()).filter(Boolean);
          return areas.length > 0;
        } catch {
          return false;
        }
      },
      "Please provide at least one area (comma-separated)"
    ),

  societyExpertise: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const societies = val.split(",").map((s) => s.trim()).filter(Boolean);
          return societies.length > 0;
        } catch {
          return false;
        }
      },
      "Please provide at least one society (comma-separated)"
    ),

  notes: z
    .string()
    .optional()
    .or(z.literal("")),

  // Primary Contact Partner (optional User reference)
  primaryContactPartnerId: z
    .string()
    .uuid("Invalid user ID")
    .optional()
    .or(z.literal("")),
});

// Zod infer type
export type BrokerFormData = z.infer<typeof brokerSchema>;

// ============ DATABASE INSERT SCHEMA ============
// This will be converted to JSON arrays before sending to DB
export const brokerInsertSchema = brokerSchema.transform((data) => ({
  name: data.name,
  email: data.email && data.email !== "" ? data.email : null,
  phone: data.phone,
  status: data.status,
  whatsapp: data.whatsapp && data.whatsapp !== "" ? data.whatsapp : null,
  areaOfOperation: data.areaOfOperation
    ? JSON.stringify(
        data.areaOfOperation
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      )
    : null,
  societyExpertise: data.societyExpertise
    ? JSON.stringify(
        data.societyExpertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    : null,
  budgetMin: data.budgetMin ? BigInt(data.budgetMin) : null,
  budgetMax: data.budgetMax ? BigInt(data.budgetMax) : null,
  notes: data.notes && data.notes !== "" ? data.notes : null,
  primaryContactPartnerId:
    data.primaryContactPartnerId && data.primaryContactPartnerId !== ""
      ? data.primaryContactPartnerId
      : null,
}));

export type BrokerInsertData = z.infer<typeof brokerInsertSchema>;
