import { z } from "zod";

export const brokerInteractionSchema = z.object({
  brokerId: z.string().uuid("Invalid broker ID"),
  subject: z.string().min(1).max(255),
  notes: z.string().optional().or(z.literal("")),
  communicationType: z.enum(["Call", "Email", "WhatsApp", "In-Person", "Meeting"]),
});

export const brokerInteractionUpdateSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  notes: z.string().optional().or(z.literal("")),
  communicationType: z.enum(["Call", "Email", "WhatsApp", "In-Person", "Meeting"]).optional(),
});

export type BrokerInteractionCreate = z.infer<typeof brokerInteractionSchema>;
export type BrokerInteractionUpdate = z.infer<typeof brokerInteractionUpdateSchema>;
