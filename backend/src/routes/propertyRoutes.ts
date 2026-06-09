import express from "express";
import { createProperty, updateProperty, getProperties, getPropertyById } from "../controllers/propertyController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/get", getProperties);
router.get("/:id", getPropertyById);
router.post("/", verifyToken, createProperty);
router.put("/:id", verifyToken, updateProperty);

export default router;
