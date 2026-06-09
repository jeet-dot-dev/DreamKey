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

export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const {
      buildingName,
      location,
      propertyType,
      availabilityStatus,
      priceMin,
      priceMax,
      dateFrom,
      dateTo,
      ownerId,
      sourcePartnerId,
      page = "1",
      limit = "10",
    } = req.query;

    const where: any = {};

    if (buildingName) {
      where.buildingName = { contains: buildingName as string, mode: "insensitive" };
    }

    if (location) {
      where.location = { contains: location as string, mode: "insensitive" };
    }

    if (propertyType) {
      where.propertyType = propertyType as string;
    }

    if (availabilityStatus) {
      where.availabilityStatus = availabilityStatus as string;
    }

    if (ownerId) {
      where.ownerId = ownerId as string;
    }

    if (sourcePartnerId) {
      where.sourcePartnerId = sourcePartnerId as string;
    }

    if (priceMin || priceMax) {
      where.AND = [];
      if (priceMin) {
        where.AND.push({ askingPrice: { gte: BigInt(priceMin as string) } });
      }
      if (priceMax) {
        where.AND.push({ askingPrice: { lte: BigInt(priceMax as string) } });
      }
    }

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

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      prisma.propertyListing.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, phone: true } },
          sourcePartner: { select: { id: true, name: true, phone: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
          amenities: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.propertyListing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const serialized = properties.map((p: any) => ({
      ...p,
      askingPrice: p.askingPrice ? Number(p.askingPrice) : null,
      carpetArea: p.carpetArea ? Number(p.carpetArea) : null,
      superBuiltUpArea: p.superBuiltUpArea ? Number(p.superBuiltUpArea) : null,
      bedrooms: p.bedrooms ? Number(p.bedrooms) : null,
      bathrooms: p.bathrooms ? Number(p.bathrooms) : null,
    }));

    return res.status(200).json({
      message: "Properties fetched successfully",
      data: serialized,
      pagination: { currentPage: pageNum, pageSize: limitNum, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({
      message: "Failed to fetch properties",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    if (!id) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = (await prisma.propertyListing.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, phone: true, email: true, whatsapp: true },
        },
        sourcePartner: {
          select: { id: true, name: true, phone: true, email: true, whatsapp: true },
        },
        amenities: true,
        images: { orderBy: { order: "asc" } },
        societyBrochure: true,
        user: { select: { id: true, username: true, email: true } },
      },
    })) as any;

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const serialized = {
      ...property,
      askingPrice: property.askingPrice ? Number(property.askingPrice) : null,
      carpetArea: property.carpetArea ? Number(property.carpetArea) : null,
      superBuiltUpArea: property.superBuiltUpArea ? Number(property.superBuiltUpArea) : null,
      bedrooms: property.bedrooms ? Number(property.bedrooms) : null,
      bathrooms: property.bathrooms ? Number(property.bathrooms) : null,
    };

    return res.status(200).json({ message: "Property fetched successfully", data: serialized });
  } catch (error) {
    console.error("Error fetching property:", error);
    return res.status(500).json({
      message: "Failed to fetch property",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "Property id is required" });

    // Fetch existing property with media
    const existing = (await prisma.propertyListing.findUnique({
      where: { id },
      include: { images: true, societyBrochure: true },
    })) as any;
    if (!existing) return res.status(404).json({ message: "Property not found" });

    const parsed = propertyCreateSchema.partial().safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });

    const data = parsed.data as any;

    // ── Scalar fields ──────────────────────────────────────────────────────
    const scalarFields = [
      "propertyType", "buildingName", "location", "pinCode",
      "floorNumber", "totalFloors", "bedrooms", "bathrooms", "balconies",
      "carpetArea", "superBuiltUpArea", "askingPrice", "availabilityStatus",
      "availabilityDate", "accessType", "remarks", "builderName",
      "yearBuilt", "totalUnits", "reraNumber", "ownerId", "sourcePartnerId",
    ];
    const updatePayload: any = {};
    for (const field of scalarFields) {
      if (data[field] !== undefined) updatePayload[field] = data[field];
    }
    if (data.availabilityDate) {
      updatePayload.availabilityDate = new Date(data.availabilityDate);
    }

    // ── Amenities ──────────────────────────────────────────────────────────
    if (data.amenities) {
      updatePayload.amenities = {
        upsert: { create: data.amenities, update: data.amenities },
      };
    }

    // ── Images ────────────────────────────────────────────────────────────
    // deletedImageIds: array of existing PropertyImage IDs to remove
    const deletedImageIds: string[] = Array.isArray(req.body.deletedImageIds)
      ? req.body.deletedImageIds
      : [];

    if (deletedImageIds.length > 0) {
      // Find the R2 keys of images being deleted
      const toDelete = existing.images.filter((img: any) =>
        deletedImageIds.includes(img.id)
      );
      // Delete from DB
      await prisma.propertyImage.deleteMany({
        where: { id: { in: deletedImageIds }, propertyListingId: id },
      });
      // Delete from R2 (best-effort)
      for (const img of toDelete) {
        if (img.publicId) {
          try { await deleteR2Object(img.publicId); } catch {}
        }
      }
    }

    // Add new images if provided (already uploaded to R2 by client)
    if (data.images && data.images.length > 0) {
      updatePayload.images = {
        create: data.images.map((img: any, idx: number) => ({
          url: img.publicUrl || "",
          publicId: img.objectKey,
          caption: img.caption || null,
          order: (existing.images.length - deletedImageIds.length) + idx,
        })),
      };
    }

    // ── Brochure ──────────────────────────────────────────────────────────
    // deleteBrochure: true means remove existing brochure
    if (req.body.deleteBrochure === true && existing.societyBrochure) {
      await prisma.propertyBrochure.delete({
        where: { propertyListingId: id },
      });
      if (existing.societyBrochure.publicId) {
        try { await deleteR2Object(existing.societyBrochure.publicId); } catch {}
      }
    }

    // Replace/add brochure if new one uploaded
    if (data.brochure) {
      // Delete old one from R2 if exists and wasn't already deleted
      if (existing.societyBrochure && !req.body.deleteBrochure) {
        if (existing.societyBrochure.publicId) {
          try { await deleteR2Object(existing.societyBrochure.publicId); } catch {}
        }
        await prisma.propertyBrochure.delete({ where: { propertyListingId: id } });
      }
      updatePayload.societyBrochure = {
        create: {
          url: data.brochure.publicUrl || "",
          publicId: data.brochure.objectKey,
          fileName: data.brochure.fileName,
        },
      };
    }

    const updated = await prisma.propertyListing.update({
      where: { id },
      data: updatePayload,
      include: { amenities: true, images: { orderBy: { order: "asc" } }, societyBrochure: true },
    });

    return res.status(200).json({ message: "Property updated", data: serializeBigInt(updated) });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({
      message: "Failed to update property",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

