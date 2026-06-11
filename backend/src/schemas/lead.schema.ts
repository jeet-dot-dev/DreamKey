import { z } from "zod";

// ============ LEAD SCHEMA ============
export const leadSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),

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
    .length(10, "Please enter a valid 10-digit WhatsApp number")
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
    .any()
    .optional()
    .refine((val) => {
      if (val === undefined || val === null || val === "") return true;
      const strVal = String(val);
      return /^\d+$/.test(strVal);
    }, "Budget must be a valid number")
    .nullable(),

  budgetMax: z
    .any()
    .optional()
    .refine((val) => {
      if (val === undefined || val === null || val === "") return true;
      const strVal = String(val);
      return /^\d+$/.test(strVal);
    }, "Budget must be a valid number")
    .nullable(),

  preferredLocation: z
    .string()
    .optional()
    .or(z.literal(""))
    .nullable(),

  // Property Preferences
  propertyType: z
    .enum(["FLAT", "LAND", "WAREHOUSE", "COMMERCIAL", "OTHER"])
    .optional()
    .nullable()
    .or(z.literal("")),

  bedrooms: z
    .any()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    })
    .nullable(),

  bathrooms: z
    .any()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    })
    .nullable(),

  minArea: z
    .any()
    .optional()
    .refine((val) => {
      if (val === undefined || val === null || val === "") return true;
      const strVal = String(val);
      return /^\d+(\.\d+)?$/.test(strVal);
    }, "Area must be a valid number")
    .nullable(),

  maxArea: z
    .any()
    .optional()
    .refine((val) => {
      if (val === undefined || val === null || val === "") return true;
      const strVal = String(val);
      return /^\d+(\.\d+)?$/.test(strVal);
    }, "Area must be a valid number")
    .nullable(),

  furnishedType: z
    .enum(["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"])
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

// ============ DATABASE INSERT SCHEMA ============
export const leadInsertSchema = leadSchema.transform((data) => ({
  name: data.name,
  phone: data.phone,
  email: data.email && data.email !== "" ? data.email : null,
  whatsapp: data.whatsapp && data.whatsapp !== "" ? data.whatsapp : null,
  source: data.source && data.source !== "" ? data.source : null,
  budgetMin: data.budgetMin && data.budgetMin !== "" ? BigInt(data.budgetMin) : null,
  budgetMax: data.budgetMax && data.budgetMax !== "" ? BigInt(data.budgetMax) : null,
  preferredLocation: data.preferredLocation && data.preferredLocation !== "" ? data.preferredLocation : null,
  propertyType: data.propertyType && (data.propertyType as string) !== "" ? data.propertyType as any : null,
  bedrooms: data.bedrooms,
  bathrooms: data.bathrooms,
  minArea: data.minArea && data.minArea !== "" ? data.minArea : null,
  maxArea: data.maxArea && data.maxArea !== "" ? data.maxArea : null,
  furnishedType: data.furnishedType && (data.furnishedType as string) !== "" ? data.furnishedType as any : null,
  preferredAmenities: data.preferredAmenities && data.preferredAmenities !== "" ? data.preferredAmenities : null,
  purchaseTimeline: data.purchaseTimeline && data.purchaseTimeline !== "" ? data.purchaseTimeline : null,
  priority: data.priority,
  notes: data.notes && data.notes !== "" ? data.notes : null,
  status: data.status,
}));

export type LeadInsertData = z.infer<typeof leadInsertSchema>;
