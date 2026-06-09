import { z } from "zod";

const allowedContentTypes = ["image/jpeg", "image/png", "application/pdf"] as const;

export const presignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(allowedContentTypes),
  folder: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9/_-]+$/, "Folder can only contain letters, numbers, slash, underscore, and hyphen")
    .default("properties/temp"),
});

export const deleteObjectSchema = z.object({
  objectKey: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(
      /^properties\/(images|brochures|temp)\/[A-Za-z0-9._/-]+$/,
      "objectKey must point to a property asset"
    )
    .refine((value) => !value.includes(".."), "objectKey cannot contain path traversal segments"),
});