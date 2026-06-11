import { z } from "zod";

export const leadInteractionSchema = z.object({
  type: z.enum([
    "CALL",
    "WHATSAPP",
    "EMAIL",
    "MEETING",
    "SITE_VISIT",
    "NOTE",
    "PROPERTY_SHARED"
  ], {
    message: "Interaction Type is required",
  }),
  subject: z.string().min(1, "Subject is required").max(255, "Subject cannot exceed 255 characters"),
  notes: z.string().min(1, "Notes are required"),
  followUpDate: z.string().nullable().optional().or(z.literal("")),
  outcome: z.string().nullable().optional().or(z.literal("")),
});

export const leadInteractionUpdateSchema = z.object({
  type: z.enum([
    "CALL",
    "WHATSAPP",
    "EMAIL",
    "MEETING",
    "SITE_VISIT",
    "NOTE",
    "PROPERTY_SHARED"
  ]).optional(),
  subject: z.string().min(1, "Subject is required").max(255, "Subject cannot exceed 255 characters").optional(),
  notes: z.string().min(1, "Notes are required").optional(),
  followUpDate: z.string().nullable().optional().or(z.literal("")),
  outcome: z.string().nullable().optional().or(z.literal("")),
});

export type LeadInteractionCreate = z.infer<typeof leadInteractionSchema>;
export type LeadInteractionUpdate = z.infer<typeof leadInteractionUpdateSchema>;
