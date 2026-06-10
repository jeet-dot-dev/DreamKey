import { prisma } from "../lib/prisma.js";
import type { Response } from "express";
import type { Request as ExpressRequest } from "express";
import { ownerInteractionSchema, ownerInteractionUpdateSchema } from "../schemas/ownerInteraction.schema.js";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

export const listInteractions = async (req: ExpressRequest, res: Response) => {
  try {
    const { ownerId } = req.query as { ownerId?: string };
    if (!ownerId) {
      return res.status(400).json({ message: "ownerId query parameter is required" });
    }

    const interactions = await prisma.ownerCommunicationLog.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ data: interactions });
  } catch (error) {
    console.error("Error listing owner interactions:", error);
    return res.status(500).json({ message: "Failed to list interactions", error: error instanceof Error ? error.message : String(error) });
  }
};

export const getInteractionById = async (req: ExpressRequest, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "Interaction id is required" });

    const interaction = await prisma.ownerCommunicationLog.findUnique({ where: { id } });
    if (!interaction) return res.status(404).json({ message: "Interaction not found" });

    return res.status(200).json({ data: interaction });
  } catch (error) {
    console.error("Error fetching owner interaction:", error);
    return res.status(500).json({ message: "Failed to fetch interaction", error: error instanceof Error ? error.message : String(error) });
  }
};

export const createInteraction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = ownerInteractionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
    }

    const { ownerId, subject, notes, communicationType } = parsed.data;

    const owner = await prisma.owner.findUnique({ where: { id: ownerId } });
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const created = await prisma.ownerCommunicationLog.create({
      data: { ownerId, subject, notes: notes ?? "", communicationType },
    });

    return res.status(201).json({ message: "Interaction created", data: created });
  } catch (error) {
    console.error("Error creating owner interaction:", error);
    return res.status(500).json({ message: "Failed to create interaction", error: error instanceof Error ? error.message : String(error) });
  }
};

export const updateInteraction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "Interaction id is required" });

    const parsed = ownerInteractionUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });

    const existing = await prisma.ownerCommunicationLog.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Interaction not found" });

    const updated = await prisma.ownerCommunicationLog.update({
      where: { id },
      data: {
        subject: parsed.data.subject ?? existing.subject,
        notes: parsed.data.notes ?? existing.notes,
        communicationType: parsed.data.communicationType ?? existing.communicationType,
      },
    });

    return res.status(200).json({ message: "Interaction updated", data: updated });
  } catch (error) {
    console.error("Error updating owner interaction:", error);
    return res.status(500).json({ message: "Failed to update interaction", error: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteInteraction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ success: false, message: "Interaction id is required" });

    const existing = await prisma.ownerCommunicationLog.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Interaction not found" });

    await prisma.ownerCommunicationLog.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting owner interaction:", error);
    return res.status(500).json({ success: false, message: "Failed to delete interaction" });
  }
};