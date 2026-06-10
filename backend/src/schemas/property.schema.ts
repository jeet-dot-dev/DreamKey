import { z } from "zod";

export const propertyBaseSchema = z
  .object({
    propertyType: z
      .enum(["FLAT", "LAND", "WAREHOUSE", "COMMERCIAL", "OTHER"], {
        message: "Property Type is required",
      }),
    buildingName: z
      .string({ message: "Building/Society Name is required" })
      .min(1, "Building/Society Name is required")
      .max(100, "Building/Society Name cannot exceed 100 characters"),
    location: z
      .string({ message: "Location/Area is required" })
      .min(1, "Location/Area is required")
      .max(100, "Location/Area cannot exceed 100 characters"),
    pinCode: z
      .string({ message: "Pin Code is required" })
      .min(3, "Pin Code must be at least 3 characters")
      .max(6, "Pin Code cannot exceed 6 characters"),

    floorNumber: z.string().max(50, "Floor Number cannot exceed 50 characters").optional().or(z.literal("")),
    totalFloors: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().optional()),
    bedrooms: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),
    bathrooms: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),
    balconies: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().optional()),
    carpetArea: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),
    superBuiltUpArea: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().optional()),

    askingPrice: z.preprocess(
      (v) => {
        if (v === "" || v === undefined || v === null) return undefined;
        try {
          return BigInt(v as any);
        } catch {
          return v;
        }
      },
      z.bigint({
        message: "Asking Price is required",
      })
    ),
    availabilityStatus: z.enum(["AVAILABLE", "RENTED", "SOLD", "UPCOMING"], {
      message: "Availability Status is required",
    }),
    availabilityDate: z.string().optional().or(z.literal("")),

    // Relations - accept both uuid strings and null/empty
    ownerId: z
      .string()
      .uuid()
      .nullable()
      .optional(),
    sourcePartnerId: z
      .string()
      .uuid()
      .nullable()
      .optional(),

    // Misc
    accessType: z.string().max(100, "Access Type cannot exceed 100 characters").optional().or(z.literal("")),
    remarks: z.string().max(1000, "Remarks cannot exceed 1000 characters").optional().or(z.literal("")),

    // Society Insights (missing fields)
    builderName: z.string().max(100, "Builder Name cannot exceed 100 characters").optional().or(z.literal("")),
    yearBuilt: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().optional()),
    totalUnits: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().optional()),
    reraNumber: z.string().max(100, "RERA Number cannot exceed 100 characters").optional().or(z.literal("")),

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
  });

export const propertyCreateSchema = propertyBaseSchema.refine(
  (data) => !!data.ownerId || !!data.sourcePartnerId,
  {
    message: "Either ownerId or sourcePartnerId is required",
    path: ["ownerId"],
  }
);

export const propertyUpdateSchema = propertyBaseSchema.partial();

export type PropertyCreate = z.infer<typeof propertyCreateSchema>;

