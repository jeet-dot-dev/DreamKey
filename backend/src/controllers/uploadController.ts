import type { Request, Response } from "express";
import {
  createR2ObjectKey,
  createR2UploadUrl,
  deleteR2Object,
  getR2ObjectUrl,
} from "../lib/r2.js";
import { deleteObjectSchema, presignSchema } from "../schemas/presign.Schema.js";

const getSignedUrl = async (req: Request, res: Response) => {
  try {
    const parsed = presignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues,
      });
    }

    const { fileName, contentType, folder } = parsed.data;
    const objectKey = createR2ObjectKey({ folder, fileName });
    const uploadUrl = await createR2UploadUrl({
      objectKey,
      contentType,
    });

    return res.status(200).json({
      message: "Presigned URL created",
      data: {
        objectKey,
        uploadUrl,
        publicUrl: getR2ObjectUrl(objectKey),
        expiresInSeconds: 900,
      },
    });
  } catch (error) {
    console.error("Error creating presigned upload URL:", error);
    return res.status(500).json({
      message: "Failed to create presigned upload URL",
    });
  }
};

const deleteUploadedObject = async (req: Request, res: Response) => {
  try {
    const parsed = deleteObjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues,
      });
    }

    await deleteR2Object(parsed.data.objectKey);

    return res.status(200).json({
      message: "Object deleted",
    });
  } catch (error) {
    console.error("Error deleting uploaded object:", error);
    return res.status(500).json({
      message: "Failed to delete uploaded object",
    });
  }
};

export default getSignedUrl;
export { deleteUploadedObject };
