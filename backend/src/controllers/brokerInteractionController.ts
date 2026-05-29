import { prisma } from "../lib/prisma.js";
import type { Response } from "express";
import type { Request as ExpressRequest } from "express";
import { brokerInteractionSchema, brokerInteractionUpdateSchema } from "../schemas/brokerInteraction.schema.js";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

export const listInteractions = async (req: ExpressRequest, res: Response) => {
  try {
    const { brokerId } = req.query as { brokerId?: string };
    if (!brokerId) {
      return res.status(400).json({ message: "brokerId query parameter is required" });
    }

    const interactions = await prisma.brokerInteractionLog.findMany({
      where: { brokerId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ data: interactions });
  } catch (error) {
    console.error("Error listing interactions:", error);
    return res.status(500).json({ message: "Failed to list interactions", error: error instanceof Error ? error.message : String(error) });
  }
};

export const getInteractionById = async (req: ExpressRequest, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "Interaction id is required" });

    const interaction = await prisma.brokerInteractionLog.findUnique({ where: { id } });
    if (!interaction) return res.status(404).json({ message: "Interaction not found" });

    return res.status(200).json({ data: interaction });
  } catch (error) {
    console.error("Error fetching interaction:", error);
    return res.status(500).json({ message: "Failed to fetch interaction", error: error instanceof Error ? error.message : String(error) });
  }
};

export const createInteraction = async (req: AuthRequest, res: Response) => {
  try {
    // Require auth for creation
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = brokerInteractionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
    }

    const { brokerId, subject, notes, communicationType } = parsed.data;

    // Ensure broker exists
    const broker = await prisma.broker.findUnique({ where: { id: brokerId } });
    if (!broker) return res.status(404).json({ message: "Broker not found" });

    const created = await prisma.brokerInteractionLog.create({
      data: { brokerId, subject, notes: notes ?? null, communicationType },
    });

    return res.status(201).json({ message: "Interaction created", data: created });
  } catch (error) {
    console.error("Error creating interaction:", error);
    return res.status(500).json({ message: "Failed to create interaction", error: error instanceof Error ? error.message : String(error) });
  }
};

export const updateInteraction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "Interaction id is required" });

    const parsed = brokerInteractionUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });

    const existing = await prisma.brokerInteractionLog.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Interaction not found" });

    const updated = await prisma.brokerInteractionLog.update({
      where: { id },
      data: {
        subject: parsed.data.subject ?? existing.subject,
        notes: parsed.data.notes ?? existing.notes,
        communicationType: parsed.data.communicationType ?? existing.communicationType,
      },
    });

    return res.status(200).json({ message: "Interaction updated", data: updated });
  } catch (error) {
    console.error("Error updating interaction:", error);
    return res.status(500).json({ message: "Failed to update interaction", error: error instanceof Error ? error.message : String(error) });
  }
};
