import express from "express";
import { createProperty, updateProperty } from "../controllers/propertyController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, createProperty);
router.put("/:id", verifyToken, updateProperty);

export default router;
