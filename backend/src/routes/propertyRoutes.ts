import express from "express";
import { createProperty, updateProperty, getProperties, getPropertyById, deleteProperty } from "../controllers/propertyController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/get", getProperties);
router.get("/:id", getPropertyById);
router.post("/", verifyToken, createProperty);
router.put("/:id", verifyToken, updateProperty);
router.delete("/:id", verifyToken, deleteProperty);

export default router;
