import { prisma } from "../lib/prisma.js";
import type { Response } from "express";
import type { Request as ExpressRequest } from "express";
import { brokerSchema, brokerInsertSchema } from "../schemas/broker.schema.js";
import { z } from "zod";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

export const addNewBroker = async (req: AuthRequest, res: Response) => {
  try {
    // Check user authentication
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate broker data
    const brokerData = brokerSchema.safeParse(req.body);
    if (!brokerData.success) {
      console.error('Validation errors:', brokerData.error.issues);
      return res.status(400).json({
        message: 'Validation failed',
        errors: brokerData.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Transform and validate for database
    const insertData = brokerInsertSchema.safeParse(brokerData.data);
    if (!insertData.success) {
      console.error('Insert schema validation errors:', insertData.error.issues);
      return res.status(400).json({
        message: 'Invalid broker data for insertion',
        errors: insertData.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Create broker with authenticated user as primary contact
    const newBroker = await prisma.broker.create({
      data: {
        ...insertData.data,
        primaryContactPartnerId: req.user.userId,
      },
    });

    // Serialize BigInt fields to strings for JSON response
    const serializedBroker = {
      ...newBroker,
      budgetMin: newBroker.budgetMin?.toString() || null,
      budgetMax: newBroker.budgetMax?.toString() || null,
    };

    return res.status(201).json({
      message: "Broker created successfully",
      broker: serializedBroker,
    });
  } catch (error) {
    console.error("Error creating broker:", error);
    return res.status(500).json({
      message: "Failed to create broker",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const getBroker = async (req: AuthRequest, res: Response) => {
  try {
    // Extract query parameters for filtering and searching
    const {
      name,
      area,
      status,
      partner,
      budgetMin,
      budgetMax,
      dateFrom,
      dateTo,
      page = '1',
      limit = '10',
    } = req.query;

    // Build Prisma filter conditions
    const where: any = {};

    // Name search (case-insensitive)
    if (name) {
      where.name = {
        contains: name as string,
        mode: 'insensitive',
      };
    }

    // Area search (case-insensitive)
    if (area) {
      where.areaOfOperation = {
        contains: area as string,
        mode: 'insensitive',
      };
    }

    // Status filter
    if (status) {
      where.status = status as string;
    }

    // Partner filter - filter by partner's name
    if (partner) {
      where.primaryContactPartner = {
        username: {
          contains: partner as string,
          mode: 'insensitive',
        },
      };
    }

    // Budget range filter (stored as BigInt in DB)
    if (budgetMin || budgetMax) {
      where.AND = [];
      
      if (budgetMin) {
        // budgetMax should be >= budgetMin
        where.AND.push({
          budgetMax: {
            gte: BigInt(budgetMin as string),
          },
        });
      }
      
      if (budgetMax) {
        // budgetMin should be <= budgetMax
        where.AND.push({
          budgetMin: {
            lte: BigInt(budgetMax as string),
          },
        });
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};

      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }

      if (dateTo) {
        const toDate = new Date(dateTo as string);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Fetch brokers with primary contact partner information
    const brokers = (await prisma.broker.findMany({
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
        createdAt: 'desc',
      },
    })) as any[];

    // Get total count for pagination
    const total = await prisma.broker.count({ where });
    const totalPages = Math.ceil(total / limitNum);

    // Serialize BigInt fields to strings/numbers for JSON response
    const serializedBrokers = brokers.map((broker) => ({
      ...broker,
      budgetMin: broker.budgetMin ? Number(broker.budgetMin) : null,
      budgetMax: broker.budgetMax ? Number(broker.budgetMax) : null,
      primaryContactPartner: broker.primaryContactPartner
        ? {
            id: broker.primaryContactPartner.id,
            name: broker.primaryContactPartner.username,
            email: broker.primaryContactPartner.email,
          }
        : null,
    }));

    return res.status(200).json({
      message: 'Brokers fetched successfully',
      data: serializedBrokers,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
   console.error(error);
    return res.status(500).json({
      message: 'Failed to fetch brokers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBrokerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    if (!id) {
      return res.status(400).json({ message: 'Broker ID is required' });
    }

    const broker = (await prisma.broker.findUnique({
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
    })) as any;

    if (!broker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    const serializedBroker = {
      ...broker,
      budgetMin: broker.budgetMin ? Number(broker.budgetMin) : null,
      budgetMax: broker.budgetMax ? Number(broker.budgetMax) : null,
      primaryContactPartner: broker.primaryContactPartner
        ? {
            id: broker.primaryContactPartner.id,
            name: broker.primaryContactPartner.username,
            email: broker.primaryContactPartner.email,
          }
        : null,
    };

    return res.status(200).json({
      message: 'Broker fetched successfully',
      data: serializedBroker,
    });
  } catch (error) {
    console.error('Error fetching broker:', error);
    return res.status(500).json({
      message: 'Failed to fetch broker',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateBroker = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    if (!id) {
      return res.status(400).json({ message: 'Broker ID is required' });
    }

    // Validate broker data
    const brokerData = brokerSchema.safeParse(req.body);
    if (!brokerData.success) {
      console.error('Validation errors:', brokerData.error.issues);
      return res.status(400).json({
        message: 'Validation failed',
        errors: brokerData.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Check if broker exists
    const existingBroker = await prisma.broker.findUnique({
      where: { id },
    });

    if (!existingBroker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    // Transform and validate for database (same as insert)
    const transformedData = brokerInsertSchema.safeParse(brokerData.data);
    if (!transformedData.success) {
      console.error('Transform errors:', transformedData.error.issues);
      return res.status(400).json({
        message: 'Invalid broker data',
        errors: transformedData.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Prepare update data with transformed values
    const updateData: any = {
      name: transformedData.data.name,
      email: transformedData.data.email,
      phone: transformedData.data.phone,
      whatsapp: transformedData.data.whatsapp,
      status: transformedData.data.status,
      areaOfOperation: transformedData.data.areaOfOperation,
      societyExpertise: transformedData.data.societyExpertise,
      notes: transformedData.data.notes,
      budgetMin: transformedData.data.budgetMin,
      budgetMax: transformedData.data.budgetMax,
    };

    // Update broker
    const updatedBroker = (await prisma.broker.update({
      where: { id },
      data: updateData,
      include: {
        primaryContactPartner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    })) as any;

    const serializedBroker = {
      ...updatedBroker,
      budgetMin: updatedBroker.budgetMin ? Number(updatedBroker.budgetMin) : null,
      budgetMax: updatedBroker.budgetMax ? Number(updatedBroker.budgetMax) : null,
      primaryContactPartner: updatedBroker.primaryContactPartner
        ? {
            id: updatedBroker.primaryContactPartner.id,
            name: updatedBroker.primaryContactPartner.username,
            email: updatedBroker.primaryContactPartner.email,
          }
        : null,
    };

    return res.status(200).json({
      message: 'Broker updated successfully',
      broker: serializedBroker,
    });
  } catch (error) {
    console.error('Error updating broker:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      message: 'Failed to update broker',
      error: errorMessage,
    });
  }
};

export const deleteBroker = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ success: false, message: "Broker ID is required" });
    }

    const broker = await prisma.broker.findUnique({ where: { id } });
    if (!broker) {
      return res.status(404).json({ success: false, message: "Broker not found" });
    }

    await prisma.$transaction([
      prisma.propertyListing.updateMany({
        where: { sourcePartnerId: id },
        data: { sourcePartnerId: null },
      }),
      prisma.brokerInteractionLog.deleteMany({
        where: { brokerId: id },
      }),
      prisma.broker.delete({
        where: { id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting broker:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete broker",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};