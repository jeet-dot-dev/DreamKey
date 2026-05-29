import { prisma } from "../lib/prisma.js";
import type { Response } from "express";
import type { Request as ExpressRequest } from "express";
import { propertyCreateSchema } from "../schemas/property.schema.js";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: "Unauthorized" });

    const parsed = propertyCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });

    const data = parsed.data;

    // Verify owner or broker exists if provided
    if (data.ownerId) {
      const owner = await prisma.owner.findUnique({ where: { id: data.ownerId } });
      if (!owner) return res.status(404).json({ message: "Owner not found" });
    }

    if (data.sourcePartnerId) {
      const broker = await prisma.broker.findUnique({ where: { id: data.sourcePartnerId } });
      if (!broker) return res.status(404).json({ message: "Broker (source partner) not found" });
    }

    // Build create payload; ignore images and brochures for now
    const createPayload: any = {
      propertyType: data.propertyType ?? undefined,
      buildingName: data.buildingName,
      location: data.location,
      pinCode: data.pinCode,
      floorNumber: data.floorNumber ?? undefined,
      totalFloors: data.totalFloors ?? undefined,
      bedrooms: data.bedrooms ?? undefined,
      bathrooms: data.bathrooms ?? undefined,
      balconies: data.balconies ?? undefined,
      carpetArea: data.carpetArea ?? undefined,
      superBuiltUpArea: data.superBuiltUpArea ?? undefined,
      askingPrice: data.askingPrice ?? undefined,
      availabilityStatus: data.availabilityStatus ?? undefined,
      availabilityDate: data.availabilityDate ? new Date(data.availabilityDate) : undefined,
      accessType: data.accessType ?? undefined,
      remarks: data.remarks ?? undefined,
      ownerId: data.ownerId ?? undefined,
      sourcePartnerId: data.sourcePartnerId ?? undefined,
      userId: req.user.userId,
    };

    if (data.amenities) {
      createPayload.amenities = { create: data.amenities };
    }

    const created = await prisma.propertyListing.create({
      data: createPayload,
      include: { amenities: true },
    });

    return res.status(201).json({ message: "Property created", data: created });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ message: "Failed to create property", error: error instanceof Error ? error.message : String(error) });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "Property id is required" });

    const parsed = propertyCreateSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });

    const existing = await prisma.propertyListing.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Property not found" });

    const data = parsed.data as any;

    const updatePayload: any = { ...data };

    if (data.amenities) {
      // upsert amenities
      updatePayload.amenities = {
        upsert: {
          create: data.amenities,
          update: data.amenities,
        },
      };
    }

    const updated = await prisma.propertyListing.update({ where: { id }, data: updatePayload, include: { amenities: true } });

    return res.status(200).json({ message: "Property updated", data: updated });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({ message: "Failed to update property", error: error instanceof Error ? error.message : String(error) });
  }
};
