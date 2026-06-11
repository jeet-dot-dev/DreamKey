import { z } from "zod";

// ============ LEAD SCHEMA ============
export const leadSchema = z.object({
  name: z
    .string()
    .min(1, "Lead name is required")
    .max(100, "Lead name must be less than 100 characters"),

  phone: z
    .string()
    .length(10, "Please enter a valid 10-digit phone number")
    .regex(/^\d+$/, "Phone number must contain only digits"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),

  whatsapp: z
    .string()
    .length(10, "Please enter a0-digit WhatsApp number")
    .regex(/^\d+$/, "WhatsApp number must contain only digits")
    .optional()
    .or(z.literal(""))
    .nullable(),

  source: z
    .string()
    .optional()
    .or(z.literal(""))
    .nullable(),

  // Budget
  budgetMin: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), "Budget must be a valid number")
    .nullable(),

  budgetMax: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), "Budget must be a valid number")
    .nullable(),

  preferredLocation: z
    .string()
    .optional()
    .or(z.literal(""))
    .nullable(),

  // Property Preferences
  propertyType: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  bedrooms: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  bathrooms: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  minArea: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+(\.\d+)?$/.test(val), "Area must be a valid number")
    .nullable(),

  maxArea: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+(\.\d+)?$/.test(val), "Area must be a valid number")
    .nullable(),

  furnishedType: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  preferredAmenities: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  purchaseTimeline: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  priority: z
    .enum(["HOT", "WARM", "COLD"])
    .default("WARM"),

  notes: z
    .string()
    .optional()
    .or(z.literal(""))
    .nullable(),

  status: z
    .enum(["NEW", "FOLLOW_UP", "NEGOTIATION", "CLOSED", "LOST"])
    .default("NEW"),
})
.refine((data) => {
  if (!data.budgetMin || !data.budgetMax) return true;
  return BigInt(data.budgetMin) <= BigInt(data.budgetMax);
}, {
  message: "Minimum budget cannot exceed Maximum budget",
  path: ["budgetMin"],
})
.refine((data) => {
  if (!data.minArea || !data.maxArea) return true;
  return Number(data.minArea) <= Number(data.maxArea);
}, {
  message: "Minimum area cannot exceed Maximum area",
  path: ["minArea"],
});

export type LeadFormData = z.infer<typeof leadSchema>;
