import { prisma } from "../lib/prisma.js";
import type { Response, Request as ExpressRequest } from "express";
import { leadSchema, leadInsertSchema } from "../schemas/lead.schema.js";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

const serializeLead = (lead: any) => ({
  ...lead,
  budgetMin: lead.budgetMin ? Number(lead.budgetMin) : null,
  budgetMax: lead.budgetMax ? Number(lead.budgetMax) : null,
  minArea: lead.minArea ? Number(lead.minArea) : null,
  maxArea: lead.maxArea ? Number(lead.maxArea) : null,
});

export const createLead = async (req: AuthRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const leadData = leadSchema.safeParse(req.body);
    if (!leadData.success) {
      console.error(`[${timestamp}] Validation errors:`, leadData.error.issues);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: leadData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const insertData = leadInsertSchema.safeParse(leadData.data);
    if (!insertData.success) {
      console.error(`[${timestamp}] Insert validation errors:`, insertData.error.issues);
      return res.status(400).json({
        success: false,
        message: "Invalid lead data for insertion",
        errors: insertData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const newLead = await prisma.lead.create({
      data: insertData.data,
    });

    return res.status(201).json({
      success: true,
      data: serializeLead(newLead),
    });
  } catch (error) {
    console.error(`[${timestamp}] Error creating lead:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to create lead",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLeads = async (req: ExpressRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    const { name, phone, status, page = "1", limit = "10" } = req.query;

    const where: any = {};

    if (name) {
      where.name = { contains: name as string, mode: "insensitive" };
    }

    if (phone) {
      where.phone = { contains: phone as string, mode: "insensitive" };
    }

    if (status) {
      where.status = status as string;
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const leads = await prisma.lead.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.lead.count({ where });
    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: leads.map(serializeLead),
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(`[${timestamp}] Error fetching leads:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLeadById = async (req: ExpressRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    return res.status(200).json({
      success: true,
      data: serializeLead(lead),
    });
  } catch (error) {
    console.error(`[${timestamp}] Error fetching lead:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }

    const leadData = leadSchema.safeParse(req.body);
    if (!leadData.success) {
      console.error(`[${timestamp}] Validation errors:`, leadData.error.issues);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: leadData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const transformedData = leadInsertSchema.safeParse(leadData.data);
    if (!transformedData.success) {
      console.error(`[${timestamp}] Insert validation errors:`, transformedData.error.issues);
      return res.status(400).json({
        success: false,
        message: "Invalid lead data",
        errors: transformedData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: transformedData.data,
    });

    return res.status(200).json({
      success: true,
      data: serializeLead(updatedLead),
    });
  } catch (error) {
    console.error(`[${timestamp}] Error updating lead:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateLeadPartial = async (req: AuthRequest, res: Response) => {
  // We can just forward to updateLead since it supports editing all fields and uses safeParse with optional refinements.
  return updateLead(req, res);
};

export const deleteLead = async (req: AuthRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    await prisma.lead.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      data: { id },
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error(`[${timestamp}] Error deleting lead:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete lead",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
