import { z } from "zod";

export const ownerInteractionSchema = z.object({
  ownerId: z.string().uuid("Invalid owner ID"),
  subject: z.string().min(1).max(255),
  notes: z.string().optional().or(z.literal("")),
  communicationType: z.enum(["Call", "Email", "WhatsApp", "In-Person", "Meeting"]),
});

export const ownerInteractionUpdateSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  notes: z.string().optional().or(z.literal("")),
  communicationType: z.enum(["Call", "Email", "WhatsApp", "In-Person", "Meeting"]).optional(),
});

export type OwnerInteractionCreate = z.infer<typeof ownerInteractionSchema>;
export type OwnerInteractionUpdate = z.infer<typeof ownerInteractionUpdateSchema>;