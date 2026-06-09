import { prisma } from "../lib/prisma.js";
import { deleteR2Object } from "../lib/r2.js";
import type { Response } from "express";
import type { Request as ExpressRequest } from "express";
import { propertyCreateSchema } from "../schemas/property.schema.js";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

// Helper function to serialize BigInt values to strings for JSON responses
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (typeof obj === "object") {
    if (Array.isArray(obj)) return obj.map(serializeBigInt);
    return Object.entries(obj).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: serializeBigInt(value),
      }),
      {}
    );
  }
  return obj;
}

export const createProperty = async (req: AuthRequest, res: Response) => {
  let parsedData: any = null;

  try {
    if (!req.user?.userId) return res.status(401).json({ message: "Unauthorized" });

    const parsed = propertyCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });

    parsedData = parsed.data;

    // Verify owner or broker exists if provided
    if (parsedData.ownerId) {
      const owner = await prisma.owner.findUnique({ where: { id: parsedData.ownerId } });
      if (!owner) return res.status(404).json({ message: "Owner not found" });
    }

    if (parsedData.sourcePartnerId) {
      const broker = await prisma.broker.findUnique({ where: { id: parsedData.sourcePartnerId } });
      if (!broker) return res.status(404).json({ message: "Broker (source partner) not found" });
    }

    // Build create payload with nested media
    const createPayload: any = {
      propertyType: parsedData.propertyType ?? undefined,
      buildingName: parsedData.buildingName,
      location: parsedData.location,
      pinCode: parsedData.pinCode,
      floorNumber: parsedData.floorNumber ?? undefined,
      totalFloors: parsedData.totalFloors ?? undefined,
      bedrooms: parsedData.bedrooms ?? undefined,
      bathrooms: parsedData.bathrooms ?? undefined,
      balconies: parsedData.balconies ?? undefined,
      carpetArea: parsedData.carpetArea ?? undefined,
      superBuiltUpArea: parsedData.superBuiltUpArea ?? undefined,
      askingPrice: parsedData.askingPrice ?? undefined,
      availabilityStatus: parsedData.availabilityStatus ?? undefined,
      availabilityDate: parsedData.availabilityDate ? new Date(parsedData.availabilityDate) : undefined,
      accessType: parsedData.accessType ?? undefined,
      remarks: parsedData.remarks ?? undefined,
      ownerId: parsedData.ownerId ?? undefined,
      sourcePartnerId: parsedData.sourcePartnerId ?? undefined,
      userId: req.user.userId,
    };

    if (parsedData.amenities) {
      createPayload.amenities = { create: parsedData.amenities };
    }

    // Add nested images and brochure if provided
    if (parsedData.images && parsedData.images.length > 0) {
      createPayload.images = {
        create: parsedData.images.map((img: any, idx: number) => ({
          url: img.publicUrl || "",
          publicId: img.objectKey,
          caption: img.caption || null,
          order: img.order ?? idx,
        })),
      };
    }

    if (parsedData.brochure) {
      createPayload.societyBrochure = {
        create: {
          url: parsedData.brochure.publicUrl || "",
          publicId: parsedData.brochure.objectKey,
          fileName: parsedData.brochure.fileName,
        },
      };
    }

    // Use transaction: if anything fails, media cleanup is needed
    const created = await prisma.$transaction(async (tx) => {
      return tx.propertyListing.create({
        data: createPayload,
        include: { amenities: true, images: true, societyBrochure: true },
      });
    });

    return res.status(201).json({ message: "Property created", data: serializeBigInt(created) });
  } catch (error) {
    console.error("Error creating property:", error);
    // Attempt to clean up uploaded R2 objects if transaction failed
    const imageObjectKeys = (parsedData?.images || []).map((img: any) => img.objectKey);
    const brochureObjectKey = parsedData?.brochure?.objectKey;
    const keysToDelete = [...imageObjectKeys, brochureObjectKey].filter(Boolean);
    
    if (keysToDelete.length > 0) {
      console.warn(`Cleaning up ${keysToDelete.length} orphaned R2 object(s) after DB failure`);
      for (const key of keysToDelete) {
        try {
          await deleteR2Object(key as string);
          console.log(`Deleted R2 object: ${key}`);
        } catch (deleteError) {
          console.error(`Failed to clean up R2 object ${key}:`, deleteError);
          // Log but don't fail the API response; enqueue for retry if needed
        }
      }
    }

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

    return res.status(200).json({ message: "Property updated", data: serializeBigInt(updated) });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({ message: "Failed to update property", error: error instanceof Error ? error.message : String(error) });
  }
};
