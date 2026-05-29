import { prisma } from "../lib/prisma.js";
import type { Response } from "express";
import type { Request as ExpressRequest } from "express";
import { ownerInsertSchema, ownerSchema } from "../schemas/owner.schema.js";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

const serializeOwner = (owner: any) => ({
  ...owner,
  preferredRentMin: owner.preferredRentMin ? Number(owner.preferredRentMin) : null,
  preferredRentMax: owner.preferredRentMax ? Number(owner.preferredRentMax) : null,
  preferredPropertyTypes: owner.preferredPropertyTypes ?? null,
  primaryContactPartner: owner.primaryContactPartner
    ? {
        id: owner.primaryContactPartner.id,
        name: owner.primaryContactPartner.username,
        email: owner.primaryContactPartner.email,
      }
    : null,
});

export const addNewOwner = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const ownerData = ownerSchema.safeParse(req.body);
    if (!ownerData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ownerData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const insertData = ownerInsertSchema.safeParse(ownerData.data);
    if (!insertData.success) {
      return res.status(400).json({
        message: "Invalid owner data for insertion",
        errors: insertData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const newOwner = await prisma.owner.create({
      data: {
        ...insertData.data,
        primaryContactPartnerId: req.user.userId,
      },
      include: {
        primaryContactPartner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Owner created successfully",
      owner: serializeOwner(newOwner),
    });
  } catch (error) {
    console.error("Error creating owner:", error);
    return res.status(500).json({
      message: "Failed to create owner",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getOwner = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      status,
      partner,
      page = "1",
      limit = "10",
    } = req.query;

    const where: any = {};

    if (name) {
      where.name = { contains: name as string, mode: "insensitive" };
    }

    if (email) {
      where.email = { contains: email as string, mode: "insensitive" };
    }

    if (phone) {
      where.phone = { contains: phone as string, mode: "insensitive" };
    }

    if (status) {
      where.status = status as string;
    }

    if (partner) {
      where.primaryContactPartner = {
        username: { contains: partner as string, mode: "insensitive" },
      };
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const owners = await prisma.owner.findMany({
      where,
      include: {
        primaryContactPartner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.owner.count({ where });
    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      message: "Owners fetched successfully",
      data: owners.map(serializeOwner),
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching owners:", error);
    return res.status(500).json({
      message: "Failed to fetch owners",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getOwnerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        primaryContactPartner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    return res.status(200).json({
      message: "Owner fetched successfully",
      data: serializeOwner(owner),
    });
  } catch (error) {
    console.error("Error fetching owner:", error);
    return res.status(500).json({
      message: "Failed to fetch owner",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateOwner = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const ownerData = ownerSchema.safeParse(req.body);
    if (!ownerData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ownerData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const existingOwner = await prisma.owner.findUnique({ where: { id } });
    if (!existingOwner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const transformedData = ownerInsertSchema.safeParse(ownerData.data);
    if (!transformedData.success) {
      return res.status(400).json({
        message: "Invalid owner data",
        errors: transformedData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const updatedOwner = await prisma.owner.update({
      where: { id },
      data: {
        ...transformedData.data,
      },
      include: {
        primaryContactPartner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Owner updated successfully",
      owner: serializeOwner(updatedOwner),
    });
  } catch (error) {
    console.error("Error updating owner:", error);
    return res.status(500).json({
      message: "Failed to update owner",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
