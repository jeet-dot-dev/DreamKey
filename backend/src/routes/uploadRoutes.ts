import express, { Router } from "express";


import { verifyToken } from "../middlewares/auth.js";

import getSignedUrl, { deleteUploadedObject } from "../controllers/uploadController.js";

const router = Router();



router.post("/presign", verifyToken, getSignedUrl);
router.delete("/object", verifyToken, deleteUploadedObject);

export default router;
