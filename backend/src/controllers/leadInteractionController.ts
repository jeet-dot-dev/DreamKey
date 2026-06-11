import { prisma } from "../lib/prisma.js";
import type { Response, Request as ExpressRequest } from "express";
import { leadInteractionSchema, leadInteractionUpdateSchema } from "../schemas/leadInteraction.schema.js";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

export const listLeadInteractions = async (req: ExpressRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    const { id: leadId } = req.params as { id: string };
    if (!leadId) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }

    const interactions = await prisma.leadInteraction.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    console.error(`[${timestamp}] Error listing lead interactions:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to list interactions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLeadInteractionById = async (req: ExpressRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ success: false, message: "Interaction ID is required" });
    }

    const interaction = await prisma.leadInteraction.findUnique({
      where: { id },
    });

    if (!interaction) {
      return res.status(404).json({ success: false, message: "Interaction not found" });
    }

    return res.status(200).json({
      success: true,
      data: interaction,
    });
  } catch (error) {
    console.error(`[${timestamp}] Error fetching lead interaction:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createLeadInteraction = async (req: AuthRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id: leadId } = req.params as { id: string };
    if (!leadId) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }

    const parsed = leadInteractionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const { type, subject, notes, followUpDate, outcome } = parsed.data;

    const parsedFollowUpDate = (followUpDate && followUpDate !== "") ? new Date(followUpDate) : null;

    const created = await prisma.leadInteraction.create({
      data: {
        leadId,
        type,
        subject,
        notes,
        followUpDate: parsedFollowUpDate,
        outcome: outcome || null,
      },
    });

    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error(`[${timestamp}] Error creating lead interaction:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to create interaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateLeadInteraction = async (req: AuthRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ success: false, message: "Interaction ID is required" });
    }

    const parsed = leadInteractionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const existing = await prisma.leadInteraction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Interaction not found" });
    }

    const { type, subject, notes, followUpDate, outcome } = parsed.data;

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (subject !== undefined) updateData.subject = subject;
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate !== undefined) {
      updateData.followUpDate = (followUpDate && followUpDate !== "") ? new Date(followUpDate) : null;
    }
    if (outcome !== undefined) updateData.outcome = outcome || null;

    const updated = await prisma.leadInteraction.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(`[${timestamp}] Error updating lead interaction:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to update interaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteLeadInteraction = async (req: AuthRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ success: false, message: "Interaction ID is required" });
    }

    const existing = await prisma.leadInteraction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Interaction not found" });
    }

    await prisma.leadInteraction.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error(`[${timestamp}] Error deleting lead interaction:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete interaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
