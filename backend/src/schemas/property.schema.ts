import { z } from "zod";

export const propertyCreateSchema = z
  .object({
    propertyType: z
      .enum(["FLAT", "LAND", "WAREHOUSE", "COMMERCIAL", "OTHER"]) // use prisma enum values
      .optional(),
    buildingName: z.string().min(1).max(100),
    location: z.string().min(1).max(100),
    pinCode: z.string().min(3).max(10),

    floorNumber: z.string().optional().or(z.literal("")),
    totalFloors: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().optional()),
    bedrooms: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),
    bathrooms: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),
    balconies: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().optional()),
    carpetArea: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),
    superBuiltUpArea: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),

    askingPrice: z.preprocess((v) => (v === "" || v === undefined ? undefined : BigInt(v as any)), z.any().optional()),
    availabilityStatus: z
      .enum(["AVAILABLE", "RENTED", "SOLD", "UPCOMING"])
      .nullable()
      .optional()
      .transform((v) => (v === null || v === undefined ? undefined : v)),
    availabilityDate: z.string().optional().or(z.literal("")),

    // Relations - accept both uuid strings and null/empty
    ownerId: z
      .string()
      .uuid()
      .nullable()
      .optional()
      .transform((v) => (v === null || v === undefined ? undefined : v)),
    sourcePartnerId: z
      .string()
      .uuid()
      .nullable()
      .optional()
      .transform((v) => (v === null || v === undefined ? undefined : v)),

    // Misc
    accessType: z.string().optional().or(z.literal("")),
    remarks: z.string().optional().or(z.literal("")),

    // Amenities
    amenities: z
      .object({
        parking: z.boolean().optional(),
        gym: z.boolean().optional(),
        lift: z.boolean().optional(),
        security: z.boolean().optional(),
        powerBackup: z.boolean().optional(),
        swimmingPool: z.boolean().optional(),
        clubhouse: z.boolean().optional(),
      })
      .optional(),

    // Media (uploaded to R2)
    images: z
      .array(
        z.object({
          objectKey: z.string().min(1),
          caption: z.string().optional(),
          publicUrl: z.string().nullable().optional(),
          order: z.number().int().optional(),
        })
      )
      .optional(),
    brochure: z
      .object({
        objectKey: z.string().min(1),
        publicUrl: z.string().nullable().optional(),
        fileName: z.string().min(1),
      })
      .optional(),
  })
  .refine((data) => !!data.ownerId || !!data.sourcePartnerId, {
    message: "Either ownerId or sourcePartnerId is required",
    path: ["ownerId"],
  });

export type PropertyCreate = z.infer<typeof propertyCreateSchema>;
